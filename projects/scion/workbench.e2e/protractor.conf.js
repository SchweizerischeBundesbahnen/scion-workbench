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
const chromeArgs = ['--window-size=1920,1080'];

// Allow resolving modules specified by paths in 'tsconfig', e.g., to resolve '@scion/workbench' module. This is required when working with secondary entry point.
// By default, 'ts-node' only looks in the 'node_modules' folder for modules and not in paths specified in 'tsconfig'.
// See https://www.npmjs.com/package/tsconfig-paths
require('tsconfig-paths/register');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts',
  ],
  suites: {
    activity: [
      './src/**/activity.e2e-spec.ts',
    ],
    defaultView: [
      './src/**/entry-point-page.e2e-spec.ts',
    ],
    router: [
      './src/**/router.e2e-spec.ts',
    ],
    routerlink: [
      './src/**/router-link.e2e-spec.ts',
    ],
    viewpartAction: [
      './src/**/view-part-action.e2e-spec.ts',
    ],
    viewTabbar: [
      './src/**/view-tab-bar.e2e-spec.ts',
    ],
    workbench: [
      './src/**/workbench.e2e-spec.ts',
    ],
  },
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: process.env.HEADLESS ? ['--headless', ...chromeArgs] : chromeArgs,
      binary: puppeteer.executablePath(),
    },
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
