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
import {consumeBrowserLog} from '../helper/testing.util';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {TextMessagePO} from '../text-message.po';
import {InspectMessageBoxPO} from '../inspect-message-box.po';
import {expectMap} from '../helper/expect-map-matcher';
import {expectPromise} from '../helper/expect-promise-matcher';

describe('Workbench Message Box', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should open a message box with the specified text', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('TEXT');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('TEXT');
  });

  it('should support new lines in the message text', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.getText()).toEqual('LINE 1\nLINE 2');
  });

  it('should open a message box with the specified title', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('TITLE');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getTitle()).toEqual('TITLE');
  });

  it('should support new lines in the message box title', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterTitle('LINE 1\\nLINE 2');
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.msgboxPO.getTitle()).toEqual('LINE 1\nLINE 2');
  });

  it('should, by default, open a message box with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  it('should open a message box with info serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('info');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('info');
  });

  it('should open a message box with warn serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('warn');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('warn');
  });

  it('should open a message box with error serverity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectSeverity('error');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getSeverity()).toEqual('error');
  });

  it('should, by default and if in the context of a view, open a message box \'view-modal\'', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('view');
  });

  it('should open a message box \'application-modal\' if not in the context of a view', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.checkViewContextActive(false);
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  it('should allow opening a message box \'application-modal\' even if in the context of a view', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.selectModality('application');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isDisplayed()).toBe(true);
    await expect(await msgboxPO.getModality()).toEqual('application');
  });

  it('should display configured actions', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
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
  });

  it('should return the close action to the message box opener', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
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

  it('should allow selecting text', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.enterContent('This text should be selectable!');
    await msgboxOpenerPagePO.checkContentSelectable(true);
    await msgboxOpenerPagePO.clickOpen();

    const textMessagePO = new TextMessagePO('testee');
    await expect(await textMessagePO.isDisplayed()).toBe(true);
    await expect(await textMessagePO.isContentSelectable()).toBe(true);
  });

  it('should hide a \'view-modal\' message box when activating another view of the viewpart', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    // open the message box
    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await msgboxOpenerPagePO.enterCssClass('testee');
    await msgboxOpenerPagePO.clickOpen();

    const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(true);

    // open a new view
    await appPO.openNewViewTab();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(false);

    // expect the message box to display when activating the view again
    await msgboxOpenerPagePO.viewTabPO.activate();
    await expect(await msgboxPO.isPresent()).toBe(true);
    await expect(await msgboxPO.isDisplayed()).toBe(true);
  });

  it('should reject if missing the intention', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
    await expectPromise(msgboxOpenerPagePO.clickOpen()).toReject(/NotQualifiedError/);
  });

  describe('Custom Message Box Provider', () => {
    it('should allow opening message boxes of other message box providers than the built-in text message box provider', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
    });

    it('should hide a \'view-modal\' message box when activating another view of the viewpart', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isDisplayed()).toBe(true);

      // open a new view
      await appPO.openNewViewTab();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isDisplayed()).toBe(false);

      // expect the message box to display when activating the view again
      await msgboxOpenerPagePO.viewTabPO.activate();
      await expect(await msgboxPO.isPresent()).toBe(true);
      await expect(await msgboxPO.isDisplayed()).toBe(true);
    });

    it('should open a message box \'application-modal\' if not in the context of a view', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.checkViewContextActive(false);
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isDisplayed()).toBe(true);
      await expect(await msgboxPO.getModality()).toEqual('application');
    });

    it('should allow opening a message box \'application-modal\' even if in the context of a view', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.selectModality('application');
      await msgboxOpenerPagePO.clickOpen();

      const msgboxPO = appPO.findMessageBox({cssClass: 'testee'});
      await expect(await msgboxPO.isDisplayed()).toBe(true);
      await expect(await msgboxPO.getModality()).toEqual('application');
    });

    it('should allow passing a custom input to the message box', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1', param2: 'PARAM 2'});
      await msgboxOpenerPagePO.enterContent('CONTENT');
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expectMap(await inspectorPO.getInputAsMap()).toContain(new Map()
        .set('component', 'inspector') // qualifier
        .set('$implicit', 'CONTENT') // content
        .set('param1', 'PARAM 1') // params
        .set('param2', 'PARAM 2') // params
        .set('ɵAPP_SYMBOLIC_NAME', 'workbench-client-testing-app1') // headers
        .set('ɵREPLY_TO', jasmine.any(String)),
      );
    });

    it('should allow controlling message box settings', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({param1: 'PARAM 1'});
      await msgboxOpenerPagePO.selectSeverity('warn');
      await msgboxOpenerPagePO.enterTitle('TITLE');
      await msgboxOpenerPagePO.enterActions({yes: 'Yes', no: 'No'});
      await msgboxOpenerPagePO.clickOpen();

      const inspectorPO = new InspectMessageBoxPO('testee');
      await expect(await inspectorPO.isDisplayed()).toBe(true);
      await expect(await inspectorPO.msgboxPO.getSeverity()).toEqual('warn');
      await expect(await inspectorPO.msgboxPO.getTitle()).toEqual('TITLE');
      await expect(await inspectorPO.msgboxPO.getActions()).toEqual({yes: 'Yes', no: 'No'});
    });

    it('should throw when not passing params required by the message box provider', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await expectPromise(msgboxOpenerPagePO.clickOpen()).toReject(/ParamMismatchError/);
    });

    it('should throw when passing params not specified by the message box provider', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register message box intention
      const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
      await registerIntentionPagePO.registerIntention({type: 'messagebox', qualifier: {'component': 'inspector'}});

      // open the message box
      const msgboxOpenerPagePO = await MessageBoxOpenerPagePO.openInNewTab('app1');
      await msgboxOpenerPagePO.enterQualifier({'component': 'inspector'});
      await msgboxOpenerPagePO.enterCssClass('testee');
      await msgboxOpenerPagePO.enterParams({xyz: 'XYZ'});
      await expectPromise(msgboxOpenerPagePO.clickOpen()).toReject(/ParamMismatchError/);
    });
  });
});
