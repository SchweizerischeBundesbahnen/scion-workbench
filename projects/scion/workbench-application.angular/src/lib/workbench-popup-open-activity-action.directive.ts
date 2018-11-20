/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { WorkbenchActivity } from './workbench-activity';
import { Disposable, PlatformActivityActionTypes, PopupOpenActivityAction, Qualifier } from '@scion/workbench-application.core';
import { Params } from '@angular/router';

/**
 * Use this directive to model an activity action which opens a workbench popup.
 * The action is displayed in the upper right corner of the activity panel header.
 *
 * The host element of this modelling directive must be a <ng-container> in the context of an activity.
 *
 * Example usage:
 *
 * <ng-container wbPopupOpenActivityAction
 *               [label]="'add'"
 *               [title]="'Add person'"
 *               [cssClass]="'material-icons'"
 *               [qualifier]="{entity: 'person', type: 'new'}">
 * </ng-container>
 */
@Directive({
  selector: 'ng-container[wbPopupOpenActivityAction]',
  exportAs: 'activityAction'
})
export class WorkbenchPopupOpenActivityActionDirective implements OnInit, OnDestroy {

  private _action: Disposable;

  /**
   * Specifies the label of the button.
   */
  @Input()
  public label: string;

  /**
   * Specifies the title of the button.
   */
  @Input()
  public title: string;

  /**
   * Specifies the CSS class(es) set to the button.
   */
  @Input()
  public cssClass: string | string[];

  /**
   * Qualifies the popup to open.
   */
  @Input()
  public qualifier: Qualifier;

  /**
   * Specifies optional query parameters to open the popup.
   */
  @Input()
  public queryParams: Params;
  /**
   * Specifies optional matrix parameters to open the popup.
   *
   * Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters,
   * but do not affect route resolution.
   */
  @Input()
  public matrixParams: Params;

  /**
   * Specifies if to close the popup on focus lost, which is `true` by default.
   */
  @Input()
  public onFocusLost?: boolean;
  /**
   * Specifies if to close the popup on escape keystroke, which is `true` by default.
   */
  @Input()
  public onEscape: boolean;
  /**
   * Specifies if to close the popup on workbench view grid change, which is `true` by default.
   */
  @Input()
  public onGridLayoutChange: boolean;

  constructor(@Optional() private _activity: WorkbenchActivity) {
    if (!_activity) {
      throw Error('[NullActivityError] Action not in the context of an activity. Did you forget to invoke \'provideWorkbenchActivity(...)\' from the component\'s providers metadata?');
    }
  }

  public ngOnInit(): void {
    if (!this.qualifier) {
      throw Error('[QualifierRequiredError] Activity action requires a qualifier');
    }

    const action: PopupOpenActivityAction = {
      type: PlatformActivityActionTypes.PopupOpen,
      properties: {
        qualifier: this.qualifier,
        label: this.label,
        title: this.title,
        cssClass: this.cssClass,
        queryParams: this.queryParams,
        matrixParams: this.matrixParams,
        closeStrategy: {
          onFocusLost: this.onFocusLost,
          onEscape: this.onEscape,
          onGridLayoutChange: this.onGridLayoutChange,
        }
      },
    };
    this._action = this._activity.addAction(action);
  }

  public ngOnDestroy(): void {
    this._action.dispose();
  }
}
