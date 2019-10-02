// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter} = require('jasmine-spec-reporter');

const puppeteer = require('puppeteer');
const chromeArgs = ['--window-size=1920,1080'];

// Allow resolving modules specified by paths in 'tsconfig', e.g., to resolve '@scion/workbench' module.
// By default, 'ts-node' only looks in the 'node_modules' folder for modules and not in paths specified in 'tsconfig'.
// See https://www.npmjs.com/package/tsconfig-paths
require('tsconfig-paths/register');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts',
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: process.env.HEADLESS ? ['--headless', ...chromeArgs] : chromeArgs,
      binary: puppeteer.executablePath(),
    },
  },
  SELENIUM_PROMISE_MANAGER: false,
  directConnect: true,
  baseUrl: 'http://localhost:5000/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    },
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json'),
    });
    jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
  },
};
