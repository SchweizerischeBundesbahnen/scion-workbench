/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, Input, OnDestroy, OnInit, Optional, TemplateRef } from '@angular/core';
import { Disposable } from '../../disposable';
import { WorkbenchService } from '../../workbench.service';
import { WorkbenchView } from '../../view/workbench-view.model';
import { WorkbenchViewPart } from '../workbench-view-part.model';
import { asapScheduler } from 'rxjs';

/**
 * Use this directive to model an action contributed to the viewpart action bar located to the right of the view tabs.
 * The host element of this modelling directive must be a <ng-template>. The action shares the lifecycle of the host element.
 *
 * An action is scope aware, that is, if contributed in the context of a view, the action is added to the containing viewpart
 * and is only visible when the view is active.
 *
 * To contribute an action to every viewpart, the action is typically modelled in `app.component.html`.
 *
 * Use the property 'align' to control alignment of the action, either to the left or to the right.
 *
 * ---
 * Usage:
 *
 * <ng-template wbViewPartAction>
 *   <button wbRouterLink="/entry-point" class="material-icons" [wbRouterLinkExtras]="{activateIfPresent: false}">
 *     add
 *   </button>
 * </ng-template>
 */
@Directive({selector: 'ng-template[wbViewPartAction]'})
export class ViewPartActionDirective implements OnInit, OnDestroy {

  private _action!: Disposable;

  @Input()
  public align: 'start' | 'end' = 'start';

  constructor(private _template: TemplateRef<void>,
              @Optional() private _viewPart: WorkbenchViewPart,
              @Optional() private _view: WorkbenchView,
              private _workbench: WorkbenchService) {
  }

  public ngOnInit(): void {
    // Register this action in a subsequent microtask, as the action may be added to a parent component that has already been checked for changes.
    // Otherwise, Angular would throw an `ExpressionChangedAfterItHasBeenCheckedError`.
    asapScheduler.schedule(() => {
      this._action = (this._viewPart || this._workbench).registerViewPartAction({
        templateOrComponent: this._template,
        align: this.align,
        viewId: this._view?.viewId,
      });
    });
  }

  public ngOnDestroy(): void {
    // Unregister this action in a subsequent microtask, as the action may be removed from a parent component that has already been checked for changes.
    // Otherwise, Angular would throw an `ExpressionChangedAfterItHasBeenCheckedError`.
    if (this._action) {
      asapScheduler.schedule(() => this._action.dispose());
    }
  }
}
