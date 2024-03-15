/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {expect} from '@playwright/test';
import {MessagingPagePO} from '../page-object/messaging-page.po';
import {MessageBoxOpenerPagePO} from '../page-object/message-box-opener-page.po';
import {MessageBoxPagePO} from '../page-object/message-box-page.po';

test.describe('Workbench Message Box Splash', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register message box capability that shows splash.
    const messageBoxCapability = await microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
        size: {height: '250px', width: '250px'}, // provide initial size, otherwise playwright won't consider the splash as visible
      },
    });

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new MessageBoxPagePO(messageBox);

    // Expect splash to display.
    await expect(messageBoxPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage(`signal-ready/${messageBoxCapability.metadata!.id}`);
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(messageBoxPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
        size: {height: '250px', width: '250px'}, // provide initial size, otherwise playwright won't consider the splash as visible
      },
    });

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new MessageBoxPagePO(messageBox);

    // Expect splash not to display.
    await expect(messageBoxPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        size: {height: '250px', width: '250px'}, // provide initial size, otherwise playwright won't consider the splash as visible
      },
    });

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new MessageBoxPagePO(messageBox);

    // Expect splash not to display.
    await expect(messageBoxPage.outlet.splash).not.toBeVisible();
  });
});
