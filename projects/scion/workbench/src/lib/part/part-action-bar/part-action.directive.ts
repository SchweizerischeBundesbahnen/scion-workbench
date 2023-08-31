/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, Input, OnDestroy, OnInit, Optional, TemplateRef} from '@angular/core';
import {Disposable} from '../../common/disposable';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchView} from '../../view/workbench-view.model';
import {TemplatePortal} from '@angular/cdk/portal';
import {WorkbenchPart} from '../workbench-part.model';
import {CanMatchPartFn} from '../../workbench.model';

/**
 * Use this directive to contribute an action to a part's action bar.
 *
 * Part actions are displayed to the right of the view tab bar and enable interaction with the part and its content.
 *
 * The host element of this modeling directive must be a <ng-template>. The action shares the lifecycle of the host element.
 *
 * ```html
 * <ng-template wbPartAction>
 *   <button wbRouterLink="/path/to/view" [wbRouterLinkExtras]="{target: 'blank'}" class="material-icons">
 *     add
 *   </button>
 * </ng-template>
 * ```
 *
 * If the action is modeled in a view template, it is inherently associated with that view, i.e., only displayed when active.
 * To not associate an action with a view, model the action inside the `wb-workbench` HTML element or register it programmatically.
 *
 * Specify a `canMatch` function to match a specific part, parts in a specific area, or parts from a specific perspective.
 */
@Directive({selector: 'ng-template[wbPartAction]', standalone: true})
export class WorkbenchPartActionDirective implements OnInit, OnDestroy {

  private _action: Disposable | undefined;

  /**
   * Specifies where to place this action in the part bar.
   */
  @Input()
  public align: 'start' | 'end' = 'start';

  /**
   * Predicate to match a specific part, parts in a specific area, or parts from a specific perspective.
   *
   * If the action is modeled in a view template, it is inherently associated with that view, i.e., only displayed
   * when active. To not associate an action with a view, model the action inside the `wb-workbench` HTML element
   * or register it programmatically.
   *
   * The function can call `inject` to get any required dependencies.
   */
  @Input()
  public canMatch?: CanMatchPartFn;

  /**
   * Specifies CSS class(es) to be associated with the action, useful in end-to-end tests for locating it.
   */
  @Input()
  public cssClass?: string | string[] | undefined;

  constructor(private _template: TemplateRef<void>,
              private _workbenchService: WorkbenchService,
              @Optional() private _view: WorkbenchView) {
  }

  public ngOnInit(): void {
    this._action = this._workbenchService.registerPartAction({
      portal: new TemplatePortal(this._template, null!),
      align: this.align,
      canMatch: ((part: WorkbenchPart) => this.matchesContextualView(part) && (this.canMatch?.(part) ?? true)),
      cssClass: this.cssClass,
    });
  }

  private matchesContextualView(part: WorkbenchPart): boolean {
    if (this._view?.id) {
      return part.activeViewId === this._view.id;
    }
    return true;
  }

  public ngOnDestroy(): void {
    this._action?.dispose();
  }
}
