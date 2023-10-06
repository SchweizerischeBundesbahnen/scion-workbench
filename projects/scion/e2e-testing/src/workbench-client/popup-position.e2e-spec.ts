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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {fromRect} from '../helper/testing.util';
import {ViewTabPO} from '../view-tab.po';
import {PopupPO} from '../popup.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';

const POPUP_DIAMOND_ANCHOR_SIZE = 8;

test.describe('Workbench Popup Position', () => {

  let northViewTab: ViewTabPO;
  let westViewTab: ViewTabPO;
  let eastViewTab: ViewTabPO;
  let southViewTab: ViewTabPO;
  let popupOpenerPage: PopupOpenerPagePO;
  let centerViewTab: ViewTabPO;
  let popup: PopupPO;

  test.beforeEach(async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {width: '50px', height: '50px'},
      },
    });
    await registerCapabilityPage.viewTab.close();

    // Open views
    northViewTab = (await appPO.openNewViewTab()).view!.viewTab;
    westViewTab = (await appPO.openNewViewTab()).view!.viewTab;
    eastViewTab = (await appPO.openNewViewTab()).view!.viewTab;
    southViewTab = (await appPO.openNewViewTab()).view!.viewTab;
    popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    centerViewTab = popupOpenerPage.view.viewTab;

    // Arrange views according to the following layout
    // +------------------------------+
    // |            NORTH             |
    // +--------+------------+--------+
    // |        |            |        |
    // | WEST   |   CENTER   |  EAST  |
    // |        |            |        |
    // +--------+------------+--------+
    // |             SOUTH            |
    // +------------------------------+
    await northViewTab.dragTo({partId: await northViewTab.part.getPartId(), region: 'north'});
    await southViewTab.dragTo({partId: await southViewTab.part.getPartId(), region: 'south'});
    await westViewTab.dragTo({partId: await westViewTab.part.getPartId(), region: 'west'});
    await eastViewTab.dragTo({partId: await eastViewTab.part.getPartId(), region: 'east'});

    // Enlarge center part size
    const {width, height} = appPO.page.viewportSize()!;
    await centerViewTab.part.sash.drag('top', -.3 * height);
    await centerViewTab.part.sash.drag('left', -.25 * width);
    await centerViewTab.part.sash.drag('right', .1 * width);
    await centerViewTab.part.sash.drag('bottom', .1 * height);

    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterCssClass('testee');

    popup = appPO.popup({cssClass: 'testee'});
  });

  test.describe('global popup position', () => {

    test('should stick to the top-left viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.clickOpen();

      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(100, 0);
      expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });
    });

    test('should stick to the top-right viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.clickOpen();

      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(100, 0);
      expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });
    });

    test('should stick to the bottom-right viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.clickOpen();

      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
      expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });
    });

    test('should stick to the bottom-left viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.clickOpen();

      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
      expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(100, 0);
      });
    });
  });

  test.describe('view-relative popup position', () => {

    test('should stick to the top-left view corner', async () => {
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.clickOpen();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
      expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });
    });

    test('should stick to the top-right view corner', async () => {
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.clickOpen();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
      expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.top + 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });
    });

    test('should stick to the bottom-right view corner', async () => {
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.clickOpen();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
      expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.right - 100, 0);
      });
    });

    test('should stick to the bottom-left view corner', async () => {
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.clickOpen();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
      expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
      expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerViewTab.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerViewTab.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerViewTab.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerViewTab.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        const popupBounds = fromRect(await popup.getBoundingBox('cdk-overlay'));
        expect(popupBounds.vcenter).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(centerViewBounds.left + 100, 0);
      });
    });
  });
});
