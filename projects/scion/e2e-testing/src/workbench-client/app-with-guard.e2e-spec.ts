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
import {PopupPagePO} from '../workbench/page-object/popup-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {PageNotFoundPagePO} from '../workbench/page-object/page-not-found-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {expectDialog} from '../matcher/dialog-matcher';
import {MessageBoxPagePO} from '../workbench/page-object/message-box-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPopupCapability} from './page-object/register-workbench-capability-page.po';
import {DialogPagePO} from '../workbench/page-object/dialog-page.po';

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

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'popup', app: 'host'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    // Expect popup to display.
    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);
    await expectPopup(popupPage).toBeVisible();
  });

  test('should display "Not Found" page in host popup', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // Register host popup capability.
    await microfrontendNavigator.registerCapability<WorkbenchPopupCapability>('host', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    // Expect "Not Found" page to display.
    const notFoundPage = new PageNotFoundPagePO(appPO.popup({cssClass: 'testee'}));
    await expectPopup(notFoundPage).toBeVisible();
  });

  test('should display host dialog', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpener.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

    // Expect dialog to display.
    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);
    await expectDialog(dialogPage).toBeVisible();
  });

  test('should display "Not Found" page in host dialog', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // Register host dialog capability.
    await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

    const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});

    // Expect "Not Found" page to display.
    const notFoundPage = new PageNotFoundPagePO(appPO.dialog({cssClass: 'testee'}));
    await expectDialog(notFoundPage).toBeVisible();
  });

  test('should display host messagebox', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

    const messageboxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageboxOpener.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

    // Expect messagebox to display.
    const messagebox = appPO.messagebox({cssClass: 'testee'});
    const messageboxPage = new MessageBoxPagePO(messagebox);
    await expectMessageBox(messageboxPage).toBeVisible();
  });

  test('should display "Not Found" page in host messagebox', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: true});

    // Register host messagebox capability.
    await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

    const messageboxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageboxOpener.open({component: 'testee'}, {cssClass: 'testee'});

    // Expect "Not Found" page to display.
    const notFoundPage = new PageNotFoundPagePO(appPO.messagebox({cssClass: 'testee'}));
    await expectMessageBox(notFoundPage).toBeVisible();
  });
});
