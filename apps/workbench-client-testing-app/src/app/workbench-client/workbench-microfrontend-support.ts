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
import { ContextService, FocusMonitor, IntentClient, ManifestService, MessageClient, MicroApplicationConfig, OutletRouter, PlatformPropertyService, PreferredSizeService } from '@scion/microfrontend-platform';
import { WorkbenchClient, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopup, WorkbenchPopupService, WorkbenchRouter, WorkbenchView } from '@scion/workbench-client';
import { NgZoneIntentClientDecorator, NgZoneMessageClientDecorator } from './ng-zone-decorators';
import { Beans } from '@scion/toolkit/bean-manager';
import { environment } from '../../environments/environment';

/**
 * Registers a set of DI providers to set up microfrontend support and connect to the workbench.
 */
export function provideWorkbenchClientInitializer(): Provider[] {
  if (window === window.parent) {
    return [];
  }

  return [
    {
      provide: APP_INITIALIZER,
      useFactory: connectToWorkbenchFn,
      deps: [NgZoneMessageClientDecorator, NgZoneIntentClientDecorator],
      multi: true,
    },
    NgZoneMessageClientDecorator,
    NgZoneIntentClientDecorator,
    {provide: MicroApplicationConfig, useFactory: () => Beans.get(MicroApplicationConfig)},
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
    {provide: WorkbenchPopupService, useFactory: () => Beans.get(WorkbenchPopupService)},
    {provide: WorkbenchPopup, useFactory: () => Beans.opt(WorkbenchPopup)},
    {provide: WorkbenchMessageBoxService, useFactory: () => Beans.get(WorkbenchMessageBoxService)},
    {provide: WorkbenchNotificationService, useFactory: () => Beans.get(WorkbenchNotificationService)},
  ];
}

/**
 * Connects this app to the workbench in the host app.
 */
export function connectToWorkbenchFn(ngZoneMessageClientDecorator: NgZoneMessageClientDecorator, ngZoneIntentClientDecorator: NgZoneIntentClientDecorator): () => Promise<void> {
  return (): Promise<void> => {
    Beans.registerDecorator(MessageClient, {useValue: ngZoneMessageClientDecorator});
    Beans.registerDecorator(IntentClient, {useValue: ngZoneIntentClientDecorator});
    return WorkbenchClient.connect({symbolicName: determineAppSymbolicName()});
  };
}

/**
 * Identifies the currently running app based on the configured apps in the environment and the current URL.
 */
function determineAppSymbolicName(): string {
  const application = Object.values(environment.apps).find(app => new URL(app.url).host === window.location.host);
  if (!application) {
    throw Error(`[AppError] Application served on wrong URL. Supported URLs are: ${Object.values(environment.apps).map(app => app.url)}`);
  }
  return application.symbolicName;
}
