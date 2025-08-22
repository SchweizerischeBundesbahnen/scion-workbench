/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {environment} from '../environments/environment';
import {Perspectives} from './workbench.perspectives';
import {WorkbenchConfig} from '@scion/workbench';
import {provideTextFromStorage} from './text/storage-text-provider';

/**
 * Configures SCION Workbench for the testing application.
 */
export const workbenchConfig: WorkbenchConfig = {
  startup: {
    launcher: WorkbenchStartupQueryParams.launcher(),
  },
  microfrontendPlatform: WorkbenchStartupQueryParams.standalone() ? undefined : environment.microfrontendPlatformConfig,
  layout: {
    perspectives: Perspectives.definitions,
    initialPerspective: Perspectives.initialPerspective,
  },
  dialog: {
    modalityScope: WorkbenchStartupQueryParams.dialogModalityScope(),
  },
  textProvider: provideTextFromStorage,
};
