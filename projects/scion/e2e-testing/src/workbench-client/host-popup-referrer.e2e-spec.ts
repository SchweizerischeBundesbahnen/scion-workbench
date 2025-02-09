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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {HostPopupPagePO} from './page-object/host-popup-page.po';

test.describe('Workbench Host Popup', () => {

  test.describe('Popup Referrer', () => {

    test('should have a view reference to the contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getReferrer()).toEqual({
        viewId: await popupOpenerPage.view.getViewId(),
        viewCapabilityId: await popupOpenerPage.outlet.getCapabilityId(),
      });
    });

    test('should have a view reference to the specified contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      const startPage = await appPO.openNewViewTab();
      const startPageViewId = await startPage.view.getViewId();

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterContextualViewId(startPageViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open({waitUntilAttached: false});

      await startPage.view.tab.click();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getReferrer()).toEqual({viewId: startPageViewId});
    });

    test('should have a view reference to the specified contextual view and capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      const microfrontendViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const microfrontendViewId = await microfrontendViewPage.view.getViewId();

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterContextualViewId(microfrontendViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open({waitUntilAttached: false});

      await microfrontendViewPage.view.tab.click();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getReferrer()).toEqual({
        viewId: microfrontendViewId,
        viewCapabilityId: await microfrontendViewPage.outlet.getCapabilityId(),
      });
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new HostPopupPagePO(popup);

      await expect.poll(() => popupPage.getReferrer()).toEqual({});
    });
  });
});
