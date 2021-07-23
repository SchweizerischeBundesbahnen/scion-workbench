/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

import {WorkbenchMicrofrontendConfig} from '@scion/workbench';

/**
 * Environment used when starting the app locally.
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
      {symbolicName: 'workbench-client-testing-app1', manifestUrl: 'http://localhost:4201/assets/manifest-app1.json', intentionRegisterApiDisabled: false},
      {symbolicName: 'workbench-client-testing-app2', manifestUrl: 'http://localhost:4202/assets/manifest-app2.json', intentionRegisterApiDisabled: false},
      {symbolicName: 'devtools', manifestUrl: '/assets/manifest-devtools.json', intentionCheckDisabled: true, scopeCheckDisabled: true},
      {symbolicName: 'app-1', manifestUrl: '/assets/manifest-microfrontend-platform-testing-app.json', intentionRegisterApiDisabled: false},
    ],
  },
};

export const environment = {
  production: false,
  animationEnabled: false,
  microfrontendConfig,
};
