/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {consumeBrowserLog, sendKeys} from '../helper/testing.util';
import {Key} from 'protractor';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {HostPopupPagePO} from './page-object/host-popup-page.po';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';

describe('Workbench Popup', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should allow opening a popup contributed by the host app', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.clickOpen();

    const popupPO = await appPO.findPopup({cssClass: 'host-popup'});
    await expect(await popupPO.isDisplayed()).toBe(true);
  });

  it('should allow closing the popup and returning a value to the popup opener', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new HostPopupPagePO('host-popup');
    await popupPagePO.clickClose({returnValue: 'RETURN VALUE'});
    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  it('should allow closing the popup with an error', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new HostPopupPagePO('host-popup');
    await popupPagePO.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  it('should stick the popup to the HTMLElement anchor when moving the anchor element', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.selectAlign('north');
    await popupOpenerPagePO.clickOpen();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    await new HostPopupPagePO('host-popup').enterComponentSize({height: '100px', width: '100px'});

    const popupPO = appPO.findPopup({cssClass: 'host-popup'});

    // capture current popup and anchor location
    const anchorClientRect1 = await popupOpenerPagePO.getAnchorElementClientRect();
    const popupClientRect1 = await popupPO.getClientRect();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPagePO.expandAnchorPanel();

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
    await popupOpenerPagePO.collapseAnchorPanel();
    const popupClientRect3 = await popupPO.getClientRect();

    // assert the popup location
    await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
    await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
  });

  it('should allow repositioning the popup if using a coordinate anchor', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // Also consider merging this specs with popup.e2e-spec.ts.
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    // register intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

    // open the popup
    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
    await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.selectAnchor('coordinate');
    await popupOpenerPagePO.enterAnchorCoordinate({x: 150, y: 150, width: 2, height: 0});
    await popupOpenerPagePO.selectAlign('south');
    await popupOpenerPagePO.clickOpen();

    // TODO [#271]: Specify the preferred size via popup capability when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271
    await new HostPopupPagePO('host-popup').enterComponentSize({height: '100px', width: '100px'});

    const popupPO = appPO.findPopup({cssClass: 'host-popup'});

    // capture current popup and anchor location
    const popupClientRectInitial = await popupPO.getClientRect();

    // move the anachor
    await popupOpenerPagePO.enterAnchorCoordinate({x: 200, y: 300, width: 2, height: 0});

    // assert the popup location
    await expect(await popupPO.getClientRect()).toEqual(jasmine.objectContaining({
      left: popupClientRectInitial.left + 50,
      top: popupClientRectInitial.top + 150,
    }));

    // move the anchor to its initial position
    await popupOpenerPagePO.enterAnchorCoordinate({x: 150, y: 150, width: 2, height: 0});

    // assert the popup location
    await expect(await popupPO.getClientRect()).toEqual(popupClientRectInitial);
  });

  describe('view context', () => {

    it('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'host-popup'});
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
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new HostPopupPagePO('host-popup');
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

    it('should bind the popup to the current view, if opened in the context of a view', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.findPopup({cssClass: 'host-popup'});
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
  });

  describe('popup closing', () => {

    it('should close the popup on focus lost ', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await popupOpenerPagePO.viewTabPO.activate();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(false);
    });

    it('should not close the popup on focus lost ', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await popupOpenerPagePO.viewTabPO.activate();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);
    });

    it('should close the popup on escape keystroke ', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.clickOpen();

      const popupPage1PO = new HostPopupPagePO('host-popup');
      await expect(await popupPage1PO.popupPO.isPresent()).toBe(true);
      await expect(await popupPage1PO.popupPO.isDisplayed()).toBe(true);

      await sendKeys(Key.ESCAPE);

      await expect(await popupPage1PO.popupPO.isPresent()).toBe(false);
      await expect(await popupPage1PO.popupPO.isDisplayed()).toBe(false);

      // open the popup
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.clickOpen();

      const popupPage2PO = new HostPopupPagePO('host-popup');
      await expect(await popupPage2PO.popupPO.isPresent()).toBe(true);
      await expect(await popupPage2PO.popupPO.isDisplayed()).toBe(true);

      await popupPage2PO.enterReturnValue('explicitly request the focus');
      await sendKeys(Key.ESCAPE);

      await expect(await popupPage2PO.popupPO.isPresent()).toBe(false);
      await expect(await popupPage2PO.popupPO.isDisplayed()).toBe(false);
    });

    it('should not close the popup on escape keystroke ', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);

      await sendKeys(Key.ESCAPE);

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isDisplayed()).toBe(true);
    });

    it('should provide the popup\'s capability', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.clickOpen();

      // expect the popup of this app to display
      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.getPopupCapability()).toEqual(jasmine.objectContaining({
        qualifier: {component: 'host-popup'},
        type: 'popup',
        properties: jasmine.objectContaining({
          path: 'host-popup;matrixParam1=:param1;matrixParam2=:component',
          cssClass: 'host-popup',
        }),
      }));
    });

    it('should allow passing a value to the popup component', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterParams({param1: 'PARAM1'});
      await popupOpenerPagePO.clickOpen();

      // expect values to be contained in popup params
      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({param1: 'PARAM1'}));
    });

    it('should contain the qualifier in popup params', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.clickOpen();

      // expect qualifier to be contained in popup params
      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({component: 'host-popup'}));
    });

    it('should substitute named URL params with values of the qualifier and params', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // Also consider merging this specs with popup.e2e-spec.ts.
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      // open the popup
      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab('app1');
      await popupOpenerPagePO.enterQualifier({component: 'host-popup'});
      await popupOpenerPagePO.enterParams({param1: 'PARAM1'});
      await popupOpenerPagePO.clickOpen();

      // expect named params to be substituted
      const popupPagePO = new HostPopupPagePO('host-popup');
      await expect(await popupPagePO.getPopupParams()).toEqual(jasmine.objectContaining({component: 'host-popup', param1: 'PARAM1'}));
      await expect(await popupPagePO.getRouteParams()).toEqual({matrixParam1: 'PARAM1', matrixParam2: 'host-popup'});
    });
  });
});
