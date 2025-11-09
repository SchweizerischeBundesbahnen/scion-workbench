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
import {BlankTestPagePO} from './page-object/test-pages/blank-test-page.po';

test.describe('Workbench Popup Position', () => {

  test.beforeEach(async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // +------------------------------+
    // |            TOP               |
    // +--------+------------+--------+
    // |        |            |        |
    // | LEFT   | MAIN-AREA  | RIGHT  |
    // |        |            |        |
    // +--------+------------+--------+
    // |            BOTTOM            |
    // +------------------------------+
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.top', {align: 'top', ratio: .25})
      .addPart('part.bottom', {align: 'bottom', ratio: .25})
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25})
      .addView('view.101', {partId: 'part.top', activateView: true})
      .addView('view.102', {partId: 'part.bottom', activateView: true})
      .addView('view.103', {partId: 'part.left', activateView: true})
      .addView('view.104', {partId: 'part.right', activateView: true})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .navigateView('view.103', ['test-view'])
      .navigateView('view.104', ['test-view']),
    );
  });

  test.describe('global popup position', () => {

    test('should stick to the top-left viewport corner', async ({workbenchNavigator, appPO, page}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContext(null);
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {top: 100, left: 100});
      });
    });

    test('should stick to the top-right viewport corner', async ({workbenchNavigator, appPO, page}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContext(null);
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {top: 100, right: 100});
      });
    });

    test('should stick to the bottom-right viewport corner', async ({workbenchNavigator, appPO, page}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContext(null);
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expectPopup(popupPage).toHavePosition('west', 'viewport', {bottom: 100, right: 100});
      });
    });

    test('should stick to the bottom-left viewport corner', async ({workbenchNavigator, appPO, page}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContext(null);
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expectPopup(popupPage).toHavePosition('east', 'viewport', {bottom: 100, left: 100});
      });
    });
  });

  test.describe('view-relative popup position', () => {

    test('should stick to the top-left view corner', async ({workbenchNavigator, appPO}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {top: 100, left: 100});
      });
    });

    test('should stick to the top-right view corner', async ({workbenchNavigator, appPO}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {top: 100, right: 100});
      });
    });

    test('should stick to the bottom-right view corner', async ({workbenchNavigator, appPO}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('west', view, {bottom: 100, right: 100});
      });
    });

    test('should stick to the bottom-left view corner', async ({workbenchNavigator, appPO}) => {
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('blank-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.open();

      const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));
      const view = popupOpenerPage.view.locator;
      await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});

      await test.step('increase view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('top', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('bottom', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('left', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', 25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await popupOpenerPage.view.part.sash.drag('right', -25);
        await expectPopup(popupPage).toHavePosition('east', view, {bottom: 100, left: 100});
      });
    });
  });
});
