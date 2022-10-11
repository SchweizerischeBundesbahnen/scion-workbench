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

test.describe('Workbench Popup', () => {

  test.describe('Popup Referrer', () => {

    test('should have a view reference to the contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({viewId: popupOpenerPagePO.viewId});
    });

    test('should have a view reference to the specified contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const startPagePO = await appPO.openNewViewTab();
      const startPageViewId = startPagePO.viewId!;

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterContextualViewId(startPageViewId);
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.clickOpen();

      await startPagePO.view!.viewTab.click();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({viewId: startPageViewId});
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterContextualViewId('<null>');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await expect(await popupPagePO.getReferrer()).toEqual({});
    });
  });
});
