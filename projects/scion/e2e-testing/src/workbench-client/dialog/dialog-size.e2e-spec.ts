/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {expect} from '@playwright/test';
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {DialogPagePO} from '../page-object/dialog-page.po';

test.describe('Workbench Dialog Size', () => {

  test('should size the dialog as configured in the dialog capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
          width: '500px',
          minWidth: '495px',
          maxWidth: '505px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});

    await expect.poll(() => dialog.getComputedStyle()).toEqual(expect.objectContaining({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
      width: '500px',
      minWidth: '495px',
      maxWidth: '505px',
    } satisfies Partial<CSSStyleDeclaration>));

    // Expect the dialog to display with the defined size.
    await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
      height: 500,
      width: 500,
    }));
  });

  test('should not adjust dialog size and display scrollbars if embedded content overflows', async ({appPO, microfrontendNavigator}) => {
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

    const dialogBoundingBox = await dialog.getDialogBoundingBox();

    // Expect the dialog content not to overflow.
    await expect(dialogPage.contentScrollbars.vertical).not.toBeVisible();
    await expect(dialogPage.contentScrollbars.horizontal).not.toBeVisible();

    await dialogPage.enterComponentSize({height: '800px', width: '600px'});

    // Expect dialog size not to change.
    await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(dialogBoundingBox);

    // Expect embedded content to overflow and scrollbars from the app-root viewport of the client testing app to be displayed.
    await expect(dialogPage.contentScrollbars.vertical).toBeVisible();
    await expect(dialogPage.contentScrollbars.horizontal).toBeVisible();
  });

  test('should be resizable by default', async ({appPO, microfrontendNavigator}) => {
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

    // Expect the dialog to be resizable.
    await expect(dialog.resizeHandles).toHaveCount(8);
  });

  test('should be non-resizable if configured in the capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        resizable: false,
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

    // Expect the dialog not to be resizable.
    await expect(dialog.resizeHandles).toHaveCount(0);
  });
});
