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

test.describe('Workbench Dialog Title', () => {

  test('should set title from capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        title: 'TITLE',
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

    // Expect title to be set.
    await expect(dialog.title).toHaveText('TITLE');
  });

  test('should substitute parameter in title from capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-dialog',
        title: 'TITLE :id',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', params: {id: '123'}});

    const dialog = appPO.dialog({cssClass: 'testee'});

    // Expect title to be set and placeholder to be substituted.
    await expect(dialog.title).toHaveText('TITLE 123');
  });

  test('should update title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        title: 'TITLE',
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

    // Expect title to be set.
    await expect(dialog.title).toHaveText('TITLE');

    // Update title from handle.
    await dialogPage.enterTitle('TITLE 2');

    // Expect title to be updated.
    await expect(dialog.title).toHaveText('TITLE 2');
  });
});
