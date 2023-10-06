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
import {PopupPagePO} from './page-object/popup-page.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench Popup', () => {

  test.describe('Popup Referrer', () => {

    test('should have a view reference to the contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({
        viewId: popupOpenerPage.viewId,
        viewCapabilityId: await popupOpenerPage.outlet.getCapabilityId(),
      });
    });

    test('should have a view reference to the specified contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const startPage = await appPO.openNewViewTab();
      const startPageViewId = startPage.viewId!;

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterContextualViewId(startPageViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      await startPage.view!.viewTab.click();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({
        viewId: startPageViewId,
      });
    });

    test('should have a view reference to the specified contextual view and capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const microfrontendPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const microfrontendViewId = microfrontendPage.viewId!;

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterContextualViewId(microfrontendViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      await microfrontendPage.view!.viewTab.click();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({
        viewId: microfrontendViewId,
        viewCapabilityId: await microfrontendPage.outlet.getCapabilityId(),
      });
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({});
    });
  });
});
