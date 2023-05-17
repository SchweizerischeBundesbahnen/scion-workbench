/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Directive, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, Optional, SimpleChanges} from '@angular/core';
import {WorkbenchNavigationExtras, WorkbenchRouter} from './workbench-router.service';
import {mergeWith, noop, Subject} from 'rxjs';
import {LocationStrategy} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {WorkbenchView} from '../view/workbench-view.model';
import {filter, takeUntil} from 'rxjs/operators';
import {Defined} from '@scion/toolkit/util';
import {RouterUtils} from './router.util';
import isPrimaryRouteTarget = RouterUtils.isPrimaryRouteTarget;

/**
 * Like 'RouterLink' but with functionality to target a view outlet.
 *
 * If in the context of a view in the main area and CTRL (Mac: ⌘, Windows: ⊞) key is not pressed, by default, navigation
 * replaces the content of the current view. Override this default behavior by setting a view target strategy in navigation extras.
 *
 * By default, navigation is relative to the currently activated route, if any.
 * Prepend the path with a forward slash '/' to navigate absolutely, or set `relativeTo` property in navigational extras to `null`.
 */
@Directive({
  selector: '[wbRouterLink]',
  standalone: true,
})
export class WorkbenchRouterLinkDirective implements OnChanges, OnDestroy {

  private _commands: any[] = [];
  private _extras: WorkbenchNavigationExtras = {};
  private _ngOnChange$ = new Subject<void>();
  private _ngOnDestroy$ = new Subject<void>();

  @HostBinding('attr.href')
  public href: string | null = null;

  @Input()
  public set wbRouterLink(commands: any[] | string | undefined | null) {
    this._commands = (commands ? (Array.isArray(commands) ? commands : [commands]) : []);
  }

  @Input('wbRouterLinkExtras') // eslint-disable-line @angular-eslint/no-input-rename
  public set extras(extras: WorkbenchNavigationExtras | undefined) {
    this._extras = extras || {};
  }

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _router: Router,
              private _route: ActivatedRoute,
              private _locationStrategy: LocationStrategy,
              private _cd: ChangeDetectorRef,
              host: ElementRef,
              @Optional() private _view: WorkbenchView | null) {
    if (host.nativeElement.tagName === 'A') {
      this.installHrefUpdater();
    }
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  public onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (button !== 0) { // not primary mouse button pressed
      return true;
    }

    const extras = this.computeNavigationExtras(ctrlKey, metaKey);
    this._workbenchRouter.navigate(this._commands, extras).then(noop);
    return false;
  }

  /**
   * Computes navigation extras based on the given extras and this directive's injection context.
   */
  protected computeNavigationExtras(ctrlKey: boolean = false, metaKey: boolean = false): WorkbenchNavigationExtras {
    const contextualView = this._view ?? undefined;
    const contextualPart = this._view?.part;
    const controlPressed = ctrlKey || metaKey;

    return {
      ...this._extras,
      relativeTo: Defined.orElse(this._extras.relativeTo, () => {
        const isAbsolute = (typeof this._commands[0] === 'string') && this._commands[0].startsWith('/');
        return isAbsolute ? null : this._route;
      }),
      target: Defined.orElse(this._extras.target, () => {
        // When closing a view, derive the target only if no path is set.
        if (this._extras.close && this._commands.length) {
          return undefined;
        }
        // Navigate in new tab if CTRL or META modifier key is pressed.
        if (controlPressed) {
          return 'blank';
        }
        // Navigate the contextual view only if it is the target of primary routes.
        const contextualViewId = contextualView?.id;
        if (contextualViewId && isPrimaryRouteTarget(contextualViewId)) {
          return contextualViewId;
        }
        return undefined;
      }),
      activate: this._extras.activate ?? !controlPressed, // by default, the view is not activated if CTRL or META modifier key is pressed (same behavior as for browser links)
      blankPartId: this._extras.blankPartId ?? (contextualPart?.isInMainArea ? contextualPart.id : undefined),
    };
  }

  /**
   * Updates the link's href based on given array of commands and navigation extras.
   */
  private installHrefUpdater(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        mergeWith(this._ngOnChange$),
        takeUntil(this._ngOnDestroy$),
      )
      .subscribe(() => {
        const urlTree = this._commands.length && this._router.createUrlTree(this._commands, this.computeNavigationExtras());
        this.href = urlTree ? this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)) : null;
        this._cd.markForCheck();
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._ngOnChange$.next();
  }

  public ngOnDestroy(): void {
    this._ngOnDestroy$.next();
  }
}
