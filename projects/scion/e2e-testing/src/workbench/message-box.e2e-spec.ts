/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {consumeBrowserLog, sendKeys} from '../helper/testing.util';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {TextMessagePO} from '../text-message.po';
import {InspectMessageBoxPO} from '../inspect-message-box.po';
import {Key} from 'protractor';

describe('Workbench Message Box', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should open a message box with the specified text', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('TEXT');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('TEXT');
  });

  it('should support new lines in the message text', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('LINE 1\nLINE 2');
  });

  it('should open a message box with the specified title', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('TITLE');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getTitle()).toEqual('TITLE');
  });

  it('should support new lines in the message box title', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.msgboxPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  it('should, by default, open a message box with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  it('should open a message box with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('info');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  it('should open a message box with warn serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('warn');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('warn');
  });

  it('should open a message box with error serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('error');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('error');
  });

  it('should, by default and if in the context of a view, open a message box \'view-modal\'', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('view');
  });

  it('should hide the message box when its contextual view (if any) is deactivated, and then display it again when activating the view', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('view');

    // activate another view
    await appPO.openNewViewTab();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(false);

    // re-activate the view
    await msgboxOpenerPagePO.viewTabPO.activate();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(true);
  });

  it('should not destroy the message box when its contextual view (if any) is deactivated', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectComponent('inspect-message-box');
    await msgboxOpenerPagePO.clickOpen();

    const inspectorPO = new InspectMessageBoxPO('testee');
    const componentInstanceId = await inspectorPO.getComponentInstanceId();
    await expect(await inspectorPO.isPresent()).toBe(true);
    await expect(await inspectorPO.isDisplayed()).toBe(true);

    // activate another view
    await appPO.openNewViewTab();
    await expect(await inspectorPO.isPresent()).toBe(true);
    await expect(await inspectorPO.isDisplayed()).toBe(false);

    // re-activate the view
    await msgboxOpenerPagePO.viewTabPO.activate();
    await expect(await inspectorPO.isPresent()).toBe(true);
    await expect(await inspectorPO.isDisplayed()).toBe(true);

    // expect the component not to be constructed anew
    await expect(await inspectorPO.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  it('should open a message box \'application-modal\' if not in the context of a view', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.checkViewContextActive(false);
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  it('should allow opening a message box \'application-modal\' even if in the context of a view', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('application');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  it('should allow opening a message box in any view', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const viewTab1PO = (await appPO.openNewViewTab()).viewPO.viewTabPO;
    const viewTab2PO = (await appPO.openNewViewTab()).viewPO.viewTabPO;
    const viewTab3PO = (await appPO.openNewViewTab()).viewPO.viewTabPO;

    // open the message box in view 2
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('view');
    await msgboxOpenerPagePO.enterContextualViewId(await viewTab2PO.getViewId());
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await appPO.getMessageBoxCount()).toEqual(1);
    await expect(await msgboxPO.isDisplayed()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);

    // activate view 1
    await viewTab1PO.activate();
    await expect(await msgboxPO.isDisplayed()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // activate view 2
    await viewTab2PO.activate();
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // activate view 3
    await viewTab3PO.activate();
    await expect(await msgboxPO.isDisplayed()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close view 3
    await viewTab3PO.close();
    await expect(await viewTab2PO.isActive()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await appPO.getMessageBoxCount()).toEqual(1);

    // close view 2
    await viewTab2PO.close();
    await expect(await viewTab1PO.isActive()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(false);
    await expect(await appPO.getMessageBoxCount()).toEqual(0);

    // close view 1
    await viewTab1PO.close();
    await expect(await msgboxPO.isDisplayed()).toBe(false);
    await expect(await msgboxPO.isPresent()).toBe(false);
    await expect(await appPO.getMessageBoxCount()).toEqual(0);
  });

  it('should display configured actions in the order as specified', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getActions()).toEqual({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });

    // Verify the display order
    await expect(Object.keys(await msgboxPO.getActions())).toEqual(['yes', 'no', 'cancel']);
  });

  it('should return the close action to the message box opener', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await msgboxPO.clickActionButton('yes');
    await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('yes');

    await msgboxOpenerPagePO.clickOpen();
    await msgboxPO.clickActionButton('no');
    await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('no');

    await msgboxOpenerPagePO.clickOpen();
    await msgboxPO.clickActionButton('cancel');
    await expect(await msgboxOpenerPagePO.getMessageBoxCloseAction()).toEqual('cancel');
  });

  it('should close the message box on escape keystroke if a \'cancel\' or \'close\' action is present', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});

    // Close on ESC if 'cancel' action is present
    await msgboxOpenerPagePO.enterActions({
      ok: 'OK',
      cancel: 'cancel',
    });
    await msgboxOpenerPagePO.clickOpen();
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await sendKeys(Key.ESCAPE);
    await expect(await msgboxPO.isPresent()).toBe(false);

    // Close on ESC if 'close' action is present
    await msgboxOpenerPagePO.enterActions({
      ok: 'OK',
      close: 'Close',
    });
    await msgboxOpenerPagePO.clickOpen();
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await sendKeys(Key.ESCAPE);
    await expect(await msgboxPO.isPresent()).toBe(false);

    // Do not close on ESC otherwise
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
    });
    await msgboxOpenerPagePO.clickOpen();
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await sendKeys(Key.ESCAPE);
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.isPresent()).toBe(true);
  });

  it('should allow selecting text', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('This text should be selectable!');
    await msgboxOpenerPagePO.checkContentSelectable(true);
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.isContentSelectable()).toBe(true);
  });

  it('should stack multiple message boxes and offset them horizontally and vertically', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee-1');
    await msgboxOpenerPagePO.clickOpen();
    await msgboxOpenerPagePO.enterCssClass('testee-2');
    await msgboxOpenerPagePO.clickOpen();
    await msgboxOpenerPagePO.enterCssClass('testee-3');
    await msgboxOpenerPagePO.clickOpen();

    const msgbox1PO = appPO.findMessageBox({cssClass: 'testee-1'});
    await expect(await msgbox1PO.isDisplayed()).toBe(true);
    const msgbox1ClientRect = await msgbox1PO.getClientRect();

    const msgbox2PO = appPO.findMessageBox({cssClass: 'testee-2'});
    await expect(await msgbox2PO.isDisplayed()).toBe(true);
    const msgbox2ClientRect = await msgbox2PO.getClientRect();
    await expect(msgbox2ClientRect.left - msgbox1ClientRect.left).toEqual(10);
    await expect(msgbox2ClientRect.top - msgbox1ClientRect.top).toEqual(10);

    const msgbox3PO = appPO.findMessageBox({cssClass: 'testee-3'});
    await expect(await msgbox3PO.isDisplayed()).toBe(true);
    const msgbox3ClientRect = await msgbox3PO.getClientRect();
    await expect(msgbox3ClientRect.left - msgbox2ClientRect.left).toEqual(10);
    await expect(msgbox3ClientRect.top - msgbox2ClientRect.top).toEqual(10);
  });

  it('should display the `OK` action when not specifying any action', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.getActions()).toEqual({ok: 'OK'});
  });

  it('should not focus elements under the glasspane', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await msgboxOpenerPagePO.clickTitle();
    await expect(await msgboxPO.isActionActive('ok')).toBe(true);
  });

  describe('Action Buttons Focus Trap', () => {

    it('should focus the first action button when opening the message box', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
    });

    it('should cycle focus through the action buttons (pressing TAB or ARROW_RIGHT)', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.TAB);
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.ARROW_RIGHT);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.ARROW_RIGHT);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.ARROW_RIGHT);
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.ARROW_RIGHT);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.ARROW_RIGHT);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.ARROW_RIGHT);
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
    });

    it('should cycle focus through the action buttons (pressing SHIFT-TAB or ARROW_LEFT)', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.chord(Key.SHIFT, Key.TAB));
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.ARROW_LEFT);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.ARROW_LEFT);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.ARROW_LEFT);
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);

      await sendKeys(Key.ARROW_LEFT);
      await expect(await msgboxPO.isActionActive('cancel')).toBe(true);

      await sendKeys(Key.ARROW_LEFT);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);

      await sendKeys(Key.ARROW_LEFT);
      await expect(await msgboxPO.isActionActive('yes')).toBe(true);
    });

    it('should restore focus after re-activating its contextual view, if any', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterActions({
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
      });
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await sendKeys(Key.ARROW_RIGHT);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isDisplayed()).toBe(false);

      // re-activate the view
      await msgboxOpenerPagePO.viewTabPO.activate();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isDisplayed()).toBe(true);
      await expect(await msgboxPO.isActionActive('no')).toBe(true);
    });
  });

  describe('Custom Message Component', () => {
    it('should allow displaying a custom component', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isPresent()).toBe(true);
      await expect(await inspectorPO.isDisplayed()).toBe(true);
    });

    it('should pass the input', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.enterComponentInput('ABC');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expect(await inspectorPO.getInput()).toEqual('ABC');
    });

    it('should allow setting the title', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await inspectorPO.enterTitle('TITLE');
      await expect(await inspectorPO.msgboxPO.getTitle()).toEqual('TITLE');
    });

    it('should overwrite the title if also passed by the message box opener', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterTitle('title');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await inspectorPO.enterTitle('TITLE');
      await expect(await inspectorPO.msgboxPO.getTitle()).toEqual('TITLE');
    });

    it('should allow setting the severity', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await inspectorPO.selectSeverity('info');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('info');
      await inspectorPO.selectSeverity('warn');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('warn');
      await inspectorPO.selectSeverity('error');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('error');
      await inspectorPO.selectSeverity('');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('info');
    });

    it('should overwrite the severity if also passed by the message box opener', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.selectSeverity('warn');
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('warn');
      await inspectorPO.selectSeverity('error');
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('error');
    });

    it('should append CSS class(es)', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass(['testee', 'A', 'B']);
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getCssClasses()).toEqual(jasmine.arrayContaining(['A', 'B']));
      await inspectorPO.enterCssClass('C D');
      await expect(await inspectorPO.msgboxPO.getCssClasses()).toEqual(jasmine.arrayContaining(['A', 'B', 'C', 'D']));
    });

    it('should replace actions', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass(['testee']);
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
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

    it('should allow returning any value', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab();
      await msgboxOpenerPagePO.enterCssClass(['testee']);
      await msgboxOpenerPagePO.selectComponent('inspect-message-box');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
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
