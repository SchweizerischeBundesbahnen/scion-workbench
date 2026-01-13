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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {MicrofrontendPopupTestPagePO} from './page-object/test-pages/microfrontend-popup-test-page.po';

test.describe('Popup Router', () => {

  test('should navigate to own public popups', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect popup to display
    await expectPopup(popupPage).toBeVisible();
  });

  test('should navigate to own private popups', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect popup to display
    await expectPopup(popupPage).toBeVisible();
  });

  test('should not navigate to private popups of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as private popup in app 2
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });

    // register popup intention in app 1
    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    const open = popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });
    await expect(open).rejects.toThrow(/NullProviderError/);

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect popup not to display
    await expectPopup(popupPage).not.toBeAttached();
  });

  test('should navigate to public popups of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // register popup intention in app 1
    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'testee'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
  });

  test('should not navigate to public popups of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup as public popup in app 2
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    const open = popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });
    await expect(open).rejects.toThrow(/NotQualifiedError/);

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect popup not to display
    await expectPopup(popupPage).not.toBeAttached();
  });

  test('should allow opening multiple popups simultaneously in different views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee-3'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the first popup for app-1
    const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage1.open({component: 'testee-1'}, {
      anchor: 'element',
      closeStrategy: {onFocusLost: false, onEscape: false},
      cssClass: 'testee-1',
    });

    const popup1 = appPO.popup({cssClass: 'testee-1'});
    const popupPage1 = new PopupPagePO(popup1);

    // expect the popup of this app to display
    await expectPopup(popupPage1).toBeVisible();
    await expect.poll(() => popupPage1.getPopupCapability().then(capability => capability.metadata!.appSymbolicName)).toEqual('workbench-client-testing-app1');

    // open the second popup for app-1
    const popupOpenerPage2 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage2.open({component: 'testee-2'}, {
      anchor: 'element',
      closeStrategy: {onFocusLost: false, onEscape: false},
      cssClass: 'testee-2',
    });

    // expect popup to display
    const popup2 = appPO.popup({cssClass: 'testee-2'});
    const popupPage2 = new PopupPagePO(popup2);

    // expect the popup of this app to display
    await expectPopup(popupPage2).toBeVisible();
    await expect.poll(() => popupPage2.getPopupCapability().then(capability => capability.metadata!.appSymbolicName)).toEqual('workbench-client-testing-app1');

    // open the popup for app-2
    const popupOpenerPage3 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app2');
    await popupOpenerPage3.open({component: 'testee-3'}, {
      anchor: 'element',
      closeStrategy: {onFocusLost: false, onEscape: false},
      cssClass: 'testee-3',
    });

    // expect popup to display
    const popup3 = appPO.popup({cssClass: 'testee-3'});
    const popupPage3 = new PopupPagePO(popup3);

    // expect the popup of this app to display
    await expectPopup(popupPage3).toBeVisible();
    await expect.poll(() => popupPage3.getPopupCapability().then(capability => capability.metadata!.appSymbolicName)).toEqual('workbench-client-testing-app2');
  });

  test('should open popup with empty microfrontend path', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '',
      },
    });

    // open the popup with `empty` as path
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee', path: 'empty'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new MicrofrontendPopupTestPagePO(popup);

    // expect popup to display
    await expectPopup(popupPage).toBeVisible();
  });

  test('should not throw if another app provides an equivalent but private popup capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect the popup of this app to display
    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popupPage.getPopupCapability().then(capability => capability.metadata!.appSymbolicName)).toEqual('workbench-client-testing-app1');
  });

  test('should not throw if another app provides an equivalent public popup capability if not declared an intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect the popup of this app to display
    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popupPage.getPopupCapability().then(capability => capability.metadata!.appSymbolicName)).toEqual('workbench-client-testing-app1');
  });

  test('should log warning if another app provides an equivalent public popup capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerCapability('app2', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect first popup to display
    await expectPopup(popupPage).toBeVisible();

    // expect warning to be logged for the second popup
    await expect.poll(() => consoleLogs.get({severity: 'warning', message: /Ignoring popup intent/})).not.toEqual([]);
  });

  test('should log warning if multiple popup providers match the qualifier', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });
    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // expect first popup to display
    await expectPopup(popupPage).toBeVisible();

    // expect warning to be logged for the second popup
    await expect.poll(() => consoleLogs.get({severity: 'warning', message: /Ignoring popup intent/})).not.toEqual([]);
  });

  test('should allow closing and re-opening a popup', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-popup',
      },
    });

    // open the popup for the first time
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();

    // close the popup
    await popupPage.close();
    await expectPopup(popupPage).not.toBeAttached();

    // open the popup for the second time
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });
    await expectPopup(popupPage).toBeVisible();
  });
});
