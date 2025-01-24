/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, inject, TemplateRef} from '@angular/core';
import {DESKTOP} from '../workbench-element-references';

/**
 * Directive to add a desktop to the workbench.
 *
 * The desktop is displayed when no view is open and the layout does not contain a navigated part.
 *
 * A desktop can provide instructions for working with the application, display a welcome page, or provide links to open views.
 *
 * Usage:
 * Add this directive to an `<ng-template>` child of the `<wb-workbench>` component. The template content will be used as desktop content.
 *
 * ```html
 * <wb-workbench>
 *   <ng-template wbDesktop>
 *     Welcome
 *   </ng-template>
 * </wb-workbench>
 * ```
 *
 * > Using `@if` allows displaying the desktop based on a condition, e.g. the active perspective.
 *
 * For layouts with a main area, it is recommended to navigate the main area part instead:
 * ```ts
 * import {MAIN_AREA, provideWorkbench} from '@scion/workbench';
 *
 * provideWorkbench({
 *   layout: factory => factory
 *     .addPart(MAIN_AREA)
 *     .navigatePart(MAIN_AREA, ['path/to/desktop'])
 * });
 * ```
 */
@Directive({selector: 'ng-template[wbDesktop]', standalone: true})
export class WorkbenchDesktopDirective {

  constructor() {
    const template = inject(TemplateRef<void>);
    const desktop = inject(DESKTOP);

    // Register the desktop.
    desktop.set(template);

    // Unregister the desktop when destroyed, but only if no other desktop has been registered in the meantime.
    inject(DestroyRef).onDestroy(() => {
      if (desktop() === template) {
        desktop.set(undefined);
      }
    });
  }
}
