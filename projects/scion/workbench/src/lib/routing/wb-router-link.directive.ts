/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, HostBinding, HostListener, inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {WbNavigationExtras, WorkbenchRouter} from './workbench-router.service';
import {noop} from 'rxjs';
import {LocationStrategy} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {WorkbenchView} from '../view/workbench-view.model';
import {Defined} from '@scion/toolkit/util';

/**
 * Like 'RouterLink' but with functionality to target a view outlet.
 *
 * If in the context of a view and CTRL or META (Mac: ⌘, Windows: ⊞) key is not pressed, by default, navigation replaces the content of the current view.
 * Override this default behavior by setting a view target strategy in navigation extras.
 *
 * By default, navigation is relative to the currently activated route, if any.
 * Prepend the path with a forward slash '/' to navigate absolutely, or set `relativeTo` property in navigational extras to `null`.
 */
@Directive({selector: ':not(a)[wbRouterLink]'})
export class WbRouterLinkDirective {

  protected _commands: any[] = [];
  protected _extras: WbNavigationExtras = {};

  @Input()
  public set wbRouterLink(commands: any[] | string | undefined | null) {
    this._commands = (commands ? (Array.isArray(commands) ? commands : [commands]) : []);
  }

  @Input('wbRouterLinkExtras') // eslint-disable-line @angular-eslint/no-input-rename
  public set extras(extras: WbNavigationExtras) {
    this._extras = extras || {};
  }

  constructor(private _workbenchRouter: WorkbenchRouter = inject(WorkbenchRouter),
              private _route: ActivatedRoute = inject(ActivatedRoute),
              @Optional() private _view: WorkbenchView | null = inject(WorkbenchView, {optional: true})) {
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  public onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (button !== 0) { // not main button pressed
      return true;
    }

    const extras = this.createNavigationExtras(ctrlKey, metaKey);
    this._workbenchRouter.navigate(this._commands, extras).then(noop);
    return false;
  }

  protected createNavigationExtras(ctrlKey: boolean = false, metaKey: boolean = false): WbNavigationExtras {
    const contextualViewId = this._view?.viewId;
    const currentPartId = this._view?.part.partId;
    const controlPressed = ctrlKey || metaKey;

    return {
      ...this._extras,
      relativeTo: Defined.orElse(this._extras.relativeTo, () => {
        const isAbsolute = (typeof this._commands[0] === 'string') && this._commands[0].startsWith('/');
        return isAbsolute ? null : this._route;
      }),
      target: Defined.orElse(this._extras.target, () => {
        if (this._extras.close && this._commands.length) {
          return undefined; // when closing a view, derive the target only if no path is set.
        }
        if (controlPressed || contextualViewId === undefined) {
          return 'blank';
        }
        return contextualViewId;
      }),
      activate: this._extras.activate ?? !controlPressed, // by default, the view is not activated if CTRL or META modifier key is pressed (same behavior as for browser links)
      blankPartId: this._extras.blankPartId || currentPartId,
    };
  }
}

@Directive({selector: 'a[wbRouterLink]'})
export class WbRouterLinkWithHrefDirective extends WbRouterLinkDirective implements OnChanges {

  @HostBinding('href')
  public href: string | undefined;

  constructor(private _router: Router, private _locationStrategy: LocationStrategy) {
    super();
  }

  private updateTargetUrlAndHref(): void {
    this.href = this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(this._router.createUrlTree(this._commands, this.createNavigationExtras())));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.updateTargetUrlAndHref();
  }
}
