import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { WB_ROUTE_REUSE_IDENTITY_PARAM } from './routing-params.constants';

/**
 * Like {DefaultRouteReuseStrategy}, but does not destroy the routed component if associated with a re-use identity.
 *
 * This strategy is used in workbench activity part to not destroy the activity when switching to another activity.
 */
export class WbRouteReuseStrategy implements RouteReuseStrategy {

  private _handleMap = new Map<any, DetachedRouteHandle>();

  public shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.resolveRouteReuseIdentityElseNull(route) !== null;
  }

  public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const identity = this.resolveRouteReuseIdentityElseNull(route);
    if (!identity) {
      return;
    }

    if (handle === null) {
      this._handleMap.delete(identity);
    } else {
      this._handleMap.set(identity, handle);
    }
  }

  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const identity = this.resolveRouteReuseIdentityElseNull(route);
    return identity && this._handleMap.has(identity) || false;
  }

  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const identity = this.resolveRouteReuseIdentityElseNull(route);
    return identity && this._handleMap.get(identity) || null;
  }

  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private resolveRouteReuseIdentityElseNull(route: ActivatedRouteSnapshot): any {
    return route.data[WB_ROUTE_REUSE_IDENTITY_PARAM] || route.paramMap[WB_ROUTE_REUSE_IDENTITY_PARAM] || null;
  }
}
