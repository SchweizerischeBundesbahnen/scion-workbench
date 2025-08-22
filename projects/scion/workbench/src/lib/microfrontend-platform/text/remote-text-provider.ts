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
import {MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchTextService} from '@scion/workbench-client';
import {Dictionaries} from '@scion/toolkit/util';

/**
 * Registers a text provider for the SCION Workbench to get texts from micro apps.
 *
 * If the key matches the format of a remote key, text is requested via intent from the respective 'text-provider' capability.
 * If not, the key is ignored and `undefined` is returned.
 *
 * Remote key format: "workbench.~<APP_SYMBOLIC_NAME>~.<TEXT_KEY>".
 *
 * @see createRemoteTranslatable
 */
export function provideRemoteTextProvider(): EnvironmentProviders {
  const REMOTE_KEY = /^workbench\.~(?<provider>[^\\~]+)~\.(?<key>.+)$/;
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_TEXT_PROVIDER,
      useValue: remoteTextProvider satisfies WorkbenchTextProviderFn,
      multi: true,
    },
  ]);

  function remoteTextProvider(remoteKey: string | `workbench.~${string}~.${string}`, params: {[name: string]: string | `topic://${string}`}): Signal<string> | undefined {
    // Test if the key matches a remote key.
    const match = REMOTE_KEY.exec(remoteKey);
    if (!match) {
      return undefined; // ignore key
    }

    // Parse key and provider from the remote key.
    const {key, provider} = match.groups!;

    // Request the text by intent. Parameters starting with the topic protocol 'topic://' are resolved via messaging.
    const text$ = observeParams$(params)
      .pipe(
        map(params => params.reduce((translatable, [name, value]) => `${translatable};${name}=${value}`, `%${key!}`)),
        switchMap(translatable => Beans.get(WorkbenchTextService).text$(translatable, {provider: provider!})),
        map(text => text ?? key!),
      );
    return toSignal(text$, {initialValue: ''});
  }

  /**
   * Creates an Observable that emits tuples of name/value pairs from the passed parameters.
   *
   * Parameters starting with the topic protocol 'topic://' are resolved via topic-based messaging.
   */
  function observeParams$(params: {[name: string]: string | `topic://${string}`}): Observable<Array<[string, string]>> {
    const observableParams: Array<Observable<[string, string]>> = Object.entries(params).map(([name, value]) => {
      if (!value.startsWith(TOPIC_PROTOCOL)) {
        return of([name, value]);
      }

      const topic = value.substring(TOPIC_PROTOCOL.length);
      return Beans.get(MessageClient).request$<string | undefined>(topic, undefined, {retain: true}).pipe(map(({body: resolved}) => ([name, resolved ?? ''])));
    });

    return observableParams.length ? combineLatest(observableParams) : of([]);
  }
}

/**
 * Creates a translatable for the SCION Workbench to request the text from a micro app.
 *
 * Passed parameters are used to substitute named interpolation parameters. A named interpolation parameter starts with a colon (`:`) followed by a name.
 *
 * Example: %translationKey;param1=value1;param2=:value2 // :value2 is a named interpolation parameter
 *
 * Named interpolation parameters can be substituted by explicit values (passed as value params) or topics (passed as topic params).
 * Unlike value params, topic params define a topic and the actual value will be requested when resolving the translatable.
 * Like the translatable's interpolation params, a topic can reference value params as named parameters in topic segments.
 *
 * @param translatable - Specifies the translatable.
 * @param config - Specifies the text provider and values for substituting named interpolation parameters.
 * @return Translatable that can be passed to the workbench's {@link text()} function for translation.
 *
 * @see provideRemoteTextProvider
 */
export function createRemoteTranslatable(translatable: Translatable | undefined, config: {appSymbolicName: string; valueParams?: {[name: string]: unknown} | Map<string, unknown>; topicParams?: {[name: string]: string} | Map<string, string>}): Translatable | undefined {
  if (!translatable?.startsWith('%')) {
    return translatable;
  }

  const remoteTranslatable = `%workbench.~${config.appSymbolicName}~.${translatable.substring(1)}`;
  const valueParams = Dictionaries.coerce(config.valueParams);
  const topicParams = Object.fromEntries(Object.entries(Dictionaries.coerce(config.topicParams))
    // Replace named params in topic segments.
    .map(([name, topic]) => [name, topic.replace(/(?<=\/|^):(?<namedParam>[^/]+)/g, (match: string, namedParam: string) => `${valueParams[namedParam] ?? match}`)] as const)
    // Add topic protocol to indicate resolution via topic-based messaging.
    .map(([paramName, topic]) => [paramName, `${TOPIC_PROTOCOL}${topic}`] as const));

  // Replace named params in matrix param values.
  return remoteTranslatable.replace(/(?<==):(?<namedParam>[^;]+)/g, (match: string, namedParam: string) => `${valueParams[namedParam] ?? topicParams[namedParam] ?? match}`);
}

/**
 * Prefix of topic params.
 */
const TOPIC_PROTOCOL = 'topic://';
