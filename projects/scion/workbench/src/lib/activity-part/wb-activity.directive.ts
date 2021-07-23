/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {Activity} from './activity';
import {WorkbenchActivityPartService} from './workbench-activity-part.service';

/**
 * Use this directive to model an activity as content child of <wb-workbench>.
 *
 * Activities are top-level navigation elements to open activity panels or views via Angular router API.
 * They are placed in the activity bar on the far left-hand side.
 *
 * Example usage:
 *
 * <wb-workbench>
 *   <wb-activity title="Users"
 *                itemText="group"
 *                itemCssClass="material-icons"
 *                routerLink="user-account">
 *   </wb-activity>
 * </wb-workbench>
 */
@Directive({selector: 'wb-activity', exportAs: 'activity'}) // eslint-disable-line @angular-eslint/directive-selector
export class WbActivityDirective implements OnInit, OnDestroy {

  public readonly activity: Activity;

  /**
   * Specifies the title of the activity.
   */
  @Input()
  public set title(title: string | null) {
    this.activity.title = title;
  }

  /**
   * Specifies the text for the activity item.
   *
   * You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.
   */
  @Input()
  public set itemText(itemText: string | null) {
    this.activity.itemText = itemText;
  }

  /**
   * Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.
   */
  @Input()
  public set itemCssClass(itemCssClass: string | string[] | undefined) {
    this.activity.itemCssClass = itemCssClass;
  }

  /**
   * Specifies CSS class(es) added to the activity item and activity panel, e.g. used for e2e testing.
   */
  @Input()
  public set cssClass(cssClass: string | string[] | undefined) {
    this.activity.cssClass = cssClass;
  }

  /**
   * Specifies the routing commands used by Angular router to navigate when this activity is clicked.
   *
   * Depending on the target specified, the routed component is opened in the activity panel, which is by default, or displayed as a view.
   *
   * The route must be registered as primary Angular route.
   *
   * @see target
   * @see Router
   */
  @Input()
  public set routerLink(routerLink: any[] | string) {
    this.activity.routerLink = routerLink;
  }

  /**
   * Controls whether to open this activity in the activity panel or to open it in a separate view.
   */
  @Input()
  public set target(target: 'activity-panel' | 'view') {
    this.activity.target = target;
  }

  /**
   * Controls whether to show or hide this activity. By default, this activity is showing.
   *
   * Use over *ngIf directive to show or hide this activity based on a conditional.
   */
  @Input()
  public set visible(visible: boolean) {
    this.activity.visible = visible;
  }

  /**
   * Specifies where to insert this activity in the list of activities.
   */
  @Input()
  public set position(insertionOrder: number) {
    this.activity.position = insertionOrder;
  }

  constructor(private _activityPartService: WorkbenchActivityPartService) {
    this.activity = this._activityPartService.createActivity();
  }

  public ngOnInit(): void {
    this._activityPartService.addActivity(this.activity);
  }

  public ngOnDestroy(): void {
    this._activityPartService.removeActivity(this.activity);
  }
}
