/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { WorkbenchActivity } from './workbench-activity';
import { Disposable, PlatformActivityActionTypes, Qualifier, ViewOpenActivityAction } from '@scion/workbench-application.core';
import { Params } from '@angular/router';

/**
 * Use this directive to model an activity action which opens a workbench view.
 * The action is displayed in the upper right corner of the activity panel header.
 *
 * The host element of this modelling directive must be a <ng-container> in the context of an activity.
 *
 * Example usage:
 *
 * <ng-container wbViewOpenActivityAction
 *               [label]="'add'"
 *               [title]="'Add person'"
 *               [cssClass]="'material-icons'"
 *               [qualifier]="{entity: 'person', type: 'new'}">
 * </ng-container>
 */
@Directive({
  selector: 'ng-container[wbViewOpenActivityAction]',
  exportAs: 'activityAction',
})
export class WorkbenchViewOpenActivityActionDirective implements OnInit, OnDestroy {

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
   * Qualifies the view to open.
   */
  @Input()
  public qualifier: Qualifier;

  /**
   * Specifies optional query parameters to open the view.
   */
  @Input()
  public queryParams: Params;
  /**
   * Specifies optional matrix parameters to open the view.
   *
   * Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters,
   * but do not affect route resolution.
   */
  @Input()
  public matrixParams: Params;
  /**
   * Activates the view if it is already present.
   * If not present, the view is opened according to the specified 'target' strategy.
   */
  @Input()
  public activateIfPresent: boolean;
  /**
   * Closes the view if present. Has no effect if no view is present which matches the qualifier.
   */
  @Input()
  public closeIfPresent: boolean;

  constructor(@Optional() private _activity: WorkbenchActivity) {
    if (!_activity) {
      throw Error('[NullActivityError] Action not in the context of an activity. Did you forget to invoke \'provideWorkbenchActivity(...)\' from the component\'s providers metadata?');
    }
  }

  public ngOnInit(): void {
    if (!this.qualifier) {
      throw Error('[QualifierRequiredError] Activity action requires a qualifier');
    }

    const action: ViewOpenActivityAction = {
      type: PlatformActivityActionTypes.ViewOpen,
      properties: {
        qualifier: this.qualifier,
        label: this.label,
        title: this.title,
        cssClass: this.cssClass,
        queryParams: this.queryParams,
        matrixParams: this.matrixParams,
        activateIfPresent: this.activateIfPresent,
        closeIfPresent: this.closeIfPresent,
      },
    };
    this._action = this._activity.addAction(action);
  }

  public ngOnDestroy(): void {
    this._action.dispose();
  }
}
