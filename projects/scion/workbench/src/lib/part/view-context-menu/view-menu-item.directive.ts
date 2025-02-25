/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, inject, input, output, TemplateRef} from '@angular/core';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchView} from '../../view/workbench-view.model';

/**
 * Directive to add a menu item to the context menu of a view.
 *
 * Right-clicking on a view tab opens a context menu to interact with the view and its content.
 *
 * Usage:
 * Add this directive to an `<ng-template>`. The template content will be used as the menu item content. The menu item shares the lifecycle of its embedding context.
 *
 * ```html
 * <ng-template wbViewMenuItem [accelerator]="['ctrl', 'alt', '1']" (action)="...">
 *   ...
 * </ng-template>
 * ```
 *
 * The {@link WorkbenchView} is available as the default template variable (`let-view`).
 *
 * ```html
 * <ng-template wbViewMenuItem let-view>
 *   ...
 * </ng-template>
 * ```
 *
 * Menu items are context-sensitive:
 * - Declaring the menu item in a view's template displays it only in the context menu of that view.
 * - Declaring the menu item outside a view context, such as within `<wb-workbench>`, displays it in the context menu of every view.
 *
 * A predicate can be used to match a specific context, such as a particular view or condition.
 *
 * ```html
 * <ng-template wbViewMenuItem [canMatch]="...">
 *   ...
 * </ng-template>
 * ```
 *
 * Alternatively, menu items can be added using a factory function and registered via {@link WorkbenchService.registerViewMenuItem}.
 */
@Directive({selector: 'ng-template[wbViewMenuItem]'})
export class WorkbenchViewMenuItemDirective {

  /**
   * Binds keyboard accelerator(s) to the menu item, e.g., ['ctrl', 'alt', 1].
   *
   * Supported modifiers are 'ctrl', 'shift', 'alt' and 'meta'.
   */
  public readonly accelerator = input<string[] | undefined>();

  /**
   * Enables grouping of menu items.
   */
  public readonly group = input<string | undefined>();

  /**
   * Controls if the menu item is disabled. Defaults to `false`.
   */
  public readonly disabled = input<boolean>();

  /**
   * Predicate to match a specific context, such as a particular view or condition. Defaults to any context.
   *
   * The function:
   * - Can call `inject` to get any required dependencies.
   * - Runs in a reactive context and is called again when tracked signals change.
   *   Use Angular's `untracked` function to execute code outside this reactive context.
   */
  public readonly canMatch = input<(view: WorkbenchView) => boolean>();

  /**
   * Specifies CSS class(es) to add to the menu item, e.g., to locate the menu item in tests.
   */
  public readonly cssClass = input<string | string[] | undefined>();

  /**
   * Emits when the menu item is clicked.
   */
  public readonly action = output<WorkbenchView>();

  constructor() {
    this.registerMenuItem();
  }

  private registerMenuItem(): void {
    const template = inject(TemplateRef) as TemplateRef<void>;
    const workbenchService = inject(WorkbenchService);
    const context = {
      view: inject(WorkbenchView, {optional: true}),
    };

    const action = workbenchService.registerViewMenuItem((view: WorkbenchView) => {
      if (context.view && context.view.id !== view.id) {
        return null;
      }
      if (this.canMatch() && !this.canMatch()!(view)) {
        return null;
      }

      return {
        content: template,
        accelerator: this.accelerator(),
        group: this.group(),
        cssClass: this.cssClass(),
        disabled: this.disabled(),
        onAction: () => this.action.emit(view),
      };
    });

    inject(DestroyRef).onDestroy(() => action.dispose());
  }
}
