/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Environment used when packaging the app for CI on GitHub.
 */
export const environment = {
  production: true,
  animationEnabled: false,
  apps: {
    app1: {
      symbolicName: 'workbench-client-testing-app1',
      url: 'http://localhost:4201',
    },
    app2: {
      symbolicName: 'workbench-client-testing-app2',
      url: 'http://localhost:4202',
    },
  },
};
