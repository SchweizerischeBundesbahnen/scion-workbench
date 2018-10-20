/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { Activity } from './activity';
import { WorkbenchActivityPartService } from './workbench-activity-part.service';

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
 *                label="group"
 *                cssClass="material-icons"
 *                routerLink="user-account">
 *   </wb-activity>
 * </wb-workbench>
 */
@Directive({selector: 'wb-activity', exportAs: 'activity'}) // tslint:disable-line:directive-selector
export class WbActivityDirective implements OnInit, OnDestroy {

  public readonly activity: Activity;

  /**
   * Specifies the title of the activity.
   */
  @Input()
  public set title(title: string) {
    this.activity.title = title;
  }

  /**
   * Use in combination with an icon font to specify the icon.
   */
  @Input()
  public set label(label: string) {
    this.activity.label = label;
  }

  /**
   * Specifies the CSS class(es) used for the icon, e.g. 'material-icons' when using Angular Material Design.
   */
  @Input()
  public set cssClass(cssClass: string | string[]) {
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
