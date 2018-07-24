/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';

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
export class WbActivityDirective implements OnChanges {

  private _commands: any[] = [];
  private _path: string;

  /**
   * Actions of this activity.
   */
  public actions: TemplateRef<void>[] = [];

  /**
   * Number of pixels added to the activity panel width if this is the active activity.
   */
  public panelWidthDelta = 0;

  /**
   * Specifies the title of the activity.
   */
  @Input()
  public title: string;

  /**
   * Use in combination with an icon font to specify the icon.
   */
  @Input()
  public label: string;

  /**
   * Specifies the CSS class(es) used for the icon, e.g. 'material-icons' when using Angular Material Design.
   */
  @Input()
  public cssClass: string | string[];

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
  public routerLink: any[] | string;

  /**
   * Controls where to open the resolved component:
   *
   * - activity-panel: component is opened in the activity panel (default)
   * - view: component is displayed as a view
   */
  @Input()
  public target: 'activity-panel' | 'view' = 'activity-panel';

  public registerAction(action: TemplateRef<void>): void {
    this.actions.push(action);
  }

  public unregisterAction(action: TemplateRef<void>): void {
    const index = this.actions.indexOf(action);
    if (index === -1) {
      throw Error('Illegal argument: action not contained');
    }
    this.actions.splice(index, 1);
  }

  public get path(): string {
    return this._path;
  }

  public get commands(): any[] {
    return this._commands;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes.routerLink) {
      return;
    }

    const commands = this.routerLink;
    this._commands = (commands ? (Array.isArray(commands) ? commands : commands.split('/').filter(Boolean)) : []);
    this._path = this.commands.filter(it => typeof it !== 'object').join('/');
  }
}
