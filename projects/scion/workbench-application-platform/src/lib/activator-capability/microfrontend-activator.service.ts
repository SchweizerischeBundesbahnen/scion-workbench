/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injectable, Injector, OnDestroy } from '@angular/core';
import { ActivatorOutletComponent } from './activator-outlet/activator-outlet.component';
import { DOCUMENT } from '@angular/common';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';

@Injectable()
export class MicrofrontendActivatorService implements OnDestroy {

  private readonly _portalRef: ComponentRef<ActivatorOutletComponent>;

  constructor(@Inject(DOCUMENT) document: any,
              applicationRef: ApplicationRef,
              componentFactoryResolver: ComponentFactoryResolver,
              injector: Injector) {
    const bodyPortalOutlet = new DomPortalOutlet(document.body, componentFactoryResolver, applicationRef, injector);
    const componentPortal = new ComponentPortal(ActivatorOutletComponent);
    this._portalRef = bodyPortalOutlet.attachComponentPortal(componentPortal);
  }

  public ngOnDestroy(): void {
    this._portalRef && this._portalRef.destroy();
  }
}
