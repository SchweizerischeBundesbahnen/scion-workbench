/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, InjectionToken, isSignal, signal, Signal} from '@angular/core';

export const TEXT = new InjectionToken<string | (() => string | Signal<string>)>('TEXT');

/**
 * Component which renders text injected via {@link TEXT} injection token.
 */
@Component({
  selector: 'wb-text',
  template: '{{text()}}',
  standalone: true,
})
export class TextComponent {

  protected text = coerceText(inject(TEXT));
}

function coerceText(textOrFn: string | (() => string | Signal<string>)): Signal<string> {
  if (typeof textOrFn === 'function') {
    const text = textOrFn();
    return isSignal(text) ? text : signal(text);
  }
  return signal(textOrFn);
}
