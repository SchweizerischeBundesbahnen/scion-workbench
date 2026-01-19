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
 * Applications can register a text provider using {@link WorkbenchClient.registerTextProvider} to provide texts to other applications.
 *
 * To get texts from another application, the application must declare an intention:
 *
 * ```json
 * {
 *   "type": "text-provider",
 *   "qualifier": {
 *     "provider": "<APP_SYMBOLIC_NAME>" // Replace with the symbolic name of the providing application
 *   }
 * },
 * ```
 *
 * @category Localization
 */
export abstract class WorkbenchTextService {

  /**
   * Gets the text for given {@link Translatable} from the specified application. Text requests are cached.
   *
   * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to the specified application for translation, with the percent symbol omitted.
   * Otherwise, the text is returned as is.
   *
   * Interpolation parameters can either be passed via options or appended to the translatable in matrix notation. If appended to the translatable, semicolons must be escaped with two backslashes (`\\;`).
   *
   * @example - Request the text for given key
   * ```ts
   * Beans.get(WorkbenchTextService).text$('%key', {provider: 'app'});
   * ```
   *
   * @example - Request the text for given key and interpolation parameters
   * ```ts
   * Beans.get(WorkbenchTextService).text$('%key;param1=value1;param2=value2', {provider: 'app'});
   *
   * // Alternatively, parameters can be passed via options.
   * Beans.get(WorkbenchTextService).text$('%key', {params: {param1: 'value1', param2: 'value2'}, provider: 'app'});
   * ```
   *
   * @param translatable - Specifies the translatable.
   * @param options - Options for requesting the text.
   * @param options.provider - Application that provides the text.
   * @param options.params - Parameters for text interpolation.
   * @param options.ttl - Time to retain texts in the cache after the last subscriber unsubscribes, in milliseconds. Defaults to the next animation frame.
   * @return Observable emitting the requested text or `undefined` if not found.
   *         Localized texts are emitted in the current language, and each time when the language changes.
   *         If an error occurs, the observable emits the passed translation key and then completes. The error is not propagated.
   */
  public abstract text$(translatable: Translatable | undefined, options: {provider: string; params?: Record<string, unknown> | Map<string, unknown>; ttl?: number}): Observable<string | undefined>;
}
