/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from '../app.po';
import { PopupOpenerPagePO } from './page-object/popup-opener-page.po';
import { Key } from 'protractor';
import { PopupPagePO } from './page-object/popup-page.po';
import { consumeBrowserLog, sendKeys } from '../helper/testing.util';
import { PopupFocusPagePO } from './page-object/popup-focus-page.po';

const POPUP_DIAMOND_ANCHOR_SIZE = 8;

describe('Workbench Popup', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  describe('overlay alignment if using HTMLElement anchor', () => {

    it('should, by default, open in the north of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAnchor('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.top, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    it('should open in the north of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('north');
      await popupOpenerPagePO.selectAnchor('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.top, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    it('should open in the south of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('south');
      await popupOpenerPagePO.selectAnchor('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});

      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.bottom, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(anchorClientRect.left + anchorClientRect.width / 2, 0);
      await expect(await popupPO.getAlign()).toEqual('south');
    });

    it('should open in the east of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('east');
      await popupOpenerPagePO.selectAnchor('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(anchorClientRect.top + anchorClientRect.height / 2, 0);
      await expect(popupClientRect.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.right, 0);
      await expect(await popupPO.getAlign()).toEqual('east');
    });

    it('should open in the west of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('west');
      await popupOpenerPagePO.selectAnchor('element');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const anchorClientRect = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(anchorClientRect.top + anchorClientRect.height / 2, 0);
      await expect(popupClientRect.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorClientRect.left, 0);
      await expect(await popupPO.getAlign()).toEqual('west');
    });
  });

  describe('overlay alignment if using coordinate anchor', () => {

    it('should, by default, open in the north of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterAnchorCoordinate({x: 300, y: 300, width: 100, height: 100});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(350, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    it('should open in the north of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('north');
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterAnchorCoordinate({x: 300, y: 300, width: 100, height: 100});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(300, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(350, 0);
      await expect(await popupPO.getAlign()).toEqual('north');
    });

    it('should open in the south of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('south');
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterAnchorCoordinate({x: 300, y: 300, width: 100, height: 100});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});

      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(400, 0);
      await expect(popupClientRect.left + popupClientRect.width / 2).toBeCloseTo(350, 0);
      await expect(await popupPO.getAlign()).toEqual('south');
    });

    it('should open in the east of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('east');
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterAnchorCoordinate({x: 300, y: 300, width: 100, height: 100});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(350, 0);
      await expect(popupClientRect.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(400, 0);
      await expect(await popupPO.getAlign()).toEqual('east');
    });

    it('should open in the west of the anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectAlign('west');
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterAnchorCoordinate({x: 300, y: 300, width: 100, height: 100});
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = await appPO.findPopup({cssClass: 'testee'});
      const popupClientRect = await popupPO.getClientRect('cdk-overlay');

      await expect(await popupPO.isDisplayed()).toBe(true);
      await expect(popupClientRect.top + popupClientRect.height / 2).toBeCloseTo(350, 0);
      await expect(popupClientRect.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(300, 0);
      await expect(await popupPO.getAlign()).toEqual('west');
    });
  });

  it('should allow passing a value to the popup component', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.enterPopupInput('TEST INPUT');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.getInput()).toEqual('TEST INPUT');
  });

  it('should allow closing the popup and returning a value to the popup opener', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO('testee');
    await popupPagePO.clickClose({returnValue: 'RETURN VALUE'});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  it('should allow closing the popup with an error', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO('testee');
    await popupPagePO.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  describe('Moving the anchor', () => {
    it('should stick the popup to the HTMLElement anchor when moving the anchor element', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.selectAnchor('element');
      await popupOpenerPagePO.selectAlign('north');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'testee'});

      // capture current popup and anchor location
      const anchorClientRect1 = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect1 = await popupPO.getClientRect();

      // expand a collapsed panel to move the popup anchor downward
      await popupOpenerPagePO.expandSizePanel();

      const anchorClientRect2 = await popupOpenerPagePO.getAnchorElementClientRect();
      const popupClientRect2 = await popupPO.getClientRect();
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
      const popupClientRect3 = await popupPO.getClientRect();

      // assert the popup location
      await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
      await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
    });

    it('should allow repositioning the popup if using a coordinate anchor', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterAnchorCoordinate({x: 150, y: 150, width: 2, height: 0});
      await popupOpenerPagePO.selectAlign('south');
      await popupOpenerPagePO.enterPreferredOverlaySize({width: '100px', height: '100px'});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'testee'});
      const popupClientRect1 = await popupPO.getClientRect('cdk-overlay');
      await expect(popupClientRect1.left + 50).toEqual(150);
      await expect(popupClientRect1.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(150);

      // move the anchor to another position
      await popupOpenerPagePO.enterAnchorCoordinate({x: 200, y: 300, width: 2, height: 0});
      const popupClientRect2 = await popupPO.getClientRect('cdk-overlay');
      await expect(popupClientRect2.left + 50).toEqual(200);
      await expect(popupClientRect2.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(300);

      // move the anchor to another position
      await popupOpenerPagePO.enterAnchorCoordinate({x: 300, y: 400, width: 2, height: 0});
      const popupClientRect3 = await popupPO.getClientRect('cdk-overlay');
      await expect(popupClientRect3.left + 50).toEqual(300);
      await expect(popupClientRect3.top - POPUP_DIAMOND_ANCHOR_SIZE).toEqual(400);
    });
  });

  describe('view context', () => {

    it('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.viewTabPO.activate();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);
    });

    it('should not destroy the popup when its contextual view (if any) is deactivated', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      const componentInstanceId = await popupPagePO.getComponentInstanceId();
      await expect(await popupPagePO.isPresent()).toBe(true);
      await expect(await popupPagePO.isDisplayed()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPagePO.isPresent()).toBe(true);
      await expect(await popupPagePO.isDisplayed()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.viewTabPO.activate();
      await expect(await popupPagePO.isPresent()).toBe(true);
      await expect(await popupPagePO.isDisplayed()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await popupPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    it('should allow binding the popup to any view', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const startPagePO = await appPO.openNewViewTab();

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterViewRef(startPagePO.viewId);
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      // open a popup and bind it to the start page view.
      const popupPO = appPO.findPopup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(false);

      // activate the view to which the popup is bound to
      await startPagePO.viewTabPO.activate();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(false);
    });

    it('should bind the popup to the current view, if opened in the context of a view', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(false);

      // activate the view again
      await popupOpenerPagePO.viewTabPO.activate();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // close the view
      await popupOpenerPagePO.viewTabPO.close();
      await expect(await popupPO.isPresent()).toBe(false);
      await expect(await popupPO.isDisplayed()).toBe(false);
    });

    it('should allow the popup do detach from its contextual view', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterViewRef('<null>');
      await popupOpenerPagePO.selectAnchor('coordinate');
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // activate the view again
      await popupOpenerPagePO.viewTabPO.activate();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);

      // close the view
      await popupOpenerPagePO.viewTabPO.close();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isDisplayed()).toBe(true);
    });
  });

  describe('popup closing', () => {

    it('should close the popup on focus lost', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await popupOpenerPagePO.viewTabPO.activate();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(false);
    });

    it('should not close the popup on focus lost', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await popupOpenerPagePO.viewTabPO.activate();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);
    });

    it('should close the popup on escape keystroke', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await sendKeys(Key.ESCAPE);

      await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(false);
    });

    it('should not close the popup on escape keystroke', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await sendKeys(Key.ESCAPE);

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);
    });
  });

  describe('focus trap', () => {

    it('should automatically focus the first field', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO('testee');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);
    });

    it('should install a focus trap to cycle focus (pressing tab)', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO('testee');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);
    });

    it('should install a focus trap to cycle focus (pressing shift-tab)', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO('testee');
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await popupFocusPagePO.isActiveElement('last-field')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await popupFocusPagePO.isActiveElement('first-field')).toBe(true);
    });

    it('should restore focus after re-activating its contextual view, if any', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.selectPopupComponent('popup-focus-page');
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupFocusPagePO = new PopupFocusPagePO('testee');
      await popupFocusPagePO.clickField('middle-field');
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);
      await expect(await popupFocusPagePO.isPresent()).toBe(true);
      await expect(await popupFocusPagePO.isDisplayed()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupFocusPagePO.isPresent()).toBe(true);
      await expect(await popupFocusPagePO.isDisplayed()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.viewTabPO.activate();
      await expect(await popupFocusPagePO.isPresent()).toBe(true);
      await expect(await popupFocusPagePO.isDisplayed()).toBe(true);
      await expect(await popupFocusPagePO.isActiveElement('middle-field')).toBe(true);
    });
  });
});

