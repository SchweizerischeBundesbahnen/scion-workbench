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
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {expect} from '@playwright/test';
import {MessageBoxPagePO} from '../message-box-page.po';
import {TextMessageBoxPagePO} from '../text-message-box-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';

test.describe('Workbench Message Box', () => {

  test('should open a message box with the specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterContent('TEXT');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new TextMessageBoxPagePO(messageBox);

    await expect(messageBoxPage.text).toHaveText('TEXT');
  });

  test('should support new lines in the message text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterContent('LINE 1\\nLINE 2');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new TextMessageBoxPagePO(messageBox);

    await expect(messageBoxPage.text).toHaveText('LINE 1\nLINE 2');
  });

  test('should open a message box with the specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterTitle('TITLE');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect(messageBox.title).toHaveText('TITLE');
  });

  test('should support new lines in the message box title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect(messageBox.title).toHaveText('LINE 1\nLINE 2');
  });

  test('should, by default, open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect.poll(() => messageBox.getSeverity()).toEqual('info');
  });

  test('should open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.selectSeverity('info');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect.poll(() => messageBox.getSeverity()).toEqual('info');
  });

  test('should open a message box with warn severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.selectSeverity('warn');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect.poll(() => messageBox.getSeverity()).toEqual('warn');
  });

  test('should open a message box with error severity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.selectSeverity('error');
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await expect.poll(() => messageBox.getSeverity()).toEqual('error');
  });

  test('should display configured actions', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await messageBoxOpenerPage.open();

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

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});

    await messageBox.clickActionButton('yes');
    await expect(messageBoxOpenerPage.closeAction).toHaveText('yes');

    await messageBoxOpenerPage.open();
    await messageBox.clickActionButton('no');
    await expect(messageBoxOpenerPage.closeAction).toHaveText('no');

    await messageBoxOpenerPage.open();
    await messageBox.clickActionButton('cancel');
    await expect(messageBoxOpenerPage.closeAction).toHaveText('cancel');
  });

  test('should allow selecting text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open the message box
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await messageBoxOpenerPage.enterContent('This text should be selectable!');
    await messageBoxOpenerPage.checkContentSelectable(true);
    await messageBoxOpenerPage.open();

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const messageBoxPage = new TextMessageBoxPagePO(messageBox);

    await expect.poll(() => messageBoxPage.isTextSelectable()).toBe(true);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.enterCssClass('testee');
    await expect(messageBoxOpenerPage.open()).rejects.toThrow(/NotQualifiedError/);
  });

  test.describe('Custom Message Box Provider', () => {
    test('should allow opening message boxes of other message box providers than the built-in text message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'message-box-page'}});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.enterQualifier({component: 'message-box-page'});
      await messageBoxOpenerPage.enterCssClass('testee');
      await messageBoxOpenerPage.enterParams({param1: 'REQUIRED PARAM'});
      await messageBoxOpenerPage.open();

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      await expectMessageBox(messageBoxPage).toBeVisible();
    });

    test('should allow passing a custom input to the message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'message-box-page'}});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.enterQualifier({component: 'message-box-page'});
      await messageBoxOpenerPage.enterCssClass('testee');
      await messageBoxOpenerPage.enterParams({param1: 'REQUIRED PARAM', param2: 'OPTIONAL PARAM'});
      await messageBoxOpenerPage.enterContent('CONTENT');
      await messageBoxOpenerPage.open();

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      await expect(messageBoxPage.input).toHaveText('CONTENT');
      await expect(messageBoxPage.param1).toHaveText('REQUIRED PARAM');
      await expect(messageBoxPage.param2).toHaveText('OPTIONAL PARAM');
    });

    test('should throw when not passing params required by the message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'message-box-page'}});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.enterQualifier({component: 'message-box-page'});
      await expect(messageBoxOpenerPage.open()).rejects.toThrow(/IntentParamValidationError/);
    });

    test('should throw when passing params not specified by the message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'message-box-page'}});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.enterQualifier({component: 'message-box-page'});
      await messageBoxOpenerPage.enterParams({xyz: 'XYZ'});
      await expect(messageBoxOpenerPage.open()).rejects.toThrow(/IntentParamValidationError/);
    });
  });
});
