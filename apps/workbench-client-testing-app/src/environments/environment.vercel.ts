/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Environment used when packaging the app for Vercel.
 */
export const environment = {
  production: true,
  animationEnabled: true,
  apps: {
    app1: {
      symbolicName: 'workbench-client-testing-app1',
      url: 'http://scion-workbench-client-testing-app1.now.sh',
    },
    app2: {
      symbolicName: 'workbench-client-testing-app2',
      url: 'http://scion-workbench-client-testing-app2.now.sh',
    },
  },
};
