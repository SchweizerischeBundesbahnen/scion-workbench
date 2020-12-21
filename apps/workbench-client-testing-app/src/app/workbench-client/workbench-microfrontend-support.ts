/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { APP_INITIALIZER, Provider } from '@angular/core';
import { ContextService, FocusMonitor, IntentClient, ManifestService, MessageClient, OutletRouter, PlatformPropertyService, PreferredSizeService } from '@scion/microfrontend-platform';
import { WorkbenchClient, WorkbenchRouter, WorkbenchView } from '@scion/workbench-client';
import { NgZoneIntentClientDecorator, NgZoneMessageClientDecorator } from './ng-zone-decorators';
import { Beans } from '@scion/toolkit/bean-manager';
import { environment } from '../../environments/environment';

/**
 * Registers a set of DI providers to set up microfrontend support and connect to the workbench.
 */
export function provideWorkbenchClientInitializer(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: connectToWorkbenchFn,
      deps: [NgZoneMessageClientDecorator, NgZoneIntentClientDecorator],
      multi: true,
    },
    NgZoneMessageClientDecorator,
    NgZoneIntentClientDecorator,
    {provide: MessageClient, useFactory: () => Beans.get(MessageClient)},
    {provide: IntentClient, useFactory: () => Beans.get(IntentClient)},
    {provide: OutletRouter, useFactory: () => Beans.get(OutletRouter)},
    {provide: ContextService, useFactory: () => Beans.get(ContextService)},
    {provide: ManifestService, useFactory: () => Beans.get(ManifestService)},
    {provide: FocusMonitor, useFactory: () => Beans.get(FocusMonitor)},
    {provide: PlatformPropertyService, useFactory: () => Beans.get(PlatformPropertyService)},
    {provide: PreferredSizeService, useFactory: () => Beans.get(PreferredSizeService)},
    {provide: WorkbenchRouter, useFactory: () => Beans.get(WorkbenchRouter)},
    {provide: WorkbenchView, useFactory: () => Beans.opt(WorkbenchView)},
  ];
}

/**
 * Connects this app to the workbench in the host app.
 */
export function connectToWorkbenchFn(ngZoneMessageClientDecorator: NgZoneMessageClientDecorator, ngZoneIntentClientDecorator: NgZoneIntentClientDecorator): () => Promise<void> {
  return (): Promise<void> => {
    if (window === window.parent) {
      return Promise.resolve(); // not running in the context of the workbench host app
    }

    Beans.registerDecorator(MessageClient, {useValue: ngZoneMessageClientDecorator});
    Beans.registerDecorator(IntentClient, {useValue: ngZoneIntentClientDecorator});
    return WorkbenchClient.connect({symbolicName: environment.symbolicName});
  };
}
