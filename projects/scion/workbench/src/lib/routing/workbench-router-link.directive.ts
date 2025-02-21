/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, ElementRef, HostListener, inject, input, signal, Signal} from '@angular/core';
import {WorkbenchRouter} from './workbench-router.service';
import {LocationStrategy} from '@angular/common';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {WorkbenchView} from '../view/workbench-view.model';
import {combineLatestWith, filter, map, startWith, switchMap} from 'rxjs/operators';
import {Commands, WorkbenchNavigationExtras} from './routing.model';
import {Arrays, Defined} from '@scion/toolkit/util';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {createNavigationFromCommands, ɵWorkbenchRouter} from './ɵworkbench-router.service';

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
@Directive({
  selector: '[wbRouterLink]',
  host: {
    '[attr.href]': 'href()',
  },
})
export class WorkbenchRouterLinkDirective {

  public readonly commands = input.required({alias: 'wbRouterLink', transform: (commands: Commands | string | undefined | null) => Arrays.coerce(commands)});
  public readonly extras = input({}, {alias: 'wbRouterLinkExtras', transform: (extras: Omit<WorkbenchNavigationExtras, 'close'> | undefined) => extras ?? {}});

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _view = inject(WorkbenchView, {optional: true});

  protected readonly href = this.computeHrefIfLink();

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
   * Computes navigation extras based on the given extras and contextual route.
   */
  private computeNavigationExtras(ctrlKey: boolean = false, metaKey: boolean = false): WorkbenchNavigationExtras {
    const controlPressed = ctrlKey || metaKey;
    const extras = this.extras();

    return {
      ...extras,
      relativeTo: Defined.orElse(extras.relativeTo, this._route), // `null` is a valid `relativeTo` for absolute navigation
      target: controlPressed ? 'blank' : extras.target ?? this._view?.id,
      activate: extras.activate ?? !controlPressed, // by default, the view is not activated if CTRL or META modifier key is pressed (same behavior as for browser links)
      close: false, // do not support closing a view using this directive.
    };
  }

  /**
   * Computes the link's href based on given array of commands and navigation extras.
   */
  private computeHrefIfLink(): Signal<string | null> {
    // Compute href only if the host is a link (anchor tag).
    const host = inject(ElementRef).nativeElement as Element;
    if (host.tagName !== 'A') {
      return signal(null);
    }

    const workbenchRouter = inject(ɵWorkbenchRouter);
    const locationStrategy = inject(LocationStrategy);

    // Compute href when commands, extras or the application URL change.
    const commands$ = toObservable(this.commands).pipe(filter(commands => !!commands.length));
    const extras$ = toObservable(this.extras).pipe(map(() => this.computeNavigationExtras()));
    const navigationEnd$ = this._router.events.pipe(filter(event => event instanceof NavigationEnd), startWith(undefined));

    const href$ = commands$
      .pipe(
        combineLatestWith(extras$, navigationEnd$),
        switchMap(([commands, extras]) => workbenchRouter.createUrlTree(createNavigationFromCommands(commands, extras), extras)),
        map(urlTree => urlTree && locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree))),
      );
    return toSignal(href$, {initialValue: null});
  }
}
