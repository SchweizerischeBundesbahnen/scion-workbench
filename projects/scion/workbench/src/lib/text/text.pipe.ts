/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform, signal, Signal, untracked} from '@angular/core';
import {Translatable} from './workbench-text-provider.model';
import {text} from './text';

/**
 * Enables the translation of a given {@link Translatable}.
 *
 * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to the text provider for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is. A translation key may include parameters in matrix notation for text interpolation.
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 * - `text`: no translation key, text is returned as is
 *
 * @experimental since 20.0.0-beta.3; API and behavior may change in any version without notice.
 */
@Pipe({name: 'wbText'})
export class TextPipe implements PipeTransform {

  private _translatable = signal<Translatable | undefined | null>(undefined);
  private _text = text(this._translatable);

  public transform(translatable: Translatable): Signal<string>;
  public transform(translatable: Translatable | undefined): Signal<string | undefined>;
  public transform(translatable: Translatable | null): Signal<string | null>;
  public transform(translatable: Translatable | undefined | null): Signal<string | undefined | null> {
    // DO NOT call text() on key change to avoid stale RxJS subscriptions of previous texts,
    // as allocated resources are only cleaned up when the injection context, such as this pipe, is destroyed.
    untracked(() => this._translatable.set(translatable));
    return this._text;
  }
}
