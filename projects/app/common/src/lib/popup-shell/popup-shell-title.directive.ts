/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, TemplateRef } from '@angular/core';

/**
 * Use this directive to model the title for {SciPopupComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * ---
 * Example usage:
 *
 * <sci-popup-shell [valid]="..." (ok)="...">
 *   <ng-template sciPopupShellTitle>Title</ng-template>
 *
 *   <ng-template sciPopupShellContent>
 *     ...
 *   </ng-template>
 * </sci-popup-shell>
 */
@Directive({selector: 'ng-template[sciPopupShellTitle]'})
export class SciPopupShellTitleDirective {

  constructor(public readonly template: TemplateRef<void>) {
  }
}
