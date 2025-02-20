/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, inject, input, TemplateRef} from '@angular/core';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPart} from '../workbench-part.model';

/**
 * Directive to add an action to a part.
 *
 * Part actions are displayed in the part bar, enabling interaction with the part and its content. Actions can be aligned to the left or right.
 *
 * Usage:
 * Add this directive to an `<ng-template>`. The template content will be used as the action content. The action shares the lifecycle of its embedding context.
 *
 * ```html
 * <ng-template wbPartAction>
 *   ...
 * </ng-template>
 * ```
 *
 * The {@link WorkbenchPart} is available as the default template variable (`let-part`).
 *
 * ```html
 * <ng-template wbPartAction let-part>
 *   ...
 * </ng-template>
 * ```
 *
 * Part actions are context-sensitive:
 * - Declaring the action in a part's template displays it only in that part.
 * - Declaring the action in a view's template displays it only when that view is active.
 * - Declaring the action outside a part and view context, such as within `<wb-workbench>`, displays it in every part.
 *
 * A predicate can be used to match a specific context, such as a particular part or condition.
 *
 * ```html
 * <ng-template wbPartAction [canMatch]="...">
 *   ...
 * </ng-template>
 * ```
 *
 * Alternatively, actions can be added using a factory function and registered via {@link WorkbenchService.registerPartAction}.
 */
@Directive({selector: 'ng-template[wbPartAction]'})
export class WorkbenchPartActionDirective {

  /**
   * Specifies where to place this action in the part bar. Defaults to `end`.
   */
  public readonly align = input<'start' | 'end' | undefined>();

  /**
   * Predicate to match a specific context, such as a particular part or condition. Defaults to any context.
   *
   * The function:
   * - Can call `inject` to get any required dependencies.
   * - Runs in a reactive context and is called again when tracked signals change.
   *   Use Angular's `untracked` function to execute code outside this reactive context.
   */
  public readonly canMatch = input<(part: WorkbenchPart) => boolean>();

  /**
   * Specifies CSS class(es) to add to the action, e.g., to locate the action in tests.
   */
  public readonly cssClass = input<string | string[] | undefined>();

  constructor() {
    this.registerPartAction();
  }

  private registerPartAction(): void {
    const template = inject(TemplateRef<void>);
    const workbenchService = inject(WorkbenchService);
    const context = {
      view: inject(WorkbenchView, {optional: true}),
      part: inject(WorkbenchPart, {optional: true}),
    };

    const action = workbenchService.registerPartAction((part: WorkbenchPart) => {
      if (context.part && context.part.id !== part.id) {
        return null;
      }
      if (context.view && context.view.id !== part.activeViewId()) {
        return null;
      }
      if (this.canMatch() && !this.canMatch()!(part)) {
        return null;
      }

      return {
        content: template,
        align: this.align(),
        cssClass: this.cssClass(),
      };
    });

    inject(DestroyRef).onDestroy(() => action.dispose());
  }
}
