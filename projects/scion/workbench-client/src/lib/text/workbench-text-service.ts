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
import {Translatable} from './workbench-text-provider.model';

/**
 * Provides texts from micro applications.
 *
 * @category Localization
 */
export abstract class WorkbenchTextService {

  /**
   * Gets the text for given {@link Translatable} from the specified application. Text requests are cached.
   *
   * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to the specified application for translation, with the percent symbol omitted.
   * Otherwise, the text is returned as is. A translation key may include parameters in matrix notation for text interpolation.
   *
   * Examples:
   * - `%key`: translation key
   * - `%key;param=value`: translation key with a single interpolation parameter
   * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
   * - `text`: no translation key, text is returned as is
   *
   * The application must declare an intention to get texts from another application:
   *
   * ```json
   * {
   *   "type": "text-provider",
   *   "qualifier": {
   *     "provider": "<APP_SYMBOLIC_NAME>" // Replace with the symbolic name of the providing application
   *   }
   * },
   * ```
   * Applications can register a text provider using {@link WorkbenchClient.registerTextProvider} to provide texts to other applications.
   *
   * @param translatable - Specifies the translatable.
   * @param options - Options for requesting the text.
   * @param options.provider - The application that provides the text.
   * @param options.timeout - Maximum time in milliseconds to wait for the text. Defaults to `30s`.
   * @return Observable emitting the text or `undefined` if not found. Localized texts are emitted
   *         in the current language, and each time when the language changes. If an error occurs,
   *         emits the key and logs the error.
   */
  public abstract text$(translatable: Translatable, options: {provider: string; timeout?: number}): Observable<string | undefined>;
}
