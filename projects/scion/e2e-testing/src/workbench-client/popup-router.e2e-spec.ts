/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {PopupPagePO} from './page-object/popup-page.po';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Popup Router', () => {

  test('should navigate to own public popups', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isVisible()).toBe(true);
  });

  test('should navigate to own private popups', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isVisible()).toBe(true);
  });

  test('should not navigate to private popups of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as private popup in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });

    // register popup intention in app 1
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await expect(popupOpenerPage.clickOpen()).rejects.toThrow(/NullProviderError/);

    // expect popup not to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isPresent()).toBe(false);
  });

  test('should navigate to public popups of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // register popup intention in app 1
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isVisible()).toBe(true);
  });

  test('should not navigate to public popups of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await expect(popupOpenerPage.clickOpen()).rejects.toThrow(/NotQualifiedError/);

    // expect popup not to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isPresent()).toBe(false);
  });

  test('should allow opening multiple popups simultaneously in different views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-popup',
      },
    });
    await registerCapabilityPage1.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-popup',
      },
    });
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-3'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the first popup for app-1
    const popupOpenerApp1aPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerApp1aPage.enterQualifier({component: 'testee-1'});
    await popupOpenerApp1aPage.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp1aPage.enterCssClass('testee-1');
    await popupOpenerApp1aPage.clickOpen();

    // expect popup to display
    const popupPageApp1a = new PopupPagePO(appPO, {cssClass: 'testee-1'});
    await expect(await popupPageApp1a.popup.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp1a.getPopupCapability()).metadata!.appSymbolicName).toEqual('workbench-client-testing-app1');

    // open the second popup for app-1
    const popupOpenerApp1bPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerApp1bPage.enterQualifier({component: 'testee-2'});
    await popupOpenerApp1bPage.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp1bPage.enterCssClass('testee-2');
    await popupOpenerApp1bPage.clickOpen();

    // expect popup to display
    const popupPageApp1b = new PopupPagePO(appPO, {cssClass: 'testee-2'});
    await expect(await popupPageApp1b.popup.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp1b.getPopupCapability()).metadata!.appSymbolicName).toEqual('workbench-client-testing-app1');

    // open the popup for app-2
    const popupOpenerApp2Page = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app2');
    await popupOpenerApp2Page.enterQualifier({component: 'testee-3'});
    await popupOpenerApp2Page.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp2Page.enterCssClass('testee-3');
    await popupOpenerApp2Page.clickOpen();

    // expect popup to display
    const popupPageApp2 = new PopupPagePO(appPO, {cssClass: 'testee-3'});
    await expect(await popupPageApp2.popup.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp2.getPopupCapability()).metadata!.appSymbolicName).toEqual('workbench-client-testing-app2');
  });

  test('should open popup with empty microfrontend path', async ({page, appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

    // register testee popups
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '<empty>',
      },
    });

    // open the popup with `empty` as path
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee', path: 'empty'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect popup to display
    await expect(await popupPage.popup.isPresent()).toBe(true);

    await expect(page.locator('app-root')).toBeVisible();
  });

  test('should not throw if another app provides an equivalent but private popup capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });
    const registerIntentionPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2.registerIntention({
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPage.getPopupCapability()).metadata!.appSymbolicName).toEqual('workbench-client-testing-app1');
  });

  test('should not throw if another app provides an equivalent public popup capability if not declared an intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPage.getPopupCapability()).metadata!.appSymbolicName).toEqual('workbench-client-testing-app1');
  });

  test('should log warning if another app provides an equivalent public popup capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });
    const registerIntentionPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2.registerIntention({
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect first popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isPresent()).toBe(true);

    // expect warning to be logged for the second popup
    await expect(await consoleLogs.get({severity: 'warning', filter: /Ignoring popup intent/})).not.toEqual([]);
  });

  test('should log warning if multiple popup providers match the qualifier', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // expect first popup to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.isPresent()).toBe(true);

    // expect warning to be logged for the second popup
    await expect(await consoleLogs.get({severity: 'warning', filter: /Ignoring popup intent/})).not.toEqual([]);
  });

  test('should allow closing and re-opening a popup', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup for the first time
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

    // expect popup to display
    await expect(await popupPage.popup.isVisible()).toBe(true);

    // close the popup
    await popupPage.clickClose();
    await expect(await popupPage.popup.isVisible()).toBe(false);

    // open the popup for the second time
    await popupOpenerPage.clickOpen();
    await expect(await popupPage.popup.isVisible()).toBe(true);
  });
});
