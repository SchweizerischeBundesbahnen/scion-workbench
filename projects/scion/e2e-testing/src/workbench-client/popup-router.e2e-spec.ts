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
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
  });

  test('should navigate to own private popups', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
  });

  test('should not navigate to private popups of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as private popup in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // register popup intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await expect(popupOpenerPagePO.clickOpen()).rejects.toThrow(/NullProviderError/);

    // expect popup not to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
  });

  test('should navigate to public popups of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // register popup intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
  });

  test('should not navigate to public popups of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await expect(popupOpenerPagePO.clickOpen()).rejects.toThrow(/NotQualifiedError/);

    // expect popup not to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
  });

  test('should allow opening multiple popups simultaneously in different views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'popup',
        cssClass: 'testee-1',
      },
    });
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'popup',
        cssClass: 'testee-2',
      },
    });
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee-3'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee-3',
      },
    });

    // open the first popup for app-1
    const popupOpenerApp1aPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerApp1aPagePO.enterQualifier({component: 'testee-1'});
    await popupOpenerApp1aPagePO.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp1aPagePO.clickOpen();

    // expect popup to display
    const popupPageApp1aPO = new PopupPagePO(appPO, 'testee-1');
    await expect(await popupPageApp1aPO.popupPO.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp1aPO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');

    // open the second popup for app-1
    const popupOpenerApp1bPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerApp1bPagePO.enterQualifier({component: 'testee-2'});
    await popupOpenerApp1bPagePO.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp1bPagePO.clickOpen();

    // expect popup to display
    const popupPageApp1bPO = new PopupPagePO(appPO, 'testee-2');
    await expect(await popupPageApp1bPO.popupPO.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp1bPO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');

    // open the popup for app-2
    const popupOpenerApp2PagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app2');
    await popupOpenerApp2PagePO.enterQualifier({component: 'testee-3'});
    await popupOpenerApp2PagePO.enterCloseStrategy({closeOnFocusLost: false, closeOnEscape: false});
    await popupOpenerApp2PagePO.clickOpen();

    // expect popup to display
    const popupPageApp2PO = new PopupPagePO(appPO, 'testee-3');
    await expect(await popupPageApp2PO.popupPO.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPageApp2PO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app2');
  });

  test('should throw when the requested popup has no microfrontend path declared', async ({page, appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const popupPagePO = new PopupPagePO(appPO, 'testee');

    // register testee popups
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'undefined'},
      properties: {
        path: '<undefined>',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'null'},
      properties: {
        path: '<null>',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '<empty>',
        cssClass: 'testee',
      },
    });

    // open the popup with `undefined` as path
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee', path: 'undefined'});
    await expect(popupOpenerPagePO.clickOpen()).rejects.toThrow(/PopupProviderError/);

    // expect popup not to display
    await expect(await popupPagePO.popupPO.isPresent()).toBe(false);

    // open the popup with `null` as path
    await popupOpenerPagePO.enterQualifier({component: 'testee', path: 'null'});
    await expect(popupOpenerPagePO.clickOpen()).rejects.toThrow(/PopupProviderError/);

    // expect popup not to display
    await expect(await popupPagePO.popupPO.isPresent()).toBe(false);

    // open the popup with `empty` as path
    await popupOpenerPagePO.enterQualifier({component: 'testee', path: 'empty'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    await expect(await popupPagePO.popupPO.isPresent()).toBe(true);

    await expect(page.locator('app-root')).toBeVisible();
  });

  test('should not throw if another app provides an equivalent but private popup capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerIntentionPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2PO.registerIntention({
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPagePO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');
  });

  test('should not throw if another app provides an equivalent public popup capability if not declared an intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

    // expect the popup of this app to display
    await expect((await popupPagePO.getPopupCapability()).metadata.appSymbolicName).toEqual('workbench-client-testing-app1');
  });

  test('should log warning if another app provides an equivalent public popup capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    const registerIntentionPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2PO.registerIntention({
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect first popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isPresent()).toBe(true);

    // expect warning to be logged for the second popup
    await expect(consoleLogs.get({severity: 'warning', filter: /Ignoring popup intent/})).not.toEqual([]);
  });

  test('should log warning if multiple popup providers match the qualifier', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popups
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();

    // expect first popup to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.popupPO.isPresent()).toBe(true);

    // expect warning to be logged for the second popup
    await expect(consoleLogs.get({severity: 'warning', filter: /Ignoring popup intent/})).not.toEqual([]);
  });

  test('should allow closing and re-opening a popup', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'popup',
        cssClass: 'testee',
      },
    });

    // open the popup for the first time
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.clickOpen();
    const popupPagePO = new PopupPagePO(appPO, 'testee');

    // expect popup to display
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

    // close the popup
    await popupPagePO.clickClose();
    await expect(await popupPagePO.popupPO.isVisible()).toBe(false);

    // open the popup for the second time
    await popupOpenerPagePO.clickOpen();
    await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
  });
});
