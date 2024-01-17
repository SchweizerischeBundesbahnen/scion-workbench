/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {expect} from '@playwright/test';
import {InspectMessageBoxComponentPO} from '../inspect-message-box-component.po';

test.describe('Workbench Message Box', () => {

  test('should open a message box with the specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterContent('TEXT');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(messageBox.message).toHaveText('TEXT');
  });

  test('should support new lines in the message text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterContent('LINE 1\\nLINE 2');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(messageBox.message).toHaveText('LINE 1\nLINE 2');
  });

  test('should open a message box with the specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterTitle('TITLE');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(messageBox.title).toHaveText('TITLE');
  });

  test('should support new lines in the message box title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect(messageBox.title).toHaveText('LINE 1\nLINE 2');
  });

  test('should, by default, open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect.poll(() => messageBox.getSeverity()).toEqual('info');
  });

  test('should open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('info');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect.poll(() => messageBox.getSeverity()).toEqual('info');
  });

  test('should open a message box with warn severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('warn');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect.poll(() => messageBox.getSeverity()).toEqual('warn');
  });

  test('should open a message box with error severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('error');
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect.poll(() => messageBox.getSeverity()).toEqual('error');
  });

  test('should display configured actions', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect.poll(() => messageBox.getActions()).toEqual({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });

    // Assert order of action buttons
    await expect.poll(async () => Object.keys(await messageBox.getActions())).toEqual([
      'yes', 'no', 'cancel',
    ]);
  });

  test('should return the close action to the message box opener', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await msgbox.clickActionButton('yes');
    await expect(msgboxOpenerPage.closeAction).toHaveText('yes');

    await msgboxOpenerPage.clickOpen();
    await msgbox.clickActionButton('no');
    await expect(msgboxOpenerPage.closeAction).toHaveText('no');

    await msgboxOpenerPage.clickOpen();
    await msgbox.clickActionButton('cancel');
    await expect(msgboxOpenerPage.closeAction).toHaveText('cancel');
  });

  test('should allow selecting text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterContent('This text should be selectable!');
    await msgboxOpenerPage.checkContentSelectable(true);
    await msgboxOpenerPage.clickOpen();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    await expect.poll(() => messageBox.isContentSelectable()).toBe(true);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await expect(msgboxOpenerPage.clickOpen()).rejects.toThrow(/NotQualifiedError/);
  });

  test.describe('Custom Message Box Provider', () => {
    test('should allow opening message boxes of other message box providers than the built-in text message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({param1: 'REQUIRED PARAM'});
      await msgboxOpenerPage.clickOpen();

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(messageBox);
      await expect(inspectMessageBoxComponent.locator).toBeVisible();
    });

    test('should allow passing a custom input to the message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({param1: 'REQUIRED PARAM', param2: 'OPTIONAL PARAM'});
      await msgboxOpenerPage.enterContent('CONTENT');
      await msgboxOpenerPage.clickOpen();

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(messageBox);
      await expect(inspectMessageBoxComponent.input).toHaveText('CONTENT');
      await expect(inspectMessageBoxComponent.param1).toHaveText('REQUIRED PARAM');
      await expect(inspectMessageBoxComponent.param2).toHaveText('OPTIONAL PARAM');
    });

    test('should throw when not passing params required by the message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await expect(msgboxOpenerPage.clickOpen()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing params not specified by the message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({xyz: 'XYZ'});
      await expect(msgboxOpenerPage.clickOpen()).rejects.toThrow(/IntentParamValidationError/);
    });
  });
});
