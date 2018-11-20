/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestingViewPO } from './page-object/testing-view.po';
import { HostAppPO } from './page-object/host-app.po';
import { browser } from 'protractor';
import { expectViewToNotExist, expectViewToShow } from './util/testing.util';
import { noop } from 'rxjs';
import { Testcase61097badMessageBoxPO } from './page-object/testcase-61097bad-msgbox.po';

describe('MessageBox', () => {

  const hostAppPO = new HostAppPO();
  const testingViewPO = new TestingViewPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should show specified actions', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-a6cecbaa-msgbox');
    const actions = {ok: 'OK', cancel: 'Cancel', ['127f38d1a966']: '9ce7b0679386'};
    await msgboxPanelPO.enterActions(actions);

    // close via ok action
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-a6cecbaa-msgbox');
      await expect(msgboxPO.getActions()).toEqual(actions);
      await msgboxPO.close('ok');
      await expect(msgboxPanelPO.getCloseAction()).toEqual('ok');
    }

    // close via cancel action
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-a6cecbaa-msgbox');
      await expect(msgboxPO.getActions()).toEqual(actions);
      await msgboxPO.close('cancel');
      await expect(msgboxPanelPO.getCloseAction()).toEqual('cancel');
    }

    // close via 127f38d1a966 action
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-a6cecbaa-msgbox');
      await expect(msgboxPO.getActions()).toEqual(actions);
      await msgboxPO.close('127f38d1a966');
      await expect(msgboxPanelPO.getCloseAction()).toEqual('127f38d1a966');
    }
  });

  it('should show specified text and title', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-c5dc3af5cd92-msgbox');
    await msgboxPanelPO.enterText('01de40e40df3');
    await msgboxPanelPO.enterTitle('976653342eef');
    await msgboxPanelPO.enterActions({ok: 'OK'});

    await msgboxPanelPO.open();
    const msgboxPO = await hostAppPO.findMessageBox('e2e-c5dc3af5cd92-msgbox');
    await expect(msgboxPO.getText()).toEqual('01de40e40df3');
    await expect(msgboxPO.getTitle()).toEqual('976653342eef');
  });

  it('should show specified severity', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-fbf7ec24f2d4-msgbox');
    await msgboxPanelPO.enterActions({ok: 'OK'});

    // info
    await msgboxPanelPO.selectSeverity('info');
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-fbf7ec24f2d4-msgbox');
      await expect(msgboxPO.getSeverity()).toEqual('info');
      await msgboxPO.close('ok');
    }

    // warn
    await msgboxPanelPO.selectSeverity('warn');
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-fbf7ec24f2d4-msgbox');
      await expect(msgboxPO.getSeverity()).toEqual('warn');
      await msgboxPO.close('ok');
    }

    // error
    await msgboxPanelPO.selectSeverity('error');
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-fbf7ec24f2d4-msgbox');
      await expect(msgboxPO.getSeverity()).toEqual('error');
      await msgboxPO.close('ok');
    }
  });

  it('should apply view modality [testcase: c91805e8]', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-dfa87d85eb1f-msgbox');
    await msgboxPanelPO.selectModality('view');
    await msgboxPanelPO.enterActions({ok: 'OK'});
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-dfa87d85eb1f-msgbox');
      await expect(msgboxPO.isDisplayed()).toBeTruthy('expected messagebox to be displayed');
    }

    // test if other view can be opened via activity bar
    {
      await hostAppPO.clickActivityItem('e2e-activity-c91805e8');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-c91805e8', componentSelector: 'app-view-c91805e8'});
      const msgboxPO = await hostAppPO.findMessageBox('e2e-dfa87d85eb1f-msgbox');
      await expect(msgboxPO.isDisplayed()).toBeFalsy('expected messagebox not to be displayed');
    }

    // switch to disabled view
    {
      await hostAppPO.clickViewTab('e2e-testing-view');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      const msgboxPO = await hostAppPO.findMessageBox('e2e-dfa87d85eb1f-msgbox');
      await expect(msgboxPO.isDisplayed()).toBeTruthy('expected messagebox to be displayed');
    }
  });

  it('should apply application modality [testcase: c91805e8]', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-dfa87d85eb1f-msgbox');
    await msgboxPanelPO.selectModality('application');
    await msgboxPanelPO.enterActions({ok: 'OK'});
    await msgboxPanelPO.open();
    {
      const msgboxPO = await hostAppPO.findMessageBox('e2e-dfa87d85eb1f-msgbox');
      await expect(msgboxPO.isDisplayed()).toBeTruthy('expected messagebox to be displayed');
    }

    // test that other view cannot be opened via activity bar
    {
      await hostAppPO.clickActivityItem('e2e-activity-c91805e8').then(() => fail('expected activity item not to be clickable')).catch(noop);
      await expectViewToNotExist({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-c91805e8'});
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      const msgboxPO = await hostAppPO.findMessageBox('e2e-dfa87d85eb1f-msgbox');
      await expect(msgboxPO.isDisplayed()).toBeTruthy('expected messagebox to be displayed');
    }
  });

  it('should make text selectable', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-cc1bea0bdaa0-msgbox');
    await msgboxPanelPO.enterText('some selectable text');
    await msgboxPanelPO.checkContentSelectable(true);
    await msgboxPanelPO.enterActions({ok: 'OK'});

    await msgboxPanelPO.open();
    const msgboxPO = await hostAppPO.findMessageBox('e2e-cc1bea0bdaa0-msgbox');
    await expect(msgboxPO.isContentSelectable()).toBeTruthy('expected be seletable');
  });

  it('should make text not selectable', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterCssClass('e2e-cc1bea0bdaa0-msgbox');
    await msgboxPanelPO.enterText('some selectable text');
    await msgboxPanelPO.checkContentSelectable(false);
    await msgboxPanelPO.enterActions({ok: 'OK'});

    await msgboxPanelPO.open();
    const msgboxPO = await hostAppPO.findMessageBox('e2e-cc1bea0bdaa0-msgbox');
    await expect(msgboxPO.isContentSelectable()).toBeFalsy('expected not be seletable');
  });

  it('should show a custom message box [testcase: 61097bad]', async () => {
    await testingViewPO.navigateTo();
    const msgboxPanelPO = await testingViewPO.openMessageBoxPanel();

    await msgboxPanelPO.enterQualifier({'type': 'list'});
    await msgboxPanelPO.enterCssClass('e2e-61097bad-msgbox');
    await msgboxPanelPO.enterPayload({'items': ['a', 'b', 'c']});
    await msgboxPanelPO.enterActions({ok: 'OK'});

    await msgboxPanelPO.open();
    const msgboxPO = new Testcase61097badMessageBoxPO('e2e-61097bad-msgbox');
    await expect(msgboxPO.getItems()).toEqual(['a', 'b', 'c']);
  });
});
