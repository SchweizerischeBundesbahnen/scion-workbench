/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {MessagingPagePO} from './page-object/messaging-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';

test.describe('Workbench Popup', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability that shows splash.
    const popupCapability = await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
      },
    });

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect splash to display.
    await expect(popupPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage(`signal-ready/${popupCapability.metadata!.id}`);
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(popupPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
      },
    });

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect splash not to display.
    await expect(popupPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
      },
    });

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect splash not to display.
    await expect(popupPage.outlet.splash).not.toBeVisible();
  });
});
