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

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({viewId: popupOpenerPage.viewId});
    });

    test('should have a view reference to the specified contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const startPage = await appPO.openNewViewTab();
      const startPageViewId = startPage.viewId!;

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterContextualViewId(startPageViewId);
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      await startPage.view!.viewTab.click();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({viewId: startPageViewId});
    });

    test('should not have a view reference if opened outside of a contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.getReferrer()).toEqual({});
    });
  });
});
