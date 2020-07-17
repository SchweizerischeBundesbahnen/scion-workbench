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
import { WorkbenchModule } from '@scion/workbench';
import { CommonModule } from '@angular/common';
import { PopupOutletComponent } from './popup-outlet.component';
import { PopupIntentDispatcher } from './popup-intent-dispatcher.service';

/**
 * Built-in capability to show a popup.
 */
@NgModule({
  declarations: [
    PopupOutletComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    WorkbenchModule.forChild(),
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: provideModuleInitializerFn, multi: true, deps: [Injector]},
    PopupIntentDispatcher,
  ],
})
export class PopupCapabilityModule {
}

export function provideModuleInitializerFn(injector: Injector): () => void {
  // use injector because Angular Router cannot be injected in `APP_INITIALIZER` function
  // do not return the function directly to not break the AOT build (add redundant assignment)
  const fn = (): void => injector.get(PopupIntentDispatcher).init();
  return fn;
}
