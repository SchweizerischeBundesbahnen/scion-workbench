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
import {ViewPagePO} from './page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {TextMessageBoxPO} from './page-object/text-message-box.po';
import {expectMessageBox} from '../matcher/message-box-matcher';
import {expect} from '@playwright/test';

/**
 * This test uses microfrontends as the workbench registers microfrontend routes programmatically in `provideWorkbench()`.
 * Thus, microfrontend routes must be matched before the routes passed to the Router, independent of the order of `provideWorkbench()`
 * and `provideRouter()`. Otherwise, a redirect an `app.routes.ts` would prevent the matching of microfrontend routes.
 */
test.describe('App With Redirect', () => {

  test('should display microfrontend [providers=workbench-before-router;routes=flat]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', microfrontendSupport: true});

    // Open view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Expect view to display.
    await expectView(viewPage).toBeActive();
  });

  test('should display microfrontend [providers=workbench-before-router;routes=nested]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', microfrontendSupport: true});

    // Open view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Expect view to display.
    await expectView(viewPage).toBeActive();
  });

  test('should display microfrontend [providers=workbench-after-router;routes=flat]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', microfrontendSupport: true});

    // Open view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Expect view to display.
    await expectView(viewPage).toBeActive();
  });

  test('should display microfrontend [providers=workbench-after-router;routes=nested]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', microfrontendSupport: true});

    // Open view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Expect view to display.
    await expectView(viewPage).toBeActive();
  });

  /**
   * The built-in message box is also based on a route registered by the Workbench.
   */
  test('should display built-in message box [providers=workbench-before-router;routes=flat]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open('TEXT', {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const textMessagePage = new TextMessageBoxPO(messageBox);

    await expectMessageBox(textMessagePage).toBeVisible();
    await expect(textMessagePage.text).toHaveText('TEXT');
  });

  /**
   * The built-in message box is also based on a route registered by the Workbench.
   */
  test('should display built-in message box [providers=workbench-before-router;routes=nested]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open('TEXT', {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const textMessagePage = new TextMessageBoxPO(messageBox);

    await expectMessageBox(textMessagePage).toBeVisible();
    await expect(textMessagePage.text).toHaveText('TEXT');
  });

  /**
   * The built-in message box is also based on a route registered by the Workbench.
   */
  test('should display built-in message box [providers=workbench-after-router;routes=flat]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open('TEXT', {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const textMessagePage = new TextMessageBoxPO(messageBox);

    await expectMessageBox(textMessagePage).toBeVisible();
    await expect(textMessagePage.text).toHaveText('TEXT');
  });

  /**
   * The built-in message box is also based on a route registered by the Workbench.
   */
  test('should display built-in message box [providers=workbench-after-router;routes=nested]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open the message box.
    const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageBoxOpenerPage.open('TEXT', {cssClass: 'testee'});

    const messageBox = appPO.messagebox({cssClass: 'testee'});
    const textMessagePage = new TextMessageBoxPO(messageBox);

    await expectMessageBox(textMessagePage).toBeVisible();
    await expect(textMessagePage.text).toHaveText('TEXT');
  });
});
