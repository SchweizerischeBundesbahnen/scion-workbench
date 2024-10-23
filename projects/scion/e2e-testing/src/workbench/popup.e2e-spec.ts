/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {waitUntilBoundingBoxStable} from '../helper/testing.util';

const POPUP_DIAMOND_ANCHOR_SIZE = 8;
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {expectView} from '../matcher/view-matcher';

test.describe('Workbench Popup', () => {

  test.describe('popup alignment if using HTMLElement anchor', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('north');

      const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.bottom + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(anchorBox.top, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(anchorBox.hcenter, 0);
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('north');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('north');

      const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.bottom + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(anchorBox.top, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(anchorBox.hcenter, 0);
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('south');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('south');

      const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(anchorBox.bottom, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(anchorBox.hcenter, 0);
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('east');

      const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(anchorBox.vcenter, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(anchorBox.right, 0);
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('west');

      const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(anchorBox.vcenter, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(anchorBox.left, 0);
    });
  });

  test.describe('popup alignment if using coordinate anchor', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('north');

      const viewBounds = await appPO.activePart({inMainArea: true}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.bottom + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(viewBounds.top + 300, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(viewBounds.left + 300, 0);
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('north');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('north');

      const viewBounds = await appPO.activePart({inMainArea: true}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.bottom + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(viewBounds.top + 300, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(viewBounds.left + 300, 0);
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('south');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('south');

      const viewBounds = await appPO.activePart({inMainArea: true}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(viewBounds.top + 300, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(viewBounds.left + 300, 0);
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('east');

      const viewBounds = await appPO.activePart({inMainArea: true}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(viewBounds.top + 300, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.left - POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(viewBounds.left + 300, 0);
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expect.poll(() => popup.getAlign()).toEqual('west');

      const viewBounds = await appPO.activePart({inMainArea: true}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(viewBounds.top + 300, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(viewBounds.left + 300, 0);
    });
  });

  test('should allow passing a value to the popup component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.selectPopupComponent('popup-page');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.enterPopupInput('TEST INPUT');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expect(popupPage.input).toHaveText('TEST INPUT');
  });

  test.describe('popup result', () => {
    test('should allow closing the popup and returning a value to the popup opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'RETURN VALUE'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should allow closing the popup with an error', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'ERROR', closeWithError: true});
      await expect(popupOpenerPage.error).toHaveText('ERROR');
    });

    test('should allow returning value on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await popupOpenerPage.view.tab.click();
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should return only the latest result value on close', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE 1', {apply: true});

      await popupPage.close({returnValue: 'RETURN VALUE 2'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE 2');
    });

    test('should not return value on escape keystroke', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await page.keyboard.press('Escape');
      await expect(popupOpenerPage.returnValue).not.toBeAttached();
    });
  });

  test('should associate popup with specified CSS class(es) ', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.selectPopupComponent('popup-page');
    await popupOpenerPage.enterCssClass(['testee', 'a', 'b']);
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: ['testee', 'a', 'b']});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
  });

  test.describe('Moving the anchor', () => {

    test('should stick to the popup anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.selectAlign('north');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      // Wait until popup is positioned and sized.
      await waitUntilBoundingBoxStable(popup.locator);

      // capture current popup and anchor location
      const anchorBoxInitial = await popupOpenerPage.getAnchorElementBoundingBox();
      const popupBoundsInitial = await popup.getBoundingBox();

      // expand a collapsed panel to move the popup anchor downward
      await popupOpenerPage.expandSizePanel();
      await expect(async () => {
        const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
        const popupBounds = await popup.getBoundingBox();
        const xDelta = anchorBox.left - anchorBoxInitial.left;
        const yDelta = anchorBox.top - anchorBoxInitial.top;

        // assert the anchor to moved downward
        expect(anchorBox.top).toBeGreaterThan(anchorBoxInitial.top);
        expect(anchorBox.left).toEqual(anchorBoxInitial.left);

        // assert the popup location
        expect(popupBounds.top).toEqual(popupBoundsInitial.top + yDelta);
        expect(popupBounds.left).toEqual(popupBoundsInitial.left + xDelta);
      }).toPass();

      // collapse the panel to move the popup anchor upward
      await popupOpenerPage.collapseSizePanel();
      await expect(async () => {
        const popupBounds = await popup.getBoundingBox();

        // assert the popup location
        expect(popupBounds.top).toEqual(popupBoundsInitial.top);
        expect(popupBounds.left).toEqual(popupBoundsInitial.left);
      }).toPass();
    });

    test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({left: 150, top: 150});
      await popupOpenerPage.selectAlign('south');
      await popupOpenerPage.enterSize({width: '100px', height: '100px'});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      const viewBounds = await appPO.activePart({inMainArea: true}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toEqual(viewBounds.left + 150);
      await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toEqual(viewBounds.top + 150);

      // move the anchor to another position
      await popupOpenerPage.enterPosition({left: 200, top: 300});
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toEqual(viewBounds.left + 200);
      await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toEqual(viewBounds.top + 300);

      // move the anchor to another position
      await popupOpenerPage.enterPosition({left: 300, top: 400});
      await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toEqual(viewBounds.left + 300);
      await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toEqual(viewBounds.top + 400);
    });
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // re-activate the view
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should detach popup if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in main area.
      const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open popup opener view.
      const popupOpenerView = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);

      // Drag popup opener view into peripheral area.
      await popupOpenerView.view.tab.dragTo({grid: 'workbench', region: 'east'});

      // Open popup.
      await popupOpenerView.selectPopupComponent('popup-page');
      await popupOpenerView.enterCssClass('testee');
      await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerView.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // Maximize the main area.
      await viewPageInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeHidden();

      // Restore the layout.
      await viewPageInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should maintain popup bounds if view is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1 with popup.
      const popupPage = await SizeTestPagePO.openInPopup(appPO, {position: 'element'});
      const viewPage1 = new PopupOpenerPagePO(appPO.view({viewId: await appPO.activePart({inMainArea: true}).activeView.getViewId()}));

      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Open view 2.
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
      await expectPopup(popupPage).toBeHidden();
      await expectView(viewPage1).toBeInactive();
      await expectView(viewPage2).toBeActive();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Activate view 1.
      await viewPage1.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive();

      // Expect popup not to be resized
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if view is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view 1 with popup.
      const popupPage = await SizeTestPagePO.openInPopup(appPO, {position: 'coordinate'});
      const viewPage1 = new PopupOpenerPagePO(appPO.view({viewId: await appPO.activePart({inMainArea: true}).activeView.getViewId()}));

      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Open view 2.
      const viewPage2 = await workbenchNavigator.openInNewTab(ViewPagePO);
      await expectPopup(popupPage).toBeHidden();
      await expectView(viewPage1).toBeInactive();
      await expectView(viewPage2).toBeActive();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Activate view 1.
      await viewPage1.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive();

      // Expect popup not to be resized (no flickering).
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expectPopup(popupPage).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // re-activate the view
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // expect the component not to be constructed anew
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should allow binding the popup to any view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const startPage = await appPO.openNewViewTab();

      // open a popup and bind it to the start page view.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterContextualViewId(await startPage.view.getViewId());
      await popupOpenerPage.enterPosition({left: appPO.viewportBoundingBox().hcenter, top: appPO.viewportBoundingBox().vcenter});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open({waitUntilAttached: false});

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).not.toBeAttached();

      // activate the view to which the popup is bound to
      await startPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // activate another view
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeHidden();

      // activate the view to which the popup is bound to
      await startPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // deactivate the view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // activate the view again
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // close the view
      await popupOpenerPage.view.tab.close();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should allow the popup do detach from its contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // deactivate the view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeVisible();

      // activate the view again
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // close the view
      await popupOpenerPage.view.tab.close();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should propagate view context', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open target view.
      const popupTargetViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open popup in target view.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-opener-page');
      await popupOpenerPage.enterCssClass('testee-1');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterContextualViewId(await popupTargetViewPage.view.getViewId());
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.open({waitUntilAttached: false});

      const popup1 = appPO.popup({cssClass: 'testee-1'});
      const popupPopupOpenerPage1 = new PopupOpenerPagePO(popup1);

      await expectPopup(popupPopupOpenerPage1).not.toBeAttached();

      // Activate target view.
      await popupTargetViewPage.view.tab.click();
      await expectPopup(popupPopupOpenerPage1).toBeVisible();

      // Open another popup from the popup (inherit popup's view context).
      await popupPopupOpenerPage1.selectPopupComponent('popup-page');
      await popupPopupOpenerPage1.enterCssClass('testee-2');
      await popupPopupOpenerPage1.enterCloseStrategy({closeOnFocusLost: false});
      await popupPopupOpenerPage1.enterPosition({left: 300, top: 300});
      await popupPopupOpenerPage1.open();

      const popup2 = appPO.popup({cssClass: 'testee-2'});
      const popupPage2 = new PopupPagePO(popup2);

      // Expect popup 2 to have contextual view of popup 1, i.e., is also visible.
      await expectPopup(popupPage2).toBeVisible();

      // Activate target view.
      await popupOpenerPage.view.tab.click();

      // Expect popup 1 and popup 2 not to be visible because contextual view is not active.
      await expectPopup(popupPopupOpenerPage1).toBeHidden();
      await expectPopup(popupPage2).toBeHidden();

      // Activate contextual view of the popups.
      await popupTargetViewPage.view.tab.click();

      // Expect popup 1 and popup 2 to be visible.
      await expectPopup(popupPopupOpenerPage1).toBeVisible();
      await expectPopup(popupPage2).toBeVisible();
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).toBeVisible();
    });

    test('should remain focus on the element that caused the popup to lose focus', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup page
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      // Open test page
      const inputFieldPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
      // Move test page to the right
      await inputFieldPage.view.tab.dragTo({partId: await inputFieldPage.view.part.getPartId(), region: 'east'});

      // Open popup
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.open();

      // Expect popup to have focus.
      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await expectPopup(focusTestPage).not.toBeAttached();

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(inputFieldPage.input).toBeFocused();
    });
  });

  test.describe('focus trap', () => {

    test('should automatically focus the first field', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should install a focus trap to cycle focus (pressing tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.lastField).toBeFocused();
    });

    test('should install a focus trap to cycle focus (pressing shift-tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should restore focus after re-activating its contextual view, if any', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await focusTestPage.clickField('middle-field');
      await expect(focusTestPage.middleField).toBeFocused();
      await expect(focusTestPage.locator).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expect(focusTestPage.locator).toBeAttached();
      await expect(focusTestPage.locator).not.toBeVisible();

      // re-activate the view
      await popupOpenerPage.view.tab.click();
      await expect(focusTestPage.locator).toBeVisible();
      await expect(focusTestPage.middleField).toBeFocused();
    });
  });
});
