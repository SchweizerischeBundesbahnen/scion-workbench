/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectorRef, ComponentFactoryResolver, Directive, Inject, ViewContainerRef } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { ROUTER_OUTLET_NAME } from '../workbench.constants';
import { OutletContext } from '@angular/router/src/router_outlet_context';

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
    WbRouterOutletDirective.installWorkaroundForAngularIssue25313(parentContexts.getContext(outlet));
  }

  /**
   * Installs a workaround for Angular issue 'https://github.com/angular/angular/issues/25313'.
   * TODO[Angular 7.0]: Remove if fixed.
   *
   * Issue #25313: Router outlet mounts wrong component if using a route reuse strategy and if the router
   *               outlet was not instantiated at the time the route got activated.
   */
  private static installWorkaroundForAngularIssue25313(context: OutletContext): void {
    if (context.attachRef && context.route.component !== context.attachRef.componentType) {
      context.attachRef = null;
    }
  }
}
