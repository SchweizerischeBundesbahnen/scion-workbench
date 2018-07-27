/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, HostBinding, HostListener, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';
import { WorkbenchView } from '../workbench.model';
import { WbNavigationExtras, WorkbenchRouter } from './workbench-router.service';
import { noop } from 'rxjs';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkbenchService } from '../workbench.service';

/**
 * Like 'RouterLink' but with functionality to target a view outlet.
 *
 * By default, navigation is relative to the currently activated route, if any.
 * Prepend the path with a forward slash '/' to navigate absolutely, or set `relativeTo` property in navigational extras to `null`.
 */
@Directive({selector: ':not(a)[wbRouterLink]'})
export class WbRouterLinkDirective {

  protected _commands: any[] = [];
  protected _extras: WbNavigationExtras = {};

  @Input()
  public set wbRouterLink(commands: any[] | string) {
    this._commands = (commands ? (Array.isArray(commands) ? commands : [commands]) : []);
  }

  @Input('wbRouterLinkExtras') // tslint:disable-line:no-input-rename
  public set extras(extras: WbNavigationExtras) {
    this._extras = extras || {};
  }

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _route: ActivatedRoute,
              private _workbench: WorkbenchService,
              @Optional() private _view: WorkbenchView) {
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey'])
  public onClick(button: number, ctrlKey: boolean): boolean {
    if (button !== 0) { // not main button pressed
      return true;
    }

    const extras = this.createNavigationExtras(ctrlKey);
    this._workbenchRouter.navigate(this._commands, extras).then(noop);
    return false;
  }

  protected createNavigationExtras(ctrlKey: boolean = false): WbNavigationExtras {
    const currentViewRef = this._view && this._view.viewRef;
    const currentViewPartRef = currentViewRef && this._workbench.resolveContainingViewPartServiceElseThrow(this._view.viewRef).viewPartRef;
    const isAbsolute = (typeof this._commands[0] === 'string') && this._commands[0].startsWith('/');
    const relativeTo = (isAbsolute ? null : this._route);

    return {
      ...this._extras,
      relativeTo: this._extras.relativeTo === undefined ? relativeTo : this._extras.relativeTo,
      target: this._extras.target || (this._view && !ctrlKey ? 'self' : 'blank'),
      selfViewRef: this._extras.selfViewRef || currentViewRef,
      blankViewPartRef: this._extras.blankViewPartRef || currentViewPartRef,
    };
  }
}

@Directive({selector: 'a[wbRouterLink]'})
export class WbRouterLinkWithHrefDirective extends WbRouterLinkDirective implements OnChanges {

  @HostBinding('href')
  public href: string;

  constructor(private _router: Router,
              private _locationStrategy: LocationStrategy,
              workbenchRouter: WorkbenchRouter,
              route: ActivatedRoute,
              workbench: WorkbenchService,
              @Optional() view: WorkbenchView) {
    super(workbenchRouter, route, workbench, view);
  }

  private updateTargetUrlAndHref(): void {
    this.href = this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(this._router.createUrlTree(this._commands, this.createNavigationExtras())));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.updateTargetUrlAndHref();
  }
}
