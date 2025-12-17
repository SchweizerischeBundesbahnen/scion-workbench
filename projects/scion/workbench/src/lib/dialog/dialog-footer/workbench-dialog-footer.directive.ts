/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, DestroyRef, Directive, inject, input, TemplateRef} from '@angular/core';
import {ɵWorkbenchDialog} from '../ɵworkbench-dialog.model';
import {Disposable} from '../../common/disposable';
import {asapScheduler} from 'rxjs';

/**
 * Use this directive to replace the default dialog footer that renders actions contributed via the {@link WorkbenchDialogActionDirective} directive.
 *
 * The host element of this modeling directive must be a <ng-template>. The footer shares the lifecycle of the host element.
 *
 * **Example:**
 * ```html
 * <ng-template wbDialogFooter>
 *   <app-dialog-footer/>
 * </ng-template>
 * ```
 */
@Directive({selector: 'ng-template[wbDialogFooter]'})
export class WorkbenchDialogFooterDirective {

  /**
   * Specifies if to display a visual separator between the dialog content and this footer.
   * Defaults to `true`.
   */
  public readonly divider = input(undefined, {transform: booleanAttribute});
  public readonly template = inject(TemplateRef) as TemplateRef<void>;

  private _footer: Disposable | undefined;

  constructor() {
    const dialog = inject(ɵWorkbenchDialog);

    // Defer registering footer to avoid `ExpressionChangedAfterItHasBeenCheckedError`.
    asapScheduler.schedule(() => this._footer = dialog.registerFooter(this));

    // Defer disposing footer to avoid `ExpressionChangedAfterItHasBeenCheckedError`.
    inject(DestroyRef).onDestroy(() => asapScheduler.schedule(() => this._footer?.dispose()));
  }
}
