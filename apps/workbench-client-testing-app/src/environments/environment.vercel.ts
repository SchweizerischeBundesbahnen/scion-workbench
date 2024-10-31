/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import packageJson from '../../../../projects/scion/workbench/package.json';

const version = packageJson.version.replace(/\./g, '-');

/**
 * Environment used when packaging the app for Vercel.
 */
export const environment = {
  animationEnabled: true,
  apps: {
    app1: {
      symbolicName: 'workbench-client-testing-app1',
      url: `https://workbench-client-testing-app1-v${version}.scion.vercel.app`,
    },
    app2: {
      symbolicName: 'workbench-client-testing-app2',
      url: `https://workbench-client-testing-app2-v${version}.scion.vercel.app`,
    },
  },
};
