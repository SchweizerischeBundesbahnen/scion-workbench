/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {MessageBoxPagePO} from '../message-box-page.po';
import {TextMessageBoxPagePO} from '../text-message-box-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';

test.describe('Workbench Message Box', () => {

  test.describe('Text Formatting', () => {
    test('should open a message box with the specified text', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      await expect(messageBoxPage.text).toHaveText('message');
    });

    test('should support new lines in the message text', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('LINE 1\\nLINE 2', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      await expect(messageBoxPage.text).toHaveText('LINE 1\nLINE 2');
    });

    test('should allow selecting text', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('This text should be selectable!', {cssClass: 'testee', contentSelectable: true});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      await expect.poll(() => messageBoxPage.isTextSelectable()).toBe(true);
    });
  });

  test.describe('Title', () => {
    test('should open a message box with the specified title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee', title: 'TITLE'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect(messageBox.title).toHaveText('TITLE');
    });

    test('should support new lines in the message box title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee', title: 'LINE 1\\nLINE 2'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect(messageBox.title).toHaveText('LINE 1\nLINE 2');
    });
  });

  test.describe('Severity', () => {
    test('should, by default, open a message box with info severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('info');
    });

    test('should open a message box with info severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee', severity: 'info'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('info');
    });

    test('should open a message box with warn severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee', severity: 'warn'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('warn');
    });

    test('should open a message box with error severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee', severity: 'error'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getSeverity()).toEqual('error');
    });
  });

  test.describe('Actions', () => {
    test('should display the `OK` action when not specifying any action', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getActions()).toEqual({ok: 'OK'});
    });

    test('should display configured actions in the order as specified', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {
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

    test('should return the close action to the message box opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('message', {
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
    });

    test('should close the message box on escape keystroke if cancel action is present', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);

      await test.step('pressing ESCAPE on message box that has a cancel action', async () => {
        await messageBoxOpenerPage.open('message', {
          cssClass: 'testee',
          actions: {
            ok: 'OK',
            cancel: 'cancel',
          },
        });
        const messageBox = appPO.messagebox({cssClass: 'testee'});
        const messageBoxPage = new TextMessageBoxPagePO(messageBox);

        await expectMessageBox(messageBoxPage).toBeVisible();

        await page.keyboard.press('Escape');
        // Expect message box to be closed
        await expectMessageBox(messageBoxPage).not.toBeAttached();
        await expect(messageBoxOpenerPage.closeAction).toHaveText('cancel');
      });

      await test.step('pressing ESCAPE on message box that has no cancel action', async () => {
        await messageBoxOpenerPage.open('Message', {
          cssClass: 'testee',
          actions: {
            ok: 'OK',
            close: 'close',
          },
        });
        const messageBox = appPO.messagebox({cssClass: 'testee'});
        const messageBoxPage = new TextMessageBoxPagePO(messageBox);

        await expectMessageBox(messageBoxPage).toBeVisible();

        await page.keyboard.press('Escape');
        // Expect message box not to be closed
        await expectMessageBox(messageBoxPage).toBeVisible();
      });
    });
  });

  test.describe('Action Buttons Focus Trap', () => {

    test('should focus the first action button when opening the message box', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('Message', {
        cssClass: 'testee', actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect(messageBox.actions.nth(0)).toBeFocused();
    });

    test('should cycle focus through the action buttons (pressing TAB or ARROW_RIGHT)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('Message', {
        cssClass: 'testee', actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });
      const messageBox = appPO.messagebox({cssClass: 'testee'});
      await expect(messageBox.actions.nth(0)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(messageBox.actions.nth(1)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(messageBox.actions.nth(2)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(messageBox.actions.nth(0)).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expect(messageBox.actions.nth(1)).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expect(messageBox.actions.nth(2)).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expect(messageBox.actions.nth(0)).toBeFocused();
    });

    test('should cycle focus through the action buttons (pressing SHIFT-TAB or ARROW_LEFT)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('Message', {
        cssClass: 'testee', actions: {
          yes: 'Yes',
          no: 'No',
          cancel: 'Cancel',
        },
      });
      const messageBox = appPO.messagebox({cssClass: 'testee'});
      await expect(messageBox.actions.nth(0)).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(messageBox.actions.nth(2)).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(messageBox.actions.nth(1)).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(messageBox.actions.nth(0)).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(messageBox.actions.nth(2)).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(messageBox.actions.nth(1)).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(messageBox.actions.nth(0)).toBeFocused();
    });
  });

  test.describe('Message Component', () => {
    test('should allow displaying a component as the message', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('component:message-box-page', {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      await expectMessageBox(messageBoxPage).toBeVisible();
    });

    test('should pass the input', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('component:message-box-page', {cssClass: 'testee', inputs: {input: 'ABC'}});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      await expect(messageBoxPage.input).toHaveText('ABC');
    });
  });

  test.describe('Size', () => {
    test('should have a maximal width of 400px', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('Lorem ipsum dolor sit amet.'.repeat(100), {
        title: 'Lorem ipsum dolor sit amet.'.repeat(100),
        cssClass: 'testee',
      });
      const messageBox = appPO.messagebox({cssClass: 'testee'});

      await expect.poll(() => messageBox.getBoundingBox()).toEqual(expect.objectContaining({
        width: 400,
      }));
    });

    test('should exceed the maximum width to display all action buttons', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const messageBoxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await messageBoxOpenerPage.open('Lorem ipsum dolor sit amet.'.repeat(100), {
        actions: {
          button1: 'Button 1',
          button2: 'Button 2',
          button3: 'Button 3',
          button4: 'Button 4',
          button5: 'Button 5',
          button6: 'Button 6',
          button7: 'Button 7',
          button8: 'Button 8',
        },
        cssClass: 'testee',
      });
      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new TextMessageBoxPagePO(messageBox);

      // Expect message box to exceed maximal width.
      await expect.poll(() => messageBox.getBoundingBox()).toEqual(expect.objectContaining({
        width: 1007, // visual regression test
      }));
      // Expect message to be aligned with message box bounds.
      await expect.poll(() => messageBoxPage.getTextBoundingBox()).toEqual(expect.objectContaining({
        width: 970, // visual regression test
      }));
    });
  });
});
