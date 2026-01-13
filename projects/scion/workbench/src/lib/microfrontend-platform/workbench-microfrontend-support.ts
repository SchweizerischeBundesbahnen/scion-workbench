/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import './microfrontend-platform.config'; // DO NOT remove to augment `MicrofrontendPlatformConfig` with `splash` property.
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {provideMicrofrontendPlatform} from './microfrontend-platform.provider';
import {IntentClient, ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, PlatformPropertyService} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchDialogService, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, WorkbenchTextService} from '@scion/workbench-client';
import {WorkbenchConfig} from '../workbench-config';
import {provideManifestObjectCache} from './manifest-object-cache.service';
import {provideMicrofrontendPerspective} from './microfrontend-perspective/microfrontend-perspective.provider';
import {provideMicrofrontendPart} from './microfrontend-part/microfrontend-part.provider';
import {provideMicrofrontendView} from './microfrontend-view/microfrontend-view.provider';
import {provideMicrofrontendNotification} from './microfrontend-notification/microfrontend-notification.provider';
import {provideMicrofrontendDialog} from './microfrontend-dialog/microfrontend-dialog.provider';
import {provideMicrofrontendMessageBox} from './microfrontend-message-box/microfrontend-message-box.provider';
import {provideMicrofrontendText} from './microfrontend-text/microfrontend-text.provider';
import {provideMicrofrontendPopup} from './microfrontend-popup/microfrontend-popup.provider';
import {Routing} from '../routing/routing.util';
import {provideWorkbenchInitializer, WorkbenchStartupPhase} from '../startup/workbench-initializer';

/**
 * Provides a set of DI providers to set up microfrontend support in the workbench.
 */
export function provideWorkbenchMicrofrontendSupport(workbenchConfig: WorkbenchConfig): EnvironmentProviders | [] {
  if (!workbenchConfig.microfrontendPlatform) {
    return [];
  }

  return makeEnvironmentProviders([
    provideMicrofrontendPlatform(workbenchConfig),
    provideMicrofrontendPerspective(),
    provideMicrofrontendPart(),
    provideMicrofrontendView(),
    provideMicrofrontendDialog(),
    provideMicrofrontendMessageBox(),
    provideMicrofrontendPopup(),
    provideMicrofrontendNotification(),
    provideMicrofrontendText(),
    provideManifestObjectCache(),
    provideMicrofrontendPlatformBeans(),
    provideWorkbenchClientBeans(),
    runCanMatchGuardsAfterStartup(),
  ]);
}

/**
 * Provides beans of @scion/microfrontend-platform for DI.
 */
function provideMicrofrontendPlatformBeans(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: MicrofrontendPlatformConfig, useFactory: () => Beans.get(MicrofrontendPlatformConfig)},
    {provide: MessageClient, useFactory: () => Beans.get(MessageClient)},
    {provide: IntentClient, useFactory: () => Beans.get(IntentClient)},
    {provide: OutletRouter, useFactory: () => Beans.get(OutletRouter)},
    {provide: ManifestService, useFactory: () => Beans.get(ManifestService)},
    {provide: PlatformPropertyService, useFactory: () => Beans.get(PlatformPropertyService)},
  ]);
}

/**
 * Provides beans of @scion/workbench-client for DI.
 */
function provideWorkbenchClientBeans(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: WorkbenchRouter, useFactory: () => Beans.get(WorkbenchRouter)},
    {provide: WorkbenchPopupService, useFactory: () => Beans.get(WorkbenchPopupService)},
    {provide: WorkbenchDialogService, useFactory: () => Beans.get(WorkbenchDialogService)},
    {provide: WorkbenchMessageBoxService, useFactory: () => Beans.get(WorkbenchMessageBoxService)},
    {provide: WorkbenchNotificationService, useFactory: () => Beans.get(WorkbenchNotificationService)},
    {provide: WorkbenchTextService, useFactory: () => Beans.get(WorkbenchTextService)},
  ]);
}

/**
 * Instructs Angular to evaluate `CanMatch` route guards, required for guards that depend on data not available during initial navigation,
 * such as the completed startup of the SCION Microfrontend Platform to lookup capabilities. Otherwise, microfrontends would display a
 * "Not Found" page until the next Angular navigation.
 */
function runCanMatchGuardsAfterStartup(): EnvironmentProviders {
  return provideWorkbenchInitializer(() => Routing.runCanMatchGuards(), {phase: WorkbenchStartupPhase.PostStartup});
}
