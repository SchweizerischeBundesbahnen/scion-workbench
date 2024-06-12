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
 * Environment used when packaging the app for CI on GitHub.
 */
const microfrontendPlatformConfig: MicrofrontendPlatformConfig = {
  host: {
    symbolicName: 'workbench-host-app',
    manifest: workbenchManifest,
  },
  applications: [
    {symbolicName: 'workbench-client-testing-app1', manifestUrl: 'http://localhost:4201/manifest-app1.json', intentionRegisterApiDisabled: false},
    {symbolicName: 'workbench-client-testing-app2', manifestUrl: 'http://localhost:4202/manifest-app2.json', intentionRegisterApiDisabled: false},
  ],
};

export const environment = {
  animationEnabled: false,
  logAngularChangeDetectionCycles: false,
  microfrontendPlatformConfig,
};
