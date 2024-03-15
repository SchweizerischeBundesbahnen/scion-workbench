/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {APP_INITIALIZER, EnvironmentProviders, inject, InjectionToken, Injector, makeEnvironmentProviders, NgZone, runInInjectionContext} from '@angular/core';
import {APP_IDENTITY, ContextService, FocusMonitor, IntentClient, ManifestService, MessageClient, ObservableDecorator, OutletRouter, PlatformPropertyService, PreferredSizeService} from '@scion/microfrontend-platform';
import {WorkbenchClient, WorkbenchDialog, WorkbenchDialogService, WorkbenchMessageBox, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopup, WorkbenchPopupService, WorkbenchRouter, WorkbenchThemeMonitor, WorkbenchView} from '@scion/workbench-client';
import {NgZoneObservableDecorator} from './ng-zone-observable-decorator';
import {Beans} from '@scion/toolkit/bean-manager';
import {environment} from '../../environments/environment';

/**
 * DI token for injectables to be instantiated after connected to the workbench.
 */
export const WORKBENCH_POST_CONNECT = new InjectionToken<unknown>('WORKBENCH_POST_CONNECT');

/**
 * Registers a set of DI providers to set up SCION Workbench Client.
 */
export function provideWorkbenchClient(): EnvironmentProviders | [] {
  if (window === window.parent) {
    return [];
  }

  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      useFactory: connectToWorkbenchFn,
      multi: true,
    },
    {provide: APP_IDENTITY, useFactory: () => Beans.get(APP_IDENTITY)},
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
    {provide: WorkbenchDialogService, useFactory: () => Beans.get(WorkbenchDialogService)},
    {provide: WorkbenchDialog, useFactory: () => Beans.opt(WorkbenchDialog)},
    {provide: WorkbenchMessageBoxService, useFactory: () => Beans.get(WorkbenchMessageBoxService)},
    {provide: WorkbenchMessageBox, useFactory: () => Beans.opt(WorkbenchMessageBox)},
    {provide: WorkbenchNotificationService, useFactory: () => Beans.get(WorkbenchNotificationService)},
    {provide: WorkbenchThemeMonitor, useFactory: () => Beans.get(WorkbenchThemeMonitor)},
  ]);
}

/**
 * Connects this app to the workbench in the host app.
 */
function connectToWorkbenchFn(): () => Promise<void> {
  const zone = inject(NgZone);
  const injector = inject(Injector);

  return async (): Promise<void> => {
    Beans.register(ObservableDecorator, {useValue: new NgZoneObservableDecorator(zone)});
    await zone.runOutsideAngular(() => WorkbenchClient.connect(determineAppSymbolicName()));
    await runInInjectionContext(injector, () => inject(WORKBENCH_POST_CONNECT, {optional: true}));
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
