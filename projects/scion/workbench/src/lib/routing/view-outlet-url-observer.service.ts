import { GuardsCheckEnd, NavigationStart, PRIMARY_OUTLET, Route, Router, Routes } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Injectable, IterableDiffers, OnDestroy } from '@angular/core';
import { WbBeforeDestroyGuard } from '../view/wb-before-destroy.guard';
import { Observable, Subject } from 'rxjs';
import { ViewOutletDiffer } from './view-outlet-differ';

/**
 * Provides the ability to watch for changes being made to view outlets in the URL
 * and installs auxiliary routes for view router outlets specified in the URI.
 *
 * If a new view router outlet is detected in the URI, all primary routes are registered with that routing outlet.
 * If a view router outlet is removed, all associated routes are discarded.
 */
@Injectable()
export class ViewOutletUrlObserver implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewOutletAdd$ = new Subject<string>();
  private _viewOutletRemove$ = new Subject<string>();

  private _undoRouteRegistrationFn: () => void;

  constructor(private _router: Router, differs: IterableDiffers) {
    this.installNavigationStartRoutingListener(differs);
    this.installGuardsCheckEndRoutingListener(differs);
  }

  /**
   * Checks for new view router outlets in the URL, and if so, it makes all primary routes available to them (auxiliary routes).
   * However, if navigation is rejected due to routing guards, those auxiliary routes must be undone.
   */
  private onNavigationStart(routerEvent: NavigationStart, differ: ViewOutletDiffer): void {
    this._undoRouteRegistrationFn = null;

    const viewOutletChanges = differ.diff(routerEvent.url);
    if (viewOutletChanges) {
      // Register auxiliary routes for added view outlets.
      const newAuxiliaryRoutes: Route[] = [];
      viewOutletChanges.forEachAddedItem(({item}) => {
        newAuxiliaryRoutes.push(...this.createAuxiliaryRoutesFor(item));
      });

      // Prepare undo action in case navigation is rejected, e.g. by routing guard.
      this._undoRouteRegistrationFn = (): void => {
        differ.diff(this._router.url); // undo stateful differ
        this.installRoutes(this._router.config.filter(route => !newAuxiliaryRoutes.includes(route)));
      };

      this.installRoutes([...this._router.config, ...newAuxiliaryRoutes]);
    }
  }

  /**
   * Checks for removed view router outlets in the URL, and if so, it discards all associated auxiliary routes.
   * Also, if navigation is rejected, undo any auxiliary route registered in the current routing cycle.
   */
  private onGuardsCheckEnd(routerEvent: GuardsCheckEnd, differ: ViewOutletDiffer): void {
    // Undo route registration if rejected.
    if (!routerEvent.shouldActivate) {
      this._undoRouteRegistrationFn && this._undoRouteRegistrationFn();
      this._undoRouteRegistrationFn = null;
      return;
    }

    // Notify about added and removed outlets, and discard removed routes.
    const viewOutletChanges = differ.diff(routerEvent.url);
    if (viewOutletChanges) {
      const routes = this._router.config;
      const discardedRoutes: Route[] = [];

      viewOutletChanges.forEachAddedItem(({item}) => {
        this._viewOutletAdd$.next(item);
      });

      viewOutletChanges.forEachRemovedItem(({item}) => {
        discardedRoutes.push(...routes.filter(route => route.outlet === item));
        this._viewOutletRemove$.next(item);
      });

      this.installRoutes(routes.filter(route => !discardedRoutes.includes(route)));
    }
  }

  private installRoutes(routes: Routes): void {
    // Note: Do not use Router.resetConfig(...) which would destroy any currently routed component.
    this._router.config = routes;
  }

  private get primaryRoutes(): Routes {
    return this._router.config.filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET);
  }

  private createAuxiliaryRoutesFor(viewOutlet: string): Routes {
    return this.primaryRoutes.map(it => {
      return {
        ...it,
        outlet: viewOutlet,
        canDeactivate: [...it.canDeactivate || [], WbBeforeDestroyGuard]
      };
    });
  }

  /***
   * Emits if a new view outlet is detected in the URL.
   */
  public get viewOutletAdd$(): Observable<string> {
    return this._viewOutletAdd$;
  }

  /***
   * Emits if a view outlet is no longer contained in the URL.
   */
  public get viewOutletRemove$(): Observable<string> {
    return this._viewOutletRemove$;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private installNavigationStartRoutingListener(differs: IterableDiffers): void {
    const outletDiffer = new ViewOutletDiffer(differs);
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        takeUntil(this._destroy$),
      )
      .subscribe((routerEvent: NavigationStart) => {
        this.onNavigationStart(routerEvent, outletDiffer);
      });
  }

  private installGuardsCheckEndRoutingListener(differs: IterableDiffers): void {
    const outletDiffer = new ViewOutletDiffer(differs);
    this._router.events
      .pipe(
        filter(event => event instanceof GuardsCheckEnd),
        takeUntil(this._destroy$),
      )
      .subscribe((routerEvent: GuardsCheckEnd) => {
        this.onGuardsCheckEnd(routerEvent, outletDiffer);
      });
  }
}
