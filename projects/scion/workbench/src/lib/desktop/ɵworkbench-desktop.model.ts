/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRouteSnapshot, ChildrenOutletContexts, PRIMARY_OUTLET, UrlSegment} from '@angular/router';
import {computed, EnvironmentInjector, inject, Injectable, Injector, runInInjectionContext, signal, Signal} from '@angular/core';
import {WorkbenchDesktop} from './workbench-desktop.model';
import {ClassList} from '../common/class-list';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {DESKTOP_OUTLET} from '../layout/workbench-layout';
import {NavigationData} from '../routing/routing.model';
import {Routing} from '../routing/routing.util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {WorkbenchDesktopComponent} from './workbench-desktop.component';

@Injectable({providedIn: 'root'})
export class ɵWorkbenchDesktop implements WorkbenchDesktop {

  private readonly _desktopEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _childrenOutletContexts = inject(ChildrenOutletContexts);
  private readonly _injector = inject(Injector);

  public outlet = signal(PRIMARY_OUTLET);
  public navigationId = signal<string | undefined>(undefined);
  public navigationHint = signal<string | undefined>(undefined);
  public navigationData = signal<NavigationData>({});
  public urlSegments = signal<UrlSegment[]>([], {equal: (a, b) => a.join('/') === b.join('/')});
  public readonly portal: Signal<WbComponentPortal>;
  public readonly classList = new ClassList();

  constructor() {
    this.portal = this.createPortal();
    this.installModelUpdater();
  }

  private createPortal(): Signal<WbComponentPortal> {
    return computed(() => runInInjectionContext(this._injector, () => {
      if (this.outlet() === PRIMARY_OUTLET) {
        return new WbComponentPortal(WorkbenchDesktopComponent);
      }
      else {
        return new WbComponentPortal(WorkbenchDesktopComponent, {
          providers: [
            // The workbench registers auxiliary routes of all top-level routes, enabling routing on a per-desktop basis. // TODO
            // But, if the workbench component itself is displayed in a router outlet, the desktop outlet is not a top-level outlet.
            // Therefore, we instruct the outlet to act as a top-level outlet to be the target of the registered top-level desktop routes.
            {provide: ChildrenOutletContexts, useValue: this._childrenOutletContexts},
          ],
        });
      }
    }));
  }

  /**
   * Method invoked when the workbench layout has changed.
   *
   * This method:
   * - is called on every layout change, enabling the update of desktop properties defined in the layout (navigation hint, navigation data, ...).
   * - is called on route activation (after destroyed the previous component (if any), but before constructing the new component).
   */
  private onLayoutChange(change: {layout: ɵWorkbenchLayout; route: ActivatedRouteSnapshot; previousRoute?: ActivatedRouteSnapshot | null}): void {
    const {layout, route, previousRoute} = change;

    const mDesktop = layout.desktop;

    this.urlSegments.set(layout.urlSegments({outlet: DESKTOP_OUTLET}));
    this.outlet.set(mDesktop.navigation ? DESKTOP_OUTLET : PRIMARY_OUTLET);

    // Test if a new route has been activated for this desktop.
    const routeChanged = route && route?.routeConfig !== previousRoute?.routeConfig;
    if (routeChanged) {
      this.classList.route = Routing.lookupRouteData(route, WorkbenchRouteData.cssClass);
      this.classList.application = [];
    }

    // Test if this desktop was navigated. Navigation does not necessarily cause the route to change.
    const navigationChanged = mDesktop.navigation?.id !== this.navigationId();
    if (navigationChanged) {
      this.navigationId.set(mDesktop.navigation?.id);
      this.navigationHint.set(mDesktop.navigation?.hint);
      this.navigationData.set(mDesktop.navigation?.data ?? {});
      this.classList.navigation = mDesktop.navigation?.cssClass;
    }
  }

  /**
   * Sets up automatic synchronization of {@link WorkbenchDesktop} on every layout change.
   *
   * If the operation is cancelled (e.g., due to a navigation failure), it reverts the changes.
   */
  private installModelUpdater(): void {
    const workbenchRouter = inject(ɵWorkbenchRouter);

    Routing.activatedRoute$(DESKTOP_OUTLET, {emitOn: 'always'})
      .pipe(takeUntilDestroyed())
      .subscribe(([previousRoute, route]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
        const navigationContext = workbenchRouter.getCurrentNavigationContext();
        const {layout, previousLayout} = navigationContext;

        this.onLayoutChange({layout, route, previousRoute});

        // Revert change in case the navigation fails.
        if (previousLayout) {
          navigationContext.registerUndoAction(() => this.onLayoutChange({layout: previousLayout, route: previousRoute!, previousRoute: route}));
        }
      });
  }

  /**
   * Reference to the handle's injector.
   */
  public get injector(): Injector {
    return this._desktopEnvironmentInjector;
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    this.classList.application = cssClass;
  }

  /** @inheritDoc */
  public get cssClass(): Signal<string[]> {
    return this.classList.application;
  }

  public destroy(): void {
    this._desktopEnvironmentInjector.destroy();
  }
}
