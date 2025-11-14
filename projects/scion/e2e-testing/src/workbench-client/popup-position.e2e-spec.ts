/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {PopupPagePO} from './page-object/popup-page.po';

test.describe('Workbench Popup Position', () => {

  test.describe('global popup position', () => {

    test('should position popup relative to the top-left viewport corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, left: 100},
        align: 'east',
        context: null,
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, left: 200});
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 150, left: 200});
      });
    });

    test('should position popup relative to the top-right viewport corner', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, right: 100},
        align: 'west',
        context: null,
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, right: 200});
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 150, right: 200});
      });
    });

    test('should position popup relative to the bottom-right viewport corner', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 100, right: 100},
        align: 'west',
        context: null,
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, right: 200});
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 150, right: 200});
      });
    });

    test('should position popup relative to the bottom-left viewport corner', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 100, left: 100},
        align: 'east',
        context: null,
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, left: 200});
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 150, left: 200});
      });
    });
  });

  test.describe('view-relative popup position', () => {

    test('should position popup relative to the top-left view corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, left: 100},
        align: 'east',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, left: 200});
        await expectPopup(popupPage).toHavePosition('east', view, {top: 150, left: 200});
      });
    });

    test('should position popup relative to the top-right view corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, right: 100},
        align: 'west',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, right: 200});
        await expectPopup(popupPage).toHavePosition('west', view, {top: 150, right: 200});
      });
    });

    test('should position popup relative to the bottom-right view corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 100, right: 100},
        align: 'west',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, right: 200});
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 150, right: 200});
      });
    });

    test('should position popup relative to the bottom-left view corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 100, left: 100},
        align: 'east',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, left: 200});
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 150, left: 200});
      });
    });
  });
});
