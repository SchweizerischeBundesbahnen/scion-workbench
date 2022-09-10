/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, EnvironmentInjector, inject, ViewContainerRef} from '@angular/core';
import {ChildrenOutletContexts, RouterOutlet} from '@angular/router';
import {ROUTER_OUTLET_NAME} from '../workbench.constants';

/**
 * Like 'RouterOutlet' but with functionality to dynamically set the router outlet name via {ROUTER_OUTLET_NAME} injection token.
 */
@Component({selector: 'wb-router-outlet', template: '', exportAs: 'outlet'})
export class WbRouterOutletComponent extends RouterOutlet {

  constructor() {
    super(
      inject(ChildrenOutletContexts),
      inject(ViewContainerRef),
      inject(ROUTER_OUTLET_NAME),
      inject(ChangeDetectorRef),
      inject(EnvironmentInjector),
    );
  }
}
