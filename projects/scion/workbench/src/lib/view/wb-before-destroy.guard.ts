import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WbBeforeDestroy } from '../workbench.model';

/**
 * Invokes 'wbBeforeDestroy' lifecycle hook, if applicable.
 */
@Injectable()
export class WbBeforeDestroyGuard implements CanDeactivate<any> {

  public canDeactivate(component: any,
                       currentRoute: ActivatedRouteSnapshot,
                       currentState: RouterStateSnapshot,
                       nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const it = component as WbBeforeDestroy;
    if (typeof it.wbBeforeDestroy === 'function') {
      return component.wbBeforeDestroy();
    }

    return true;
  }
}
