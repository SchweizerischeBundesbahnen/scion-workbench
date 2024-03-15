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
import {expect} from '@playwright/test';
import {expectMessageBox} from '../../matcher/message-box-matcher';
import {TextMessagePO} from '../page-object/text-message.po';
import {LegacyMessageBoxOpenerPagePO} from '../page-object/test-pages/legacy-message-box-opener-page.po';

test.describe('Workbench Message Box Built-in Capability', () => {

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await expect(messageBoxOpenerPage.open('')).rejects.toThrow(/NotQualifiedError/);
  });

  test.describe('Text', () => {

    test('should open a message box with the specified text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('TEXT', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessagePage = new TextMessagePO(messageBox);

      await expectMessageBox(textMessagePage).toBeVisible();
      await expect(textMessagePage.text).toHaveText('TEXT');
    });

    test('should support new lines in the message text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('LINE 1\\nLINE 2', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessagePage = new TextMessagePO(messageBox);

      await expect(textMessagePage.text).toHaveText('LINE 1\nLINE 2');
    });

    test('should allow selecting text', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('This text should be selectable!', {cssClass: 'testee', contentSelectable: true});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessagePage = new TextMessagePO(messageBox);

      await expect.poll(() => textMessagePage.isTextSelectable()).toBe(true);
    });

    test('should not have height if the message is empty', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const textMessagePage = new TextMessagePO(messageBox);

      // Expect the text message box page to display without height.
      await expect.poll(() => textMessagePage.getBoundingBox()).toEqual(expect.objectContaining({
        height: 0,
      }));
    });
  });

  test.describe('Title', () => {

    test('should open a message box with the specified title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', title: 'TITLE'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect(messageBox.title).toHaveText('TITLE');
    });

    test('should support new lines in the message box title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
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

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('info');
    });

    test('should open a message box with info severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', severity: 'info'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('info');
    });

    test('should open a message box with warn severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open('', {cssClass: 'testee', severity: 'warn'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('warn');
    });

    test('should open a message box with error severity', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      // Open the message box.
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

      // Open the message box.
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

      // Open the message box.
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

    test('should close the message box on escape keystroke if cancel action is present', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');

      await test.step('pressing ESCAPE on message box that has a cancel action', async () => {
        // Open the message box.
        await messageBoxOpenerPage.open('message', {
          cssClass: 'testee',
          actions: {
            ok: 'OK',
            cancel: 'cancel',
          },
        });
        const messageBox = appPO.messagebox({cssClass: 'testee'});
        const textMessagePage = new TextMessagePO(messageBox);

        await expectMessageBox(textMessagePage).toBeVisible();

        await page.keyboard.press('Escape');
        // Expect message box to be closed
        await expectMessageBox(textMessagePage).not.toBeAttached();
        await expect(messageBoxOpenerPage.closeAction).toHaveText('cancel');
      });

      await test.step('pressing ESCAPE on message box that has no cancel action', async () => {
        // Open the message box.
        await messageBoxOpenerPage.open('message', {
          cssClass: 'testee',
          actions: {
            ok: 'OK',
            close: 'close',
          },
        });
        const messageBox = appPO.messagebox({cssClass: 'testee'});
        const textMessagePage = new TextMessagePO(messageBox);

        await expectMessageBox(textMessagePage).toBeVisible();

        await page.keyboard.press('Escape');
        // Expect message box not to be closed
        await expectMessageBox(textMessagePage).toBeVisible();
      });
    });
  });

  // @deprecated since workbench version 17.0.0-beta.9; PO will be removed in a future release.
  test('should support legacy content option for workbench clients older than version v1.0.0-beta.23', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open the message box.
    const legacyMessageBoxOpenerPage = await LegacyMessageBoxOpenerPagePO.openInNewTab(appPO, microfrontendNavigator);
    await legacyMessageBoxOpenerPage.open({content: 'TEXT', cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const textMessagePage = new TextMessagePO(messageBox);

    await expectMessageBox(textMessagePage).toBeVisible();
    await expect(textMessagePage.text).toHaveText('TEXT');
  });
});
