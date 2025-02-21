/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, inject, input, TemplateRef} from '@angular/core';
import {ɵWorkbenchDialog} from '../ɵworkbench-dialog';
import {Disposable} from '../../common/disposable';
import {asapScheduler} from 'rxjs';

/**
 * Use this directive to contribute an action to the dialog footer (only applicable if not using a custom dialog footer).
 *
 * Actions are displayed in the order as modeled in the template and can be placed either on the left or right.
 *
 * The host element of this modeling directive must be a <ng-template>. The action shares the lifecycle of the host element.
 *
 * **Example:**
 * ```html
 * <ng-template wbDialogAction>
 *   <button (click)="dialog.close()">Close</button>
 * </ng-template>
 * ```
 */
@Directive({selector: 'ng-template[wbDialogAction]'})
export class WorkbenchDialogActionDirective {

  /**
   * Specifies where to place this action in the dialog footer. Defaults to `end`.
   */
  public readonly align = input<'start' | 'end'>('end');
  public readonly template = inject(TemplateRef) as TemplateRef<void>;

  private _action: Disposable | undefined;

  constructor() {
    const dialog = inject(ɵWorkbenchDialog);

    // Defer registering action to avoid `ExpressionChangedAfterItHasBeenCheckedError`.
    asapScheduler.schedule(() => this._action = dialog.registerAction(this));

    // Defer disposing action to avoid `ExpressionChangedAfterItHasBeenCheckedError`.
    inject(DestroyRef).onDestroy(() => asapScheduler.schedule(() => this._action?.dispose()));
  }
}
