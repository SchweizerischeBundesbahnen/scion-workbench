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
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';

const POPUP_DIAMOND_ANCHOR_SIZE = 8;

test.describe('Workbench Popup', () => {

  test.describe('overlay alignment if using HTMLElement anchor', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popup = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.top, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popup.getAlign()).toEqual('north');
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('north');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const popup = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.top, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popup.getAlign()).toEqual('north');
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('south');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});

      await popupOpenerPage.clickOpen();

      const popup = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.bottom, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popup.getAlign()).toEqual('south');
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const popup = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(anchorClientRect.top + anchorClientRect.height / 2, 0);
      await expect(popupClientRect.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.right, 0);
      await expect(await popup.getAlign()).toEqual('east');
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const popup = await appPO.popup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(anchorClientRect.top + anchorClientRect.height / 2, 0);
      await expect(popupClientRect.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.left, 0);
      await expect(await popup.getAlign()).toEqual('west');
    });
  });

  test.describe('overlay alignment if using coordinate anchor', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const view = await appPO.activePart({inMainArea: true}).activeView;
      const viewBounds = await view.getBoundingBox();

      const popup = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popup.getAlign()).toEqual('north');
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('north');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const view = await appPO.activePart({inMainArea: true}).activeView;
      const viewBounds = await view.getBoundingBox();

      const popup = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popup.getAlign()).toEqual('north');
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('south');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const view = await appPO.activePart({inMainArea: true}).activeView;
      const viewBounds = await view.getBoundingBox();

      const popup = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popup.getAlign()).toEqual('south');
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('east');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const view = await appPO.activePart({inMainArea: true}).activeView;
      const viewBounds = await view.getBoundingBox();

      const popup = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popup.getAlign()).toEqual('east');
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectAlign('west');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const view = await appPO.activePart({inMainArea: true}).activeView;
      const viewBounds = await view.getBoundingBox();

      const popup = await appPO.popup({cssClass: 'testee'});
      const popupClientRect = await popup.getBoundingBox('cdk-overlay');

      await expect(await popup.isVisible()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(viewBounds.top + 300, 0);
      await expect(popupClientRect.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(viewBounds.left + 300, 0);
      await expect(await popup.getAlign()).toEqual('west');
    });
  });

  test('should allow passing a value to the popup component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.enterPopupInput('TEST INPUT');
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getInput()).toEqual('TEST INPUT');
  });

  test('should allow closing the popup and returning a value to the popup opener', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await popupPage.clickClose({returnValue: 'RETURN VALUE'});

    await expect(await popupOpenerPage.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  test('should allow closing the popup with an error', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await popupPage.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPage.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  test('should associate popup with specified CSS class(es) ', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCssClass(['testee', 'a', 'b']);
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

    await expect(await popupPage.popup.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'a', 'b']));
  });

  test.describe('Moving the anchor', () => {
    test('should stick the popup to the HTMLElement anchor when moving the anchor element', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition('element');
      await popupOpenerPage.selectAlign('north');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});

      // capture current popup and anchor location
      const anchorClientRect1 = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect1 = await popup.getBoundingBox();

      // expand a collapsed panel to move the popup anchor downward
      await popupOpenerPage.expandSizePanel();

      const anchorClientRect2 = await popupOpenerPage.getAnchorElementClientRect();
      const popupClientRect2 = await popup.getBoundingBox();
      const xDelta = anchorClientRect2.left - anchorClientRect1.left;
      const yDelta = anchorClientRect2.top - anchorClientRect1.top;

      // assert the anchor to moved downward
      await expect(anchorClientRect2.top).toBeGreaterThan(anchorClientRect1.top);
      await expect(anchorClientRect2.left).toEqual(anchorClientRect1.left);

      // assert the popup location
      await expect(popupClientRect2.top).toEqual(popupClientRect1.top + yDelta);
      await expect(popupClientRect2.left).toEqual(popupClientRect1.left + xDelta);

      // collapse the panel to move the popup anchor upward
      await popupOpenerPage.collapseSizePanel();
      const popupClientRect3 = await popup.getBoundingBox();

      // assert the popup location
      await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
      await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
    });

    test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterPosition({left: 150, top: 150});
      await popupOpenerPage.selectAlign('south');
      await popupOpenerPage.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPage.clickOpen();

      const view = await appPO.activePart({inMainArea: true}).activeView;
      const viewBounds = await view.getBoundingBox();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupClientRect1 = await popup.getBoundingBox('cdk-overlay');
      await expect(popupClientRect1.left + popupClientRect1.width / 2).toEqual(viewBounds.left + 150);
      await expect(popupClientRect1.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(viewBounds.top + 150);

      // move the anchor to another position
      await popupOpenerPage.enterPosition({left: 200, top: 300});
      const popupClientRect2 = await popup.getBoundingBox('cdk-overlay');
      await expect(popupClientRect2.left + popupClientRect2.width / 2).toEqual(viewBounds.left + 200);
      await expect(popupClientRect2.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(viewBounds.top + 300);

      // move the anchor to another position
      await popupOpenerPage.enterPosition({left: 300, top: 400});
      const popupClientRect3 = await popup.getBoundingBox('cdk-overlay');
      await expect(popupClientRect3.left + popupClientRect3.width / 2).toEqual(viewBounds.left + 300);
      await expect(popupClientRect3.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(viewBounds.top + 400);
    });
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPage.view.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expect(await popupPage.isPresent()).toBe(true);
      await expect(await popupPage.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPage.isPresent()).toBe(true);
      await expect(await popupPage.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPage.view.viewTab.click();
      await expect(await popupPage.isPresent()).toBe(true);
      await expect(await popupPage.isVisible()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should allow binding the popup to any view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const startPage = await appPO.openNewViewTab();

      // open a popup and bind it to the start page view.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterContextualViewId(startPage.viewId!);
      await popupOpenerPage.enterPosition({left: appPO.size().width / 2, top: appPO.size().height / 2});
      await popupOpenerPage.selectPopupComponent('popup-page');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // activate the view to which the popup is bound to
      await startPage.view!.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // activate another view
      await popupOpenerPage.view.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // activate the view to which the popup is bound to
      await startPage.view!.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // activate the view again
      await popupOpenerPage.view.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // close the view
      await popupOpenerPage.view.viewTab.close();
      await expect(await popup.isPresent()).toBe(false);
      await expect(await popup.isVisible()).toBe(false);
    });

    test('should allow the popup do detach from its contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.enterPosition({left: 300, top: 300});
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // activate the view again
      await popupOpenerPage.view.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // close the view
      await popupOpenerPage.view.viewTab.close();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);

      await popupOpenerPage.view.viewTab.click();

      await expect(await popupPage.popup.isPresent()).toBe(false);
      await expect(await popupPage.popup.isVisible()).toBe(false);
    });

    test('should not close the popup on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);

      await popupOpenerPage.view.viewTab.click();

      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);
    });

    test('should close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      await expect(await popupPage.popup.isPresent()).toBe(false);
      await expect(await popupPage.popup.isVisible()).toBe(false);
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);
    });

    test('should remain focus on the element that caused the popup to lose focus', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup page
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      // Open test page
      const inputFieldPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
      // Move test page to the right
      await inputFieldPage.view.viewTab.dragTo({partId: await inputFieldPage.view.part.getPartId(), region: 'east'});

      // Open popup
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.clickOpen();

      // Expect popup to have focus.
      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO, popup);
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await expect(await popup.isVisible()).toBe(false);

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(await inputFieldPage.isInputFieldActiveElement()).toBe(true);
    });
  });

  test.describe('focus trap', () => {

    test('should automatically focus the first field', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO, popup);
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);
    });

    test('should install a focus trap to cycle focus (pressing tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO, popup);
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await focusTestPage.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await focusTestPage.isActiveElement('last-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await focusTestPage.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await focusTestPage.isActiveElement('last-field')).toBe(true);
    });

    test('should install a focus trap to cycle focus (pressing shift-tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO, popup);
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await focusTestPage.isActiveElement('last-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await focusTestPage.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await focusTestPage.isActiveElement('last-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await focusTestPage.isActiveElement('middle-field')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await focusTestPage.isActiveElement('first-field')).toBe(true);
    });

    test('should restore focus after re-activating its contextual view, if any', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.selectPopupComponent('focus-test-page');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO, popup);
      await focusTestPage.clickField('middle-field');
      await expect(await focusTestPage.isActiveElement('middle-field')).toBe(true);
      await expect(await focusTestPage.isPresent()).toBe(true);
      await expect(await focusTestPage.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await focusTestPage.isPresent()).toBe(true);
      await expect(await focusTestPage.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPage.view.viewTab.click();
      await expect(await focusTestPage.isPresent()).toBe(true);
      await expect(await focusTestPage.isVisible()).toBe(true);
      await expect(await focusTestPage.isActiveElement('middle-field')).toBe(true);
    });
  });
});

