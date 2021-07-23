/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Directive, OnDestroy, TemplateRef} from '@angular/core';
import {WorkbenchActivityPartService} from './workbench-activity-part.service';
import {ActivatedRoute} from '@angular/router';
import {Disposable} from '../disposable';

/**
 * Use this directive to model an action for an activity, which is displayed
 * in the upper right corner of the activity panel header.
 *
 * The host element of this modelling directive must be a <ng-template> in the context of an activity.
 *
 * Example usage:
 *
 * <ng-template wbActivityAction>
 *   <button [wbRouterLink]="['user', 'new']" mat-icon-button title="Create user">
 *     <mat-icon>add</mat-icon>
 *   </button>
 * </ng-template>
 */
@Directive({
  selector: 'ng-template[wbActivityAction]',
  exportAs: 'activityAction',
})
export class WbActivityActionDirective implements OnDestroy {

  private readonly _action: Disposable;

  constructor(private _template: TemplateRef<void>,
              activityService: WorkbenchActivityPartService,
              route: ActivatedRoute) {
    const activity = activityService.getActivityFromRoutingContext(route.snapshot);
    if (!activity) {
      throw Error('[RoutingContextError] Route not in the context of an activity');
    }

    this._action = activity.registerAction(this._template);
  }

  public ngOnDestroy(): void {
    this._action.dispose();
  }
}
