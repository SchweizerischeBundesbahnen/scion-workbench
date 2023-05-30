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
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({
        viewId: popupOpenerPagePO.viewId,
        viewCapabilityId: await popupOpenerPagePO.outlet.getCapabilityId(),
      });
    });

    test('should have a view reference to the specified contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const startPagePO = await appPO.openNewViewTab();
      const startPageViewId = startPagePO.viewId!;

      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterContextualViewId(startPageViewId);
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      await startPagePO.view!.viewTab.click();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({
        viewId: startPageViewId,
      });
    });

    test('should have a view reference to the specified contextual view and capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const microfrontendPO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const microfrontendViewId = microfrontendPO.viewId!;

      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterContextualViewId(microfrontendViewId);
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      await microfrontendPO.view!.viewTab.click();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({
        viewId: microfrontendViewId,
        viewCapabilityId: await microfrontendPO.outlet.getCapabilityId(),
      });
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterContextualViewId('<null>');
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({});
    });
  });
});
