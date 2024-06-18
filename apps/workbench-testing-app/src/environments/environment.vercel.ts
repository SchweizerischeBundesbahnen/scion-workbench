/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MicrofrontendPlatformConfig} from '@scion/microfrontend-platform';
import {workbenchManifest} from '../app/workbench.manifest';

/**
 * Environment used when packaging the app for Vercel.
 */
const microfrontendPlatformConfig: MicrofrontendPlatformConfig = {
  host: {
    symbolicName: 'workbench-host-app',
    manifest: workbenchManifest,
  },
  applications: [
    {symbolicName: 'workbench-client-testing-app1', manifestUrl: 'https://scion-workbench-client-testing-app1.vercel.app/manifest-app1.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'workbench-client-testing-app2', manifestUrl: 'https://scion-workbench-client-testing-app2.vercel.app/manifest-app2.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'devtools', manifestUrl: 'https://scion-microfrontend-platform-devtools-v1-3-0.vercel.app/manifest.json', intentionCheckDisabled: true, scopeCheckDisabled: true},
  ],
};

export const environment = {
  animationEnabled: true,
  logAngularChangeDetectionCycles: false,
  microfrontendPlatformConfig,
};
