/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

import {MicrofrontendPlatformConfig} from '@scion/microfrontend-platform';
import {workbenchManifest} from '../app/workbench-manifest';

/**
 * Environment used when starting the app locally.
 */
const microfrontendPlatformConfig: MicrofrontendPlatformConfig = {
  host: {
    symbolicName: 'workbench-host-app',
    manifest: workbenchManifest,
  },
  applications: [
    {symbolicName: 'workbench-client-testing-app1', manifestUrl: 'http://localhost:4201/assets/manifest-app1.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'workbench-client-testing-app2', manifestUrl: 'http://localhost:4202/assets/manifest-app2.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'devtools', manifestUrl: 'https://scion-microfrontend-platform-devtools-v1-0-0-rc-12.vercel.app/assets/manifest.json', intentionCheckDisabled: true, scopeCheckDisabled: true},
  ],
  properties: {
    'workbench-client-testing-app1': {
      color: '#314d8c',
    },
    'workbench-client-testing-app2': {
      color: '#2c78f7',
    },
  },
};

export const environment = {
  production: false,
  animationEnabled: false,
  microfrontendPlatformConfig,
};
