/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
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
