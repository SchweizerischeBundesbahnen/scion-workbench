/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * This file can be replaced during build by using the `fileReplacements` array.
 * `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
 * The list of file replacements can be found in `angular.json`.
 */
export const environment = {
  production: false,
  apps: {
    app_1: {
      symbolicName: 'app-1',
      url: 'http://localhost:4201',
    },
    app_2: {
      symbolicName: 'app-2',
      url: 'http://localhost:4202',
    },
    app_3: {
      symbolicName: 'app-3',
      url: 'http://localhost:4203',
    },
    app_4: {
      symbolicName: 'app-4',
      url: 'http://localhost:4204',
    },
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
