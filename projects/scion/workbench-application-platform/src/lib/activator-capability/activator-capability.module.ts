/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkbenchModule } from '@scion/workbench';
import { CoreModule } from '../core/core.module';
import { ActivatorOutletComponent } from './activator-outlet/activator-outlet.component';
import { MicrofrontendActivatorService } from './microfrontend-activator.service';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  declarations: [
    ActivatorOutletComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    PortalModule,
    WorkbenchModule.forChild(),
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: provideModuleInitializerFn, multi: true, deps: [Injector]},
    MicrofrontendActivatorService,
  ],
})
export class ActivatorCapabilityModule {
}

export function provideModuleInitializerFn(injector: Injector): () => void {
  // use injector because MicrofrontendActivatorService cannot be injected in `APP_INITIALIZER` function
  // do not return the function directly to not break the AOT build (add redundant assignment)
  const fn = (): void => {
    injector.get(MicrofrontendActivatorService);
  };
  return fn;
}
