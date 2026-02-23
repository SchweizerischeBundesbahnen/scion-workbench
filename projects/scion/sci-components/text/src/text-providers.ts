/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, InjectionToken, Injector, isSignal, runInInjectionContext, Signal, signal} from '@angular/core';
import {SciTextProviderFn, Translatable} from './text-provider.model';
import {scionComponentsTextProvider} from './scion-components-text-provider';
import {Maps} from '@scion/toolkit/util';

/**
 * Provides texts based on registered text providers.
 */
@Injectable({providedIn: 'root'})
export class TextProviders {

  private readonly _textProviders: SciTextProviderFn[] = [
    // Provide app-specific texts.
    ...inject(SCI_TEXT_PROVIDER, {optional: true}) ?? [],
    // Provide built-in texts of @scion/components.
    scionComponentsTextProvider,
  ];

  /**
   * Provides the text for the given {@link Translatable} based on text providers registered under the {@link SCI_TEXT_PROVIDER} DI token.
   *
   * Text providers are called in registration order. If a provider does not provide the text, the next provider is called, and so on.
   *
   * This function must be called within an injection context, or an explicit {@link Injector} passed. Text providers may allocate resources
   * that are released only when the injector is destroyed. Destroy the injector when the text is no longer needed.
   */
  public provide(translatable: Translatable | undefined | null, options: {params?: Record<string, unknown> | Map<string, unknown>; injector?: Injector}): Signal<string | undefined | null> {
    if (!translatable?.startsWith('%') || translatable === '%' || !this._textProviders.length) {
      return signal(translatable);
    }

    // Parse translatable into key and params.
    const {key, params} = parseTranslatable(translatable as `%${string}`);

    // Append params from options.
    Maps.coerce(options.params).forEach((value, name) => params.set(name, `${value}`));

    const injector = options.injector ?? inject(Injector);
    for (const textProvider of this._textProviders) {
      const text = runInInjectionContext(injector, () => textProvider(key, Object.fromEntries(params)));
      if (text !== undefined) {
        return isSignal(text) ? text : signal(text);
      }
    }
    return signal(translatable);
  }
}

/**
 * Parses a translation key into its key and parameters, if any.
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 */
function parseTranslatable(translationKey: `%${string}`): {key: string; params: Map<string, string>} {
  const {key, params} = /^%(?<key>[^;]+)(;(?<params>.*))?$/.exec(translationKey)!.groups!;
  return {key: key!, params: parseMatrixParams(params)};
}

/**
 * Parses params in matrix notation.
 *
 * Format: `param1=value1;param2=value2`
 */
function parseMatrixParams(matrixParams: string | undefined): Map<string, string> {
  if (!matrixParams?.length) {
    return new Map();
  }

  const params = new Map<string, string>();
  for (const match of encodeEscapedSemicolons(matrixParams).matchAll(/(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups as {paramName: string; paramValue: string};
    params.set(paramName, decodeSemicolons(paramValue));
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

/**
 * Multi-DI token for injecting text providers.
 *
 * Multiple text providers can be registered. Providers are called in registration order.
 * If a provider does not provide the text, the next provider is called, and so on.
 */
export const SCI_TEXT_PROVIDER = new InjectionToken<SciTextProviderFn[]>('SCI_TEXT_PROVIDER');
