/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

/**
 * Use this directive to model a button for {SciPopupComponent}.
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
 *   <ng-template sciPopupShellButton (click)="...">OK</ng-template>
 * </sci-popup-shell>
 */
@Directive({selector: 'ng-template[sciPopupShellButton]'})
export class SciPopupShellButtonDirective {

  /**
   * Specifies if this is the default button, meaning it is enabled only if valid
   * and clicked upon enter keystroke.
   */
  @Input()
  public defaultButton = true;

  /**
   * Specifies CSS class(es) added to the <button>, e.g. used for e2e testing.
   */
  @Input()
  public cssClass: string | string[];

  @Output()
  public click = new EventEmitter<Event>();

  constructor(public readonly template: TemplateRef<void>) {
  }

  public onClick(event: Event): void {
    this.click.emit(event);
  }
}
