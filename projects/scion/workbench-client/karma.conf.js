/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// By setting `PLAYWRIGHT_BROWSERS_PATH=0`, chromium binaries are found in `node_modules`
// https://playwright.dev/docs/ci#caching-browsers
process.env.PLAYWRIGHT_BROWSERS_PATH = 0;
process.env.CHROME_BIN = require('playwright-core').chromium.executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../../coverage/scion/workbench-client'),
      subdir: '.',
      reporters: [
        {type: 'html'},
        {type: 'text-summary'},
      ],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [
      process.env.HEADLESS ? 'ChromeHeadless' : 'Chrome',
    ],
    singleRun: !!process.env.HEADLESS,
    failOnEmptyTestSuite: false,
    restartOnFileChange: true,
  });
};
