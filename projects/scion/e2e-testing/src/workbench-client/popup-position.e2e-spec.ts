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
import {fromRect} from '../helper/testing.util';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

const POPUP_DIAMOND_ANCHOR_SIZE = 8;

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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, left: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, right: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, right: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, left: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, left: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({top: 150, right: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, right: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 200, 0);
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
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);

      await test.step('update position', async () => {
        await popupOpenerPage.enterPosition({bottom: 150, left: 200});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 150, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 200, 0);
      });
    });
  });
});
