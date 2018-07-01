import { ChangeDetectorRef, ComponentFactoryResolver, Directive, Inject, ViewContainerRef } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { ROUTER_OUTLET_NAME } from '../workbench.constants';

/**
 * Like 'RouterOutlet' but with functionality to dynamically set the router outlet name via {ROUTER_OUTLET_NAME} injection token.
 */
@Directive({selector: 'wb-router-outlet', exportAs: 'outlet'}) // tslint:disable-line:directive-selector
export class WbRouterOutletDirective extends RouterOutlet {

  public constructor(
    @Inject(ROUTER_OUTLET_NAME) outlet: string,
    parentContexts: ChildrenOutletContexts,
    location: ViewContainerRef,
    resolver: ComponentFactoryResolver,
    changeDetector: ChangeDetectorRef) {
    super(parentContexts, location, resolver, outlet, changeDetector);
  }
}
