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
import {PerspectiveDefinitions} from './workbench.perspectives';
import {WorkbenchModuleConfig} from '@scion/workbench';

/**
 * Configures SCION Workbench for the testing application.
 */
export const workbenchModuleConfig: WorkbenchModuleConfig = {
  startup: {
    launcher: WorkbenchStartupQueryParams.launcher(),
  },
  microfrontendPlatform: WorkbenchStartupQueryParams.standalone() ? undefined : environment.microfrontendPlatformConfig,
  layout: {
    perspectives: [
      ...PerspectiveDefinitions.perspectives,
      ...PerspectiveDefinitions.perspectivesFromQueryParam,
    ],
    initialPerspective: PerspectiveDefinitions.initialPerspective,
  },
  dialog: {
    modalityScope: WorkbenchStartupQueryParams.dialogModalityScope(),
  },
};
