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
import {MessageBoxOpenerPagePO} from '../page-object/message-box-opener-page.po';
import {MessageBoxPagePO} from '../../workbench/page-object/message-box-page.po';
import {expectMessageBox} from '../../matcher/message-box-matcher';
import {expect} from '@playwright/test';
import {WorkbenchMessageBoxCapability} from '../page-object/register-workbench-capability-page.po';
import {canMatchWorkbenchMessageBoxCapability} from '../../workbench/page-object/layout-page/register-route-page.po';

test.describe('Workbench Message Box Host', () => {

  test('should open a messagebox contributed by the host app', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageBoxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new MessageBoxPagePO(messageBox);

    await expectMessageBox(messageBoxPage).toBeVisible();

    // Expect capability to be available via `ActivatedMicrofrontend`.
    await expect.poll(() => messageBoxPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {component: 'messagebox', app: 'host'},
      properties: {
        path: '',
      },
    });
  });

  test('should pass params to the messagebox component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host messagebox capability.
    await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
    });

    // Register host messagebox route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})],
    });

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee', params: {param: '123'}});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new MessageBoxPagePO(messageBox);

    // Expect params.
    await expect.poll(() => messageBoxPage.activatedMicrofrontend.getParams()).toEqual({param: '123'});
  });

  test('should size the message box as configured in the capability', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host messagebox capability.
    await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
          width: '350px',
          minWidth: '345px',
          maxWidth: '355px',
        },
      },
    });

    // Register host messagebox route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})],
    });

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new MessageBoxPagePO(messageBox);

    // Expect the message box page to display with the defined size.
    await expect.poll(() => messageBoxPage.messageBox.dialog.getDialogBoundingBox()).toMatchObject({
      height: 500,
      width: 350,
    });

    await expect.poll(() => messageBoxPage.messageBox.dialog.getComputedStyle()).toMatchObject({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
      width: '350px',
      minWidth: expect.anything() as unknown as string, // overwritten with minimal buttons witdth (footer)
      maxWidth: '355px',
    } satisfies Partial<CSSStyleDeclaration>);
  });
});
