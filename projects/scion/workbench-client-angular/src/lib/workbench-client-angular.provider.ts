/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, EnvironmentProviders, inject, InjectionToken, Injector, makeEnvironmentProviders, NgZone, provideAppInitializer} from '@angular/core';
import {provideWorkbenchMenuAdapter} from './menu/workbench-client-angular-menu-adapter';
import {MaybeObservable, WorkbenchClient, WorkbenchClientConfiguration, WorkbenchDialog, WorkbenchDialogService, WorkbenchMessageBox, WorkbenchMessageBoxService, WorkbenchNotification, WorkbenchNotificationService, WorkbenchPart, WorkbenchPopup, WorkbenchPopupService, WorkbenchRouter, WorkbenchTextProviderFn, WorkbenchTextService, WorkbenchThemeMonitor, WorkbenchView} from '@scion/workbench-client';
import {text} from '@scion/sci-components/text';
import {Beans} from '@scion/toolkit/bean-manager';
import {APP_IDENTITY, ConnectOptions, ContextService, FocusMonitor, IntentClient, ManifestService, MessageClient, ObservableDecorator, OutletRouter, PlatformPropertyService, PreferredSizeService} from '@scion/microfrontend-platform';
import {NgZoneObservableDecorator} from './connector/ng-zone-observable-decorator';
import {runWorkbenchClientInitializers, WorkbenchClientStartupPhase} from './connector/workbench-client-initializer';
import {map, Observable} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {createDestroyableInjector} from './common/injector.util';

/**
 * Enables an Angular application to connect to the SCION Workbench.
 *
 * The connection is established in an Angular app initializer. The application can register initializers via {@link provideWorkbenchClientInitializer} function
 * to hook into the startup of the SCION Workbench Client. The client is fully started once all initializers have completed.
 *
 * Use {@link provideTextProvider} to register a text provider to provide texts to the SCION Workbench and other micro apps.
 *
 * @param symbolicName - Specifies the symbolic name of the application; must match the symbolic name registered in the workbench host app.
 * @param options - Controls how to connect to the workbench.
 */
export function provideWorkbenchClientAngular(symbolicName: string, options?: ConnectOptions): EnvironmentProviders {
  // TODO [menu] Most applications have the check as follows. That way, the flag MicrofrontendPlatformClient.isConnected() is correct. Fix flag in @scion/microfrontend-platform if not connnected to the host.
  // if (window === window.parent) {
  //   return [];
  // }
  return makeEnvironmentProviders([
    // Connect to the SCION Workbench, unless 'connect' is set to `false`.
    provideAppInitializer(() => connectToWorkbenchFn(symbolicName, options)),
    // Provide workbench adapter to render menu popover in the workbench host application and enable federation of menu items contributed by different micro apps.
    provideWorkbenchMenuAdapter(),
    // Provide beans for injection in Angular.
    {provide: APP_SYMBOLIC_NAME, useFactory: () => Beans.get(APP_IDENTITY)},
    {provide: MessageClient, useFactory: () => Beans.get(MessageClient)},
    {provide: IntentClient, useFactory: () => Beans.get(IntentClient)},
    {provide: OutletRouter, useFactory: () => Beans.get(OutletRouter)},
    {provide: ContextService, useFactory: () => Beans.get(ContextService)},
    {provide: ManifestService, useFactory: () => Beans.get(ManifestService)},
    {provide: FocusMonitor, useFactory: () => Beans.get(FocusMonitor)},
    {provide: PlatformPropertyService, useFactory: () => Beans.get(PlatformPropertyService)},
    {provide: PreferredSizeService, useFactory: () => Beans.get(PreferredSizeService)},
    {provide: WorkbenchRouter, useFactory: () => Beans.get(WorkbenchRouter)},
    {provide: WorkbenchPart, useFactory: () => Beans.opt(WorkbenchPart)},
    {provide: WorkbenchView, useFactory: () => Beans.opt(WorkbenchView)},
    {provide: WorkbenchPopupService, useFactory: () => Beans.get(WorkbenchPopupService)},
    {provide: WorkbenchPopup, useFactory: () => Beans.opt(WorkbenchPopup)},
    {provide: WorkbenchDialogService, useFactory: () => Beans.get(WorkbenchDialogService)},
    {provide: WorkbenchDialog, useFactory: () => Beans.opt(WorkbenchDialog)},
    {provide: WorkbenchMessageBoxService, useFactory: () => Beans.get(WorkbenchMessageBoxService)},
    {provide: WorkbenchMessageBox, useFactory: () => Beans.opt(WorkbenchMessageBox)},
    {provide: WorkbenchNotificationService, useFactory: () => Beans.get(WorkbenchNotificationService)},
    {provide: WorkbenchNotification, useFactory: () => Beans.opt(WorkbenchNotification)},
    {provide: WorkbenchThemeMonitor, useFactory: () => Beans.get(WorkbenchThemeMonitor)},
    {provide: WorkbenchTextService, useFactory: () => Beans.get(WorkbenchTextService)},
  ]);
}

async function connectToWorkbenchFn(symbolicName: string, connectOptions?: ConnectOptions): Promise<void> {
  const zone = inject(NgZone);
  const injector = inject(Injector);
  const options: WorkbenchClientConfiguration & ConnectOptions = {
    ...connectOptions,
    connect: connectOptions?.connect ?? window !== window.parent,
    textProvider: applicationTextProvider(),
  };

  Beans.register(ObservableDecorator, {useValue: new NgZoneObservableDecorator(zone)});
  await runWorkbenchClientInitializers(WorkbenchClientStartupPhase.PreConnect, injector);
  await zone.runOutsideAngular(() => WorkbenchClient.connect(symbolicName, options));
  await runWorkbenchClientInitializers(WorkbenchClientStartupPhase.PostConnect, injector);
}

/**
 * Provides texts of this app to the SCION Workbench and other micro apps.
 */
function applicationTextProvider(): WorkbenchTextProviderFn {
  const rootInjector = inject(Injector);

  return (key: string, params: {[name: string]: string}): MaybeObservable<string | undefined> => {
    // Delegate to text provider registered in @scion/components.
    // Use a wrapper observable to bind `text()` to the lifecycle of the subscription.
    return new Observable(observer => {
      const injector = createDestroyableInjector({parent: rootInjector});

      toObservable(text(`%${key}`, {params, injector}), {injector})
        .pipe(
          map(text => text !== '' && text !== key ? text : undefined), // emit `undefined` if not found the text
          takeUntilDestroyed(injector.get(DestroyRef)),
        )
        .subscribe(observer);

      return () => injector.destroy();
    });
  };
}

/**
 * Enables injection of the application's symbolic name.
 */
export const APP_SYMBOLIC_NAME = new InjectionToken<string>('APP_SYMBOLIC_NAME');
