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
import { Disposable } from '@scion/workbench-application.core';
import { WorkbenchActivity } from '@scion/workbench-application.angular';
import { CustomActivityActionTypes, CustomNotifyActivityAction } from '@scion/app/common';


/**
 * Use this directive to model an activity action which shows a notification to the user.
 *
 * The host element of this modelling directive must be a <ng-container> in the context of an activity.
 *
 * Example usage:
 *
 * <ng-container appNotifyActivityAction text="..." title="..."></ng-container>
 */
@Directive({
  selector: 'ng-container[appCustomActivityAction]',
  exportAs: 'activityAction'
})
export class CustomNotifyActivityActionDirective implements OnInit, OnDestroy {

  private _action: Disposable;

  @Input()
  public title: string;

  @Input()
  public text: string;

  /**
   * Specifies the CSS class(es) set to the button.
   */
  @Input()
  public cssClass: string | string[];

  constructor(@Optional() private _activity: WorkbenchActivity) {
    if (!_activity) {
      throw Error('[NullActivityError] Action not in the context of an activity. Did you forget to invoke \'provideWorkbenchActivity(...)\' from the component\'s providers metadata?');
    }
  }

  public ngOnInit(): void {
    const action: CustomNotifyActivityAction = {
      type: CustomActivityActionTypes.CustomNotify,
      properties: {
        text: this.text,
        title: this.title,
        cssClass: this.cssClass,
      },
    };
    this._action = this._activity.addAction(action);
  }

  public ngOnDestroy(): void {
    this._action.dispose();
  }
}
