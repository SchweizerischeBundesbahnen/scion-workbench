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
import { Disposable, PlatformActivityActionTypes, UrlOpenActivityAction } from '@scion/workbench-application.core';

/**
 * Use this directive to model an activity action which opens an URL in a separate browser tab.
 * The action is displayed in the upper right corner of the activity panel header.
 *
 * The host element of this modelling directive must be a <ng-container> in the context of an activity.
 *
 * Example usage:
 *
 * <ng-container wbUrlOpenActivityAction
 *               [label]="'search'"
 *               [title]="'Search'"
 *               [cssClass]="'material-icons'"
 *               [url]="'http://www.google.ch'">
 * </ng-container>
 */
@Directive({
  selector: 'ng-container[wbUrlOpenActivityAction]',
  exportAs: 'activityAction',
})
export class WorkbenchUrlOpenActivityActionDirective implements OnInit, OnDestroy {

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
   * Specifies the URL to open when the button is clicked.
   */
  @Input()
  public url: string;

  constructor(@Optional() private _activity: WorkbenchActivity) {
    if (!_activity) {
      throw Error('[NullActivityError] Action not in the context of an activity. Did you forget to invoke \'provideWorkbenchActivity(...)\' from the component\'s providers metadata?');
    }
  }

  public ngOnInit(): void {
    if (!this.url) {
      throw Error('[UrlRequiredError] Activity action requires an URL');
    }

    const action: UrlOpenActivityAction = {
      type: PlatformActivityActionTypes.UrlOpen,
      properties: {
        label: this.label,
        title: this.title,
        cssClass: this.cssClass,
        url: this.url,
      },
    };
    this._action = this._activity.addAction(action);
  }

  public ngOnDestroy(): void {
    this._action.dispose();
  }
}
