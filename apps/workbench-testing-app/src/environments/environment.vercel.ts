/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { WorkbenchMicrofrontendConfig } from '@scion/workbench';

/**
 * Environment used when packaging the app for Vercel.
 */
const microfrontendConfig: WorkbenchMicrofrontendConfig = {
  platform: {
    apps: [
      {symbolicName: 'devtools', manifestUrl: '/assets/manifest-devtools.json', intentionCheckDisabled: true, scopeCheckDisabled: true},
      {symbolicName: 'workbench-client-testing-app', manifestUrl: `https://scion-workbench-client-testing-app.now.sh/assets/manifest.json`},
    ],
  },
};

export const environment = {
  production: true,
  microfrontendConfig,
};
