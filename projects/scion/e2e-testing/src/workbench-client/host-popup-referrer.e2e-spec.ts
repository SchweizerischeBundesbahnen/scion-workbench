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
import {PopupPagePO} from '../workbench/page-object/popup-page.po';

test.describe('Workbench Host Popup', () => {

  test.describe('Popup Referrer', () => {

    test('should have a view reference to the contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention to open popup from host app.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      // Open popup from host app.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expect.poll(() => popupPage.activatedMicrofrontend.getPopupLegacyReferrer()).toEqual({
        viewId: await popupOpenerPage.view.getViewId(),
        viewCapabilityId: await popupOpenerPage.outlet.getCapabilityId(),
      });

      await expect.poll(() => popupPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
    });

    test('should have a view reference to the specified contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention to open popup from host app.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      const startPage = await appPO.openNewViewTab();
      const startPageViewId = await startPage.view.getViewId();

      // Open popup from host app.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        context: startPageViewId,
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      await startPage.view.tab.click();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expect.poll(() => popupPage.activatedMicrofrontend.getPopupLegacyReferrer()).toEqual({viewId: startPageViewId});
      await expect.poll(() => popupPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
    });

    test('should have a view reference to the specified contextual view and capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention to open popup from host app.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      const microfrontendViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const microfrontendViewId = await microfrontendViewPage.view.getViewId();

      // Open popup from host app.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        context: microfrontendViewId,
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      await microfrontendViewPage.view.tab.click();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expect.poll(() => popupPage.activatedMicrofrontend.getPopupLegacyReferrer()).toEqual({
        viewId: microfrontendViewId,
        viewCapabilityId: await microfrontendViewPage.outlet.getCapabilityId(),
      });
      await expect.poll(() => popupPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention to open popup from host app.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      // Open popup from host app.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        context: null,
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expect.poll(() => popupPage.activatedMicrofrontend.getPopupLegacyReferrer()).toEqual({});
      await expect.poll(() => popupPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
    });
  });
});
