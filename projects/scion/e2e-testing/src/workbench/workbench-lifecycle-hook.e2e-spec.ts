/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';

test.describe('Workbench Lifecycle Hook', () => {

  test('should invoke workbench lifecycle hooks in the correct order [microfrontendSupport=enabled]', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /WorkbenchLifecycleHookLogger/})).toEqual([
      // WorkbenchStartupPhase.PreStartup
      `[WorkbenchLifecycleHookLogger][WorkbenchStartupPhase.PreStartup] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // WorkbenchStartupPhase.Startup
      `[WorkbenchLifecycleHookLogger][WorkbenchStartupPhase.Startup] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // MicrofrontendPlatformStartupPhase.PreStartup
      `[WorkbenchLifecycleHookLogger][MicrofrontendPlatformStartupPhase.PreStartup] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // MicrofrontendPlatformStartupPhase.PostStartup
      `[WorkbenchLifecycleHookLogger][MicrofrontendPlatformStartupPhase.PostStartup] [microfrontendPlatformState=Starting, workbenchStarted=false]`,

      // WorkbenchStartupPhase.PostStartup
      `[WorkbenchLifecycleHookLogger][WorkbenchStartupPhase.PostStartup] [microfrontendPlatformState=Started, workbenchStarted=false]`,
    ]);
  });

  test('should not invoke microfrontend-related lifecycle hooks if starting the workbench with microfrontend support disabled [microfrontendSupport=disabled]', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /WorkbenchLifecycleHookLogger/})).toEqual([
      // WorkbenchStartupPhase.PreStartup
      `[WorkbenchLifecycleHookLogger][WorkbenchStartupPhase.PreStartup] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // WorkbenchStartupPhase.Startup
      `[WorkbenchLifecycleHookLogger][WorkbenchStartupPhase.Startup] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // WorkbenchStartupPhase.PostStartup
      `[WorkbenchLifecycleHookLogger][WorkbenchStartupPhase.PostStartup] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
    ]);
  });
});
