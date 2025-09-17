/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchTextService} from './workbench-text-service';
import {animationFrameScheduler, catchError, concatWith, first, MonoTypeOperatorFunction, NEVER, Observable, of, ReplaySubject, share, switchMap, timeout, timer} from 'rxjs';
import {APP_IDENTITY, Intent, IntentClient, ManifestService, mapToBody} from '@scion/microfrontend-platform';
import {Beans, PreDestroy} from '@scion/toolkit/bean-manager';
import {finalize} from 'rxjs/operators';
import {Translatable} from './workbench-text-provider.model';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/** @inheritDoc */
export class ɵWorkbenchTextService implements WorkbenchTextService, PreDestroy {

  private readonly _cache = new Map<Translatable, Observable<string | undefined>>();

  /** @inheritDoc */
  public text$(translatable: Translatable | undefined, options: {provider: string; ttl?: number}): Observable<string | undefined> {
    if (!translatable?.startsWith('%') || translatable === '%') {
      return of(translatable);
    }

    const cacheKey = `${translatable}@${options.provider};ttl=${options.ttl ?? 0}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)!;
    }

    const {key, params} = parseTranslatable(translatable as `%${string}`);
    const translateIntent: Intent = {
      type: WorkbenchCapabilities.TextProvider,
      qualifier: {provider: options.provider},
      params: new Map()
        .set('key', key)
        .set('params', params),
    };

    const text$ = Beans.get(IntentClient).request$<string | undefined>(translateIntent, undefined, {retain: true})
      .pipe(
        // Ensure the observable to never complete independent of text provider request completion, providing consistent
        // behavior to consumers and simplifying cache cleanup as finalize is only called when the last subscriber unsubscribes,
        // after the specified TTL.
        concatWith(NEVER),
        mapToBody(),
        waitUntilRegisteredTextProvider(options.provider, {timeout: 60_000}),
        catchError((error: unknown) => {
          // Prefix the key with an additional `%` character to escape the leading `%` character. See console formatting rules: https://developer.mozilla.org/en-US/docs/Web/API/console
          console.error(`[NullTextError][${Beans.get(APP_IDENTITY)}] Failed to get text '%${translatable}' from application '${options.provider}'. Caused by: `, error);
          return of(`%${key}`);
        }),
        // Remove cached text when an error occurs, or when the subscriber count drops to zero, after the specified TTL.
        finalize(() => this._cache.delete(cacheKey)),
        share({
          connector: () => new ReplaySubject(1),
          resetOnRefCountZero: () => timer(options.ttl ?? 0, animationFrameScheduler), // reset asynchronously to prevent flickering of translated texts on re-layout
        }),
      );
    this._cache.set(cacheKey, text$);

    return text$;
  }

  public preDestroy(): void {
    this._cache.clear();
  }
}

/**
 * Waits until registered specified text provider, or errors when the specified timeout elapses, if any.
 */
function waitUntilRegisteredTextProvider<T>(provider: string, options?: {timeout?: number}): MonoTypeOperatorFunction<T> {
  return catchError((error, caught) => {
    if (error instanceof Error && error.message.includes('NullProviderError')) {
      // Wait until registered the text provider.
      return Beans.get(ManifestService).lookupCapabilities$({type: WorkbenchCapabilities.TextProvider, qualifier: {provider: provider}})
        .pipe(
          first(capabilities => capabilities.length > 0),
          timeout({first: options?.timeout}),
          switchMap(() => caught),
        );
    }
    throw error;
  });
}

/**
 * Parses a translation key into its key and parameters, if any.
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 */
function parseTranslatable(translationKey: `%${string}`): {key: string; params: Record<string, string>} {
  const {key, params} = /^%(?<key>[^;]+)(;(?<params>.*))?$/.exec(translationKey)!.groups!;
  return {key: key!, params: parseMatrixParams(params)};
}

/**
 * Parses params in matrix notation.
 *
 * Format: `param1=value1;param2=value2`
 */
function parseMatrixParams(matrixParams: string | undefined): Record<string, string> {
  if (!matrixParams?.length) {
    return {};
  }

  const params: Record<string, string> = {};
  for (const match of encodeEscapedSemicolons(matrixParams).matchAll(/(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups as {paramName: string; paramValue: string};
    params[paramName] = decodeSemicolons(paramValue);
  }
  return params;

  /**
   * Encodes escaped semicolons (`\\;`) as `&#x3b` (Unicode) to prevent interpretation as interpolation parameter separators.
   */
  function encodeEscapedSemicolons(value: string): string {
    return value.replaceAll('\\;', '&#x3b');
  }

  /**
   * Decodes encoded semicolons (`&#x3b`) back to semicolons (`;`).
   */
  function decodeSemicolons(value: string): string {
    return value.replaceAll('&#x3b', ';');
  }
}
