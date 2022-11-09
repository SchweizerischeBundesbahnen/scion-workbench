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

    await expect(await consoleLogs.get({severity: 'debug', filter: /WorkbenchLifecycleHookLogger/})).toEqual([
      // WORKBENCH_PRE_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken WORKBENCH_PRE_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken WORKBENCH_PRE_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // WORKBENCH_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken WORKBENCH_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken WORKBENCH_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // MICROFRONTEND_PLATFORM_PRE_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken MICROFRONTEND_PLATFORM_PRE_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken MICROFRONTEND_PLATFORM_PRE_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // MICROFRONTEND_PLATFORM_POST_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken MICROFRONTEND_PLATFORM_POST_STARTUP] [microfrontendPlatformState=Starting, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken MICROFRONTEND_PLATFORM_POST_STARTUP] [microfrontendPlatformState=Starting, workbenchStarted=false]`,

      // WORKBENCH_POST_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken WORKBENCH_POST_STARTUP] [microfrontendPlatformState=Started, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken WORKBENCH_POST_STARTUP] [microfrontendPlatformState=Started, workbenchStarted=false]`,
    ]);
  });

  test('should not invoke microfrontend-related lifecycle hooks when starting the workbench with microfrontend support disabled [microfrontendSupport=disabled]', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await expect(await consoleLogs.get({severity: 'debug', filter: /WorkbenchLifecycleHookLogger/})).toEqual([
      // WORKBENCH_PRE_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken WORKBENCH_PRE_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken WORKBENCH_PRE_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // WORKBENCH_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken WORKBENCH_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken WORKBENCH_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,

      // WORKBENCH_POST_STARTUP
      `[WorkbenchLifecycleHookLogger#construct][InjectionToken WORKBENCH_POST_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
      `[WorkbenchLifecycleHookLogger#init][InjectionToken WORKBENCH_POST_STARTUP] [microfrontendPlatformState=Stopped, workbenchStarted=false]`,
    ]);
  });
});
