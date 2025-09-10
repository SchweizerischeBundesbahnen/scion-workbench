/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable, WORKBENCH_TEXT_PROVIDER, WorkbenchTextProviderFn} from '../../text/workbench-text-provider.model';
import {EnvironmentProviders, makeEnvironmentProviders, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {combineLatest, map, Observable, of, switchMap} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchTextService} from '@scion/workbench-client';
import {Dictionaries} from '@scion/toolkit/util';

/**
 * Registers a text provider for the SCION Workbench to get texts from micro apps.
 *
 * This text provider provides texts for keys matching the format: "workbench.external.scion-workbench-client.<APP_SYMBOLIC_NAME>.<TRANSLATABLE>".
 *
 * @see createRemoteTranslatable
 */
export function provideRemoteTextProvider(): EnvironmentProviders {
  const REMOTE_TRANSLATION_KEY = /^workbench\.external\.scion-workbench-client\.(?<provider>[^\\.]+)\.%(?<key>.+)$/;
  const REMOTE_TEXT = /^workbench\.external\.scion-workbench-client\.(?<provider>[^\\.]+)\.(?<text>[^%].+)$/;

  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_TEXT_PROVIDER,
      useValue: provideRemoteText satisfies WorkbenchTextProviderFn,
      multi: true,
    },
    {
      provide: WORKBENCH_TEXT_PROVIDER,
      useValue: interpolateRemoteText satisfies WorkbenchTextProviderFn,
      multi: true,
    },
  ]);

  /**
   * Provides text from a remote app.
   */
  function provideRemoteText(translationKey: string | `workbench.external.scion-workbench-client.${string}.%${string}`, params: {[name: string]: string | `topic://${string}`}): Signal<string> | undefined {
    // Test if the key matches a remote translation key.
    const match = REMOTE_TRANSLATION_KEY.exec(translationKey);
    if (!match) {
      return undefined;
    }

    // Parse key and provider from the remote translation key.
    const {key, provider} = match.groups as {key: string; provider: string};

    // Request the text by intent. Parameters starting with the topic protocol 'topic://' are resolved via messaging.
    const text$ = observeParams$(params, {provider})
      .pipe(
        map(params => params.reduce((translatable, [param, value]) => `${translatable};${param}=${encodeSemicolons(value)}`, `%${key}`)),
        switchMap(translatable => Beans.get(WorkbenchTextService).text$(translatable, {provider})),
        map(text => text ?? key),
      );
    return toSignal(text$, {initialValue: ''});
  }

  /**
   * Substitutes named parameters in a remote text.
   */
  function interpolateRemoteText(translationKey: string | `workbench.external.scion-workbench-client.${string}.${string}`, params: {[name: string]: string | `topic://${string}`}): Signal<string> | undefined {
    // Test if the key matches a remote text.
    const match = REMOTE_TEXT.exec(translationKey);
    if (!match) {
      return undefined;
    }

    // Parse text and provider from the remote text.
    const {text, provider} = match.groups as {text: string; provider: string};

    // Substitute params. Parameters starting with the topic protocol 'topic://' are resolved via messaging.
    const text$ = observeParams$(params, {provider})
      .pipe(map(params => params.reduce((text, [param, value]) => text.replaceAll(`:${param}`, value), decodeSemicolons(text))));
    return toSignal(text$, {initialValue: ''});
  }

  /**
   * Creates an Observable that emits tuples of name-value pairs from the passed parameters.
   *
   * Parameters starting with the topic protocol 'topic://' are resolved via topic-based messaging.
   */
  function observeParams$(params: {[name: string]: string | `topic://${string}`}, options: {provider: string}): Observable<Array<[string, string]>> {
    const observableParams: Array<Observable<[string, string]>> = Object.entries(params).map(([param, value]) => {
      if (!value.startsWith(TOPIC_PROTOCOL)) {
        return of([param, value]);
      }

      const topic = value.substring(TOPIC_PROTOCOL.length);
      return Beans.get(MessageClient).request$<Translatable | undefined>(topic, undefined, {retain: true})
        .pipe(
          mapToBody(),
          // Resolve text if the resolver returns a translatable.
          switchMap(resolved => resolved?.startsWith('%') ? Beans.get(WorkbenchTextService).text$(resolved, options) : of(resolved)),
          map(resolved => [param, resolved ?? '']),
        );
    });

    return observableParams.length ? combineLatest(observableParams) : of([]);
  }
}

/**
 * Creates a translatable for the SCION Workbench to request the text from a micro app.
 *
 * Passed parameters are used to substitute named parameters in the text or interpolation parameters of the translation key.
 *
 * A named parameter starts with a colon (`:`) followed by the parameter name and can be substituted by an explicit value (passed as value param) or topic (passed as topic param).
 * Topic params define a topic with the actual value requested when resolving the translatable. A topic can also reference value params as named params in topic segments.
 *
 * @example - Translation Key
 * `%translationKey;param1=:namedParam1;param2=:namedParam2`
 *
 * @example - Text
 * `Text with :namedParam1 and :namedParam2`
 *
 * @param translatable - Specifies the translatable.
 * @param config - Specifies the text provider and values for substituting named parameters.
 * @return Translatable that can be passed to the workbench's {@link text()} function for translation.
 *
 * @see provideRemoteTextProvider
 */
export function createRemoteTranslatable(translatable: Translatable | undefined, config: {appSymbolicName: string; valueParams?: {[name: string]: unknown} | Map<string, unknown>; topicParams?: {[name: string]: string} | Map<string, string>}): Translatable | undefined {
  if (!translatable) {
    return translatable;
  }

  // Create Map of value params.
  const valueParams = new Map(Object.entries(Dictionaries.coerce(config.valueParams)).map(([param, value]) => [param, encodeSemicolons(value)]));
  // Create Map of topic params, substituting referenced value params.
  const topicParams = new Map(Object.entries(Dictionaries.coerce(config.topicParams)).map(([param, topic]) => [param, toTopicParam(topic)]));

  // Return text as-is if not a translation key nor referencing parameters.
  if (!translatable.startsWith('%') && !containsParam(translatable, valueParams) && !containsParam(translatable, topicParams)) {
    return translatable;
  }

  const remoteTranslatablePrefix = `%workbench.external.scion-workbench-client.${config.appSymbolicName}`;
  if (translatable.startsWith('%')) {
    // Substitute named parameters in interpolation params.
    return `${remoteTranslatablePrefix}.${translatable}`.replace(/(?<==):(?<namedParam>[^;]+)/g, (match: string, param: string) => valueParams.get(param) ?? topicParams.get(param) ?? match);
  }
  else {
    // Append referenced parameters in matrix notation.
    return [...valueParams, ...topicParams]
      .filter(([param]) => translatable.includes(`:${param}`))
      .reduce((translatable, [param, value]) => `${translatable};${param}=${value}`, `${remoteTranslatablePrefix}.${encodeSemicolons(translatable)}`);
  }

  /**
   * Adds the topic protocol to indicate resolution via topic-based messaging and substitutes named topic segments.
   */
  function toTopicParam(topic: string): string {
    return `${TOPIC_PROTOCOL}${topic.replace(/(?<=\/|^):(?<namedParam>[^/]+)/g, (match: string, namedParam: string) => {
      return valueParams.get(namedParam) ?? match;
    })}`;
  }

  /**
   * Tests whether the passed text references any of the passed params.
   */
  function containsParam(text: string, params: Map<string, unknown>): boolean {
    return Array.from(params.keys()).some(param => text.includes(`:${param}`));
  }
}

/**
 * Prefix of topic params.
 */
const TOPIC_PROTOCOL = 'topic://';

/**
 * Encodes semicolons (`;`) as `&#x3b` (Unicode) to prevent interpretation as interpolation parameter separators.
 */
function encodeSemicolons(value: unknown): string {
  return `${value}`.replaceAll(';', '&#x3b');
}

/**
 * Decodes encoded semicolons (`&#x3b`) back to semicolons (`;`).
 */
function decodeSemicolons(value: string): string {
  return value.replaceAll('&#x3b', ';');
}
