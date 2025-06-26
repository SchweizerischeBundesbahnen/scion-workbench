/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {environment} from '../environments/environment';
import {MAIN_AREA, WorkbenchConfig} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from '../app/workbench/workbench-startup-query-params';

export const workbenchConfig: WorkbenchConfig = {
  layout: {
    perspectives: [
      {
        id: 'default',
        layout: factory => factory
          .addPart(MAIN_AREA)
          .navigatePart(MAIN_AREA, [], {hint: 'main-area'}),
      },
    ],
    initialPerspective: 'default',
  },
  microfrontendPlatform: WorkbenchStartupQueryParams.standalone() ? undefined : environment.microfrontendPlatformConfig,
};
