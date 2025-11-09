/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {effect, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {SettingsService} from '../settings.service';

/**
 * Highlights glasspanes if enabled in settings.
 *
 * This function must be called within an injection context.
 */
export function installGlasspaneHighlighter(): void {
  const highlightGlasspane = toSignal(inject(SettingsService).observe$('highlightGlasspane'));

  // Enable highlighting based on 'highlightGlasspane' setting.
  effect(() => {
    if (highlightGlasspane()) {
      document.documentElement.setAttribute('data-highlight-glasspane', '');
    }
    else {
      document.documentElement.removeAttribute('data-highlight-glasspane');
    }
  });
}
