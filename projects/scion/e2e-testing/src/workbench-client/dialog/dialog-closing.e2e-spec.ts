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
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {DialogPagePO} from '../page-object/dialog-page.po';
import {expectDialog} from '../../matcher/dialog-matcher';
import {expect} from '@playwright/test';

test.describe('Workbench Dialog Closing', () => {

  test('should by default open closable dialog', async ({appPO, microfrontendNavigator}) => {
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

    // Expect the close button to be visible.
    await expect(dialog.closeButton).toBeVisible();
  });

  test('should not display close button if `closable` is `false`', async ({appPO, microfrontendNavigator}) => {
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
        closable: false,
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});

    // Expect the close button not to be visible.
    await expect(dialog.closeButton).not.toBeVisible();
  });

  test('should close the dialog on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
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

    await dialogPage.waitForFocusIn();

    // Retry pressing Escape keystroke since the installation of the escape keystroke may take some time.
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expectDialog(dialogPage).not.toBeAttached();
    }).toPass();
  });

  test('should close the dialog with an error', async ({appPO, microfrontendNavigator}) => {
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

    // Close the dialog.
    await dialogPage.close({returnValue: 'ERROR', closeWithError: true});

    // Expect error to be returned.
    await expect(dialogOpenerPage.error).toHaveText('ERROR');
  });
});
