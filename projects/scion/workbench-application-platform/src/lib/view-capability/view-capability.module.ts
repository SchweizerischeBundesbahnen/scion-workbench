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
import { CoreModule } from '../core/core.module';
import { ViewIntentDispatcher } from './view-intent-dispatcher.service';
import { WorkbenchModule } from '@scion/workbench';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewOutletComponent } from './view-outlet.component';

/**
 * Built-in capability to show a view.
 */
@NgModule({
  declarations: [
    ViewOutletComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    WorkbenchModule.forChild(),
    RouterModule.forChild([]),
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: provideModuleInitializerFn, multi: true, deps: [Injector]},
    ViewIntentDispatcher,
  ],
  entryComponents: [
    ViewOutletComponent,
  ],
})
export class ViewCapabilityModule {
}

export function provideModuleInitializerFn(injector: Injector): () => void {
  // use injector because Angular Router cannot be injected in `APP_INITIALIZER` function
  // do not return the function directly to not break the AOT build (add redundant assignment)
  const fn = (): void => injector.get(ViewIntentDispatcher).init();
  return fn;
}
