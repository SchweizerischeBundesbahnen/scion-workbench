/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {MessageBoxOpenerPagePO} from '../page-object/message-box-opener-page.po';
import {expect} from '@playwright/test';
import {TextMessageBoxPagePO} from '../../text-message-box-page.po';

test.describe('Workbench Message Box', () => {

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await expect(messageBoxOpenerPage.open('', {cssClass: 'testee'})).rejects.toThrow(/NotQualifiedError/);
  });

  test.describe('Text', () => {

    test('should open a message box with the specified text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('TEXT', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      await expect(messageBoxPage.text).toHaveText('TEXT');
    });

    test('should support new lines in the message text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('LINE 1\\nLINE 2', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      await expect(messageBoxPage.text).toHaveText('LINE 1\nLINE 2');
    });

    test('should allow selecting text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('This text should be selectable!', {cssClass: 'testee', contentSelectable: true});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      await expect.poll(() => messageBoxPage.isTextSelectable()).toBe(true);
    });
  });

  test.describe('Title', () => {

    test('should open a message box with the specified title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', title: 'TITLE'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect(messageBox.title).toHaveText('TITLE');
    });

    test('should support new lines in the message box title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', title: 'LINE 1\\nLINE 2'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect(messageBox.title).toHaveText('LINE 1\nLINE 2');
    });
  });

  test.describe('Severity', () => {

    test('should, by default, open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('info');
    });

    test('should open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', severity: 'info'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('info');
    });

    test('should open a message box with warn severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', severity: 'warn'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('warn');
    });

    test('should open a message box with error severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', severity: 'error'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('error');
    });
  });

  test.describe('Actions', () => {

    test('should display configured actions', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // open the message box
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {
        cssClass: 'testee',
        actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });

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
      await messageBoxOpenerPage.open('', {
        cssClass: 'testee',
        actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await messageBox.clickActionButton('yes');
      await expect(messageBoxOpenerPage.closeAction).toHaveText('yes');

      await messageBoxOpenerPage.open('', {
        cssClass: 'testee',
        actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });
      await messageBox.clickActionButton('no');
      await expect(messageBoxOpenerPage.closeAction).toHaveText('no');

      await messageBoxOpenerPage.open('', {
        cssClass: 'testee',
        actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });
      await messageBox.clickActionButton('cancel');
      await expect(messageBoxOpenerPage.closeAction).toHaveText('cancel');
    });
  });
});
