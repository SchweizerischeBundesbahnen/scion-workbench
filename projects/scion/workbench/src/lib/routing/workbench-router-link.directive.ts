/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Directive, effect, ElementRef, HostBinding, HostListener, inject, input} from '@angular/core';
import {WorkbenchRouter} from './workbench-router.service';
import {mergeWith, Subject} from 'rxjs';
import {LocationStrategy} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {WorkbenchView} from '../view/workbench-view.model';
import {filter} from 'rxjs/operators';
import {Commands, WorkbenchNavigationExtras} from './routing.model';
import {Arrays, Defined} from '@scion/toolkit/util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Like the Angular 'RouterLink' directive but with functionality to navigate a view.
 *
 * Use this directive to navigate the current view. If the user presses the CTRL key (Mac: ⌘, Windows: ⊞), this directive will open a new view.
 *
 * ```html
 * <a [wbRouterLink]="['../path/to/view']">Link</a>
 * ```
 *
 * You can override the default behavior by setting an explicit navigation target in navigation extras.
 *
 * ```html
 * <a [wbRouterLink]="['../path/to/view']" [wbRouterLinkExtras]="{target: 'blank'}">Link</a>
 * ```
 *
 * By default, navigation is relative to the currently activated route, if any.
 *
 * Prepend the path with a forward slash '/' to navigate absolutely, or set `relativeTo` property in navigational extras to `null`.
 *
 * ```html
 * <a [wbRouterLink]="['/path/to/view']">Link</a>
 * ```
 */
@Directive({selector: '[wbRouterLink]'})
export class WorkbenchRouterLinkDirective {

  public readonly commands = input([], {alias: 'wbRouterLink', transform: (commands: Commands | string | undefined | null) => Arrays.coerce(commands)});
  public readonly extras = input({}, {alias: 'wbRouterLinkExtras', transform: (extras: Omit<WorkbenchNavigationExtras, 'close'> | undefined) => extras ?? {}});

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _locationStrategy = inject(LocationStrategy);
  private readonly _cd = inject(ChangeDetectorRef);
  private readonly _view = inject(WorkbenchView, {optional: true});

  @HostBinding('attr.href')
  protected href: string | null = null;

  constructor() {
    const host = inject(ElementRef).nativeElement as HTMLElement;

    if (host.tagName === 'A') {
      this.installHrefUpdater();
    }
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  protected onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (button !== 0) { // not primary mouse button pressed
      return true;
    }

    const extras = this.computeNavigationExtras(ctrlKey, metaKey);
    void this._workbenchRouter.navigate(this.commands(), extras);
    return false;
  }

  /**
   * Computes navigation extras based on the given extras and this directive's injection context.
   */
  protected computeNavigationExtras(ctrlKey: boolean = false, metaKey: boolean = false): Omit<WorkbenchNavigationExtras, 'close'> {
    const controlPressed = ctrlKey || metaKey;

    return {
      ...this.extras(),
      relativeTo: Defined.orElse(this.extras().relativeTo, this._route), // `null` is a valid `relativeTo` for absolute navigation
      target: controlPressed ? 'blank' : this.extras().target ?? this._view?.id,
      activate: this.extras().activate ?? !controlPressed, // by default, the view is not activated if CTRL or META modifier key is pressed (same behavior as for browser links)
    };
  }

  /**
   * Updates the link's href based on given array of commands and navigation extras.
   */
  private installHrefUpdater(): void {
    const changes = new Subject<void>();
    effect(() => {
      this.commands();
      this.extras();
      changes.next();
    });

    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        mergeWith(changes),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const urlTree = this.commands().length && this._router.createUrlTree(this.commands(), this.computeNavigationExtras());
        this.href = urlTree ? this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)) : null;
        this._cd.markForCheck();
      });
  }
}
