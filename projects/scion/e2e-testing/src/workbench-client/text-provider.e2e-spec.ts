/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPartCapability, WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {TextTestPagePO} from './page-object/test-pages/text-test-page.po';
import {TextTestPagePO as HostTextTestPagePO} from '../workbench/page-object/test-pages/text-test-page.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {TextMessageBoxPagePO} from '../text-message-box-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {TextNotificationPagePO} from '../text-notification-page.po';
import {MAIN_AREA} from '../workbench.model';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchViewCapability} from '../workbench/page-object/layout-page/register-route-page.po';

test.describe('Text Provider', () => {

  test.describe('WorkbenchClientTextService', () => {

    test('should observe text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT 1');

      // Observe text.
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT 1');

      // Change text.
      await testPage.provideText('key', 'TEXT 2');
      await expect(testPage.text1.text).toHaveText('TEXT 2');
    });

    test('should observe text with params (appended to the translatable)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT 1 - {{param1}} {{param2}}');

      // Observe text.
      await testPage.text1.observe('%key;param1=value1;param2=value2', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT 1 - value1 value2');

      // Change text.
      await testPage.provideText('key', 'TEXT 2 - {{param1}} {{param2}}');
      await expect(testPage.text1.text).toHaveText('TEXT 2 - value1 value2');
    });

    test('should observe text with params (passed via options)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT 1 - {{param1}} {{param2}}');

      // Observe text.
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1', params: {param1: 'value1', param2: 'value2'}});
      await expect(testPage.text1.text).toHaveText('TEXT 1 - value1 value2');

      // Change text.
      await testPage.provideText('key', 'TEXT 2 - {{param1}} {{param2}}');
      await expect(testPage.text1.text).toHaveText('TEXT 2 - value1 value2');
    });

    test('should observe text with params (appended to the translatable and passed via options)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT 1 - {{param1}} {{param2}} {{param3}} {{param4}}');

      // Observe text.
      await testPage.text1.observe('%key;param1=value1;param2=value2', {provider: 'workbench-client-testing-app1', params: {param2: 'VALUE2', param3: 'VALUE3', param4: 'VALUE4'}});
      await expect(testPage.text1.text).toHaveText('TEXT 1 - value1 VALUE2 VALUE3 VALUE4');
    });

    test('should observe non-translatable text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT');

      // Observe text.
      await testPage.text1.observe('key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('key');

      // Change text.
      await testPage.provideText('key', 'TEXT 2');
      await expect(testPage.text1.text).toHaveText('key');
    });

    test('should emit `undefined` if not found', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide `undefined` for requested text.
      await testPage.provideText('key', '<undefined>');

      // Expect key to be returned.
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('<undefined>');

      // Expect no error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
    });

    test('should emit key and log error if missing the "text-provider" intention', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Observe text.
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app2'});

      // Expect key to be returned.
      await expect(testPage.text1.text).toHaveText('%key');
      await expect.poll(() => testPage.text1.state()).toEqual('completed');

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /NotQualifiedError/})).toHaveLength(1);
    });

    test('should not complete observable', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT');

      // Observe text (provider does not complete request).
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT');
      await expect.poll(() => testPage.text1.state()).toBeUndefined();

      // Observe text (provider completes request).
      await testPage.text2.observe('%key;options.complete=true', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text2.text).toHaveText('TEXT');
      await expect.poll(() => testPage.text2.state()).toBeUndefined();
    });

    test('should observe text from another app', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view for app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register test view for app 2.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app2', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
        private: false,
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register intention to open test view from app 1.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'testee', app: 'app1'}, cssClass: 'testee-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'testee', app: 'app2'}, cssClass: 'testee-app2'},
          ],
        },
      });

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      const textProviderApp1Page = new TextTestPagePO(appPO.view({cssClass: 'testee-app1'}));
      const textProviderApp2Page = new TextTestPagePO(appPO.view({cssClass: 'testee-app2'}));

      // Provide text in app 2.
      await textProviderApp2Page.provideText('key', 'TEXT 1');

      // Register intention in app 1 to get texts from app 2.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'text-provider',
        qualifier: {provider: 'workbench-client-testing-app2'},
      });

      // Observe text of app 2 from app 1.
      await textProviderApp1Page.text1.observe('%key', {provider: 'workbench-client-testing-app2'});
      await expect(textProviderApp1Page.text1.text).toHaveText('TEXT 1');

      // Change text.
      await textProviderApp2Page.provideText('key', 'TEXT 2');
      await expect(textProviderApp1Page.text1.text).toHaveText('TEXT 2');
    });

    test('should wait until registered text-provider capability', async ({appPO, microfrontendNavigator, consoleLogs, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register intention to not error if capability is not yet registered.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'text-provider',
        qualifier: {provider: 'workbench-client-testing-app1'},
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT');

      // Unregister text provider.
      await testPage.unregisterTextProvider();

      // Observe text.
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1'});

      // Wait some time.
      await page.waitForTimeout(1000);

      // Expect text not to be returned.
      await expect(testPage.text1.text).not.toBeAttached();

      // Register text provider.
      await testPage.registerTextProvider();

      // Expect text to be returned.
      await expect(testPage.text1.text).toHaveText('TEXT');

      // Expect no error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    test('should cache texts', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view for app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register test view for app 2.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app2', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
        private: false,
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register intention to open test view from app 1.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'testee', app: 'app1'}, cssClass: 'testee-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'testee', app: 'app2'}, cssClass: 'testee-app2'},
          ],
        },
      });

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      // Provide text.
      const textProviderApp1Page = new TextTestPagePO(appPO.view({cssClass: 'testee-app1'}));
      await textProviderApp1Page.provideText('key', 'TEXT (app1)');

      const textProviderApp2Page = new TextTestPagePO(appPO.view({cssClass: 'testee-app2'}));
      await textProviderApp2Page.provideText('key', 'TEXT (app2)');

      // Observe text.
      await textProviderApp1Page.text1.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(textProviderApp1Page.text1.text).toHaveText('TEXT (app1)');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await textProviderApp1Page.text2.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(textProviderApp1Page.text2.text).toHaveText('TEXT (app1)');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();

      // Register intention to get texts from app 2.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'text-provider',
        qualifier: {provider: 'workbench-client-testing-app2'},
      });

      // Observe text of other app.
      await textProviderApp1Page.text3.observe('%key', {provider: 'workbench-client-testing-app2'});
      await expect(textProviderApp1Page.text3.text).toHaveText('TEXT (app2)');

      // Expect request to the text provider of app 2.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app2] Requesting text: %key',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await textProviderApp1Page.text4.observe('%key', {provider: 'workbench-client-testing-app2'});
      await expect(textProviderApp1Page.text4.text).toHaveText('TEXT (app2)');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();
    });

    test('should cache texts if provider completes request', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view for app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register test view for app 2.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app2', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
        private: false,
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register intention to open test view from app 1.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'testee', app: 'app1'}, cssClass: 'testee-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'testee', app: 'app2'}, cssClass: 'testee-app2'},
          ],
        },
      });

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      // Provide text.
      const textProviderApp1Page = new TextTestPagePO(appPO.view({cssClass: 'testee-app1'}));
      await textProviderApp1Page.provideText('key', 'TEXT (app1)');

      const textProviderApp2Page = new TextTestPagePO(appPO.view({cssClass: 'testee-app2'}));
      await textProviderApp2Page.provideText('key', 'TEXT (app2)');

      // Observe text.
      await textProviderApp1Page.text1.observe('%key;options.complete=true', {provider: 'workbench-client-testing-app1'});
      await expect(textProviderApp1Page.text1.text).toHaveText('TEXT (app1)');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key;options.complete=true',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await textProviderApp1Page.text2.observe('%key;options.complete=true', {provider: 'workbench-client-testing-app1'});
      await expect(textProviderApp1Page.text2.text).toHaveText('TEXT (app1)');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();

      // Register intention to get texts from app 2.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'text-provider',
        qualifier: {provider: 'workbench-client-testing-app2'},
      });

      // Observe text of other app.
      await textProviderApp1Page.text3.observe('%key;options.complete=true', {provider: 'workbench-client-testing-app2'});
      await expect(textProviderApp1Page.text3.text).toHaveText('TEXT (app2)');

      // Expect request to the text provider of app 2.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app2] Requesting text: %key;options.complete=true',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await textProviderApp1Page.text4.observe('%key;options.complete=true', {provider: 'workbench-client-testing-app2'});
      await expect(textProviderApp1Page.text4.text).toHaveText('TEXT (app2)');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();
    });

    test('should cache texts (text with params)', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT - {{param}}');

      // Observe text.
      await testPage.text1.observe('%key;param=value1', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT - value1');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key;param=value1',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await testPage.text2.observe('%key;param=value1', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text2.text).toHaveText('TEXT - value1');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();

      // Observe text again (params passed via options).
      await testPage.text3.observe('%key', {params: {param: 'value1'}, provider: 'workbench-client-testing-app1'});
      await expect(testPage.text3.text).toHaveText('TEXT - value1');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();

      // Observe text with different param.
      await testPage.text4.observe('%key;param=value2', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text4.text).toHaveText('TEXT - value2');

      // Expect request to text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key;param=value2',
      ]);
    });

    test('should stop observing text when unsubscribing from last subscription', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT 1');

      // Observe text (first subscription).
      await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT 1');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
      ]);
      consoleLogs.clear();

      // Observe text again (second subscription).
      await testPage.text2.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text2.text).toHaveText('TEXT 1');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);

      // Cancel first text subscription
      await testPage.text1.cancel();

      // Expect text of second text subscription.
      await expect(testPage.text2.text).toHaveText('TEXT 1');

      // Change text.
      await testPage.provideText('key', 'TEXT 2');
      await expect(testPage.text2.text).toHaveText('TEXT 2');

      // Observe text again (third subscription).
      await testPage.text3.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text3.text).toHaveText('TEXT 2');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);

      // Cancel second text subscription
      await testPage.text2.cancel();

      // Cancel third text subscription
      await testPage.text3.cancel();

      // Observe text again (fourth subscription).
      await testPage.text4.observe('%key', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text4.text).toHaveText('TEXT 2');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
      ]);
    });

    test('should share subscription by TTL', async ({appPO, microfrontendNavigator, consoleLogs, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT');

      // Observe text with no TTL
      await test.step('Observe text with no TTL', async () => {
        await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1'});
        await expect(testPage.text1.text).toHaveText('TEXT');

        // Expect request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
        ]);
        consoleLogs.clear();
      });

      // Observe text with TTL 2000.
      await test.step('Observe text with TTL 2000', async () => {
        await testPage.text2.observe('%key', {provider: 'workbench-client-testing-app1', ttl: 2000});
        await expect(testPage.text2.text).toHaveText('TEXT');

        // Expect request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
        ]);
        consoleLogs.clear();
      });

      // Observe text with TTL 2000.
      await test.step('Observe text with TTL 2000', async () => {
        await testPage.text3.observe('%key', {provider: 'workbench-client-testing-app1', ttl: 2000});
        await expect(testPage.text3.text).toHaveText('TEXT');

        // Expect no request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      });

      // Unsubscribe.
      await testPage.text1.cancel();
      await testPage.text2.cancel();
      await testPage.text3.cancel();

      // Observe text with TTL 2000.
      await test.step('Observe text with TTL 2000', async () => {
        await testPage.text1.observe('%key', {provider: 'workbench-client-testing-app1', ttl: 2000});
        await expect(testPage.text1.text).toHaveText('TEXT');

        // Expect no request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        await testPage.text1.cancel();
      });

      // Observe text with no TTL
      await test.step('Observe text with no TTL', async () => {
        await testPage.text2.observe('%key', {provider: 'workbench-client-testing-app1'});
        await expect(testPage.text2.text).toHaveText('TEXT');

        // Expect request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
        ]);
        consoleLogs.clear();
        await testPage.text2.cancel();
      });

      // Observe text with TTL 1000.
      await test.step('Observe text with TTL 1000', async () => {
        await testPage.text3.observe('%key', {provider: 'workbench-client-testing-app1', ttl: 1000});
        await expect(testPage.text3.text).toHaveText('TEXT');

        // Expect request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
        ]);
        consoleLogs.clear();
        await testPage.text3.cancel();
      });

      // Wait 2000s.
      await page.waitForTimeout(2000);

      // Observe text with TTL 2000.
      await test.step('Observe text with TTL 2000', async () => {
        await testPage.text4.observe('%key', {provider: 'workbench-client-testing-app1', ttl: 2000});
        await expect(testPage.text4.text).toHaveText('TEXT');

        // Expect request to the text provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
        ]);
        consoleLogs.clear();
        await testPage.text4.cancel();
      });
    });

    test('should parse key with multiple params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT - {{param1}} - {{param2}}');

      // Observe text.
      await testPage.text1.observe('%key;param1=value1;param2=value2', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT - value1 - value2');
    });

    test('should support escaped semicolon character in parameter value', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT - {{param1}} - {{param2}}');

      // Observe text.
      await testPage.text1.observe('%key;param1=v\\;al=ue1;param2=va\\;lue2', {provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT - v;al=ue1 - va;lue2');
    });

    test('should support semicolon character in parameter passed via options', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('key', 'TEXT - {{param1}} - {{param2}}');

      // Observe text.
      await testPage.text1.observe('%key', {params: {param1: 'val;ue1', param2: 'val=ue2'}, provider: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT - val;ue1 - val=ue2');
    });
  });

  test.describe('Workbench Part', () => {

    test.describe('Localized Part', () => {

      test('should display localized texts', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: '%part_label',
              tooltip: '%part_tooltip',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'bottom'},
          properties: {
            path: 'test-part',
            title: '%part_title',
            cssClass: 'testee-2',
          },
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));

        // Provide text.
        await test.step('Provide text', async () => {
          await textPage.provideText('part_label', 'Label 1');
          await expect(dockedPart.bar.title).toHaveText('Label 1');

          await textPage.provideText('part_title', 'Title 1');
          await expect(nonDockedPart.bar.title).toHaveText('Title 1');

          await textPage.provideText('part_tooltip', 'Tooltip 1');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await textPage.provideText('part_label', 'Label 2');
          await expect(dockedPart.bar.title).toHaveText('Label 2');

          await textPage.provideText('part_title', 'Title 2');
          await expect(nonDockedPart.bar.title).toHaveText('Title 2');

          await textPage.provideText('part_tooltip', 'Tooltip 2');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await textPage.provideText('part_label', '<undefined>');
          await expect(dockedPart.bar.title).toHaveText('%part_label');

          await textPage.provideText('part_title', '<undefined>');
          await expect(nonDockedPart.bar.title).toHaveText('%part_title');

          await textPage.provideText('part_tooltip', '<undefined>');
          await expect.poll(() => activityItem.getTooltip()).toEqual('%part_tooltip');
        });
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: '%part_label;id=:id;name=:name;undefined=:undefined',
              tooltip: '%part_tooltip;id=:id;name=:name;undefined=:undefined',
            },
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: '%part_title;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));

        // Provide text.
        await textPage.provideText('part_label', 'Label - {{id}} - {{name}} - {{undefined}}');
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}} - {{undefined}}');
        await textPage.provideText('part_tooltip', 'Tooltip - {{id}} - {{name}} - {{undefined}}');

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(dockedPart.bar.title).toHaveText('');
          await expect(nonDockedPart.bar.title).toHaveText('');
          await expect.poll(() => activityItem.getTooltip()).toEqual('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await textPage.provideValue('123', 'RESOLVED 1');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 1 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await textPage.provideValue('123', 'RESOLVED 2');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 2 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await textPage.provideValue('123', '%resolved_text');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=ABC');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=A\\;B');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await textPage.provideValue('123', '<undefined>');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 -  - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 -  - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 -  - :undefined');
        });
      });

      test('should support semicolon in parameter and resolver', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: '%part_label;id=:id;name=:name',
              tooltip: '%part_tooltip;id=:id;name=:name',
            },
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: '%part_title;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123;456'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123;456'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));

        // Provide text.
        await textPage.provideText('part_label', 'Label - {{id}} - {{name}}');
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}}');
        await textPage.provideText('part_tooltip', 'Tooltip - {{id}} - {{name}}');
        await textPage.provideValue('123;456', 'A;B');

        await expect(dockedPart.bar.title).toHaveText('Label - 123;456 - A;B');
        await expect(nonDockedPart.bar.title).toHaveText('Title - 123;456 - A;B');
        await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: '%part_title;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee',
          },
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide text and value.
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}}');
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123',
          '[TextProvider][workbench-client-testing-app1] Requesting text: %part_title;id=123;name=RESOLVED',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: '%part_title;id=:id;name=:name;options.complete=true', // instruct provider to complete
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id/complete', // instruct provider to complete
            },
            cssClass: 'testee',
          },
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide text and value.
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}}');
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123',
          '[TextProvider][workbench-client-testing-app1] Requesting text: %part_title;id=123;name=RESOLVED;options.complete=true',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });

    test.describe('Non-Localized Part', () => {

      test('should display non-localized texts', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: 'Label',
              tooltip: 'Tooltip',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main'},
          properties: {
            path: 'test-part',
            title: 'Title',
            cssClass: 'testee-2',
          },
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.main',
                qualifier: {part: 'main'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                position: 'left-top',
                active: true,
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Expect view title and heading as specified.
        await expect(dockedPart.bar.title).toHaveText('Label');
        await expect(nonDockedPart.bar.title).toHaveText('Title');
        await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip');
      });

      test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: '%',
              tooltip: '%',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main'},
          properties: {
            path: 'test-part',
            title: '%',
            cssClass: 'testee-2',
          },
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.main',
                qualifier: {part: 'main'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                position: 'left-top',
                active: true,
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Expect view title and heading as specified.
        await expect(dockedPart.bar.title).toHaveText('%');
        await expect(nonDockedPart.bar.title).toHaveText('%');
        await expect.poll(() => activityItem.getTooltip()).toEqual('%');
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: 'Label - :id - :name - :undefined',
              tooltip: 'Tooltip - :id - :name - :undefined',
            },
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: 'Title - :id - :name - :undefined',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(dockedPart.bar.title).toHaveText('');
          await expect(nonDockedPart.bar.title).toHaveText('');
          await expect.poll(() => activityItem.getTooltip()).toEqual('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await textPage.provideValue('123', 'RESOLVED 1');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 1 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await textPage.provideValue('123', 'RESOLVED 2');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 2 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await textPage.provideValue('123', '%resolved_text');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=ABC');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=A\\;B');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await textPage.provideValue('123', '<undefined>');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 -  - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 -  - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 -  - :undefined');
        });
      });

      test('should support semicolon in text, parameter and resolver', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            extras: {
              icon: 'folder',
              label: 'Part;Label - :id - :name',
              tooltip: 'Part;Tooltip - :id - :name',
            },
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: 'Part;Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123;456'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123;456'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        await textPage.provideValue('123;456', 'A;B');

        await expect(dockedPart.bar.title).toHaveText('Part;Label - 123;456 - A;B');
        await expect(nonDockedPart.bar.title).toHaveText('Part;Title - 123;456 - A;B');
        await expect.poll(() => activityItem.getTooltip()).toEqual('Part;Tooltip - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: 'Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            cssClass: 'testee',
          },
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide value.
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-part',
            title: 'Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id/complete', // instruct provider to complete
            },
            cssClass: 'testee',
          },
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('app1', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new TextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide value.
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });
  });

  test.describe('Workbench Host Part', () => {

    test.describe('Localized Part', () => {

      test('should display localized texts', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: '%part_label',
              tooltip: '%part_tooltip',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'bottom'},
          properties: {
            path: '',
            title: '%part_title',
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'bottom'})],
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));

        // Provide text.
        await test.step('Provide text', async () => {
          await textPage.provideText('part_label', 'Label 1');
          await expect(dockedPart.bar.title).toHaveText('Label 1');

          await textPage.provideText('part_title', 'Title 1');
          await expect(nonDockedPart.bar.title).toHaveText('Title 1');

          await textPage.provideText('part_tooltip', 'Tooltip 1');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await textPage.provideText('part_label', 'Label 2');
          await expect(dockedPart.bar.title).toHaveText('Label 2');

          await textPage.provideText('part_title', 'Title 2');
          await expect(nonDockedPart.bar.title).toHaveText('Title 2');

          await textPage.provideText('part_tooltip', 'Tooltip 2');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await textPage.provideText('part_label', '<undefined>');
          await expect(dockedPart.bar.title).toHaveText('%part_label');

          await textPage.provideText('part_title', '<undefined>');
          await expect(nonDockedPart.bar.title).toHaveText('%part_title');

          await textPage.provideText('part_tooltip', '<undefined>');
          await expect.poll(() => activityItem.getTooltip()).toEqual('%part_tooltip');
        });
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: '%part_label;id=:id;name=:name;undefined=:undefined',
              tooltip: '%part_tooltip;id=:id;name=:name;undefined=:undefined',
            },
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%part_title;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'bottom'})],
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));

        // Provide text.
        await textPage.provideText('part_label', 'Label - {{id}} - {{name}} - {{undefined}}');
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}} - {{undefined}}');
        await textPage.provideText('part_tooltip', 'Tooltip - {{id}} - {{name}} - {{undefined}}');

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(dockedPart.bar.title).toHaveText('');
          await expect(nonDockedPart.bar.title).toHaveText('');
          await expect.poll(() => activityItem.getTooltip()).toEqual('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await textPage.provideValue('123', 'RESOLVED 1');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 1 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await textPage.provideValue('123', 'RESOLVED 2');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 2 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await textPage.provideValue('123', '%resolved_text');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=ABC');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=A\\;B');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await textPage.provideValue('123', '<undefined>');

          await expect(dockedPart.bar.title).toHaveText('Label - 123 -  - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 -  - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 -  - :undefined');
        });
      });

      test('should support semicolon in parameter and resolver', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: '%part_label;id=:id;name=:name',
              tooltip: '%part_tooltip;id=:id;name=:name',
            },
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%part_title;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'bottom'})],
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123;456'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123;456'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));

        // Provide text.
        await textPage.provideText('part_label', 'Label - {{id}} - {{name}}');
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}}');
        await textPage.provideText('part_tooltip', 'Tooltip - {{id}} - {{name}}');
        await textPage.provideValue('123;456', 'A;B');

        await expect(dockedPart.bar.title).toHaveText('Label - 123;456 - A;B');
        await expect(nonDockedPart.bar.title).toHaveText('Title - 123;456 - A;B');
        await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%part_title;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'right'})],
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide text and value.
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}}');
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-host-app] Requesting value: 123',
          '[TextProvider][workbench-host-app] Requesting text: %part_title;id=123;name=RESOLVED',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%part_title;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id/complete', // instruct provider to complete
            },
            cssClass: 'testee',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'right'})],
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide text and value.
        await textPage.provideText('part_title', 'Title - {{id}} - {{name}}');
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-host-app] Requesting value: 123',
          '[TextProvider][workbench-host-app] Requesting text: %part_title;id=123;name=RESOLVED',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });

    test.describe('Non-Localized Part', () => {

      test('should display non-localized texts', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: 'Label',
              tooltip: 'Tooltip',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main'},
          properties: {
            path: '',
            title: 'Title',
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'main'})],
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.main',
                qualifier: {part: 'main'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                position: 'left-top',
                active: true,
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Expect view title and heading as specified.
        await expect(dockedPart.bar.title).toHaveText('Label');
        await expect(nonDockedPart.bar.title).toHaveText('Title');
        await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip');
      });

      test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: '%',
              tooltip: '%',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main'},
          properties: {
            path: '',
            title: '%',
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'main'})],
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.main',
                qualifier: {part: 'main'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                position: 'left-top',
                active: true,
              },
            ],
          },
        });

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // Expect view title and heading as specified.
        await expect(dockedPart.bar.title).toHaveText('%');
        await expect(nonDockedPart.bar.title).toHaveText('%');
        await expect.poll(() => activityItem.getTooltip()).toEqual('%');
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: 'Label - :id - :name - :undefined',
              tooltip: 'Tooltip - :id - :name - :undefined',
            },
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name - :undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'bottom'})],
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(dockedPart.bar.title).toHaveText('');
          await expect(nonDockedPart.bar.title).toHaveText('');
          await expect.poll(() => activityItem.getTooltip()).toEqual('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await textPage.provideValue('123', 'RESOLVED 1');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 1 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await textPage.provideValue('123', 'RESOLVED 2');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED 2 - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await textPage.provideValue('123', '%resolved_text');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=ABC');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await textPage.provideValue('123', '%resolved_text;param=A\\;B');
          await textPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await textPage.provideValue('123', '<undefined>');
          await expect(dockedPart.bar.title).toHaveText('Label - 123 -  - :undefined');
          await expect(nonDockedPart.bar.title).toHaveText('Title - 123 -  - :undefined');
          await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip - 123 -  - :undefined');
        });
      });

      test('should support semicolon in text, parameter and resolver', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'activity'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            extras: {
              icon: 'folder',
              label: 'Part;Label - :id - :name',
              tooltip: 'Part;Tooltip - :id - :name',
            },
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-1',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'activity'})],
        });

        // Register part relative aligned to docked part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'bottom'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Part;Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee-2',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'bottom'})],
        });

        // Register main-area part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'main-area'},
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.activity',
                qualifier: {part: 'activity'},
                params: {id: '123;456'},
                position: 'left-top',
                active: true,
              },
              {
                id: 'part.bottom',
                qualifier: {part: 'bottom'},
                params: {id: '123;456'},
                position: {
                  relativeTo: 'part.activity',
                  align: 'bottom',
                },
              },
            ],
          },
        });

        // Open text view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'text'}, {cssClass: 'text'});
        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));

        const activityItem = appPO.activityItem({cssClass: 'testee-1'});
        const dockedPart = appPO.part({cssClass: 'testee-1'});
        const nonDockedPart = appPO.part({cssClass: 'testee-2'});

        await textPage.provideValue('123;456', 'A;B');

        await expect(dockedPart.bar.title).toHaveText('Part;Label - 123;456 - A;B');
        await expect(nonDockedPart.bar.title).toHaveText('Part;Title - 123;456 - A;B');
        await expect.poll(() => activityItem.getTooltip()).toEqual('Part;Tooltip - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
            cssClass: 'testee',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'right'})],
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide value.
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-host-app] Requesting value: 123',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register text view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'text'},
          properties: {
            path: '',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'text'})],
        });

        // Register left part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {component: 'text'}, cssClass: 'text'},
            ],
          },
        });

        // Register right part.
        await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
          type: 'part',
          qualifier: {part: 'right'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id/complete', // instruct provider to complete
            },
            cssClass: 'testee',
          },
        });

        // Register host part route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'right'})],
        });

        // Create perspective with a part and a docked part.
        await microfrontendNavigator.createPerspective('host', {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: 'part.left',
                qualifier: {part: 'left'},
              },
              {
                id: 'part.right',
                qualifier: {part: 'right'},
                params: {id: '123'},
                position: {
                  align: 'right',
                },
              },
            ],
          },
        });

        const textPage = new HostTextTestPagePO(appPO.view({cssClass: 'text'}));
        const testPart = appPO.part({cssClass: 'testee'});

        // Provide value.
        await textPage.provideValue('123', 'RESOLVED');

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-host-app] Requesting value: 123',
        ]);
        consoleLogs.clear();

        // Change layout by closing text view.
        await textPage.view.tab.close();

        await expect(testPart.bar.title).toHaveText('Title - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });
  });

  test.describe('Workbench View', () => {

    test.describe('Localized View', () => {

      test('should display localized title and heading', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-pages/text-test-page',
            title: '%view_title',
            heading: '%view_heading',
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text.
        await test.step('Provide text', async () => {
          await testPage.provideText('view_title', 'Title 1');
          await expect(testPage.view.tab.title).toHaveText('Title 1');

          await testPage.provideText('view_heading', 'Heading 1');
          await expect(testPage.view.tab.heading).toHaveText('Heading 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await testPage.provideText('view_title', 'Title 2');
          await expect(testPage.view.tab.title).toHaveText('Title 2');

          await testPage.provideText('view_heading', 'Heading 2');
          await expect(testPage.view.tab.heading).toHaveText('Heading 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await testPage.provideText('view_title', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('%view_title');

          await testPage.provideText('view_heading', '<undefined>');
          await expect(testPage.view.tab.heading).toHaveText('%view_heading');
        });
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: '%view_title;id=:id;name=:name;undefined=:undefined',
            heading: '%view_heading;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text.
        await testPage.provideText('view_title', 'Title - {{id}} - {{name}} - {{undefined}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}} - {{undefined}}');

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.view.tab.title).toHaveText('');
          await expect(testPage.view.tab.heading).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 -  - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 -  - :undefined');
        });
      });

      test('should support semicolon in parameter and resolver', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: '%view_title;id=:id;name=:name',
            heading: '%view_heading;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');
        await testPage.provideValue('123;456', 'A;B');

        await expect(testPage.view.tab.title).toHaveText('Title - 123;456 - A;B');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123;456 - A;B');
      });

      test('should display localized title and heading set via handle', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-pages/text-test-page',
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Set title and heading via view handle.
        await testPage.setViewTitle('%view_title');
        await testPage.setViewHeading('%view_heading');

        // Provide text.
        await test.step('Provide text', async () => {
          await testPage.provideText('view_title', 'Title 1');
          await expect(testPage.view.tab.title).toHaveText('Title 1');

          await testPage.provideText('view_heading', 'Heading 1');
          await expect(testPage.view.tab.heading).toHaveText('Heading 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await testPage.provideText('view_title', 'Title 2');
          await expect(testPage.view.tab.title).toHaveText('Title 2');

          await testPage.provideText('view_heading', 'Heading 2');
          await expect(testPage.view.tab.heading).toHaveText('Heading 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await testPage.provideText('view_title', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('%view_title');

          await testPage.provideText('view_heading', '<undefined>');
          await expect(testPage.view.tab.heading).toHaveText('%view_heading');
        });
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: '%view_title;id=:id;name=:name',
            heading: '%view_heading;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text and value.
        await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Title
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Heading
          '[TextProvider][workbench-client-testing-app1] Requesting text: %view_title;id=123;name=RESOLVED', // Title
          '[TextProvider][workbench-client-testing-app1] Requesting text: %view_heading;id=123;name=RESOLVED', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: '%view_title;id=:id;name=:name;options.complete=true', // instruct provider to complete
            heading: '%view_heading;id=:id;name=:name;options.complete=true', // instruct provider to complete
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id/complete', // instruct provider to complete
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text and value.
        await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Title
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Heading
          '[TextProvider][workbench-client-testing-app1] Requesting text: %view_title;id=123;name=RESOLVED;options.complete=true', // Title
          '[TextProvider][workbench-client-testing-app1] Requesting text: %view_heading;id=123;name=RESOLVED;options.complete=true', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });

    test.describe('Non-Localized View', () => {

      test('should display non-localized title and heading', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-view',
            title: 'View Title',
            heading: 'View Heading',
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testView = appPO.view({cssClass: 'testee'});

        // Expect view title and heading as specified.
        await expect(testView.tab.title).toHaveText('View Title');
        await expect(testView.tab.heading).toHaveText('View Heading');
      });

      test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-view',
            title: '%',
            heading: '%',
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testView = appPO.view({cssClass: 'testee'});

        // Expect view title and heading as specified.
        await expect(testView.tab.title).toHaveText('%');
        await expect(testView.tab.heading).toHaveText('%');
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: 'Title - :id - :name - :undefined',
            heading: 'Heading - :id - :name - :undefined',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.view.tab.title).toHaveText('');
          await expect(testPage.view.tab.heading).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 -  - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 -  - :undefined');
        });
      });

      test('should support semicolon in text, parameter and resolver', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: 'View;Title - :id - :name',
            heading: 'View;Heading - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        await testPage.provideValue('123;456', 'A;B');

        await expect(testPage.view.tab.title).toHaveText('View;Title - 123;456 - A;B');
        await expect(testPage.view.tab.heading).toHaveText('View;Heading - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: 'Title - :id - :name',
            heading: 'Heading - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide value.
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Title
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: 'Title - :id - :name',
            heading: 'Heading - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id/complete', // instruct provider to complete
            },
          },
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide value.
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Title
          '[TextProvider][workbench-client-testing-app1] Requesting value: 123', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });
  });

  test.describe('Workbench Host View', () => {

    test.describe('Localized View', () => {

      test('should display localized title and heading', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host view capability.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: '',
            title: '%view_title',
            heading: '%view_heading',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text.
        await test.step('Provide text', async () => {
          await testPage.provideText('view_title', 'Title 1');
          await expect(testPage.view.tab.title).toHaveText('Title 1');

          await testPage.provideText('view_heading', 'Heading 1');
          await expect(testPage.view.tab.heading).toHaveText('Heading 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await testPage.provideText('view_title', 'Title 2');
          await expect(testPage.view.tab.title).toHaveText('Title 2');

          await testPage.provideText('view_heading', 'Heading 2');
          await expect(testPage.view.tab.heading).toHaveText('Heading 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await testPage.provideText('view_title', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('%view_title');

          await testPage.provideText('view_heading', '<undefined>');
          await expect(testPage.view.tab.heading).toHaveText('%view_heading');
        });
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%view_title;id=:id;name=:name;undefined=:undefined',
            heading: '%view_heading;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text.
        await testPage.provideText('view_title', 'Title - {{id}} - {{name}} - {{undefined}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}} - {{undefined}}');

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.view.tab.title).toHaveText('');
          await expect(testPage.view.tab.heading).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 -  - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 -  - :undefined');
        });
      });

      test('should support semicolon in parameter and resolver', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%view_title;id=:id;name=:name',
            heading: '%view_heading;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');
        await testPage.provideValue('123;456', 'A;B');

        await expect(testPage.view.tab.title).toHaveText('Title - 123;456 - A;B');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%view_title;id=:id;name=:name',
            heading: '%view_heading;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text and value.
        await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-host-app] Requesting value: 123', // Title
          '[TextProvider][workbench-host-app] Requesting value: 123', // Heading
          '[TextProvider][workbench-host-app] Requesting text: %view_title;id=123;name=RESOLVED', // Title
          '[TextProvider][workbench-host-app] Requesting text: %view_heading;id=123;name=RESOLVED', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%view_title;id=:id;name=:name',
            heading: '%view_heading;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id/complete', // instruct provider to complete
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide text and value.
        await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
        await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the text and value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqualIgnoreOrder([
          '[TextProvider][workbench-host-app] Requesting value: 123', // Title
          '[TextProvider][workbench-host-app] Requesting value: 123', // Heading
          '[TextProvider][workbench-host-app] Requesting text: %view_title;id=123;name=RESOLVED', // Title
          '[TextProvider][workbench-host-app] Requesting text: %view_heading;id=123;name=RESOLVED', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });

    test.describe('Non-Localized View', () => {

      test('should display non-localized title and heading', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: '',
            title: 'View Title',
            heading: 'View Heading',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testView = appPO.view({cssClass: 'testee'});

        // Expect view title and heading as specified.
        await expect(testView.tab.title).toHaveText('View Title');
        await expect(testView.tab.heading).toHaveText('View Heading');
      });

      test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          properties: {
            path: '',
            title: '%',
            heading: '%',
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
        const testView = appPO.view({cssClass: 'testee'});

        // Expect view title and heading as specified.
        await expect(testView.tab.title).toHaveText('%');
        await expect(testView.tab.heading).toHaveText('%');
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name - :undefined',
            heading: 'Heading - :id - :name - :undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.view.tab.title).toHaveText('');
          await expect(testPage.view.tab.heading).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.view.tab.title).toHaveText('Title - 123 -  - :undefined');
          await expect(testPage.view.tab.heading).toHaveText('Heading - 123 -  - :undefined');
        });
      });

      test('should support semicolon in text, parameter and resolver', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'View;Title - :id - :name',
            heading: 'View;Heading - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        await testPage.provideValue('123;456', 'A;B');

        await expect(testPage.view.tab.title).toHaveText('View;Title - 123;456 - A;B');
        await expect(testPage.view.tab.heading).toHaveText('View;Heading - 123;456 - A;B');
      });

      test('should cache texts on re-layout', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name',
            heading: 'Heading - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide value.
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-host-app] Requesting value: 123', // Title
          '[TextProvider][workbench-host-app] Requesting value: 123', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });

      test('should cache texts on re-layout if provider completes request', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
        await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial', logLevel: 'debug'});

        // Register test view.
        await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
          type: 'view',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name',
            heading: 'Heading - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id/complete', // instruct provider to complete
            },
          },
        });

        // Register host view route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
        });

        // Open test view.
        const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
        await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.view({cssClass: 'testee'}));

        // Provide value.
        await testPage.provideValue('123', 'RESOLVED');

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
          '[TextProvider][workbench-host-app] Requesting value: 123', // Title
          '[TextProvider][workbench-host-app] Requesting value: 123', // Heading
        ]);
        consoleLogs.clear();

        // Change layout by moving router view to the left.
        const dragHandle = await routerPage.view.tab.startDrag();
        await dragHandle.dragToPart('part.initial', {region: 'west'});
        await dragHandle.drop();

        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED');

        // Expect no request to the value provider.
        await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
        consoleLogs.clear();
      });
    });
  });

  test.describe('Workbench Dialog', () => {

    test.describe('Localized Dialog', () => {

      test('should display localized title', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-pages/text-test-page',
            title: '%dialog_title',
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // Provide text.
        await test.step('Provide text', async () => {
          await testPage.provideText('dialog_title', 'Title 1');
          await expect(testPage.dialog.title).toHaveText('Title 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await testPage.provideText('dialog_title', 'Title 2');
          await expect(testPage.dialog.title).toHaveText('Title 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await testPage.provideText('dialog_title', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('%dialog_title');
        });
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: '%dialog_title;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // Provide text.
        await testPage.provideText('dialog_title', 'Title - {{id}} - {{name}} - {{undefined}}');

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.dialog.title).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('Title - 123 -  - :undefined');
        });
      });

      test('should support semicolon in parameter and resolver', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: '%dialog_title;id=:id;name=:name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        await testPage.provideText('dialog_title', 'Title - {{id}} - {{name}}');
        await testPage.provideValue('123;456', 'A;B');
        await expect(testPage.dialog.title).toHaveText('Title - 123;456 - A;B');
      });

      test('should display localized title set via handle', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-pages/text-test-page',
            size: {height: '800px', width: '800px'},
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // Set dialog title via dialog handle.
        await testPage.setDialogTitle('%dialog_title');

        // Provide text.
        await test.step('Provide text', async () => {
          await testPage.provideText('dialog_title', 'Title 1');
          await expect(testPage.dialog.title).toHaveText('Title 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await testPage.provideText('dialog_title', 'Title 2');
          await expect(testPage.dialog.title).toHaveText('Title 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await testPage.provideText('dialog_title', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('%dialog_title');
        });
      });
    });

    test.describe('Non-Localized Dialog', () => {

      test('should display non-localized title', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-dialog',
            title: 'Dialog Title',
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const dialog = appPO.dialog({cssClass: 'testee'});

        // Expect dialog title as specified.
        await expect(dialog.title).toHaveText('Dialog Title');
      });

      test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          properties: {
            path: 'test-dialog',
            title: '%',
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const dialog = appPO.dialog({cssClass: 'testee'});

        // Expect dialog title as specified.
        await expect(dialog.title).toHaveText('%');
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: 'Title - :id - :name - :undefined',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.dialog.title).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('Title - 123 -  - :undefined');
        });
      });

      test('should support semicolon in text, parameter and resolver', async ({appPO, microfrontendNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: 'test-pages/text-test-page',
            title: 'Dialog;Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-client-testing-app1/values/:id',
            },
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new TextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        await testPage.provideValue('123;456', 'A;B');

        await expect(testPage.dialog.title).toHaveText('Dialog;Title - 123;456 - A;B');
      });
    });
  });

  test.describe('Workbench Host Dialog', () => {

    test.describe('Localized Dialog', () => {

      test('should display localized title', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host dialog capability.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          private: false,
          properties: {
            path: '',
            title: '%dialog_title',
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Register intention.
        await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee'}});

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // Provide text.
        await test.step('Provide text', async () => {
          await testPage.provideText('dialog_title', 'Title 1');
          await expect(testPage.dialog.title).toHaveText('Title 1');
        });

        // Provide different text.
        await test.step('Provide different text', async () => {
          await testPage.provideText('dialog_title', 'Title 2');
          await expect(testPage.dialog.title).toHaveText('Title 2');
        });

        // Provide `undefined` as text.
        await test.step('Provide `undefined`', async () => {
          await testPage.provideText('dialog_title', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('%dialog_title');
        });
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host dialog capability.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          private: false,
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%dialog_title;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Register intention.
        await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee'}});

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // Provide text.
        await testPage.provideText('dialog_title', 'Title - {{id}} - {{name}} - {{undefined}}');

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.dialog.title).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('Title - 123 -  - :undefined');
        });
      });

      test('should support semicolon in parameter and resolver', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host dialog capability.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          private: false,
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: '%dialog_title;id=:id;name=:name;undefined=:undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Register intention.
        await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee'}});

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        await testPage.provideText('dialog_title', 'Title - {{id}} - {{name}}');
        await testPage.provideValue('123;456', 'A;B');
        await expect(testPage.dialog.title).toHaveText('Title - 123;456 - A;B');
      });
    });

    test.describe('Non-Localized Dialog', () => {

      test('should display non-localized title', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host dialog capability.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          private: false,
          properties: {
            path: '',
            title: 'Dialog Title',
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Register intention.
        await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee'}});

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const dialog = appPO.dialog({cssClass: 'testee'});

        // Expect dialog title as specified.
        await expect(dialog.title).toHaveText('Dialog Title');
      });

      test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register test dialog.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          properties: {
            path: '',
            title: '%',
            size: {
              width: '800px',
              height: '800px',
            },
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
        await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
        const dialog = appPO.dialog({cssClass: 'testee'});

        // Expect dialog title as specified.
        await expect(dialog.title).toHaveText('%');
      });

      test('should substitute parameters and resolvers', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host dialog capability.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          private: false,
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Title - :id - :name - :undefined',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Register intention.
        await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee'}});

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        // No resolved value yet.
        await test.step('No resolved value yet', async () => {
          // Wait some time.
          await page.waitForTimeout(1000);
          await expect(testPage.dialog.title).toHaveText('');
        });

        // Resolve value.
        await test.step('Resolve Value', async () => {
          await testPage.provideValue('123', 'RESOLVED 1');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 1 - :undefined');
        });

        // Resolve to a different value.
        await test.step('Resolve to a different value', async () => {
          await testPage.provideValue('123', 'RESOLVED 2');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 2 - :undefined');
        });

        // Resolve to translatable.
        await test.step('Resolve to translatable', async () => {
          await testPage.provideValue('123', '%resolved_text');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT - :undefined');
        });

        // Resolve to translatable with parameter.
        await test.step('Resolve to translatable with parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=ABC');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT ABC - :undefined');
        });

        // Resolve to translatable with escaped semicolon in parameter.
        await test.step('Resolve to translatable with semicolon in parameter', async () => {
          await testPage.provideValue('123', '%resolved_text;param=A\\;B');
          await testPage.provideText('resolved_text', 'RESOLVED TEXT {{param}}');
          await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED TEXT A;B - :undefined');
        });

        // Resolve to `undefined`.
        await test.step('Resolve to `undefined`', async () => {
          await testPage.provideValue('123', '<undefined>');
          await expect(testPage.dialog.title).toHaveText('Title - 123 -  - :undefined');
        });
      });

      test('should support semicolon in text, parameter and resolver', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: true});

        // Register host dialog capability.
        await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
          type: 'dialog',
          qualifier: {component: 'testee'},
          private: false,
          params: [
            {name: 'id', required: true},
          ],
          properties: {
            path: '',
            title: 'Dialog;Title - :id - :name',
            resolve: {
              name: 'textprovider/workbench-host-app/values/:id',
            },
          },
        });

        // Register host dialog route.
        await workbenchNavigator.registerRoute({
          path: '', component: 'text-test-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
        });

        // Register intention.
        await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee'}});

        // Open test dialog.
        const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
        await dialogOpener.open({component: 'testee'}, {params: {id: '123;456'}, cssClass: 'testee'});
        const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

        await testPage.provideValue('123;456', 'A;B');
        await expect(testPage.dialog.title).toHaveText('Dialog;Title - 123;456 - A;B');
      });
    });
  });

  test.describe('Workbench Messagebox', () => {

    test('should display non-localized messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test message box.
      await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open test message box.
      const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpener.open({component: 'testee'}, {cssClass: 'testee', title: 'Title', actions: {yes: 'Yes', no: 'No'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      // Expect message box texts as specified.
      await expect(messageBox.title).toHaveText('Title');
      await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes', no: 'No'});
    });

    test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test message box.
      await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open test message box.
      const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpener.open({component: 'testee'}, {cssClass: 'testee', title: '%', actions: {yes: '%', no: '%'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      // Expect message box texts as specified.
      await expect(messageBox.title).toHaveText('%');
      await expect.poll(() => messageBox.getActions()).toEqual({yes: '%', no: '%'});
    });

    test('should display localized messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register message box in app 2.
      await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('app2', {
        type: 'messagebox',
        qualifier: {component: 'testee', app: 'app2'},
        private: false,
        properties: {
          path: 'test-message-box',
        },
      });

      // Register text view in app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'text', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register intention to open message box from app 1.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee', app: 'app2'},
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'text', app: 'app1'}, cssClass: 'text-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'messagebox', app: 'app1'}, cssClass: 'messagebox-opener-app1'},
          ],
        },
      });

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      const textPageApp1 = new TextTestPagePO(appPO.view({cssClass: 'text-app1'}));
      const messageBoxOpenerApp1 = new MessageBoxOpenerPagePO(appPO.view({cssClass: 'messagebox-opener-app1'}));

      // Open test message box from app 1.
      await messageBoxOpenerApp1.open({component: 'testee', app: 'app2'}, {cssClass: 'testee', title: '%message.title', actions: {yes: '%yes.action', no: '%no.action'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      // Provide text.
      await test.step('Provide text', async () => {
        await textPageApp1.provideText('message.title', 'Title 1');
        await textPageApp1.provideText('yes.action', 'Yes 1');
        await textPageApp1.provideText('no.action', 'No 1');
        await expect(messageBox.title).toHaveText('Title 1');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes 1', no: 'No 1'});
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await textPageApp1.provideText('message.title', 'Title 2');
        await textPageApp1.provideText('yes.action', 'Yes 2');
        await textPageApp1.provideText('no.action', 'No 2');
        await expect(messageBox.title).toHaveText('Title 2');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes 2', no: 'No 2'});
      });

      // Provide `undefined` as text.
      await test.step('Provide `undefined`', async () => {
        await textPageApp1.provideText('message.title', '<undefined>');
        await textPageApp1.provideText('yes.action', '<undefined>');
        await textPageApp1.provideText('no.action', '<undefined>');
        await expect(messageBox.title).toHaveText('%message.title');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: '%yes.action', no: '%no.action'});
      });
    });
  });

  test.describe('Workbench Host Messagebox', () => {

    test('should display non-localized messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

      // Open test message box.
      const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpener.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee', title: 'Title', actions: {yes: 'Yes', no: 'No'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      // Expect message box texts as specified.
      await expect(messageBox.title).toHaveText('Title');
      await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes', no: 'No'});
    });

    test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

      // Open test message box.
      const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpener.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee', title: '%', actions: {yes: '%', no: '%'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      // Expect message box texts as specified.
      await expect(messageBox.title).toHaveText('%');
      await expect.poll(() => messageBox.getActions()).toEqual({yes: '%', no: '%'});
    });

    test('should display localized messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

      // Register text view in app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'text', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'text', app: 'app1'}, cssClass: 'text-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'messagebox', app: 'app1'}, cssClass: 'messagebox-opener-app1'},
          ],
        },
      });

      // Create perspective with text view and messagebox opener.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      const textPageApp1 = new TextTestPagePO(appPO.view({cssClass: 'text-app1'}));
      const messageBoxOpenerApp1 = new MessageBoxOpenerPagePO(appPO.view({cssClass: 'messagebox-opener-app1'}));

      // Open test message box.
      await messageBoxOpenerApp1.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee', title: '%message.title', actions: {yes: '%yes.action', no: '%no.action'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      // Provide text.
      await test.step('Provide text', async () => {
        await textPageApp1.provideText('message.title', 'Title 1');
        await textPageApp1.provideText('yes.action', 'Yes 1');
        await textPageApp1.provideText('no.action', 'No 1');
        await expect(messageBox.title).toHaveText('Title 1');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes 1', no: 'No 1'});
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await textPageApp1.provideText('message.title', 'Title 2');
        await textPageApp1.provideText('yes.action', 'Yes 2');
        await textPageApp1.provideText('no.action', 'No 2');
        await expect(messageBox.title).toHaveText('Title 2');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes 2', no: 'No 2'});
      });

      // Provide `undefined` as text.
      await test.step('Provide `undefined`', async () => {
        await textPageApp1.provideText('message.title', '<undefined>');
        await textPageApp1.provideText('yes.action', '<undefined>');
        await textPageApp1.provideText('no.action', '<undefined>');
        await expect(messageBox.title).toHaveText('%message.title');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: '%yes.action', no: '%no.action'});
      });
    });
  });

  test.describe('Workbench Host Messagebox (built-in text message)', () => {

    test('should display non-localized messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open test message box.
      const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpener.open('Message', {cssClass: 'testee', title: 'Title', actions: {yes: 'Yes', no: 'No'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessageBoxPage = new TextMessageBoxPagePO(messageBox);

      // Expect message box texts as specified.
      await expect(messageBox.title).toHaveText('Title');
      await expect(textMessageBoxPage.text).toHaveText('Message');
      await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes', no: 'No'});
    });

    test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open test message box.
      const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpener.open('%', {cssClass: 'testee', title: '%', actions: {yes: '%', no: '%'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessageBoxPage = new TextMessageBoxPagePO(messageBox);

      // Expect message box texts as specified.
      await expect(messageBox.title).toHaveText('%');
      await expect(textMessageBoxPage.text).toHaveText('%');
      await expect.poll(() => messageBox.getActions()).toEqual({yes: '%', no: '%'});
    });

    test('should display localized messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Register text view in app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'text', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'text', app: 'app1'}, cssClass: 'text-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'messagebox', app: 'app1'}, cssClass: 'messagebox-opener-app1'},
          ],
        },
      });

      // Create perspective with text view and messagebox opener.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      const textPageApp1 = new TextTestPagePO(appPO.view({cssClass: 'text-app1'}));
      const messageBoxOpenerApp1 = new MessageBoxOpenerPagePO(appPO.view({cssClass: 'messagebox-opener-app1'}));

      // Open test message box.
      await messageBoxOpenerApp1.open('%message.message', {cssClass: 'testee', title: '%message.title', actions: {yes: '%yes.action', no: '%no.action'}});
      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessageBoxPage = new TextMessageBoxPagePO(messageBox);

      // Provide text.
      await test.step('Provide text', async () => {
        await textPageApp1.provideText('message.message', 'Message 1');
        await textPageApp1.provideText('message.title', 'Title 1');
        await textPageApp1.provideText('yes.action', 'Yes 1');
        await textPageApp1.provideText('no.action', 'No 1');
        await expect(messageBox.title).toHaveText('Title 1');
        await expect(textMessageBoxPage.text).toHaveText('Message 1');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes 1', no: 'No 1'});
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await textPageApp1.provideText('message.message', 'Message 2');
        await textPageApp1.provideText('message.title', 'Title 2');
        await textPageApp1.provideText('yes.action', 'Yes 2');
        await textPageApp1.provideText('no.action', 'No 2');
        await expect(messageBox.title).toHaveText('Title 2');
        await expect(textMessageBoxPage.text).toHaveText('Message 2');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: 'Yes 2', no: 'No 2'});
      });

      // Provide `undefined` as text.
      await test.step('Provide `undefined`', async () => {
        await textPageApp1.provideText('message.message', '<undefined>');
        await textPageApp1.provideText('message.title', '<undefined>');
        await textPageApp1.provideText('yes.action', '<undefined>');
        await textPageApp1.provideText('no.action', '<undefined>');
        await expect(messageBox.title).toHaveText('%message.title');
        await expect(textMessageBoxPage.text).toHaveText('%message.message');
        await expect.poll(() => messageBox.getActions()).toEqual({yes: '%yes.action', no: '%no.action'});
      });
    });
  });

  test.describe('Workbench Host Notification (built-in text notification)', () => {

    test('should display non-localized notification', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

      // Open test notification.
      const notificationOpener = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpener.show('Notification', {title: 'Title', cssClass: 'testee'});
      const notification = appPO.notification({cssClass: 'testee'});
      const textNotificationBoxPage = new TextNotificationPagePO(notification);

      // Expect notification texts as specified.
      await expect(notification.title).toHaveText('Title');
      await expect(textNotificationBoxPage.text).toHaveText('Notification');
    });

    test('should return text as is if \'%\'', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

      // Open test notification.
      const notificationOpener = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpener.show('%', {title: '%', cssClass: 'testee'});
      const notification = appPO.notification({cssClass: 'testee'});
      const textNotificationBoxPage = new TextNotificationPagePO(notification);

      // Expect notification texts as specified.
      await expect(notification.title).toHaveText('%');
      await expect(textNotificationBoxPage.text).toHaveText('%');
    });

    test('should display localized notification', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'notification'});

      // Register text view in app 1.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'text', app: 'app1'},
        properties: {
          path: 'test-pages/text-test-page',
        },
      });

      // Register left part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'left'},
        properties: {
          views: [
            {qualifier: {component: 'text', app: 'app1'}, cssClass: 'text-app1'},
          ],
        },
      });

      // Register right part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          views: [
            {qualifier: {component: 'notification', app: 'app1'}, cssClass: 'notification-opener-app1'},
          ],
        },
      });

      // Create perspective with text view and notification opener.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.left',
              qualifier: {part: 'left'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      const textPageApp1 = new TextTestPagePO(appPO.view({cssClass: 'text-app1'}));
      const notificationOpenerApp1 = new NotificationOpenerPagePO(appPO.view({cssClass: 'notification-opener-app1'}));

      // Open test notification.
      await notificationOpenerApp1.show('%notification.message', {title: '%notification.title', cssClass: 'testee'});
      const notification = appPO.notification({cssClass: 'testee'});
      const textNotificationPage = new TextNotificationPagePO(notification);

      // Provide text.
      await test.step('Provide text', async () => {
        await textPageApp1.provideText('notification.title', 'Title 1');
        await textPageApp1.provideText('notification.message', 'Notification 1');
        await expect(notification.title).toHaveText('Title 1');
        await expect(textNotificationPage.text).toHaveText('Notification 1');
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await textPageApp1.provideText('notification.title', 'Title 2');
        await textPageApp1.provideText('notification.message', 'Notification 2');
        await expect(notification.title).toHaveText('Title 2');
        await expect(textNotificationPage.text).toHaveText('Notification 2');
      });

      // Provide `undefined` as text.
      await test.step('Provide `undefined`', async () => {
        await textPageApp1.provideText('notification.title', '<undefined>');
        await textPageApp1.provideText('notification.message', '<undefined>');
        await expect(notification.title).toHaveText('%notification.title');
        await expect(textNotificationPage.text).toHaveText('%notification.message');
      });
    });
  });
});
