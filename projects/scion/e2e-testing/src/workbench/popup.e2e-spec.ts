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
import {PopupPositionTestPagePO} from './page-object/test-pages/popup-position-test-page.po';
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {expectView} from '../matcher/view-matcher';
import {MAIN_AREA} from '../workbench.model';
import {POPUP_DIAMOND_ANCHOR_SIZE} from './workbench-layout-constants';

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

      const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
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

      const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
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

      const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
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

      const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
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

      const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
      await expect.poll(() => popup.getBoundingBox().then(box => box.vcenter)).toBeCloseTo(viewBounds.top + 300, 0);
      await expect.poll(() => popup.getBoundingBox().then(box => box.right + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(viewBounds.left + 300, 0);
    });
  });

  test('should stick to popup anchor after re-layout of workbench parts', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .addView('view.100', {partId: 'part.right'}),
    );

    // Open popup in main area.
    const popupOpenerView = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerView.selectPopupComponent('blank-test-page');
    await popupOpenerView.enterCssClass('testee');
    await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerView.open();

    const popup = appPO.popup({cssClass: 'testee'});

    // Remove the right part by closing its only view, causing the workbench to re-layout workbench parts.
    await appPO.view({viewId: 'view.100'}).tab.close();
    await expect(popup.locator).toBeVisible();

    // Expect the popup to stick to the popup anchor.
    const anchorBox = await popupOpenerView.getAnchorElementBoundingBox();
    await expect.poll(() => popup.getBoundingBox().then(box => box.bottom + POPUP_DIAMOND_ANCHOR_SIZE)).toBeCloseTo(anchorBox.top, 0);
    await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toBeCloseTo(anchorBox.hcenter, 0);
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

      const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
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

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
        .addView('view.100', {partId: 'part.activity-1'})
        .navigateView('view.100', ['test-popup-opener'])
        .activatePart('part.activity-1'),
      );

      // Open view in main area.
      const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open popup.
      const popupOpenerView = new PopupOpenerPagePO(appPO.view({viewId: 'view.100'}));
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
      const viewPage1 = new PopupOpenerPagePO(appPO.view({viewId: await appPO.activePart({grid: 'mainArea'}).activeView.getViewId()}));

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
      const viewPage1 = new PopupOpenerPagePO(appPO.view({viewId: await appPO.activePart({grid: 'mainArea'}).activeView.getViewId()}));

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
      const dragHandle = await inputFieldPage.view.tab.startDrag();
      await dragHandle.dragToPart(await inputFieldPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

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

  test.describe('stick popup to view or part bounds', () => {

    test('should stick popup anchor to bottom view bounds when scrolling up', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.bottom', {align: 'bottom'})
        .addView('testee', {partId: 'part.middle'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginTop('2000');

      // Open popup.
      const popup = await testPage.open();

      // Capture view bounds
      const viewBoundingBox = await testPage.view.getBoundingBox();

      while (await testPage.view.getScrollPosition('vertical') > 0) {
        // Move scrollbar up
        await testPage.view.scrollbars.vertical.scroll(-25);

        // Expect popup anchor not to exceed bottom view bounds
        const {y} = await popup.getAnchorPosition();
        expect(y).toBeLessThanOrEqual(viewBoundingBox.bottom + 1);
      }

      // Expect popup anchor to stick to bottom view bounds
      const {y} = await popup.getAnchorPosition();
      expect(y).toBeCloseTo(viewBoundingBox.bottom, 0);
    });

    test('should stick popup anchor to top view bounds when scrolling down', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.bottom', {align: 'bottom'})
        .addView('testee', {partId: 'part.middle'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginBottom('2000');

      // Capture view bounds.
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Open popup.
      const popup = await testPage.open();

      while (await testPage.view.getScrollPosition('vertical') < 1) {
        // Move scrollbar down
        await testPage.view.scrollbars.vertical.scroll(25);

        // Expect popup anchor not to exceed top view bounds.
        const {y} = await popup.getAnchorPosition();
        expect(y).toBeGreaterThanOrEqual(viewBoundingBox.top - 1);
      }

      // Expect popup anchor to stick to top view bounds.
      const {y} = await popup.getAnchorPosition();
      expect(y).toBeCloseTo(viewBoundingBox.top, 0);
    });

    test('should stick popup anchor to right view bounds when scrolling left', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginLeft('2000');

      // Capture view bounds.
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Open popup.
      const popup = await testPage.open();

      while (await testPage.view.getScrollPosition('horizontal') > 0) {
        // Move scrollbar left.
        await testPage.view.scrollbars.horizontal.scroll(-25);

        // Expect popup anchor not to exceed right view bounds.
        const {x} = await popup.getAnchorPosition();
        expect(x).toBeLessThanOrEqual(viewBoundingBox.right + 1);
      }

      // Expect popup anchor to stick to right view bounds.
      const {x} = await popup.getAnchorPosition();
      expect(x).toBeCloseTo(viewBoundingBox.right, 0);
    });

    test('should stick popup anchor to left view bounds when scrolling right', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginRight('2000');

      // Capture view bounds.
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Open popup.
      const popup = await testPage.open();

      while (await testPage.view.getScrollPosition('horizontal') < 1) {
        // Move scrollbar right.
        await testPage.view.scrollbars.horizontal.scroll(25);

        // Expect popup anchor not to exceed left view bounds.
        const {x} = await popup.getAnchorPosition();
        expect(x).toBeGreaterThanOrEqual(viewBoundingBox.left - 1);
      }

      // Expect popup anchor to stick to left view bounds.
      const {x} = await popup.getAnchorPosition();
      expect(x).toBeCloseTo(viewBoundingBox.left, 0);
    });

    test('should stick popup anchor to bottom part bounds when moving bottom sash up', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.part.getBoundingBox()).height > 0) {
        // Move bottom sash up.
        await testPage.view.part.sash.drag('bottom', -50);

        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.part.getBoundingBox();

        // Expect popup anchor not to exceed bottom part bounds.
        expect(y).toBeLessThanOrEqual(partBoundingBox.bottom + 1);

        // Expect popup anchor not to exceed top part bounds.
        expect(y).toBeGreaterThanOrEqual(partBoundingBox.top - 1);
      }

      const {y} = await popup.getAnchorPosition();
      const partBoundingBox = await testPage.view.part.getBoundingBox();

      // Expect popup anchor to stick to top part bounds.
      expect(y).toBeCloseTo(partBoundingBox.top, 0);

      // Expect popup anchor to stick to bottom part bounds.
      expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
    });

    /**
     * This test adds a hidden part (no navigation, no views) to create a layout where one grid-element directly succeeds another grid-element without an intermediate sci-sashbox.
     * If the grid element were not set to overflow `hidden`, the popup would stick below the bottom part bounds.
     */
    test('should stick popup anchor to bottom part bounds when moving bottom sash up (grid-element directly succeeding another grid-element)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3}) // Add hidden part.
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.part.getBoundingBox()).height > 0) {
        // Move bottom sash up.
        await testPage.view.part.sash.drag('bottom', -50);

        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.part.getBoundingBox();

        // Expect popup anchor not to exceed bottom part bounds.
        expect(y).toBeLessThanOrEqual(partBoundingBox.bottom + 1);

        // Expect popup anchor not to exceed top part bounds.
        expect(y).toBeGreaterThanOrEqual(partBoundingBox.top - 1);
      }

      const {y} = await popup.getAnchorPosition();
      const partBoundingBox = await testPage.view.part.getBoundingBox();

      // Expect popup anchor to stick to top part bounds.
      expect(y).toBeCloseTo(partBoundingBox.top, 0);

      // Expect popup anchor to stick to bottom part bounds.
      expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
    });

    test('should stick popup anchor to bottom part bounds when moving top sash down', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.top', {align: 'top', ratio: .1})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('top', {partId: 'part.top'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.part.getBoundingBox()).height > 0) {
        // Drag top sash down
        await testPage.view.part.sash.drag('top', 50);

        const {y} = await popup.getAnchorPosition();

        // Expect popup anchor not to exceed top part bounds.
        const partBoundingBox = await testPage.view.part.getBoundingBox();
        expect(y).toBeGreaterThanOrEqual(partBoundingBox.top - 1);

        // Expect popup anchor not to exceed bottom part bounds.
        expect(y).toBeLessThanOrEqual(partBoundingBox.bottom + 1);
      }

      const {y} = await popup.getAnchorPosition();
      const partBoundingBox = await testPage.view.part.getBoundingBox();

      // Expect popup anchor to stick to top part bounds.
      expect(y).toBeCloseTo(partBoundingBox.top, 0);

      // Expect popup anchor to stick to bottom part bounds.
      expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
    });

    test('should stick popup anchor to right view bounds when moving right sash to the left', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginLeft('400');

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.getBoundingBox()).width > 0) {
        // Move right sash to the left.
        await testPage.view.part.sash.drag('right', -50);

        const {x} = await popup.getAnchorPosition();

        // Expect popup anchor not to exceed right view bounds.
        const viewBoundingBox = await testPage.view.getBoundingBox();
        expect(x).toBeLessThanOrEqual(viewBoundingBox.right + 1);

        // Expect popup anchor not to exceed left view bounds.
        expect(x).toBeGreaterThanOrEqual(viewBoundingBox.left - 1);
      }

      const {x} = await popup.getAnchorPosition();
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Expect popup anchor to stick to right view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.right, 0);

      // Expect popup anchor to stick to left view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.left, 0);
    });

    test('should stick popup anchor to right view bounds when moving left sash to the right', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginLeft('400');

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.getBoundingBox()).width > 0) {
        // Move left sash to the right.
        await testPage.view.part.sash.drag('left', 50);

        const {x} = await popup.getAnchorPosition();
        const viewBoundingBox = await testPage.view.getBoundingBox();

        // Expect popup anchor not to exceed right view bounds.
        expect(x).toBeLessThanOrEqual(viewBoundingBox.right + 1);

        // Expect popup anchor not to exceed left view bounds.
        expect(x).toBeGreaterThanOrEqual(viewBoundingBox.left - 1);
      }

      const {x} = await popup.getAnchorPosition();
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Expect popup anchor to stick to right view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.right, 0);

      // Expect popup anchor to stick to left view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.left, 0);
    });

    test('should stick popup anchor to right view bounds if anchor scrolled out of viewport and moving right sash to the right', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {align: 'right', ratio: .3})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginLeft('2000');

      // Open popup.
      const popup = await testPage.open();

      await test.step('move right sash to the left', async () => {
        // Move right sash to the left.
        await testPage.view.part.sash.drag('right', -500);

        // Expect popup anchor to stick to right view bounds.
        const {x} = await popup.getAnchorPosition();
        const viewBoundingBox = await testPage.view.getBoundingBox();
        expect(x).toBeCloseTo(viewBoundingBox.right, 0);
      });

      await test.step('scroll left', async () => {
        const viewBoundingBox = await testPage.view.getBoundingBox();

        while (await testPage.view.getScrollPosition('horizontal') > 0) {
          // Move scrollbar left.
          await testPage.view.scrollbars.horizontal.scroll(-50);

          // Expect popup anchor to stick to right view bounds.
          const {x} = await popup.getAnchorPosition();
          expect(x).toBeCloseTo(viewBoundingBox.right, 0);
        }
      });

      await test.step('move right sash to the right', async () => {
        // Move right sash to the right.
        await testPage.view.part.sash.drag('right', 500);

        // Expect popup anchor to stick to right view bounds.
        const {x} = await popup.getAnchorPosition();
        const viewBoundingBox = await testPage.view.getBoundingBox();
        expect(x).toBeCloseTo(viewBoundingBox.right, 0);
      });
    });

    test('should stick popup anchor to bottom part bounds if anchor scrolled out of viewport and moving bottom sash down', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO, {cssClass: 'testee'});

      await testPage.enterMarginTop('2000');

      // Open popup.
      const popup = await testPage.open();

      await test.step('move bottom sash up', async () => {
        // Move bottom sash up.
        await testPage.view.part.sash.drag('bottom', -500);

        // Expect popup anchor to stick to bottom part bounds.
        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.part.getBoundingBox();
        expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
      });

      await test.step('scroll up', async () => {
        const partBoundingBox = await testPage.view.part.getBoundingBox();

        while (await testPage.view.getScrollPosition('vertical') > 0) {
          // Move scrollbar up.
          await testPage.view.scrollbars.vertical.scroll(-50);

          // Expect popup anchor to stick to bottom part bounds.
          const {y} = await popup.getAnchorPosition();
          expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
        }
      });

      await test.step('move bottom sash down', async () => {
        // Move top sash up.
        await testPage.view.part.sash.drag('bottom', 500);

        // Expect popup anchor to stick to bottom part bounds.
        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.getBoundingBox();
        expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
      });
    });
  });
});
