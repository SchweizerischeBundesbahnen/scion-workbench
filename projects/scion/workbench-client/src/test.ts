/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// DO NOT ACTIVATE ZONE.JS BECAUSE SCION WORKBENCH CLIENT IS NOT AN ANGULAR LIBRARY
// -> Consequently, to simulate asynchronous passage of time, use Jasmine clock instead of Angular fakeAsync zone (tick, flush).
// import 'zone.js/dist/zone';
// import 'zone.js/dist/zone-testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
