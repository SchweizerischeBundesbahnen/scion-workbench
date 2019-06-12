/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, ContentChild, ContentChildren, HostListener, Input, QueryList } from '@angular/core';
import { WorkbenchPopup } from '@scion/workbench-application.angular';
import { SciPopupShellTitleDirective } from './popup-shell-title.directive';
import { SciPopupShellContentDirective } from './popup-shell-content.directive';
import { SciPopupShellButtonDirective } from './popup-shell-button.directive';

/**
 * Component that provides the shell for a popup.
 *
 * The shell consists of the following elements:
 *   - close button in the top-right corner
 *   - title at the top
 *   - button panel at the bottom with an 'OK' button (enabled if valid)
 *
 * This component can be used only in a workbench popup context.
 *
 * Title and content are contributed as content children in the form of a `<ng-template>` decorated with `sciPopupShellTitle`
 * directive and `sciPopupShellContent`, respectively.
 *
 * Content is added to a CSS grid container with a single column.
 *
 * ---
 * Example:
 *
 * <sci-popup-shell [valid]="..." (ok)="...">
 *   <ng-template sciPopupShellTitle>Title</ng-template>
 *
 *   <ng-template sciPopupShellContent>
 *     ...
 *   </ng-template>
 * </sci-popup-shell>
 */
@Component({
  selector: 'sci-popup-shell',
  templateUrl: './popup-shell.component.html',
  styleUrls: ['./popup-shell.component.scss'],
})
export class SciPopupShellComponent implements AfterViewInit {

  @Input()
  public valid: boolean;

  @ContentChild(SciPopupShellTitleDirective, {static: false})
  public title: SciPopupShellTitleDirective;

  @ContentChild(SciPopupShellContentDirective, {static: false})
  public content: SciPopupShellContentDirective;

  @ContentChildren(SciPopupShellButtonDirective)
  public buttons: QueryList<SciPopupShellButtonDirective>;

  constructor(private _popup: WorkbenchPopup) {
  }

  @HostListener('keydown.enter', ['$event'])
  public onEnter(event: Event): void {
    this.valid && this.buttons.forEach(button => button.defaultButton && button.onClick(event));
  }

  public onClose(): void {
    this._popup.close();
  }

  public ngAfterViewInit(): void {
    if (!this.title) {
      throw Error('[NullTitleError] No title template decorated with `sciPopupShellTitle` directive modelled as content child of \u02C2sci-popup-shell\u02C3');
    }
    if (!this.content) {
      throw Error('[NullContentError] No content template decorated with `sciPopupShellContent` directive modelled as content child of \u02C2sci-popup-shell\u02C3');
    }
  }
}
