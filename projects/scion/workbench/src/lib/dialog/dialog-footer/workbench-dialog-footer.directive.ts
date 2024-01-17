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
@Directive({selector: 'ng-template[wbDialogFooter]', standalone: true})
export class WorkbenchDialogFooterDirective implements OnDestroy {

  private _footer: Disposable;

  /**
   * Specifies if to display a visual separator between the dialog content and this footer.
   * Default is `true`.
   */
  @Input({transform: booleanAttribute})
  public divider?: boolean;

  constructor(public readonly template: TemplateRef<void>, dialog: ɵWorkbenchDialog) {
    this._footer = dialog.registerFooter(this);
  }

  public ngOnDestroy(): void {
    this._footer.dispose();
  }
}
