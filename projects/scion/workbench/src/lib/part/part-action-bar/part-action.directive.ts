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
 * Directive to add an action to a part.
 *
 * Part actions are displayed in the part bar, enabling interaction with the part and its content. Actions can be aligned to the left or right.
 *
 * Usage:
 * Add this directive to an `<ng-template>`. The template content will be used as the action content.
 * The action shares the lifecycle of its embedding context.
 *
 * ```html
 * <ng-template wbPartAction>
 *   <button wbRouterLink="/path/to/view" [wbRouterLinkExtras]="{target: 'blank'}" class="material-icons">
 *     add
 *   </button>
 * </ng-template>
 * ```
 *
 * Actions are context-sensitive:
 * - Declaring the action in a part's template displays it only in that part.
 * - Declaring the action in a view's template displays it only in that view.
 *
 * To contribute the action based on other conditions, declare it as a child of `<wb-workbench>` or register it via `WorkbenchService`.
 *
 * Use a `canMatch` function to match a specific context, such as a particular part or condition. Defaults to any context.
 */
@Directive({selector: 'ng-template[wbPartAction]', standalone: true})
export class WorkbenchPartActionDirective implements OnInit, OnDestroy {

  private _action: Disposable | undefined;

  /**
   * Specifies where to place this action in the part bar. Defaults to `start`.
   */
  @Input()
  public align: 'start' | 'end' = 'start';

  /**
   * Predicate to match a specific context, such as a particular part or condition. Defaults to any context.
   *
   * The function:
   * - Can call `inject` to get any required dependencies, such as the contextual part.
   * - Runs in a reactive context, re-evaluating when tracked signals change.
   *   To execute code outside this reactive context, use Angular's `untracked` function.
   */
  @Input()
  public canMatch?: CanMatchPartFn;

  /**
   * Specifies CSS class(es) to add to the action, e.g., to locate the action in tests.
   */
  @Input()
  public cssClass?: string | string[] | undefined;

  constructor(private _template: TemplateRef<void>,
              private _workbenchService: WorkbenchService,
              @Optional() private _part: WorkbenchPart,
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
    if (this._part && part.id !== this._part.id) {
      return false;
    }
    if (this._view && part.activeViewId() !== this._view.id) {
      return false;
    }
    return true;
  }

  public ngOnDestroy(): void {
    this._action?.dispose();
  }
}
