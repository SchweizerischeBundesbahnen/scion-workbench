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
import {workbenchManifest} from '../app/workbench.manifest';

/**
 * Environment used if starting the app locally.
 */
const microfrontendPlatformConfig: MicrofrontendPlatformConfig = {
  host: {
    symbolicName: 'workbench-host-app',
    manifest: workbenchManifest,
  },
  applications: [
    {symbolicName: 'workbench-client-testing-app1', manifestUrl: 'http://localhost:4201/manifest-app1.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'workbench-client-testing-app2', manifestUrl: 'http://localhost:4202/manifest-app2.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'devtools', manifestUrl: 'https://microfrontend-platform-devtools-v1-4-0.scion.vercel.app/manifest.json', intentionCheckDisabled: true, scopeCheckDisabled: true},
  ],
};

export const environment = {
  animationEnabled: false,
  logAngularChangeDetectionCycles: true,
  initialPerspective: 'blank',
  microfrontendPlatformConfig,
};
