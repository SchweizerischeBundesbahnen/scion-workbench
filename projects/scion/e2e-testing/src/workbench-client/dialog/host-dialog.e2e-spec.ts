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
import {expectDialog} from '../../matcher/dialog-matcher';
import {HostDialogPagePO} from '../page-object/host-dialog-page.po';
import {HostFocusTestPagePO} from '../../workbench/page-object/test-pages/host-focus-test-page.po';

test.describe('Workbench Host Dialog', () => {

  test('should open a dialog contributed by the host app', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Expect dialog page to be displayed.
    await expectDialog(dialogPage).toBeVisible();
  });

  test('should apply dialog defaults', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Expect dialog page to be displayed.
    await expectDialog(dialogPage).toBeVisible();

    // Expect the close button to be visible.
    await expect(dialog.closeButton).toBeVisible();
    // Expect the dialog to be resizable.
    await expect(dialog.resizeHandles).toHaveCount(8);
    // Expect padding.
    await expect(async () => {
      const dialogBorder = 2 * await dialog.getDialogBorderWidth();
      const pageSize = await dialogPage.getBoundingBox();
      const dialogSize = await dialog.getDialogBoundingBox();
      expect(pageSize.width).toBeLessThan(dialogSize.width - dialogBorder);
    }).toPass();
  });

  test('should apply capability properties', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'custom-properties'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog', variant: 'custom-properties'}, {cssClass: 'testee', params: {id: '123'}});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Assert non-default property values of capability defined in workbench.manifest.ts
    // Expect title to be set.
    await expect(dialog.title).toHaveText('Workbench Host Dialog 123');
    // Expect the close button not to be visible.
    await expect(dialog.closeButton).not.toBeVisible();
    // Expect the dialog not to be resizable.
    await expect(dialog.resizeHandles).toHaveCount(0);
    // Expect size to be set.
    await expect.poll(() => dialog.getComputedStyle()).toMatchObject({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
      width: '500px',
      minWidth: '495px',
      maxWidth: '505px',
    } satisfies Partial<CSSStyleDeclaration>);
    // Expect no padding.
    await expect(async () => {
      const dialogBorder = 2 * await dialog.getDialogBorderWidth();
      const pageSize = await dialogPage.getBoundingBox();
      const dialogSize = await dialog.getDialogBoundingBox();
      expect(pageSize.width).toEqual(dialogSize.width - dialogBorder);
    }).toPass();
  });

  test('should focus first focusable element', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'focus-page'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog', variant: 'focus-page'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const focusTestPage = new HostFocusTestPagePO(dialog);

    await expect(focusTestPage.firstField).toBeFocused();
  });

  test('should pass params to the dialog component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog'}, {params: {param: '123'}, cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Expect dialog page to be displayed and value of param is passed.
    await expect.poll(() => dialogPage.getDialogParams()).toEqual({param: '123'});
    // Expect matrix parameter to be substituted.
    await expect.poll(() => dialogPage.getRouteParams()).toEqual({matrixParam: '123'});
  });

  test('should update title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Update title from handle.
    await dialogPage.enterTitle('TITLE');

    // Expect title to be set.
    await expect(dialog.title).toHaveText('TITLE');
  });

  test('should close the dialog with a result', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Close the dialog.
    await dialogPage.close({returnValue: 'SUCCESS'});

    // Expect result to be returned.
    await expect(dialogOpenerPage.returnValue).toHaveText('SUCCESS');
  });

  test('should close the dialog with an error', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'host-dialog'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);

    // Close the dialog.
    await dialogPage.close({returnValue: 'ERROR', closeWithError: true});

    // Expect error to be returned.
    await expect(dialogOpenerPage.error).toHaveText('ERROR');
  });
});
