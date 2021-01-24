/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter, StacktraceOption} = require('jasmine-spec-reporter');

const puppeteer = require('puppeteer');
const chromeArgs = ['--window-size=1920,1200'];

// Allow resolving modules specified by paths in 'tsconfig', e.g., to resolve '@scion/workbench' module. This is required when working with secondary entry point.
// By default, 'ts-node' only looks in the 'node_modules' folder for modules and not in paths specified in 'tsconfig'.
// See https://www.npmjs.com/package/tsconfig-paths
require('tsconfig-paths/register');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts',
  ],
  suites: {
    'workbench::startup': [
      './src/workbench/**/startup.e2e-spec.ts',
    ],
    'workbench::default-page': [
      './src/workbench/**/default-page.e2e-spec.ts',
    ],
    'workbench::router': [
      './src/workbench/**/router.e2e-spec.ts',
    ],
    'workbench::routerlink': [
      './src/workbench/**/router-link.e2e-spec.ts',
    ],
    'workbench::view': [
      './src/workbench/**/view.e2e-spec.ts',
    ],
    'workbench::viewpart-action': [
      './src/workbench/**/view-part-action.e2e-spec.ts',
    ],
    'workbench::view-tabbar': [
      './src/workbench/**/view-tab-bar.e2e-spec.ts',
    ],
    'workbench::popup': [
      './src/workbench/**/popup.e2e-spec.ts',
    ],
    'workbench::popup-size': [
      './src/workbench/**/popup-size.e2e-spec.ts',
    ],
    'workbench::message-box': [
      './src/workbench/**/message-box.e2e-spec.ts',
    ],
    'workbench::notification': [
      './src/workbench/**/notification.e2e-spec.ts',
    ],
    'workbench-client::router': [
      './src/workbench-client/**/router.e2e-spec.ts',
    ],
    'workbench-client::router-params': [
      './src/workbench-client/**/router-params.e2e-spec.ts',
    ],
    'workbench-client::view': [
      './src/workbench-client/**/view.e2e-spec.ts',
    ],
    'workbench-client::popup': [
      './src/workbench-client/**/popup.e2e-spec.ts',
    ],
    'workbench-client::popup-params': [
      './src/workbench-client/**/popup-params.e2e-spec.ts',
    ],
    'workbench-client::popup-router': [
      './src/workbench-client/**/popup-router.e2e-spec.ts',
    ],
    'workbench-client::popup-size': [
      './src/workbench-client/**/popup-size.e2e-spec.ts',
    ],
    'workbench-client::message-box': [
      './src/workbench-client/**/message-box.e2e-spec.ts',
    ],
    'workbench-client::notification': [
      './src/workbench-client/**/notification.e2e-spec.ts',
    ],
  },
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: process.env.HEADLESS ? ['--headless', ...chromeArgs] : chromeArgs,
      binary: puppeteer.executablePath(),
    },
    loggingPrefs: {
      // By default browser allows recording only WARNING and SEVERE level messages.
      browser: 'ALL' // "OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL".
    }
  },
  SELENIUM_PROMISE_MANAGER: false,
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    },
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json'),
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: StacktraceOption.PRETTY,
      },
    }));
  },
};
