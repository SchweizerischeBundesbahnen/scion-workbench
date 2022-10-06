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
import {PopupFocusPagePO} from './page-object/popup-focus-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';

const POPUP_DIAMOND_ANCHOR_SIZE = 8;

test.describe('Workbench Popup', () => {

  test.describe('overlay alignment if using HTMLElement anchor', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPosition('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.top, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('north');
      await popupOpenerPagePO.enterPosition('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.top, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('south');
      await popupOpenerPagePO.enterPosition('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});

      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.bottom, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popupPO.getAlign()).toEqual('south');
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('east');
      await popupOpenerPagePO.enterPosition('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(anchorClientRect.top + anchorClientRect.height / 2, 0);
      await expect(popupClientRect.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.right, 0);
      await expect(await popupPO.getAlign()).toEqual('east');
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('west');
      await popupOpenerPagePO.enterPosition('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(anchorClientRect.top + anchorClientRect.height / 2, 0);
      await expect(popupClientRect.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.left, 0);
      await expect(await popupPO.getAlign()).toEqual('west');
    });
  });

  test.describe('overlay alignment if using coordinate anchor', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPosition({left: 300, top: 300});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const viewPO = await appPO.activePart.activeView;
      const viewBounds = await viewPO.getBoundingBox();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('north');
      await popupOpenerPagePO.enterPosition({left: 300, top: 300});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const viewPO = await appPO.activePart.activeView;
      const viewBounds = await viewPO.getBoundingBox();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('south');
      await popupOpenerPagePO.enterPosition({left: 300, top: 300});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const viewPO = await appPO.activePart.activeView;
      const viewBounds = await viewPO.getBoundingBox();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popupPO.getAlign()).toEqual('south');
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('east');
      await popupOpenerPagePO.enterPosition({left: 300, top: 300});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const viewPO = await appPO.activePart.activeView;
      const viewBounds = await viewPO.getBoundingBox();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popupPO.getAlign()).toEqual('east');
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('west');
      await popupOpenerPagePO.enterPosition({left: 300, top: 300});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const viewPO = await appPO.activePart.activeView;
      const viewBounds = await viewPO.getBoundingBox();

      const popupPO = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getBoundingBox('cdk-overlay');

      await expect(await popupPO.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popupPO.getAlign()).toEqual('west');
    });
  });

  test('should allow passing a value to the popup component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.enterPopupInput('TEST INPUT');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.getInput()).toEqual('TEST INPUT');
  });

  test('should allow closing the popup and returning a value to the popup opener', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await popupPagePO.clickClose({returnValue: 'RETURN VALUE'});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  test('should allow closing the popup with an error', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await popupPagePO.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  test.describe('Moving the anchor', () => {
    test('should stick the popup to the HTMLElement anchor when moving the anchor element', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterPosition('element');
      await popupOpenerPagePO.selectAlign('north');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'testee'});

      // capture current popup and anchor location
      const anchorClientRect1 = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect1 = await popupPO.getBoundingBox();

      // expand a collapsed panel to move the popup anchor downward
      await popupOpenerPagePO.expandSizePanel();

      const anchorClientRect2 = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect2 = await popupPO.getBoundingBox();
      const xDelta = anchorClientRect2.left - anchorClientRect1.left;
      const yDelta = anchorClientRect2.top - anchorClientRect1.top;

      // assert the anchor to moved downward
      await expect(anchorClientRect2.top).toBeGreaterThan(anchorClientRect1.top);
      await expect(anchorClientRect2.left).toEqual(anchorClientRect1.left);

      // assert the popup location
      await expect(popupClientRect2.top).toEqual(popupClientRect1.top + yDelta);
      await expect(popupClientRect2.left).toEqual(popupClientRect1.left + xDelta);

      // collapse the panel to move the popup anchor upward
      await popupOpenerPagePO.collapseSizePanel();
      const popupClientRect3 = await popupPO.getBoundingBox();

      // assert the popup location
      await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
      await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
    });

    test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterPosition({left: 150, top: 150});
      await popupOpenerPagePO.selectAlign('south');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const viewPO = await appPO.activePart.activeView;
      const viewBounds = await viewPO.getBoundingBox();

      const popupPO = appPO.popup({cssClass: 'testee'});
      const popupClientRect1 = await popupPO.getBoundingBox('cdk-overlay');
      await expect(popupClientRect1.left + popupClientRect1.width / 2).toEqual(viewBounds.left + 150);
      await expect(popupClientRect1.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(viewBounds.top + 150);

      // move the anchor to another position
      await popupOpenerPagePO.enterPosition({left: 200, top: 300});
      const popupClientRect2 = await popupPO.getBoundingBox('cdk-overlay');
      await expect(popupClientRect2.left + popupClientRect2.width / 2).toEqual(viewBounds.left + 200);
      await expect(popupClientRect2.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(viewBounds.top + 300);

      // move the anchor to another position
      await popupOpenerPagePO.enterPosition({left: 300, top: 400});
      const popupClientRect3 = await popupPO.getBoundingBox('cdk-overlay');
      await expect(popupClientRect3.left + popupClientRect3.width / 2).toEqual(viewBounds.left + 300);
      await expect(popupClientRect3.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(viewBounds.top + 400);
    });
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      const componentInstanceId = await popupPagePO.getComponentInstanceId();
      await expect(await popupPagePO.isPresent()).toBe(true);
      await expect(await popupPagePO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPagePO.isPresent()).toBe(true);
      await expect(await popupPagePO.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPagePO.isPresent()).toBe(true);
      await expect(await popupPagePO.isVisible()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await popupPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should allow binding the popup to any view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const startPagePO = await appPO.openNewViewTab();

      // open a popup and bind it to the start page view.
      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterContextualViewId(startPagePO.viewId!);
      await popupOpenerPagePO.enterPosition({left: 0, top: 0});
      await popupOpenerPagePO.selectPopupComponent('empty-page');
      await popupOpenerPagePO.clickOpen({waitForPopup: false});

      const popupPO = appPO.popup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(false);
      await expect(await popupPO.isVisible()).toBe(false);

      // activate the view to which the popup is bound to
      await startPagePO.view!.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(false);

      // activate another view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(false);

      // activate the view to which the popup is bound to
      await startPagePO.view!.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(false);

      // activate the view again
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // close the view
      await popupOpenerPagePO.view.viewTab.close();
      await expect(await popupPO.isPresent()).toBe(false);
      await expect(await popupPO.isVisible()).toBe(false);
    });

    test('should allow the popup do detach from its contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterContextualViewId('<null>');
      await popupOpenerPagePO.enterPosition({left: 300, top: 300});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // activate the view again
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // close the view
      await popupOpenerPagePO.view.viewTab.close();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus lost', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

      await popupOpenerPagePO.view.viewTab.click();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(false);
    });

    test('should not close the popup on focus lost', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

      await popupOpenerPagePO.view.viewTab.click();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
    });

    test('should close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(false);
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
    });
  });

  test.describe('focus trap', () => {

    test('should automatically focus the first field', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO(appPO, 'testee');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);
    });

    test('should install a focus trap to cycle focus (pressing tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO(appPO, 'testee');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);
    });

    test('should install a focus trap to cycle focus (pressing shift-tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO(appPO, 'testee');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);
    });

    test('should restore focus after re-activating its contextual view, if any', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO(appPO, 'testee');
      await popupFocusPagePO.clickField('middle-field');
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);
      await expect(await popupFocusPagePO.isPresent()).toBe(true);
      await expect(await popupFocusPagePO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupFocusPagePO.isPresent()).toBe(true);
      await expect(await popupFocusPagePO.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupFocusPagePO.isPresent()).toBe(true);
      await expect(await popupFocusPagePO.isVisible()).toBe(true);
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);
    });
  });
});

