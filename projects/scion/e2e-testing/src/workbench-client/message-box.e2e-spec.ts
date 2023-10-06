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
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';

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

    const textMessageComponent = new TextMessageComponentPO(appPO, 'testee');
    await expect(await textMessageComponent.isVisible()).toBe(true);
    await expect(await textMessageComponent.getText()).toEqual('TEXT');
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

    const textMessageComponent = new TextMessageComponentPO(appPO, 'testee');
    await expect(await textMessageComponent.isVisible()).toBe(true);
    await expect(await textMessageComponent.getText()).toEqual('LINE 1\nLINE 2');
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

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getTitle()).toEqual('TITLE');
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

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  test('should, by default, open a message box with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('info');
  });

  test('should open a message box with info serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('info');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('info');
  });

  test('should open a message box with warn serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('warn');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('warn');
  });

  test('should open a message box with error serverity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectSeverity('error');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getSeverity()).toEqual('error');
  });

  test('should, by default and if in the context of a view, open a message box \'view-modal\'', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('view');
  });

  test('should open a message box \'application-modal\' if not in the context of a view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.checkViewContextActive(false);
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('application');
  });

  test('should allow opening a message box \'application-modal\' even if in the context of a view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.selectModality('application');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getModality()).toEqual('application');
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

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isVisible()).toBe(true);
    await expect(await msgbox.getActions()).toEqual({
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
    });
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
    await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('yes');

    await msgboxOpenerPage.clickOpen();
    await msgbox.clickActionButton('no');
    await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('no');

    await msgboxOpenerPage.clickOpen();
    await msgbox.clickActionButton('cancel');
    await expect(await msgboxOpenerPage.getMessageBoxCloseAction()).toEqual('cancel');
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

    const textMessageComponent = new TextMessageComponentPO(appPO, 'testee');
    await expect(await textMessageComponent.isVisible()).toBe(true);
    await expect(await textMessageComponent.isContentSelectable()).toBe(true);
  });

  test('should hide a \'view-modal\' message box when activating another view of the part', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await msgboxOpenerPage.enterCssClass('testee');
    await msgboxOpenerPage.clickOpen();

    const msgbox = appPO.messagebox({cssClass: 'testee'});
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);

    // open a new view
    await appPO.openNewViewTab();
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(false);

    // expect the message box to display when activating the view again
    await msgboxOpenerPage.viewTab.click();
    await expect(await msgbox.isPresent()).toBe(true);
    await expect(await msgbox.isVisible()).toBe(true);
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
      await msgboxOpenerPage.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
    });

    test('should hide a \'view-modal\' message box when activating another view of the part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgbox.isPresent()).toBe(true);
      await expect(await msgbox.isVisible()).toBe(true);

      // open a new view
      await appPO.openNewViewTab();
      await expect(await msgbox.isPresent()).toBe(true);
      await expect(await msgbox.isVisible()).toBe(false);

      // expect the message box to display when activating the view again
      await msgboxOpenerPage.viewTab.click();
      await expect(await msgbox.isPresent()).toBe(true);
      await expect(await msgbox.isVisible()).toBe(true);
    });

    test('should open a message box \'application-modal\' if not in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPage.checkViewContextActive(false);
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgbox.isVisible()).toBe(true);
      await expect(await msgbox.getModality()).toEqual('application');
    });

    test('should allow opening a message box \'application-modal\' even if in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPage.selectModality('application');
      await msgboxOpenerPage.clickOpen();

      const msgbox = appPO.messagebox({cssClass: 'testee'});
      await expect(await msgbox.isVisible()).toBe(true);
      await expect(await msgbox.getModality()).toEqual('application');
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
      await msgboxOpenerPage.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await msgboxOpenerPage.enterContent('CONTENT');
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await expect(await inspectMessageBoxComponent.getInputAsKeyValueObject()).toMatchObject({
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
      const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
      await registerIntentionPage.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await msgboxOpenerPage.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPage.enterCssClass('testee');
      await msgboxOpenerPage.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPage.selectSeverity('warn');
      await msgboxOpenerPage.enterTitle('TITLE');
      await msgboxOpenerPage.enterActions({yes: 'Yes', no: 'No'});
      await msgboxOpenerPage.clickOpen();

      const inspectMessageBoxComponent = new InspectMessageBoxComponentPO(appPO, 'testee');
      await expect(await inspectMessageBoxComponent.isVisible()).toBe(true);
      await expect(await inspectMessageBoxComponent.msgbox.getSeverity()).toEqual('warn');
      await expect(await inspectMessageBoxComponent.msgbox.getTitle()).toEqual('TITLE');
      await expect(await inspectMessageBoxComponent.msgbox.getActions()).toEqual({yes: 'Yes', no: 'No'});
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
