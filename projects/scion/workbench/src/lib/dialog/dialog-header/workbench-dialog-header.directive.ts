/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, Directive, Input, OnDestroy, TemplateRef} from '@angular/core';
import {ɵWorkbenchDialog} from '../ɵworkbench-dialog';
import {Disposable} from '../../common/disposable';
import {asapScheduler} from 'rxjs';

/**
 * Use this directive to replace the default dialog header that displays the title and a close button.
 *
 * The host element of this modeling directive must be a <ng-template>. The header shares the lifecycle of the host element.
 *
 * **Example:**
 * ```html
 * <ng-template wbDialogHeader>
 *   <app-dialog-header/>
 * </ng-template>
 * ```
 */
@Directive({selector: 'ng-template[wbDialogHeader]', standalone: true})
export class WorkbenchDialogHeaderDirective implements OnDestroy {

  private _header: Disposable | undefined;

  /**
   * Specifies if to display a visual separator between this header and the dialog content.
   * Default is `true`.
   */
  @Input({transform: booleanAttribute})
  public divider?: boolean;

  constructor(public readonly template: TemplateRef<void>, dialog: ɵWorkbenchDialog) {
    // Defer registering header to avoid `ExpressionChangedAfterItHasBeenCheckedError`.
    asapScheduler.schedule(() => this._header = dialog.registerHeader(this));
  }

  public ngOnDestroy(): void {
    // Defer disposing header to avoid `ExpressionChangedAfterItHasBeenCheckedError`.
    asapScheduler.schedule(() => this._header?.dispose());
  }
}
