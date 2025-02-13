/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/******************************************************************************************************************************************
 * DO NOT ACTIVATE ZONE.JS NOR ANGULAR TESTBED AS SCION-WORKBENCH-CLIENT IS NOT AN ANGULAR LIBRARY.
 *
 * About SCION specific customizations of this file:
 * - Importing the module 'zone.js' activates zone.js, so we omit it.
 * - Importing the module '@angular/core/testing' installs Angular test hooks for resetting the fake async zone, which, if missing zone.js, causes
 *   the following error since Angular 12:
 *   `zone-testing.js is needed for the fakeAsync() test helper but could not be found. Please make sure that your environment includes zone.js/testing`
 * - If not having any sort of top-level import or export statement, the compiler complains with the following error: `Cannot redeclare block-scoped variable 'require'`.
 *   To fix this problem, we add an empty export to pretend to be a module, as following: `export {};`
 *   > For more information about this 'empty export' workaround, see https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
 *   > For more information about the webpack 'refer' keyword, see to https://stackoverflow.com/a/54066904
 *
 * Please note when writing tests:
 * - To simulate asynchronous passage of time, use Jasmine clock instead of Angular fakeAsync zone (tick, flush).
 ******************************************************************************************************************************************/

// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// import 'zone.js';
// import 'zone.js/testing';
// import {getTestBed} from '@angular/core/testing';
// import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
export {};
