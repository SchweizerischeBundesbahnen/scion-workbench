/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform, signal, Signal, untracked} from '@angular/core';
import {Translatable} from './text-provider.model';
import {text} from './text';

/**
 * Gets the text for given {@link Translatable} from registered text providers.
 *
 * A {@link Translatable} is a string that, if starting with the percent symbol (`%`), is passed to registered text providers for translation, with the percent symbol omitted.
 * Otherwise, the text is returned as is.
 *
 * A translation key may include parameters in matrix notation for text interpolation. Escape semicolons with two backslashes (`\\;`).
 *
 * Examples:
 * - `%key`: translation key
 * - `%key;param=value`: translation key with a single interpolation parameter
 * - `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
 * - `text`: no translation key, text is returned as is
 */
@Pipe({name: 'sciText'})
export class SciTextPipe implements PipeTransform {

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
