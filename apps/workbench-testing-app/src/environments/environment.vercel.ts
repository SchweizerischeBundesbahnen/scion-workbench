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
    properties: {
      'workbench-client-testing-app1': {
        color: '#314d8c',
      },
      'workbench-client-testing-app2': {
        color: '#2c78f7',
      },
    },
    apps: [
      {symbolicName: 'workbench-client-testing-app1', manifestUrl: 'https://scion-workbench-client-testing-app1.vercel.app/assets/manifest-app1.json', intentionRegisterApiDisabled: false},
      {symbolicName: 'workbench-client-testing-app2', manifestUrl: 'https://scion-workbench-client-testing-app2.vercel.app/assets/manifest-app2.json', intentionRegisterApiDisabled: false},
      {symbolicName: 'devtools', manifestUrl: '/assets/manifest-devtools.json', intentionCheckDisabled: true, scopeCheckDisabled: true},
    ],
  },
};

export const environment = {
  production: true,
  animationEnabled: true,
  microfrontendConfig,
};
