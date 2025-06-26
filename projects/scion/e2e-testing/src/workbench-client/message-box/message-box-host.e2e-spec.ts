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
import {HostMessageBoxPagePO} from '../page-object/host-message-box-page.po';
import {expectMessageBox} from '../../matcher/message-box-matcher';
import {expect} from '@playwright/test';

test.describe('Workbench Message Box Host', () => {

  test('should provide the capability and pass it to the provider', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register message box capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox'}});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'host-messagebox'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new HostMessageBoxPagePO(messageBox);

    await expectMessageBox(messageBoxPage).toBeVisible();

    // Expect capability to resolve to the microfrontend message box and to be set in the handle.
    await expect.poll(() => messageBoxPage.getMessageBoxCapability()).toEqual(expect.objectContaining({
      qualifier: {
        component: 'host-messagebox',
      },
      properties: {
        path: 'test-host-message-box;matrixParam=:param',
      },
    }));
  });

  test('should pass params to the capability provider', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register message box capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox'}});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'host-messagebox'}, {cssClass: 'testee', params: {param: '123'}});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new HostMessageBoxPagePO(messageBox);

    // Expect message box page to be displayed and value of param is passed.
    await expect.poll(() => messageBoxPage.getMessageBoxParams()).toEqual({param: '123'});
    // Expect matrix parameter to be substituted.
    await expect.poll(() => messageBoxPage.getRouteParams()).toEqual({matrixParam: '123'});
  });

  test('should size the message box as configured in the capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register message box capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox', variant: 'explicit-size'}});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'host-messagebox', variant: 'explicit-size'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new HostMessageBoxPagePO(messageBox);

    // Expect the message box page to display with the defined size.
    await expect.poll(() => messageBoxPage.getBoundingBox()).toEqual(expect.objectContaining({
      height: 500,
      width: 350,
    }));

    await expect.poll(() => messageBoxPage.getComputedStyle()).toEqual(expect.objectContaining({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
      width: '350px',
      minWidth: '345px',
      maxWidth: '355px',
    } satisfies Partial<CSSStyleDeclaration>));
  });

  test('should adapt message box size if content grows or shrinks', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register message box capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox'}});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open({component: 'host-messagebox'}, {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new HostMessageBoxPagePO(messageBox);

    // Make component larger.
    await messageBoxPage.enterComponentSize({width: '350px', height: '350px'});

    // Expect the message box page to grow to the defined style.
    await expect.poll(() => messageBoxPage.getBoundingBox()).toEqual(expect.objectContaining({
      height: 350,
      width: 350,
    }));

    // Make component smaller.
    await messageBoxPage.enterComponentSize({width: '250px', height: '250px'});

    // Expect the message box page to shrink to the defined style.
    await expect.poll(() => messageBoxPage.getBoundingBox()).toEqual(expect.objectContaining({
      height: 250,
      width: 250,
    }));
  });
});
