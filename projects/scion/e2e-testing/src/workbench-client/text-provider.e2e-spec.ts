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
import {WorkbenchDialogCapability, WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {TextTestPagePO} from './page-object/test-pages/text-test-page.po';
import {TextTestPagePO as HostTextTestPagePO} from '../workbench/page-object/test-pages/text-test-page.po';

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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('key', 'TEXT 1');

      // Observe text.
      await testPage.text1.observe('%key', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT 1');

      // Change text.
      await testPage.provideText('key', 'TEXT 2');
      await expect(testPage.text1.text).toHaveText('TEXT 2');
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('key', 'TEXT');

      // Observe text.
      await testPage.text1.observe('key', {app: 'workbench-client-testing-app1'});
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide `undefined` for requested text.
      await testPage.provideText('key', '<undefined>');

      // Expect key to be returned.
      await testPage.text1.observe('%key', {app: 'workbench-client-testing-app1'});
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Observe text.
      await testPage.text1.observe('%key', {app: 'workbench-client-testing-app2'});

      // Expect key to be returned.
      await expect(testPage.text1.text).toHaveText('key');

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /NotQualifiedError/})).toHaveLength(1);
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

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          layout: [
            {
              id: 'part.left',
              views: [
                {qualifier: {component: 'testee', app: 'app1'}, cssClass: 'testee-app1'},
              ],
            },
            {
              id: 'part.right',
              align: 'right',
              views: [
                {qualifier: {component: 'testee', app: 'app2'}, cssClass: 'testee-app2'},
              ],
            },
          ],
        },
      });

      const textProviderApp1Page = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee-app1'});
      const textProviderApp2Page = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee-app2'});

      // Provide text in app 2.
      await textProviderApp2Page.provideText('key', 'TEXT 1');

      // Register intention in app 1 to get texts from app 2.
      await microfrontendNavigator.registerIntention('app1', {
        type: 'text-provider',
        qualifier: {provider: 'workbench-client-testing-app2'},
      });

      // Observe text of app 2 from app 1.
      await textProviderApp1Page.text1.observe('%key', {app: 'workbench-client-testing-app2'});
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('key', 'TEXT');

      // Unregister text provider.
      await testPage.unregisterTextProvider();

      // Observe text.
      await testPage.text1.observe('%key', {app: 'workbench-client-testing-app1'});

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

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          layout: [
            {
              id: 'part.left',
              views: [
                {qualifier: {component: 'testee', app: 'app1'}, cssClass: 'testee-app1'},
              ],
            },
            {
              id: 'part.right',
              align: 'right',
              views: [
                {qualifier: {component: 'testee', app: 'app2'}, cssClass: 'testee-app2'},
              ],
            },
          ],
        },
      });

      // Provide text.
      const textProviderApp1Page = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee-app1'});
      await textProviderApp1Page.provideText('key', 'TEXT (app1)');

      const textProviderApp2Page = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee-app2'});
      await textProviderApp2Page.provideText('key', 'TEXT (app2)');

      // Observe text.
      await textProviderApp1Page.text1.observe('%key', {app: 'workbench-client-testing-app1'});
      await expect(textProviderApp1Page.text1.text).toHaveText('TEXT (app1)');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await textProviderApp1Page.text2.observe('%key', {app: 'workbench-client-testing-app1'});
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
      await textProviderApp1Page.text3.observe('%key', {app: 'workbench-client-testing-app2'});
      await expect(textProviderApp1Page.text3.text).toHaveText('TEXT (app2)');

      // Expect request to the text provider of app 2.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app2] Requesting text: %key',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await textProviderApp1Page.text4.observe('%key', {app: 'workbench-client-testing-app2'});
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('key', 'TEXT - {{param}}');

      // Observe text.
      await testPage.text1.observe('%key;param=value1', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT - value1');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key;param=value1',
      ]);
      consoleLogs.clear();

      // Observe text again.
      await testPage.text2.observe('%key;param=value1', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text2.text).toHaveText('TEXT - value1');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);
      consoleLogs.clear();

      // Observe text with different param.
      await testPage.text3.observe('%key;param=value2', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text3.text).toHaveText('TEXT - value2');

      // Expect request to text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key;param=value2',
      ]);
    });

    test('should stop observing text when canceling last subscription', async ({appPO, microfrontendNavigator, consoleLogs}) => {
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('key', 'TEXT 1');

      // Observe text (first subscription).
      await testPage.text1.observe('%key', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text1.text).toHaveText('TEXT 1');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
      ]);
      consoleLogs.clear();

      // Observe text again (second subscription).
      await testPage.text2.observe('%key', {app: 'workbench-client-testing-app1'});
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
      await testPage.text3.observe('%key', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text3.text).toHaveText('TEXT 2');

      // Expect no request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([]);

      // Cancel second text subscription
      await testPage.text2.cancel();

      // Cancel third text subscription
      await testPage.text3.cancel();

      // Observe text again (fourth subscription).
      await testPage.text4.observe('%key', {app: 'workbench-client-testing-app1'});
      await expect(testPage.text4.text).toHaveText('TEXT 2');

      // Expect request to the text provider.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /TextProvider/})).toEqual([
        '[TextProvider][workbench-client-testing-app1] Requesting text: %key',
      ]);
    });

    test('should time out if text is not provided', async ({appPO, microfrontendNavigator, consoleLogs}) => {
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Observe text.
      await testPage.text1.observe('%key', {app: 'workbench-client-testing-app1', timeout: 1000});
      await expect(testPage.text1.text).toHaveText('key');

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /NullTextError/})).toEqual([
        expect.stringContaining('[NullTextError][workbench-client-testing-app1] Failed to get text \'%%key\' from application \'workbench-client-testing-app1\''),
      ]);
    });
  });

  test.describe('Workbench View', () => {

    test('should display non-localized title/heading', async ({appPO, microfrontendNavigator}) => {
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

    test('should display localized title/heading', async ({appPO, microfrontendNavigator}) => {
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

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
        await expect(testPage.view.tab.title).toHaveText('view_title');

        await testPage.provideText('view_heading', '<undefined>');
        await expect(testPage.view.tab.heading).toHaveText('view_heading');
      });
    });

    test('should display localized title/heading with named parameters replaced by view params', async ({appPO, microfrontendNavigator}) => {
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
          title: '%view_title;id=:id',
          heading: '%view_heading;id=:id',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await test.step('Provide text', async () => {
        await testPage.provideText('view_title', 'Title 1 - {{id}}');
        await expect(testPage.view.tab.title).toHaveText('Title 1 - 123');

        await testPage.provideText('view_heading', 'Heading 1 - {{id}}');
        await expect(testPage.view.tab.heading).toHaveText('Heading 1 - 123');
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await testPage.provideText('view_title', 'Title 2 - {{id}}');
        await expect(testPage.view.tab.title).toHaveText('Title 2 - 123');

        await testPage.provideText('view_heading', 'Heading 2 - {{id}}');
        await expect(testPage.view.tab.heading).toHaveText('Heading 2 - 123');
      });
    });

    test('should display localized title/heading with named parameters replaced by resolved values', async ({appPO, microfrontendNavigator, page}) => {
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
      await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('view_title', 'Title - {{id}} - {{name}}');
      await testPage.provideText('view_heading', 'Heading - {{id}} - {{name}}');

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
        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 1');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 1');
      });

      // Resolve to a different value.
      await test.step('Resolve to a different value', async () => {
        await testPage.provideValue('123', 'RESOLVED 2');
        await expect(testPage.view.tab.title).toHaveText('Title - 123 - RESOLVED 2');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 - RESOLVED 2');
      });

      // Resolve to `undefined`.
      await test.step('Resolve to `undefined`', async () => {
        await testPage.provideValue('123', '<undefined>');
        await expect(testPage.view.tab.title).toHaveText('Title - 123 -');
        await expect(testPage.view.tab.heading).toHaveText('Heading - 123 -');
      });
    });

    test('should not replace unkown named parameter', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
          title: '%view_title;id=:id',
          heading: '%view_heading;id=:id',
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

      await testPage.provideText('view_title', 'Title - {{id}}');
      await expect(testPage.view.tab.title).toHaveText('Title - :id');
      await testPage.provideText('view_heading', 'Heading - {{id}}');
      await expect(testPage.view.tab.heading).toHaveText('Heading - :id');
    });

    test('should set localized title/heading via handle', async ({appPO, microfrontendNavigator}) => {
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
      const testPage = TextTestPagePO.newViewPO(appPO, {cssClass: 'testee'});

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
        await expect(testPage.view.tab.title).toHaveText('view_title');

        await testPage.provideText('view_heading', '<undefined>');
        await expect(testPage.view.tab.heading).toHaveText('view_heading');
      });
    });
  });

  test.describe('Workbench Dialog', () => {

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
      const testPage = TextTestPagePO.newDialogPO(appPO, {cssClass: 'testee'});

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
        await expect(testPage.dialog.title).toHaveText('dialog_title');
      });
    });

    test('should display localized title with named parameters replaced by dialog params', async ({appPO, microfrontendNavigator}) => {
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
          title: '%dialog_title;id=:id',
          size: {
            width: '800px',
            height: '800px',
          },
        },
      });

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
      const testPage = TextTestPagePO.newDialogPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await test.step('Provide text', async () => {
        await testPage.provideText('dialog_title', 'Title 1 - {{id}}');
        await expect(testPage.dialog.title).toHaveText('Title 1 - 123');
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await testPage.provideText('dialog_title', 'Title 2 - {{id}}');
        await expect(testPage.dialog.title).toHaveText('Title 2 - 123');
      });
    });

    test('should display localized title with named parameters replaced by resolved values', async ({appPO, microfrontendNavigator, page}) => {
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
      await dialogOpener.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});
      const testPage = TextTestPagePO.newDialogPO(appPO, {cssClass: 'testee'});

      // Provide text.
      await testPage.provideText('dialog_title', 'Title - {{id}} - {{name}}');

      // No resolved value yet.
      await test.step('No resolved value yet', async () => {
        // Wait some time.
        await page.waitForTimeout(1000);
        await expect(testPage.dialog.title).toHaveText('');
      });

      // Resolve value.
      await test.step('Resolve Value', async () => {
        await testPage.provideValue('123', 'RESOLVED 1');
        await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 1');
      });

      // Resolve to a different value.
      await test.step('Resolve to a different value', async () => {
        await testPage.provideValue('123', 'RESOLVED 2');
        await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 2');
      });

      // Resolve to `undefined`.
      await test.step('Resolve to `undefined`', async () => {
        await testPage.provideValue('123', '<undefined>');
        await expect(testPage.dialog.title).toHaveText('Title - 123 -');
      });
    });

    test('should not replace unkown named parameter', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test dialog.
      await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/text-test-page',
          title: '%dialog_title;id=:id',
          size: {
            width: '800px',
            height: '800px',
          },
        },
      });

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
      const testPage = TextTestPagePO.newDialogPO(appPO, {cssClass: 'testee'});

      await testPage.provideText('dialog_title', 'Title - {{id}}');
      await expect(testPage.dialog.title).toHaveText('Title - :id');
    });

    test('should set localized title via handle', async ({appPO, microfrontendNavigator}) => {
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
      const testPage = TextTestPagePO.newDialogPO(appPO, {cssClass: 'testee'});

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
        await expect(testPage.dialog.title).toHaveText('dialog_title');
      });
    });
  });

  test.describe('Workbench Host Dialog', () => {

    test('should display non-localized title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register host dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'text-page'}});

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'text-page'}, {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect dialog title as specified.
      await expect(dialog.title).toHaveText('Dialog Title');
    });

    test('should display localized title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register host dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'text-page::translatable-title'}});

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'text-page::translatable-title'}, {cssClass: 'testee'});
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
        await expect(testPage.dialog.title).toHaveText('dialog_title');
      });
    });

    test('should display localized title with named parameters replaced by dialog params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register host dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'text-page::translatable-parameterized-title'}});

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'text-page::translatable-parameterized-title'}, {params: {id: '123'}, cssClass: 'testee'});
      const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Provide text.
      await test.step('Provide text', async () => {
        await testPage.provideText('dialog_title', 'Title 1 - {{id}}');
        await expect(testPage.dialog.title).toHaveText('Title 1 - 123');
      });

      // Provide different text.
      await test.step('Provide different text', async () => {
        await testPage.provideText('dialog_title', 'Title 2 - {{id}}');
        await expect(testPage.dialog.title).toHaveText('Title 2 - 123');
      });
    });

    test('should display localized title with named parameters replaced by resolved values', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register host dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'text-page::translatable-resolved-title'}});

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'text-page::translatable-resolved-title'}, {params: {id: '123'}, cssClass: 'testee'});
      const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Provide text.
      await testPage.provideText('dialog_title', 'Title - {{id}} - {{name}}');

      // No resolved value yet.
      await test.step('No resolved value yet', async () => {
        // Wait some time.
        await page.waitForTimeout(1000);
        await expect(testPage.dialog.title).toHaveText('');
      });

      // Resolve value.
      await test.step('Resolve Value', async () => {
        await testPage.provideValue('123', 'RESOLVED 1');
        await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 1');
      });

      // Resolve to a different value.
      await test.step('Resolve to a different value', async () => {
        await testPage.provideValue('123', 'RESOLVED 2');
        await expect(testPage.dialog.title).toHaveText('Title - 123 - RESOLVED 2');
      });

      // Resolve to `undefined`.
      await test.step('Resolve to `undefined`', async () => {
        await testPage.provideValue('123', '<undefined>');
        await expect(testPage.dialog.title).toHaveText('Title - 123 -');
      });
    });

    test('should not replace unkown named parameter', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register host dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'text-page::translatable-parameterized-title::unkown-param'}});

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'text-page::translatable-parameterized-title::unkown-param'}, {cssClass: 'testee'});
      const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

      await testPage.provideText('dialog_title', 'Title - {{id}}');
      await expect(testPage.dialog.title).toHaveText('Title - :id');
    });

    test('should set localized title/heading via handle', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register host dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'text-page'}});

      // Open test dialog.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'text-page'}, {cssClass: 'testee'});
      const testPage = new HostTextTestPagePO(appPO.dialog({cssClass: 'testee'}));

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
        await expect(testPage.dialog.title).toHaveText('dialog_title');
      });
    });
  });
});
