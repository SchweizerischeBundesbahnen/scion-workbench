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
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {HostPopupPagePO} from './page-object/host-popup-page.po';

test.describe('Workbench Popup', () => {

  test.describe('Popup Referrer', () => {

    test('should have a view reference to the contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterCssClass('host-popup');
      await popupOpenerPage.clickOpen();

      const popupPage = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await popupPage.getReferrer()).toEqual({
        viewId: popupOpenerPage.viewId,
        viewCapabilityId: await popupOpenerPage.outlet.getCapabilityId(),
      });
    });

    test('should have a view reference to the specified contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      const startPage = await appPO.openNewViewTab();
      const startPageViewId = startPage.viewId!;

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterContextualViewId(startPageViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('host-popup');
      await popupOpenerPage.clickOpen();

      await startPage.view!.viewTab.click();

      const popupPage = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await popupPage.getReferrer()).toEqual({
        viewId: startPageViewId,
      });
    });

    test('should have a view reference to the specified contextual view and capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      const microfrontendViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const microfrontendViewId = microfrontendViewPage.viewId!;

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterContextualViewId(microfrontendViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('host-popup');
      await popupOpenerPage.clickOpen();

      await microfrontendViewPage.view!.viewTab.click();

      const popupPage = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await popupPage.getReferrer()).toEqual({
        viewId: microfrontendViewId,
        viewCapabilityId: await microfrontendViewPage.outlet.getCapabilityId(),
      });
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      // register intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'popup', qualifier: {component: 'host-popup'}});

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'host-popup'});
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.enterCssClass('host-popup');
      await popupOpenerPage.clickOpen();

      const popupPage = new HostPopupPagePO(appPO, 'host-popup');
      await expect(await popupPage.getReferrer()).toEqual({});
    });
  });
});
