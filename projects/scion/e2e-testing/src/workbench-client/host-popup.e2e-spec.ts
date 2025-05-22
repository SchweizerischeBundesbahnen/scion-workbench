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
import {HostPopupPagePO} from './page-object/host-popup-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {waitUntilBoundingBoxStable} from '../helper/testing.util';
import {POPUP_DIAMOND_ANCHOR_SIZE} from '../workbench/workbench-layout-constants';

test.describe('Workbench Host Popup', () => {

  test('should allow opening a popup contributed by the host app', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new HostPopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
  });

  test.describe('popup result', () => {
    test('should allow closing the popup and returning a value to the popup opener', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await popupPage.close({returnValue: 'RETURN VALUE'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should allow closing the popup with an error', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await popupPage.close({returnValue: 'ERROR', closeWithError: true});
      await expect(popupOpenerPage.error).toHaveText('ERROR');
    });

    test('should allow returning value on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await popupOpenerPage.view.tab.click();
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should return only the latest result value on close', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE 1', {apply: true});

      await popupPage.close({returnValue: 'RETURN VALUE 2'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE 2');
    });

    test('should not return value on escape keystroke', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await page.keyboard.press('Escape');
      await expect(popupOpenerPage.returnValue).not.toBeAttached();
    });
  });

  test('should stick to the popup anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.selectAlign('north');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new HostPopupPagePO(popup);

    await popupPage.enterComponentSize({height: '100px', width: '100px'});

    // Wait until popup is positioned and sized.
    await waitUntilBoundingBoxStable(popup.locator);

    // capture current popup and anchor location
    const anchorBoxInitial = await popupOpenerPage.getAnchorElementBoundingBox();
    const popupBoundsInitial = await popup.getBoundingBox();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPage.expandAnchorPanel();
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
    await popupOpenerPage.collapseAnchorPanel();
    await expect(async () => {
      const popupBounds = await popup.getBoundingBox();

      // assert the popup location
      expect(popupBounds.top).toEqual(popupBoundsInitial.top);
      expect(popupBounds.left).toEqual(popupBoundsInitial.left);
    }).toPass();
  });

  test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterPosition({top: 150, left: 150});
    await popupOpenerPage.selectAlign('south');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new HostPopupPagePO(popup);

    await popupPage.enterComponentSize({height: '100px', width: '100px'});

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

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // re-activate the view
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);
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

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

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
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).not.toBeAttached();

      // open the popup
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      await expectPopup(popupPage).toBeVisible();

      await popupPage.enterReturnValue('explicitly request the focus');
      await page.keyboard.press('Escape');
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).toBeVisible();
    });

    test('should provide the popup\'s capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // expect the popup of this app to display
      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getPopupCapability()).toEqual(expect.objectContaining({
        qualifier: {component: 'host-popup'},
        type: 'popup',
        properties: expect.objectContaining({
          path: 'test-host-popup;matrixParam=:param',
        }),
      }));
    });

    test('should allow passing a value to the popup component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterParams({param: 'PARAM'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // expect values to be contained in popup params
      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({param: 'PARAM'}));
    });

    test('should contain the qualifier in popup params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // expect qualifier to be contained in popup params
      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({component: 'host-popup'}));
    });

    test('should substitute named URL params with values of the qualifier and params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterParams({param: 'PARAM'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // expect named params to be substituted
      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({component: 'host-popup', param: 'PARAM'}));
      await expect.poll(() => popupPage.getRouteParams()).toEqual({matrixParam: 'PARAM'});
    });
  });
});
