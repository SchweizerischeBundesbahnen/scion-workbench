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
import {POPUP_DIAMOND_ANCHOR_SIZE, PopupPO} from '../popup.po';
import {ViewPO} from '../view.po';

test.describe('Workbench Popup Position', () => {

  let northView: ViewPO;
  let westView: ViewPO;
  let eastView: ViewPO;
  let southView: ViewPO;
  let popupOpenerPage: PopupOpenerPagePO;
  let centerView: ViewPO;
  let popup: PopupPO;

  test.beforeEach(async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open views
    northView = (await appPO.openNewViewTab()).view;
    westView = (await appPO.openNewViewTab()).view;
    eastView = (await appPO.openNewViewTab()).view;
    southView = (await appPO.openNewViewTab()).view;
    popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    centerView = popupOpenerPage.view;

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
    // Drag view to the north.
    const dragHandle1 = await northView.tab.startDrag();
    await dragHandle1.dragToPart(await northView.part.getPartId(), {region: 'north'});
    await dragHandle1.drop();

    // Drag view to the south.
    const dragHandle2 = await southView.tab.startDrag();
    await dragHandle2.dragToPart(await southView.part.getPartId(), {region: 'south'});
    await dragHandle2.drop();

    // Drag view to the west.
    const dragHandle3 = await westView.tab.startDrag();
    await dragHandle3.dragToPart(await westView.part.getPartId(), {region: 'west'});
    await dragHandle3.drop();

    // Drag view to the east.
    const dragHandle4 = await eastView.tab.startDrag();
    await dragHandle4.dragToPart(await eastView.part.getPartId(), {region: 'east'});
    await dragHandle4.drop();

    // Enlarge center part size
    const {width, height} = appPO.page.viewportSize()!;
    await centerView.part.sash.drag('top', -.3 * height);
    await centerView.part.sash.drag('left', -.25 * width);
    await centerView.part.sash.drag('right', .1 * width);
    await centerView.part.sash.drag('bottom', .1 * height);

    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.selectPopupComponent('blank-test-page');
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});

    popup = appPO.popup({cssClass: 'testee'});
  });

  test.describe('global popup position', () => {

    test('should stick to the top-left viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });
    });

    test('should stick to the top-right viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });
    });

    test('should stick to the bottom-right viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(page.viewportSize()!.width - 100, 0);
      });
    });

    test('should stick to the bottom-left viewport corner', async ({page}) => {
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.open();

      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('increase viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width + 100, height: height + 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });

      await test.step('decrease viewport size', async () => {
        const {width, height} = page.viewportSize()!;
        await page.setViewportSize({width: width - 100, height: height - 100});
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(page.viewportSize()!.height - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(100, 0);
      });
    });
  });

  test.describe('view-relative popup position', () => {

    test('should stick to the top-left view corner', async () => {
      await popupOpenerPage.enterPosition({top: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.open();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });
    });

    test('should stick to the top-right view corner', async () => {
      await popupOpenerPage.enterPosition({top: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.open();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.top + 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });
    });

    test('should stick to the bottom-right view corner', async () => {
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.open();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.right - 100, 0);
      });
    });

    test('should stick to the bottom-left view corner', async () => {
      await popupOpenerPage.enterPosition({bottom: 100, left: 100});
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.open();

      const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);

      await test.step('increase view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving top-edge of the part', async () => {
        await centerView.part.sash.drag('top', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view height by moving bottom-edge of the part', async () => {
        await centerView.part.sash.drag('bottom', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving left-edge of the part', async () => {
        await centerView.part.sash.drag('left', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('increase view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', 25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });

      await test.step('decrease view width by moving right-edge of the part', async () => {
        await centerView.part.sash.drag('right', -25);
        const centerViewBounds = fromRect(await popupOpenerPage.view.getBoundingBox());
        await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(centerViewBounds.bottom - 100, 0);
        await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(centerViewBounds.left + 100, 0);
      });
    });
  });
});
