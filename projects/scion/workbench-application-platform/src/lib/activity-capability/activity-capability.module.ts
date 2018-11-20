/*
 * Copyright (c) 2018 Swiss Federal Railways
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
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivityOutletComponent } from './activity-outlet.component';
import { ViewOpenActivityActionComponent } from './view-open-action/view-open-activity-action.component';
import { ACTIVITY_ACTION_PROVIDER } from './metadata';
import { ViewOpenActivityActionProvider } from './view-open-action/view-open-activity-action-provider.service';
import { UrlOpenActivityActionComponent } from './url-open-action/url-open-activity-action.component';
import { UrlOpenActivityActionProvider } from './url-open-action/url-open-activity-action-provider.service';
import { ActivityRegistrator } from './activity-registrator.service';
import { PopupOpenActivityActionProvider } from './popup-open-action/popup-open-activity-action-provider.service';
import { PopupOpenActivityActionComponent } from './popup-open-action/popup-open-activity-action.component';

/**
 * Built-in capability to allow applications to register activities.
 */
@NgModule({
  declarations: [
    ActivityOutletComponent,
    ViewOpenActivityActionComponent,
    PopupOpenActivityActionComponent,
    UrlOpenActivityActionComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    WorkbenchModule.forChild(),
    RouterModule.forChild([]),
  ],
  providers: [
    {provide: ACTIVITY_ACTION_PROVIDER, useClass: ViewOpenActivityActionProvider, multi: true},
    {provide: ACTIVITY_ACTION_PROVIDER, useClass: PopupOpenActivityActionProvider, multi: true},
    {provide: ACTIVITY_ACTION_PROVIDER, useClass: UrlOpenActivityActionProvider, multi: true},
    {provide: APP_INITIALIZER, useFactory: provideModuleInitializerFn, multi: true, deps: [Injector]},
    ActivityRegistrator,
  ],
  entryComponents: [
    ActivityOutletComponent,
    ViewOpenActivityActionComponent,
    PopupOpenActivityActionComponent,
    UrlOpenActivityActionComponent,
  ],
})
export class ActivityCapabilityModule {
}

export function provideModuleInitializerFn(injector: Injector): () => void {
  // use injector because Angular Router cannot be injected in `APP_INITIALIZER` function
  // do not return the function directly to not break the AOT build (add redundant assignment)
  const fn = (): void => injector.get(ActivityRegistrator).init();
  return fn;
}
