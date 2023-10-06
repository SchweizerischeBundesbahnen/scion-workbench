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
import {InspectMessageBoxComponentPO} from '../inspect-message-box-component.po';
import {TextMessageComponentPO} from '../text-message-component.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';

test.describe('Workbench Message Box', () => {

  test('should open a message box with the specified text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterContent('TEXT');
    await msgboxOpenerPage.clickOpen();

    const textMessageComponent = new TextMessageComponentPO(appPO, 'testee');
    await expect(await textMessageComponent.isVisible()).toBe(true);
    await expect(await textMessageComponent.getText()).toEqual('TEXT');
  });

  test('should support new lines in the message text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterContent('LINE 1\\nLINE 2');
    await msgboxOpenerPage.clickOpen();

    const textMessageComponent = new TextMessageComponentPO(appPO, 'testee');
    await expect(await textMessageComponent.isVisible()).toBe(true);
    await expect(await textMessageComponent.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should open a message box with the specified title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterTitle('TITLE');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the message box title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterTitle('LINE 1\\nLINE 2');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, open a message box with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('info');
  });

  test('should open a message box with info serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('info');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('info');
  });

  test('should open a message box with warn serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('warn');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('warn');
  });

  test('should open a message box with error serverity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('error');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('error');
  });

  test('should, by default and if in the context of a view, open a message box \'view-modal\'', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('view');
  });

  test('should hide the message box when its contextual view (if any) is deactivated, and then display it again when activating the view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('view');

    // activate another view
    await appPO.openNewViewTab();
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(false);

    // re-activate the view
    await msgboxOpenerPage.viewTab.click();
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);
  });

  test('should not destroy the message box when its contextual view (if any) is deactivated', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectComponent('inspect-message-box');
    await msgboxOpenerPage.clickOpen();

    const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
    const componentInstanceId = await inspectMessageBoxComponent.getComponentInstanceId();
    await expect(await inspectMessageBoxComponent.isPresent()).toBe(true);
    await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);

    // activate another view
    await appPO.openNewViewTab();
    await expect(await inspectMessageBoxComponent.isPresent()).toBe(true);
    await expect(await inspectMessageBoxComponent.isVisible()).toBe(false);

    // re-activate the view
    await msgboxOpenerPage.viewTab.click();
    await expect(await inspectMessageBoxComponent.isPresent()).toBe(true);
    await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);

    // expect the component not to be constructed anew
    await expect(await inspectMessageBoxComponent.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should open a message box \'application-modal\' if not in the context of a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.checkViewContextActive(false);
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('application');
  });

  test('should allow opening a message box \'application-modal\' even if in the context of a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectModality('application');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('application');
  });

  test('should allow opening a message box in any view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const viewTab1 = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab2 = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab3 = (await appPO.openNewViewTab()).view!.viewTab;

    // open the message box in view 2
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectModality('view');
    await msgboxOpenerPage.enterContextualViewId(await viewTab2.getViewId());
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
    await expect(await msgbox.isVisible()).toBe(false);
    await expect(await msgbox.isPresent()).toBe(true);

    // activate view 1
    await viewTab1.click();
    await expect(await msgbox.isVisible()).toBe(false);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // activate view 2
    await viewTab2.click();
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // activate view 3
    await viewTab3.click();
    await expect(await msgbox.isVisible()).toBe(false);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
  });

  test.fixme('should prevent closing a view if it displays a message box with view modality', async ({appPO, workbenchNavigator}) => {
    // FIXME: this test will run as soon as https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/344 is fixed
    await appPO.navigateTo({microfrontendSupport: false});

    const viewTab1 = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab2 = (await appPO.openNewViewTab()).view!.viewTab;
    const viewTab3 = (await appPO.openNewViewTab()).view!.viewTab;

    // open the message box in view 2
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectModality('view');
    await msgboxOpenerPage.enterContextualViewId(await viewTab2.getViewId());
    await msgboxOpenerPage.clickOpen();
    await msgboxOpenerPage.viewTab.close();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
    await expect(await msgbox.isVisible()).toBe(false);
    await expect(await msgbox.isPresent()).toBe(true);

    // activate view 1
    await viewTab1.click();
    await expect(await viewTab1.isActive()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(false);
    await expect(await msgbox.isPresent()).toBe(true);

    // activate view 2
    await viewTab2.click();
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);

    // activate view 3
    await viewTab3.click();
    await expect(await viewTab3.isActive()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(false);
    await expect(await msgbox.isPresent()).toBe(true);

    // close view 3
    await viewTab3.close();
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close view 2, should not be possible
    await viewTab2.close();
    // also try to close by keystrokes and context menu
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close view 1
    await viewTab1.close();
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close message box and view 2
    await msgbox.clickActionButton('ok');
    await viewTab2.close();
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(0);
    await expect(await msgbox.isPresent()).toBe(false);
    await expect(await appPO.getMessageBoxCount()).toEqual(0);
  });

  test('should display configured actions in the order as specified', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getActions()).toEqual({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });

    // Verify the display order
    await expect(Object.keys(await msgbox.getActions())).toEqual(['yes', 'no', 'cancel']);
  });

  test('should return the close action to the message box opener', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await msgbox.clickActionButton('yes');
    await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('yes');

    await msgboxOpenerPage.clickOpen();
    await msgbox.clickActionButton('no');
    await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('no');

    await msgboxOpenerPage.clickOpen();
    await msgbox.clickActionButton('cancel');
    await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('cancel');
  });

  test('should close the message box on escape keystroke if a \'cancel\' or \'close\' action is present', async ({page, appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    const msgbox = appPO.messagebox({cssClass: 'testee'});

    // Close on ESC if 'cancel' action is present
    await msgboxOpenerPage.enterActions({
      ok: 'OK',
      cancel: 'cancel',
    });
    await msgboxOpenerPage.clickOpen();
    await expect(await msgbox.isVisible()).toBe(true);
    await page.keyboard.press('Escape');
    await expect(await msgbox.isPresent()).toBe(false);

    // Close on ESC if 'close' action is present
    await msgboxOpenerPage.enterActions({
      ok: 'OK',
      close: 'Close',
    });
    await msgboxOpenerPage.clickOpen();
    await expect(await msgbox.isVisible()).toBe(true);
    await page.keyboard.press('Escape');
    await expect(await msgbox.isPresent()).toBe(false);

    // Do not close on ESC otherwise
    await msgboxOpenerPage.enterActions({
      yes: 'Yes',
      no: 'No',
    });
    await msgboxOpenerPage.clickOpen();
    await expect(await msgbox.isVisible()).toBe(true);
    await page.keyboard.press('Escape');
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.isPresent()).toBe(true);
  });

  test('should allow selecting text', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterContent('This text should be selectable!');
    await msgboxOpenerPage.checkContentSelectable(true);
    await msgboxOpenerPage.clickOpen();

    const textMessageComponent = new TextMessageComponentPO(appPO, 'testee');
    await expect(await textMessageComponent.isVisible()).toBe(true);
    await expect(await textMessageComponent.isContentSelectable()).toBe(true);
  });

  test('should stack multiple message boxes and offset them horizontally and vertically', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.enterCount(3);
    await msgboxOpenerPage.clickOpen();

    const msgbox1 = appPO.messagebox({cssClass: ['testee', 'index-0']});
    await expect(await msgbox1.isVisible()).toBe(true);
    const msgbox1ClientRect = await msgbox1.getBoundingBox();

    const msgbox2 = appPO.messagebox({cssClass: ['testee', 'index-1']});
    await expect(await msgbox2.isVisible()).toBe(true);
    const msgbox2ClientRect = await msgbox2.getBoundingBox();
    await expect(msgbox2ClientRect.left - msgbox1ClientRect.left).toEqual(10);
    await expect(msgbox2ClientRect.top - msgbox1ClientRect.top).toEqual(10);

    const msgbox3 = appPO.messagebox({cssClass: ['testee', 'index-2']});
    await expect(await msgbox3.isVisible()).toBe(true);
    const msgbox3ClientRect = await msgbox3.getBoundingBox();
    await expect(msgbox3ClientRect.left - msgbox2ClientRect.left).toEqual(10);
    await expect(msgbox3ClientRect.top - msgbox2ClientRect.top).toEqual(10);
  });

  test('should display the `OK` action when not specifying any action', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.getActions()).toEqual({ok: 'OK'});
  });

  test('should not focus elements under the glasspane', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    await msgboxOpenerPage.clickTitle();  // should be possible to click the title before opening the message box
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    const titleClick = {failed: false};
    try {
      await msgboxOpenerPage.clickTitle();
    }
    catch {
      titleClick.failed = true;
    }
    await expect(titleClick.failed).toBe(true);
    await expect(await msgbox.isActionActive('ok')).toBe(true);
  });

  test.describe('Action Buttons Focus Trap', () => {

    test('should focus the first action button when opening the message box', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);
    });

    test('should cycle focus through the action buttons (pressing TAB or ARROW_RIGHT)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowRight');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowRight');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowRight');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);
    });

    test('should cycle focus through the action buttons (pressing SHIFT-TAB or ARROW_LEFT)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('Shift+Tab');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(true);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);

      await page.keyboard.press('ArrowLeft');
      await expect(await msgbox.isActionActive('yes')).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);
    });

    test('should restore focus after re-activating its contextual view, if any', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await page.keyboard.press('ArrowRight');

      // activate another view
      await appPO.openNewViewTab();
      await expect(await msgbox.isPresent()).toBe(true);
      await expect(await msgbox.isVisible()).toBe(false);

      // re-activate the view
      await msgboxOpenerPage.viewTab.click();
      await expect(await msgbox.isPresent()).toBe(true);
      await expect(await msgbox.isVisible()).toBe(true);
      await expect(await msgbox.isActionActive('no')).toBe(true);
      await expect(await msgbox.isActionActive('yes')).toBe(false);
      await expect(await msgbox.isActionActive('cancel')).toBe(false);
    });
  });

  test.describe('Custom Message Component', () => {
    test('should allow displaying a custom component', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isPresent()).toBe(true);
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
    });

    test('should pass the input', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.enterComponentInput('ABC');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await expect(await inspectMessageBoxComponent.getInput()).toEqual('ABC');
    });

    test('should allow setting the title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await inspectMessageBoxComponent.enterTitle('TITLE');
      await expect(await inspectMessageBoxComponent.msgbox.getTitle()).toEqual('TITLE');
    });

    test('should overwrite the title if also passed by the message box opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterTitle('title');
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await inspectMessageBoxComponent.enterTitle('TITLE');
      await expect(await inspectMessageBoxComponent.msgbox.getTitle()).toEqual('TITLE');
    });

    test('should allow setting the severity', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await inspectMessageBoxComponent.selectSeverity('info');
      await expect(await inspectMessageBoxComponent.msgbox.getSeverity()).toEqual('info');
      await inspectMessageBoxComponent.selectSeverity('warn');
      await expect(await inspectMessageBoxComponent.msgbox.getSeverity()).toEqual('warn');
      await inspectMessageBoxComponent.selectSeverity('error');
      await expect(await inspectMessageBoxComponent.msgbox.getSeverity()).toEqual('error');
    });

    test('should overwrite the severity if also passed by the message box opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.selectSeverity('warn');
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await expect(await inspectMessageBoxComponent.msgbox.getSeverity()).toEqual('warn');
      await inspectMessageBoxComponent.selectSeverity('error');
      await expect(await inspectMessageBoxComponent.msgbox.getSeverity()).toEqual('error');
    });

    test('should append CSS class(es)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass(['testee', 'A', 'B']);
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await expect(await inspectMessageBoxComponent.msgbox.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B']));
      await inspectMessageBoxComponent.enterCssClass('C D');
      await expect(await inspectMessageBoxComponent.msgbox.getCssClasses()).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
    });

    test('should replace actions', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass(['testee']);
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await expect(await inspectMessageBoxComponent.msgbox.getActions()).toEqual({ok: 'OK'});
      await inspectMessageBoxComponent.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await expect(await inspectMessageBoxComponent.msgbox.getActions()).toEqual({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      // Verify the display order
      await expect(Object.keys(await inspectMessageBoxComponent.msgbox.getActions())).toEqual(['yes', 'no', 'cancel']);
    });

    test('should allow returning any value', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPage = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
      await msgboxOpenerPage.enterCssClass(['testee']);
      await msgboxOpenerPage.selectComponent('inspect-message-box');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await inspectMessageBoxComponent.enterActions({
        yes: 'Yes',
        no: 'No',
      });
      await expect(await inspectMessageBoxComponent.msgbox.getActions()).toEqual({
        yes: 'Yes',
        no: 'No',
      });
      await inspectMessageBoxComponent.enterReturnValue('NOPE');
      await inspectMessageBoxComponent.msgbox.clickActionButton('no');
      await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('no => NOPE');
    });
  });
});
