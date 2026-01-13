/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {environment} from '../environments/environment';
import {perspectives} from './app.perspectives';
import {WorkbenchConfig} from '@scion/workbench';
import {provideTextFromStorage} from './text/storage-text-provider';

/**
 * Configures SCION Workbench for the testing application.
 */
export const workbenchConfig: WorkbenchConfig = {
  microfrontendPlatform: WorkbenchStartupQueryParams.standalone() ? undefined : {
    ...environment.microfrontendPlatformConfig, // eslint-disable-line  @typescript-eslint/no-misused-spread
    preloadInactiveViews: WorkbenchStartupQueryParams.preloadInactiveMicrofrontendViews() ?? environment.microfrontendPlatformConfig.preloadInactiveViews,
  },
  layout: perspectives,
  dialog: {
    modalityScope: WorkbenchStartupQueryParams.dialogModalityScope(),
  },
  textProvider: provideTextFromStorage,
  logging: {
    logLevel: WorkbenchStartupQueryParams.logLevel(),
  },
};
