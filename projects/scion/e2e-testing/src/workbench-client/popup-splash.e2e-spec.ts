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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {MessagingPagePO} from './page-object/messaging-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';

test.describe('Workbench Popup', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability that shows splash.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const popupCapability = await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
        cssClass: 'testee',
      },
    });

    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, {cssClass: 'testee'});

    // Expect splash to display.
    await expect(popupPagePO.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messageClientPagePO = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messageClientPagePO.publishMessage(`signal-ready/${popupCapability.metadata!.id}`);
    await messageClientPagePO.viewTab.close();

    // Expect splash not to display.
    await expect(popupPagePO.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability that does not show splash.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
        cssClass: 'testee',
      },
    });

    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, {cssClass: 'testee'});

    // Expect splash not to display.
    await expect(popupPagePO.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register popup capability that does not show splash.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        cssClass: 'testee',
      },
    });

    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, {cssClass: 'testee'});

    // Expect splash not to display.
    await expect(popupPagePO.outlet.splash).not.toBeVisible();
  });
});
