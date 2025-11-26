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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {HostPopupPagePO} from './page-object/host-popup-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {PageNotFoundPagePO} from '../workbench/page-object/page-not-found-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {HostDialogPagePO} from './page-object/host-dialog-page.po';
import {expectDialog} from '../matcher/dialog-matcher';
import {HostMessageBoxPagePO} from './page-object/host-message-box-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';

/**
 * Tests workbench navigation in an application with a protected empty-path top-level route.
 *
 * ```ts
 * {
 *   path: '',
 *   canActivate: [authorizedGuard()],
 *   children: [
 *     // Default route
 *     {
 *       path: '',
 *       canMatch: [canMatchWorkbenchOutlet(false)],
 *       component: WorkbenchComponent,
 *     },
 *     // Workbench view and part routes
 *     {
 *       path: '',
 *       canMatch: [canMatchWorkbenchOutlet(true)],
 *       children: [
 *         ...
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
test.describe('App With Guard', () => {

  test('should display host popup', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup'}});

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'host-popup'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    // Expect popup to display.
    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new HostPopupPagePO(popup);
    await expectPopup(popupPage).toBeVisible();
  });

  test('should display "Not Found" page in host popup', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

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

  test('should display host dialog', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog'}});

    const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpener.open({component: 'host-dialog'}, {cssClass: 'testee'});

    // Expect dialog to display.
    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new HostDialogPagePO(dialog);
    await expectDialog(dialogPage).toBeVisible();
  });

  test('should display "Not Found" page in host dialog', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'invalid-path'}});

    const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpener.open({component: 'host-dialog', variant: 'invalid-path'}, {cssClass: 'testee'});

    // Expect "Not Found" page to display.
    const notFoundPage = new PageNotFoundPagePO(appPO.dialog({cssClass: 'testee'}));
    await expectDialog(notFoundPage).toBeVisible();
  });

  test('should display host messagebox', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // TODO [#271]: Register messagebox capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented the issue #271
    // https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox'}});

    const messageboxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageboxOpener.open({component: 'host-messagebox'}, {cssClass: 'testee'});

    // Expect messagebox to display.
    const messagebox = appPO.messagebox({cssClass: 'testee'});
    const messageboxPage = new HostMessageBoxPagePO(messagebox);
    await expectMessageBox(messageboxPage).toBeVisible();
  });

  test('should display "Not Found" page in host messagebox', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

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
