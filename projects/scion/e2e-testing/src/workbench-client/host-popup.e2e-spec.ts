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
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.clickOpen();

    const popupPO = await appPO.popup({cssClass: 'host-popup'});
    await expect(await popupPO.isVisible()).toBe(true);
  });

  test('should allow closing the popup and returning a value to the popup opener', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.clickOpen();

    const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
    await hostPopupPagePO.clickClose({returnValue: 'RETURN VALUE'});
    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  test('should allow closing the popup with an error', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.clickOpen();

    const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
    await hostPopupPagePO.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  test('should stick the popup to the HTMLElement anchor when moving the anchor element', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.selectAlign('north');
    await popupOpenerPagePO.clickOpen();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
    await hostPopupPagePO.enterComponentSize({height: '100px', width: '100px'});

    const popupPO = appPO.popup({cssClass: 'host-popup'});

    // capture current popup and anchor location
    const anchorClientRect1 = await popupOpenerPagePO.getAnchorElementClientRect();
    const popupClientRect1 = await popupPO.getBoundingBox();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPagePO.expandAnchorPanel();

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
    await popupOpenerPagePO.collapseAnchorPanel();
    const popupClientRect3 = await popupPO.getBoundingBox();

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
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.enterPosition({top: 150, left: 150});
    await popupOpenerPagePO.selectAlign('south');
    await popupOpenerPagePO.clickOpen();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
    await hostPopupPagePO.enterComponentSize({height: '100px', width: '100px'});

    const popupPO = appPO.popup({cssClass: 'host-popup'});

    // capture current popup and anchor location
    const popupClientRectInitial = await popupPO.getBoundingBox();

    // move the anachor
    await popupOpenerPagePO.enterPosition({top: 300, left: 200});

    // assert the popup location
    await expect(await popupPO.getBoundingBox()).toEqual(expect.objectContaining({
      left: popupClientRectInitial.left + 50,
      top: popupClientRectInitial.top + 150,
    }));

    // move the anchor to its initial position
    await popupOpenerPagePO.enterPosition({top: 150, left: 150});

    // assert the popup location
    await expect(await popupPO.getBoundingBox()).toEqual(popupClientRectInitial);
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'host-popup'});
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

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      const componentInstanceId = await hostPopupPagePO.getComponentInstanceId();
      await expect(await hostPopupPagePO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await hostPopupPagePO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await hostPopupPagePO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.isVisible()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await hostPopupPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'host-popup'});
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

      // popup should be closed when view is closed
      await popupPO.waitUntilClosed();

      await expect(await popupPO.isPresent()).toBe(false);
      await expect(await popupPO.isVisible()).toBe(false);
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.clickOpen();

      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);

      await popupOpenerPagePO.view.viewTab.click();

      // popup should be closed on focus loss
      await hostPopupPagePO.popupPO.waitUntilClosed();

      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(false);
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);

      await popupOpenerPagePO.view.viewTab.click();

      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);
    });

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.clickOpen();

      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      // popup should be closed on escape keystroke
      await hostPopupPagePO.popupPO.waitUntilClosed();

      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(false);

      // open the popup
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.clickOpen();

      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);

      await hostPopupPagePO.enterReturnValue('explicitly request the focus');
      await page.keyboard.press('Escape');

      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(false);
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPagePO.clickOpen();

      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);

      await page.keyboard.press('Escape');

      await expect(await hostPopupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await hostPopupPagePO.popupPO.isVisible()).toBe(true);
    });

    test('should provide the popup\'s capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.clickOpen();

      // expect the popup of this app to display
      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.getPopupCapability()).toEqual(expect.objectContaining({
        qualifier: {component: 'host-popup'},
        type: 'popup',
        properties: expect.objectContaining({
          path: 'host-popup;matrixParam1=:param1;matrixParam2=:component',
          cssClass: 'host-popup',
        }),
      }));
    });

    test('should allow passing a value to the popup component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterParams({param1: 'PARAM1'});
      await popupOpenerPagePO.clickOpen();

      // expect values to be contained in popup params
      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.getPopupParams()).toEqual(expect.objectContaining({param1: 'PARAM1'}));
    });

    test('should contain the qualifier in popup params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.clickOpen();

      // expect qualifier to be contained in popup params
      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.getPopupParams()).toEqual(expect.objectContaining({component: 'host-popup'}));
    });

    test('should substitute named URL params with values of the qualifier and params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterParams({param1: 'PARAM1'});
      await popupOpenerPagePO.clickOpen();

      // expect named params to be substituted
      const hostPopupPagePO = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await hostPopupPagePO.getPopupParams()).toEqual(expect.objectContaining({component: 'host-popup', param1: 'PARAM1'}));
      await expect(await hostPopupPagePO.getRouteParams()).toEqual({matrixParam1: 'PARAM1', matrixParam2: 'host-popup'});
    });
  });
});
