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
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Workbench Popup', () => {

  test('should allow opening a popup contributed by the host app', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    const popup = await appPO.popup({cssClass: 'testee'});
    await expect(await popup.isVisible()).toBe(true);
  });

  test('should allow closing the popup and returning a value to the popup opener', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
    await hostPopupPage.clickClose({returnValue: 'RETURN VALUE'});
    await expect(await popupOpenerPage.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  test('should allow closing the popup with an error', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
    await hostPopupPage.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPage.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  test('should stick the popup to the HTMLElement anchor when moving the anchor element', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.selectAlign('north');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
    await hostPopupPage.enterComponentSize({height: '100px', width: '100px'});

    const popup = appPO.popup({cssClass: 'testee'});

    // capture current popup and anchor location
    const anchorClientRect1 = await popupOpenerPage.getAnchorElementClientRect();
    const popupClientRect1 = await popup.getBoundingBox();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPage.expandAnchorPanel();

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
    await popupOpenerPage.collapseAnchorPanel();
    const popupClientRect3 = await popup.getBoundingBox();

    // assert the popup location
    await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
    await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
  });

  test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'host-popup'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterPosition({top: 150, left: 150});
    await popupOpenerPage.selectAlign('south');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.clickOpen();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
    await hostPopupPage.enterComponentSize({height: '100px', width: '100px'});

    const popup = appPO.popup({cssClass: 'testee'});

    // capture current popup and anchor location
    const popupClientRectInitial = await popup.getBoundingBox();

    // move the anachor
    await popupOpenerPage.enterPosition({top: 300, left: 200});

    // assert the popup location
    await expect(await popup.getBoundingBox()).toEqual(expect.objectContaining({
      left: popupClientRectInitial.left + 50,
      top: popupClientRectInitial.top + 150,
    }));

    // move the anchor to its initial position
    await popupOpenerPage.enterPosition({top: 150, left: 150});

    // assert the popup location
    await expect(await popup.getBoundingBox()).toEqual(popupClientRectInitial);
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
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

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      const componentInstanceId = await hostPopupPage.getComponentInstanceId();
      await expect(await hostPopupPage.isPresent()).toBe(true);
      await expect(await hostPopupPage.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await hostPopupPage.isPresent()).toBe(true);
      await expect(await hostPopupPage.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPage.view.viewTab.click();
      await expect(await hostPopupPage.isPresent()).toBe(true);
      await expect(await hostPopupPage.isVisible()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await hostPopupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
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

      // popup should be closed when view is closed
      await popup.waitUntilClosed();

      await expect(await popup.isPresent()).toBe(false);
      await expect(await popup.isVisible()).toBe(false);
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);

      await popupOpenerPage.view.viewTab.click();

      // popup should be closed on focus loss
      await hostPopupPage.popup.waitUntilClosed();

      await expect(await hostPopupPage.popup.isPresent()).toBe(false);
      await expect(await hostPopupPage.popup.isVisible()).toBe(false);
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);

      await popupOpenerPage.view.viewTab.click();

      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);
    });

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      // popup should be closed on escape keystroke
      await hostPopupPage.popup.waitUntilClosed();

      await expect(await hostPopupPage.popup.isPresent()).toBe(false);
      await expect(await hostPopupPage.popup.isVisible()).toBe(false);

      // open the popup
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);

      await hostPopupPage.enterReturnValue('explicitly request the focus');
      await page.keyboard.press('Escape');

      await expect(await hostPopupPage.popup.isPresent()).toBe(false);
      await expect(await hostPopupPage.popup.isVisible()).toBe(false);
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      await expect(await hostPopupPage.popup.isPresent()).toBe(true);
      await expect(await hostPopupPage.popup.isVisible()).toBe(true);
    });

    test('should provide the popup\'s capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      // expect the popup of this app to display
      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.getPopupCapability()).toEqual(expect.objectContaining({
        qualifier: {component: 'host-popup'},
        type: 'popup',
        properties: expect.objectContaining({
          path: 'test-host-popup;matrixParam1=:param1;matrixParam2=:component',
        }),
      }));
    });

    test('should allow passing a value to the popup component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterParams({param1: 'PARAM1'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      // expect values to be contained in popup params
      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.getPopupParams()).toEqual(expect.objectContaining({param1: 'PARAM1'}));
    });

    test('should contain the qualifier in popup params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      // expect qualifier to be contained in popup params
      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.getPopupParams()).toEqual(expect.objectContaining({component: 'host-popup'}));
    });

    test('should substitute named URL params with values of the qualifier and params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterParams({param1: 'PARAM1'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      // expect named params to be substituted
      const hostPopupPage = new HostPopupPagePO(appPO, 'testee');
      await expect(await hostPopupPage.getPopupParams()).toEqual(expect.objectContaining({component: 'host-popup', param1: 'PARAM1'}));
      await expect(await hostPopupPage.getRouteParams()).toEqual({matrixParam1: 'PARAM1', matrixParam2: 'host-popup'});
    });
  });
});
