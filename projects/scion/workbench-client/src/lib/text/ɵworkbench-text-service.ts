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
import {catchError, first, MonoTypeOperatorFunction, Observable, of, ReplaySubject, share, switchMap, timeout} from 'rxjs';
import {APP_IDENTITY, Intent, IntentClient, ManifestService, mapToBody} from '@scion/microfrontend-platform';
import {Beans, PreDestroy} from '@scion/toolkit/bean-manager';
import {finalize} from 'rxjs/operators';
import {Translatable} from './workbench-text-provider.model';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/** @inheritDoc */
export class ɵWorkbenchTextService implements WorkbenchTextService, PreDestroy {

  private readonly _cache = new Map<Translatable, Observable<string | undefined>>();

  /** @inheritDoc */
  public text$(translatable: Translatable | undefined, options: {provider: string; timeout?: number}): Observable<string | undefined> {
    if (!translatable?.startsWith('%') || translatable === '%') {
      return of(translatable);
    }

    const cacheKey = `${translatable}@${options.provider}`;
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
        mapToBody(),
        waitUntilRegisteredTextProvider(options.provider),
        timeout({first: options.timeout ?? 30_000}),
        catchError((error: unknown) => {
          // Prefix the key with an additional `%` character to escape the leading `%` character. See console formatting rules: https://developer.mozilla.org/en-US/docs/Web/API/console
          console.error(`[NullTextError][${Beans.get(APP_IDENTITY)}] Failed to get text '%${translatable}' from application '${options.provider}'. Caused by: `, error);
          return of(key);
        }),
        finalize(() => this._cache.delete(cacheKey)),
        share({connector: () => new ReplaySubject(1), resetOnRefCountZero: true, resetOnComplete: true, resetOnError: true}),
      );
    this._cache.set(cacheKey, text$);

    return text$;
  }

  public preDestroy(): void {
    this._cache.clear();
  }
}

/**
 * Waits until registered specified text provider.
 */
function waitUntilRegisteredTextProvider<T>(provider: string): MonoTypeOperatorFunction<T> {
  return catchError((error, caught) => {
    if (error instanceof Error && error.message.includes('NullProviderError')) {
      // Wait until registered the text provider.
      return Beans.get(ManifestService).lookupCapabilities$({type: WorkbenchCapabilities.TextProvider, qualifier: {provider: provider}})
        .pipe(
          first(capabilities => capabilities.length > 0),
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
  for (const match of escapeSemicolon(matrixParams).matchAll(/(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups!;
    params[unescapeSemicolon(paramName!)] = unescapeSemicolon(paramValue!);
  }
  return params;

  /**
   * Replaces escaped semicolons (`\;`) with the placeholder (`ɵ`) to prevent interpretation as key-value separators.
   */
  function escapeSemicolon(value: string): string {
    return value.replaceAll('\\;', 'ɵ');
  }

  /**
   * Restores escaped semicolons by replacing the placeholder (`ɵ`) back to semicolons (`;`).
   */
  function unescapeSemicolon(value: string): string {
    return value.replaceAll('ɵ', ';');
  }
}
