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

/**
 * Use this directive to model a part action. Part actions are displayed to the right of the view tabs, either left- or
 * right-aligned. Actions can be associated with specific view(s), part(s), and/or an area.
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
 * By default, if modeled in a view template, the action is associated with the view, i.e., it is displayed only
 * if the view is active. To contribute an action to any view, model the action in the body of `wb-workbench` element.
 *
 * ```html
 * <wb-workbench>
 *   <button wbRouterLink="/path/to/view" [wbRouterLinkExtras]="{target: 'blank'}" class="material-icons">
 *     add
 *   </button>
 * </wb-workbench>
 * ```
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
   * Identifies the views(s) to associate this action with.
   *
   * If not specified, associates it with any view, or with the contextual view if modeled in the context of a view.
   * Passing `null` or any other view(s) overrides the contextual view default behavior.
   */
  @Input()
  public view?: string | string [] | undefined | null;

  /**
   * Identifies the part(s) to associate this action with. If not specified, associates it with any part.
   */
  @Input()
  public part?: string | string[] | undefined;

  /**
   * Identifies the area to associate this action with. If not specified, associates it with any area.
   */
  @Input()
  public area?: 'main' | 'peripheral' | undefined;

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
      target: {
        viewId: this.view === null ? undefined : (this.view ?? this._view?.id),
        partId: this.part,
        area: this.area,
      },
      cssClass: this.cssClass,
    });
  }

  public ngOnDestroy(): void {
    this._action?.dispose();
  }
}
