/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {afterRenderEffect, effect, inject, untracked} from '@angular/core';
import {WorkbenchElement, WorkbenchService} from '@scion/workbench';
import {toSignal} from '@angular/core/rxjs-interop';
import {SettingsService} from '../settings.service';

/**
 * Highlights the active workbench element if enabled in settings.
 *
 * This function must be called within an injection context.
 */
export function installFocusHighlighter(): void {
  const workbenchService = inject(WorkbenchService);
  const highlightFocus = toSignal(inject(SettingsService).observe$('highlightFocus'));

  // Enable highlighting based on 'highlightFocus' setting.
  effect(() => {
    if (highlightFocus()) {
      document.documentElement.setAttribute('data-highlight-focus', '');
    }
    else {
      document.documentElement.removeAttribute('data-highlight-focus');
    }
  });

  // Mark focused element for styling.
  afterRenderEffect(onCleanup => {
    if (!highlightFocus()) {
      return;
    }

    const activeWorkbenchElement = workbenchService.activeElement();

    untracked(() => {
      const element = activeWorkbenchElement ? querySelector(activeWorkbenchElement) : null;
      if (element) {
        element.setAttribute('data-focus', '');
        onCleanup(() => element.removeAttribute('data-focus'));
      }
    });
  });

  function querySelector(element: WorkbenchElement): Element | null {
    switch (element.id.split('.').at(0)) {
      case 'part': {
        return document.querySelector(`wb-part[data-partid="${element.id}"]`);
      }
      case 'view': {
        return document.querySelector(`wb-view-slot[data-viewid="${element.id}"]`);
      }
      case 'dialog': {
        return document.querySelector(`wb-dialog[data-dialogid="${element.id}"]`);
      }
      case 'popup': {
        return document.querySelector(`wb-popup[data-popupid="${element.id}"]`);
      }
      case 'notification': {
        return document.querySelector(`wb-notification[data-notificationid="${element.id}"]`);
      }
      default: {
        return null;
      }
    }
  }
}
