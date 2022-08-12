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
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';

test.describe('Workbench Message Box', () => {

  test('should open a message box with the specified text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('TEXT');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO(appPO, 'testee');
    await expect(await textMessagePO.isVisible()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('TEXT');
  });

  test('should support new lines in the message text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO(appPO, 'testee');
    await expect(await textMessagePO.isVisible()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('LINE 1\nLINE 2');
  });

  test('should open a message box with the specified title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('TITLE');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getTitle()).toEqual('TITLE');
  });

  test('should support new lines in the message box title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, open a message box with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  test('should open a message box with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('info');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  test('should open a message box with warn serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('warn');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('warn');
  });

  test('should open a message box with error serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('error');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('error');
  });

  test('should, by default and if in the context of a view, open a message box \'view-modal\'', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('view');
  });

  test('should open a message box \'application-modal\' if not in the context of a view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.checkViewContextActive(false);
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  test('should allow opening a message box \'application-modal\' even if in the context of a view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('application');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  test('should display configured actions', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterActions({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isVisible()).toBe(true);
    await expect(await msgboxPO.getActions()).toEqual({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
  });

  test('should return the close action to the message box opener', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
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

  test('should allow selecting text', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('This text should be selectable!');
    await msgboxOpenerPagePO.checkContentSelectable(true);
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO(appPO, 'testee');
    await expect(await textMessagePO.isVisible()).toBe(true);
    await expect(await textMessagePO.isContentSelectable()).toBe(true);
  });

  test('should hide a \'view-modal\' message box when activating another view of the viewpart', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);

    // open a new view
    await appPO.openNewViewTab();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(false);

    // expect the message box to display when activating the view again
    await msgboxOpenerPagePO.viewTabPO.activate();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isVisible()).toBe(true);
  });

  test('should reject if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await expect(msgboxOpenerPagePO.clickOpen()).rejects.toThrow(/NotQualifiedError/);
  });

  test.describe('Custom Message Box Provider', () => {
    test('should allow opening message boxes of other message box providers than the built-in text message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
    });

    test('should hide a \'view-modal\' message box when activating another view of the viewpart', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isVisible()).toBe(true);

      // open a new view
      await appPO.openNewViewTab();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isVisible()).toBe(false);

      // expect the message box to display when activating the view again
      await msgboxOpenerPagePO.viewTabPO.activate();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isVisible()).toBe(true);
    });

    test('should open a message box \'application-modal\' if not in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.checkViewContextActive(false);
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isVisible()).toBe(true);
      await expect(await msgboxPO.getModality()).toEqual('application');
    });

    test('should allow opening a message box \'application-modal\' even if in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.selectModality('application');
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isVisible()).toBe(true);
      await expect(await msgboxPO.getModality()).toEqual('application');
    });

    test('should allow passing a custom input to the message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await msgboxOpenerPagePO.enterContent('CONTENT');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.getInputAsKeyValueObject()).toMatchObject({
        'component': 'inspector', // qualifier
        '$implicit': 'CONTENT', // content
        'param1': 'PARAM 1', // params
        'param2': 'PARAM 2', // params
        'ɵAPP_SYMBOLIC_NAME': 'workbench-client-testing-app1', // headers
        'ɵREPLY_TO': expect.any(String),
      });
    });

    test('should allow controlling message box settings', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.selectSeverity('warn');
      await msgboxOpenerPagePO.enterTitle('TITLE');
      await msgboxOpenerPagePO.enterActions({yes: 'Yes', no: 'No'});
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO(appPO, 'testee');
      await expect(await inspectorPO.isVisible()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('warn');
      await expect(await inspectorPO.msgboxPO.getTitle()).toEqual('TITLE');
      await expect(await inspectorPO.msgboxPO.getActions()).toEqual({yes: 'Yes', no: 'No'});
    });

    test('should throw when not passing params required by the message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await expect(msgboxOpenerPagePO.clickOpen()).rejects.toThrow(/ParamMismatchError/);
    });

    test('should throw when passing params not specified by the message box provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({xyz: 'XYZ'});
      await expect(msgboxOpenerPagePO.clickOpen()).rejects.toThrow(/ParamMismatchError/);
    });
  });
});
