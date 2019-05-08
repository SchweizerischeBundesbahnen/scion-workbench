/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, HostBinding, HostListener, Input, Optional } from '@angular/core';
import { WorkbenchView } from './workbench-view';
import { WbNavigationExtras, WorkbenchRouter } from './workbench-router.service';
import { Qualifier } from '@scion/workbench-application.core';

/**
 * Provides workbench view navigation capabilities.
 *
 * This directive is like 'RouterLink' but with functionality to target a workbench view outlet.
 *
 * If in the context of a view and CTRL key is not pressed, by default, navigation replaces the content of the current view.
 * Override this default behavior by setting a view target strategy in navigational extras.
 */
@Directive({selector: ':not(a)[wbRouterLink]'})
export class WorkbenchRouterLinkDirective {

  protected _viewContext: boolean;

  @Input('wbRouterLink') // tslint:disable-line:no-input-rename
  public qualifier: Qualifier;

  @Input('wbRouterLinkExtras') // tslint:disable-line:no-input-rename
  public extras: WbNavigationExtras;

  constructor(protected _workbenchRouter: WorkbenchRouter, @Optional() view: WorkbenchView) {
    this._viewContext = !!view;
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey'])
  public onClick(button: number, ctrlKey: boolean): boolean {
    if (button !== 0) { // not main button pressed
      return true;
    }

    const extras = this.createNavigationExtras(ctrlKey);
    this._workbenchRouter.navigate(this.qualifier, extras);
    return false;
  }

  protected createNavigationExtras(ctrlKey: boolean = false): WbNavigationExtras {
    const extras = this.extras || {};

    return {
      ...extras,
      target: extras.target || (this._viewContext && !ctrlKey ? 'self' : 'blank'),
    };
  }
}

@Directive({selector: 'a[wbRouterLink]'})
export class WorkbenchRouterLinkWithHrefDirective extends WorkbenchRouterLinkDirective {

  @HostBinding('href')
  public href = '';

  constructor(workbenchRouter: WorkbenchRouter, @Optional() view: WorkbenchView) {
    super(workbenchRouter, view);
  }
}
