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

test.describe('Workbench Host Popup', () => {

  test('should allow opening a popup contributed by the host app', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

    // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

    // Open the popup.
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
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

    // Expand a collapsed panel to move the popup anchor downward.
    await popupOpenerPage.expandAnchorPanel();
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

    // Collapse the panel to move the popup anchor upward.
    await popupOpenerPage.collapseAnchorPanel();
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
  });

  test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

    // Open the popup.
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

    const view = popupOpenerPage.view.locator;
    await expectPopup(popupPage).toHavePosition('south', view, {top: 150, left: 150});

    // Move the anchor to another position.
    await popupOpenerPage.enterPosition({left: 200, top: 300});
    await expectPopup(popupPage).toHavePosition('south', view, {left: 200, top: 300});

    // Move the anchor to another position.
    await popupOpenerPage.enterPosition({left: 300, top: 400});
    await expectPopup(popupPage).toHavePosition('south', view, {left: 300, top: 400});
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      await expectPopup(popupPage).toBeVisible();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Close the view.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
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

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // Expect the popup of this app to display.
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

    test('should pass params to the popup component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterParams({param: 'PARAM'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // Expect values to be contained in popup params.
      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({param: 'PARAM'}));
    });

    test('should substitute named URL params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterParams({param: 'PARAM'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      // Expect named params to be substituted.
      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getPopupParams()).toEqual(expect.objectContaining({param: 'PARAM'}));
      await expect.poll(() => popupPage.getRouteParams()).toEqual({matrixParam: 'PARAM'});
    });
  });
});
