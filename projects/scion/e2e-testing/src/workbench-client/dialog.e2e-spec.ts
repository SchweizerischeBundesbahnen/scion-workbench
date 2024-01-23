/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {FocusTestPagePO} from '../workbench/page-object/test-pages/focus-test-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {DialogOpenerPagePO} from '../workbench/page-object/dialog-opener-page.po';

test.describe('Workbench Dialog', () => {

  test.describe('Blocking', () => {

    test('should block interaction with contextual microfrontend view', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open microfrontend view.
      const inputFieldTestPage = await InputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', modality: 'view', contextualViewId: await inputFieldTestPage.view.getViewId()});
      await dialogOpenerPage.viewTab.close();

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogRect = await dialog.getDialogBoundingBox();

      // Move the dialog to the bottom right corner.
      await dialog.moveDialog({x: appPO.viewportBoundingBox().right - dialogRect.right, y: appPO.viewportBoundingBox().bottom - dialogRect.bottom});

      // Expect interaction with contextual view to be blocked.
      await expect(inputFieldTestPage.clickInputField({timeout: 1000})).rejects.toThrowError();
      await expect(new FocusTestPagePO(dialog).firstField).toBeFocused();

      // Expect glass panes
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await inputFieldTestPage.view.getBoundingBox(), // workbench view
        await inputFieldTestPage.outlet.locator.boundingBox(), // projected router outlet
      ]));
    });
  });
});
