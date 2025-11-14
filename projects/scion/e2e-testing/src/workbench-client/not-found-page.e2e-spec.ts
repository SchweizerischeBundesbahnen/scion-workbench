/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {PageNotFoundPagePO} from '../workbench/page-object/page-not-found-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {expectDialog} from '../matcher/dialog-matcher';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';

test.describe('Workbench Page Not Found', () => {

  test.describe('Host Popup', () => {

    test('should display "Not Found" page in host popup', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup', variant: 'invalid-path'}});

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'host-popup', variant: 'invalid-path'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(notFoundPage).toBeVisible();
    });
  });

  test.describe('Host Dialog', () => {

    test('should display "Not Found" page in host dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'invalid-path'}});

      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'host-dialog', variant: 'invalid-path'}, {cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.dialog({cssClass: 'testee'}));
      await expectDialog(notFoundPage).toBeVisible();
    });
  });

  test.describe('Host Message Box', () => {

    test('should display "Not Found" page in host messagebox', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // TODO [#271]: Register messagebox capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
      // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox', variant: 'invalid-path'}});

      const messageboxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageboxOpener.open({component: 'host-messagebox', variant: 'invalid-path'}, {cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.messagebox({cssClass: 'testee'}));
      await expectMessageBox(notFoundPage).toBeVisible();
    });
  });
});
