/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {InspectMessageBoxPO} from '../inspect-message-box.po';
import {TextMessagePO} from '../text-message.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';

test.describe('Workbench Message Box', () => {

  test('should open a message box with the specified text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('TEXT');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO(appPO, 'testee');
    await expect(await textMessagePO.isVisible()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('TEXT');
  });

  test('should support new lines in the message text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO(appPO, 'testee');
    await expect(await textMessagePO.isVisible()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should open a message box with the specified title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('TITLE');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the message box title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, open a message box with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  test('should open a message box with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('info');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  test('should open a message box with warn serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('warn');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('warn');
  });

  test('should open a message box with error serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('error');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('error');
  });

  test('should, by default and if in the context of a view, open a message box \'view-modal\'', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('view');
  });

  test('should hide the message box when its contextual view (if any) is deactivated, and then display it again when activating the view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('view');

    // activate another view
    await appPO.openNewViewTab();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(false);

    // re-activate the view
    await msgboxOpenerPagePO.viewTabPO.click();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);
  });

  test('should not destroy the message box when its contextual view (if any) is deactivated', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectComponent('inspect-message-box');
    await msgboxOpenerPagePO.clickOpen();

    const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
    const componentInstanceId = await inspectorPO.getComponentInstanceId();
    await expect(await inspectorPO.isPresent()).toBe(true);
    await expect(await inspectorPO.isVisible()).toBe(true);

    // activate another view
    await appPO.openNewViewTab();
    await expect(await inspectorPO.isPresent()).toBe(true);
    await expect(await inspectorPO.isVisible()).toBe(false);

    // re-activate the view
    await msgboxOpenerPagePO.viewTabPO.click();
    await expect(await inspectorPO.isPresent()).toBe(true);
    await expect(await inspectorPO.isVisible()).toBe(true);

    // expect the component not to be constructed anew
    await expect(await inspectorPO.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should open a message box \'application-modal\' if not in the context of a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.checkViewContextActive(false);
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  test('should allow opening a message box \'application-modal\' even if in the context of a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('application');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  test('should allow opening a message box in any view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const viewTab1PO = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab2PO = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab3PO = (await appPO.openNewViewTab()).view!.viewTab;

    // open the message box in view 2
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('view');
    await msgboxOpenerPagePO.enterContextualViewId(await viewTab2PO.getViewId());
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
    await expect(await msgboxPO.isVisible()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);

    // activate view 1
    await viewTab1PO.click();
    await expect(await msgboxPO.isVisible()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // activate view 2
    await viewTab2PO.click();
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // activate view 3
    await viewTab3PO.click();
    await expect(await msgboxPO.isVisible()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
  });

  test.fixme('should prevent closing a view if it displays a message box with view modality', async ({appPO, workbenchNavigator}) => {
    // FIXME: this test will run as soon as https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/344 is fixed
    await appPO.navigateTo({microfrontendSupport: false});

    const viewTab1PO = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab2PO = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab3PO = (await appPO.openNewViewTab()).view!.viewTab;

    // open the message box in view 2
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('view');
    await msgboxOpenerPagePO.enterContextualViewId(await viewTab2PO.getViewId());
    await msgboxOpenerPagePO.clickOpen();
    await msgboxOpenerPagePO.viewTabPO.close();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
    await expect(await msgboxPO.isVisible()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);

    // activate view 1
    await viewTab1PO.click();
    await expect(await viewTab1PO.isActive()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);

    // activate view 2
    await viewTab2PO.click();
    await expect(await viewTab2PO.isActive()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);

    // activate view 3
    await viewTab3PO.click();
    await expect(await viewTab3PO.isActive()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);

    // close view 3
    await viewTab3PO.close();
    await expect(await viewTab2PO.isActive()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close view 2, should not be possible
    await viewTab2PO.close();
    // also try to close by keystrokes and context menu
    await expect(await viewTab2PO.isActive()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close view 1
    await viewTab1PO.close();
    await expect(await viewTab2PO.isActive()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close message box and view 2
    await msgboxPO.clickActionButton('ok');
    await viewTab2PO.close();
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(0);
    await expect(await msgboxPO.isPresent()).toBe(false);
    await expect(await appPO.getMessageBoxCount()).toEqual(0);
  });

  test('should display configured actions in the order as specified', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getActions()).toEqual({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });

    // Verify the display order
    await expect(Object.keys(await msgboxPO.getActions())).toEqual(['yes', 'no', 'cancel']);
  });

  test('should return the close action to the message box opener', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await msgboxPO.clickActionButton('yes');
    await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('yes');

    await msgboxOpenerPagePO.clickOpen();
    await msgboxPO.clickActionButton('no');
    await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('no');

    await msgboxOpenerPagePO.clickOpen();
    await msgboxPO.clickActionButton('cancel');
    await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('cancel');
  });

  test('should close the message box on escape keystroke if a \'cancel\' or \'close\' action is present', async ({page, appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    const msgboxPO = appPO.messagebox({cssClass: 'testee'});

    // Close on ESC if 'cancel' action is present
    await msgboxOpenerPagePO.enterActions({
      ok: 'OK',
      cancel: 'cancel',
    });
    await msgboxOpenerPagePO.clickOpen();
    await expect(await msgboxPO.isVisible()).toBe(true);
    await page.keyboard.press('Escape');
    await expect(await msgboxPO.isPresent()).toBe(false);

    // Close on ESC if 'close' action is present
    await msgboxOpenerPagePO.enterActions({
      ok: 'OK',
      close: 'Close',
    });
    await msgboxOpenerPagePO.clickOpen();
    await expect(await msgboxPO.isVisible()).toBe(true);
    await page.keyboard.press('Escape');
    await expect(await msgboxPO.isPresent()).toBe(false);

    // Do not close on ESC otherwise
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
    });
    await msgboxOpenerPagePO.clickOpen();
    await expect(await msgboxPO.isVisible()).toBe(true);
    await page.keyboard.press('Escape');
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
  });

  test('should allow selecting text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('This text should be selectable!');
    await msgboxOpenerPagePO.checkContentSelectable(true);
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO(appPO, 'testee');
    await expect(await textMessagePO.isVisible()).toBe(true);
    await expect(await textMessagePO.isContentSelectable()).toBe(true);
  });

  test('should stack multiple message boxes and offset them horizontally and vertically', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterCount(3);
    await msgboxOpenerPagePO.clickOpen();

    const msgbox1PO = appPO.messagebox({cssClass: ['testee', 'index-0']});
    await expect(await msgbox1PO.isVisible()).toBe(true);
    const msgbox1ClientRect = await msgbox1PO.getBoundingBox();

    const msgbox2PO = appPO.messagebox({cssClass: ['testee', 'index-1']});
    await expect(await msgbox2PO.isVisible()).toBe(true);
    const msgbox2ClientRect = await msgbox2PO.getBoundingBox();
    await expect(msgbox2ClientRect.left - msgbox1ClientRect.left).toEqual(10);
    await expect(msgbox2ClientRect.top - msgbox1ClientRect.top).toEqual(10);

    const msgbox3PO = appPO.messagebox({cssClass: ['testee', 'index-2']});
    await expect(await msgbox3PO.isVisible()).toBe(true);
    const msgbox3ClientRect = await msgbox3PO.getBoundingBox();
    await expect(msgbox3ClientRect.left - msgbox2ClientRect.left).toEqual(10);
    await expect(msgbox3ClientRect.top - msgbox2ClientRect.top).toEqual(10);
  });

  test('should display the `OK` action when not specifying any action', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgboxPO.getActions()).toEqual({ok: 'OK'});
  });

  test('should not focus elements under the glasspane', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPagePO.clickTitle();  // should be possible to click the title before opening the message box
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.messagebox({cssClass: 'testee'});
    const titleClick = {failed: false};
    try {
      await msgboxOpenerPagePO.clickTitle();
    }
    catch {
      titleClick.failed = true;
    }
    await expect(titleClick.failed).toBe(true);
    await expect(await msgboxPO.isActionActive('ok')).toBe(true);
  });

  test.describe('Action Buttons Focus Trap', () => {

    test('should focus the first action button when opening the message box', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);
    });

    test('should cycle focus through the action buttons (pressing TAB or ARROW_RIGHT)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowRight');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowRight');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);
    });

    test('should cycle focus through the action buttons (pressing SHIFT-TAB or ARROW_LEFT)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);
    });

    test('should restore focus after re-activating its contextual view, if any', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.messagebox({cssClass: 'testee'});
      await page.keyboard.press('ArrowRight');

      // activate another view
      await appPO.openNewViewTab();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isVisible()).toBe(false);

      // re-activate the view
      await msgboxOpenerPagePO.viewTabPO.click();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isVisible()).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
      await expect(await msgboxPO.isActionActive('yes')).toBe(false);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(false);
    });
  });

  test.describe('Custom Message Component', () => {
    test('should allow displaying a custom component', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isPresent()).toBe(true);
      await expect(await inspectorPO.isVisible()).toBe(true);
    });

    test('should pass the input', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.enterComponentInput('ABC');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.getInput()).toEqual('ABC');
    });

    test('should allow setting the title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await inspectorPO.enterTitle('TITLE');
      await expect(await inspectorPO.msgboxPO.getTitle()).toEqual('TITLE');
    });

    test('should overwrite the title if also passed by the message box opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterTitle('title');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await inspectorPO.enterTitle('TITLE');
      await expect(await inspectorPO.msgboxPO.getTitle()).toEqual('TITLE');
    });

    test('should allow setting the severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await inspectorPO.selectSeverity('info');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('info');
      await inspectorPO.selectSeverity('warn');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('warn');
      await inspectorPO.selectSeverity('error');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('error');
    });

    test('should overwrite the severity if also passed by the message box opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectSeverity('warn');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('warn');
      await inspectorPO.selectSeverity('error');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('error');
    });

    test('should append CSS class(es)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass(['testee', 'A', 'B']);
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B']));
      await inspectorPO.enterCssClass('C D');
      await expect(await inspectorPO.msgboxPO.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
    });

    test('should replace actions', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass(['testee']);
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getActions()).toEqual({ok: 'OK'});
      await inspectorPO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await expect(await inspectorPO.msgboxPO.getActions()).toEqual({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      // Verify the display order
      await expect(Object.keys(await inspectorPO.msgboxPO.getActions())).toEqual(['yes', 'no', 'cancel']);
    });

    test('should allow returning any value', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPagePO.enterCssClass(['testee']);
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await inspectorPO.enterActions({
        yes: 'Yes',
        no: 'No',
      });
      await expect(await inspectorPO.msgboxPO.getActions()).toEqual({
        yes: 'Yes',
        no: 'No',
      });
      await inspectorPO.enterReturnValue('NOPE');
      await inspectorPO.msgboxPO.clickActionButton('no');
      await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('no => NOPE');
    });
  });
});
