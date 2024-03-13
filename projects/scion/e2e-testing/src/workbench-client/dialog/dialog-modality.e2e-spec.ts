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
import {test} from '../../fixtures';
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {DialogPagePO} from '../page-object/dialog-page.po';
import {expectDialog} from '../../matcher/dialog-matcher';

test.describe('Workbench Dialog Modality', () => {

  test('should, by default and if in the context of a view, open a view-modal dialog', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect microfrontend content to be displayed.
    await expectDialog(dialogPage).toBeVisible();

    // Expect glass pane for the current view.
    await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
      await dialogOpenerPage.view.getBoundingBox(), // workbench view
      await dialogOpenerPage.outlet.locator.boundingBox(), // projected router outlet
    ]));
  });

  test('should hide dialog if view is inactive', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect microfrontend content to be displayed.
    await expectDialog(dialogPage).toBeVisible();

    // Open and activate another view.
    await appPO.openNewViewTab();

    // Expect outlet and iframe of the microfrontend dialog to be hidden but attached to the DOM.
    await expectDialog(dialogPage).toBeHidden();

    // Activate view of the dialog.
    await dialogOpenerPage.view.tab.click();

    // Expect microfrontend content to be displayed.
    await expectDialog(dialogPage).toBeVisible();
  });

  test('should open an application-modal dialog if in the context of a view and application-modality selected', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'application'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect microfrontend content to be displayed.
    await expectDialog(dialogPage).toBeVisible();

    // Expect glass panes.
    await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
      await appPO.workbenchBoundingBox(), // workbench
      await dialogOpenerPage.view.getBoundingBox(), // workbench view
      await dialogOpenerPage.outlet.locator.boundingBox(), // projected router outlet
    ]));
  });

  test('should open dialog in any view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    const view1 = (await appPO.openNewViewTab()).view;

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'view', context: {viewId: await view1.getViewId()}});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect dialog not to be displayed yet.
    await expectDialog(dialogPage).toBeHidden();

    // Activate view 1.
    await view1.tab.click();

    // Expect microfrontend content to be displayed.
    await expectDialog(dialogPage).toBeVisible();

    // Expect glass pane for view 1.
    await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await view1.getBoundingBox()]));
  });
});
