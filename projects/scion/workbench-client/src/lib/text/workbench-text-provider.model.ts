/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {Capability, ParamDefinition} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Signature of a function to provide texts to the SCION Workbench and micro apps.
 *
 * Texts starting with the percent symbol (`%`) are passed to the text provider for translation, with the percent symbol omitted.
 *
 * A text provider can be registered via {@link WorkbenchClient.registerTextProvider} in the Activator.
 *
 * @param key - Translation key of the text.
 * @param params - Parameters used for text interpolation.
 * @return Text associated with the key, or `undefined` if not found.
 *         Localized applications should return an Observable with the text in the current language, and emit the translated text each time when the language changes.
 *
 * @category Localization
 */
export type WorkbenchTextProviderFn = (key: string, params: {[name: string]: string}) => Observable<string | undefined> | string | undefined;

/**
 * Provides texts to the SCION Workbench and micro apps.
 *
 * @see WorkbenchClient.registerTextProvider
 * @see WorkbenchTextService.text$
 *
 * @category Localization
 */
export interface WorkbenchTextProviderCapability extends Capability {
  /** @inheritDoc */
  type: WorkbenchCapabilities.TextProvider;
  qualifier: {
    /** Symbolic name of the application that provides this text provider. */
    provider: string;
  };
  params: [
      {name: 'key'; required: true} & ParamDefinition,
      {name: 'params'; required: false} & ParamDefinition,
  ];
  private: false;
}

/**
 * Represents either a text or a key for translation.
 *
 * A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
 *
 * Key and parameters are passed to the registered text provider for translation. Applications can register a text provider
 * using {@link WorkbenchClient.registerTextProvider}.
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 * - `text`: no translation key, text is returned as is
 *
 * @category Localization
 */
export type Translatable = string | `%${string}`;
