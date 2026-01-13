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
 * Shows microfrontend application labels if enabled in settings.
 *
 * This function must be called within an injection context.
 */
export function installMicrofrontendApplicationLabels(): void {
  const showMicrofrontendApplicationLabels = toSignal(inject(SettingsService).observe$('showMicrofrontendApplicationLabels'));

  // Show microfrontend application labels based on 'showMicrofrontendApplicationLabels' setting.
  effect(() => {
    if (showMicrofrontendApplicationLabels()) {
      document.documentElement.setAttribute('data-show-microfrontend-application-labels', '');
    }
    else {
      document.documentElement.removeAttribute('data-show-microfrontend-application-labels');
    }
  });
}
