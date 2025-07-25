/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {PartId, WorkbenchLayout} from '@scion/workbench';
import {ActiveWorkbenchElementLogPagePO} from '../workbench/page-object/test-pages/active-workbench-element-log-page.po';
import {MAIN_AREA} from '../workbench.model';
import {HostFocusTestPagePO} from '../workbench/page-object/test-pages/host-focus-test-page.po';

test.describe('Focus Tracker', () => {

  test('should focus view when opening microfrontend view', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/focus-test-page',
      },
    });

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend router view.
    const router = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const routerViewId = await router.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend router view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(routerViewId);

    // TEST: Open view.
    await router.navigate({component: 'testee'}, {cssClass: 'testee'});
    const viewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const focusTestPage = new FocusTestPagePO(appPO, {id: viewId});
    await focusTestPage.waitUntilAttached();

    // Expect view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(viewId);
    await expect.poll(() => logPart.getLog()).toEqual([viewId]);
    await expect(appPO.view({viewId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the view.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect view not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([viewId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the view.
    await focusTestPage.firstField.click();

    // Expect view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(viewId);
    await expect.poll(() => logPart.getLog()).toEqual([viewId, 'part.right', viewId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the view.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect view not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([viewId, 'part.right', viewId, 'part.right']);
    await expect(appPO.part({partId: 'part.right'}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the view.
    await focusTestPage.firstField.click();

    // Expect view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(viewId);
    await expect.poll(() => logPart.getLog()).toEqual([viewId, 'part.right', viewId, 'part.right', viewId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the view.
    await appPO.view({viewId: viewId}).tab.close();

    // Expect view not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(routerViewId);
    await expect.poll(() => logPart.getLog()).toEqual([viewId, 'part.right', viewId, 'part.right', viewId, routerViewId]);
  });

  test('should focus dialog when opening microfrontend dialog', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/focus-test-page',
        size: {height: '300px', width: '300px'},
      },
    });

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend dialog opener view.
    const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    const dialogOpenerViewId = await dialogOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend dialog opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogOpenerViewId);

    // TEST: Open dialog.
    await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();
    const focusTestPage = new FocusTestPagePO(appPO, {id: dialogId});
    await focusTestPage.waitUntilAttached();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.dialog({dialogId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the dialog.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the dialog.
    await focusTestPage.firstField.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the dialog.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the dialog.
    await focusTestPage.firstField.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the dialog.
    await appPO.dialog({dialogId}).close();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId, null]);
  });

  test('should focus dialog when opening microfrontend host dialog', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    // TODO [#271]: Register dialog capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'host-dialog', variant: 'focus-page'}});

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend dialog opener view.
    const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    const dialogOpenerViewId = await dialogOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend dialog opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogOpenerViewId);

    // TEST: Open dialog.
    await dialogOpener.open({component: 'host-dialog', variant: 'focus-page'}, {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();
    const focusTestPage = new HostFocusTestPagePO(appPO.dialog({dialogId}));

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.dialog({dialogId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the dialog.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the dialog.
    await focusTestPage.firstField.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the dialog.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the dialog.
    await focusTestPage.firstField.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the dialog.
    await appPO.dialog({dialogId}).close();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId, null]);
  });

  test('should focus messagebox when opening microfrontend messagebox', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/focus-test-page',
        size: {height: '300px', width: '300px'},
      },
    });

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend messagebox opener view.
    const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    const messageBoxOpenerViewId = await messageBoxOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend messagebox opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(messageBoxOpenerViewId);

    // TEST: Open messagebox.
    await messageBoxOpener.open({component: 'testee'}, {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();
    const focusTestPage = new FocusTestPagePO(appPO, {id: dialogId});
    await focusTestPage.waitUntilAttached();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.dialog({dialogId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the messagebox.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect messagebox not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the messagebox.
    await focusTestPage.firstField.click();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the messagebox.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect messagebox not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the messagebox.
    await focusTestPage.firstField.click();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the messagebox.
    await appPO.messagebox({dialogId}).clickActionButton('ok');

    // Expect messagebox not to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId, null]);
  });

  test('should focus messagebox when opening microfrontend host messagebox', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    // TODO [#271]: Register messagebox capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'host-messagebox', variant: 'focus-page'}});

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend messagebox opener view.
    const messageBoxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    const messageBoxOpenerViewId = await messageBoxOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend messagebox opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(messageBoxOpenerViewId);

    // TEST: Open messagebox.
    await messageBoxOpener.open({component: 'host-messagebox', variant: 'focus-page'}, {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();
    const focusTestPage = new HostFocusTestPagePO(appPO.dialog({dialogId}));

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.messagebox({dialogId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the messagebox.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect messagebox not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the messagebox.
    await focusTestPage.firstField.click();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the messagebox.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect messagebox not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the messagebox.
    await focusTestPage.firstField.click();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the messagebox.
    await appPO.messagebox({dialogId}).clickActionButton('ok');

    // Expect messagebox not to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([dialogId, 'part.right', dialogId, 'part.right', dialogId, null]);
  });

  test('should focus popup when opening microfrontend popup', async ({appPO, workbenchNavigator, microfrontendNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/focus-test-page',
        size: {height: '300px', width: '300px'},
      },
    });

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend popup opener view.
    const popupOpener = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    const popupOpenerViewId = await popupOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend popup opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(popupOpenerViewId);

    // TEST: Open popup.
    await popupOpener.enterQualifier({component: 'testee'});
    await popupOpener.enterCssClass('testee');
    await popupOpener.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpener.open();
    const popupId = await appPO.popup({cssClass: 'testee'}).getPopupId();
    const focusTestPage = new FocusTestPagePO(appPO, {id: popupId});
    await focusTestPage.waitUntilAttached();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId]);
    await expect(appPO.popup({popupId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the popup.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the popup.
    await focusTestPage.firstField.click();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the popup.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the popup.
    await focusTestPage.firstField.click();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId, 'part.right', popupId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the popup by pressing Escape.
    await page.keyboard.press('Escape');

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId, 'part.right', popupId, null]);
  });

  test('should focus popup when opening microfrontend host popup', async ({appPO, workbenchNavigator, microfrontendNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Right'})
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    // TODO [#271]: Register popup capability in the host app via RegisterWorkbenchCapabilityPagePO when implemented
    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'host-popup', variant: 'focus-page'}});

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open microfrontend popup opener view.
    const popupOpener = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    const popupOpenerViewId = await popupOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect microfrontend popup opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(popupOpenerViewId);

    // TEST: Open popup.
    await popupOpener.enterQualifier({component: 'host-popup', variant: 'focus-page'});
    await popupOpener.enterCssClass('testee');
    await popupOpener.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpener.open();
    const popupId = await appPO.popup({cssClass: 'testee'}).getPopupId();
    const focusTestPage = new HostFocusTestPagePO(appPO.popup({popupId}));

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId]);
    await expect(appPO.popup({popupId}).locator).toContainFocus();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the popup.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the popup.
    await focusTestPage.firstField.click();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Focus element outside the popup.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId, 'part.right']);
    await expect.poll(() => focusTestPage.isFocused()).toBe(false);

    // TEST: Focus element in the popup.
    await focusTestPage.firstField.click();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId, 'part.right', popupId]);
    await expect(focusTestPage.firstField).toBeFocused();
    await expect.poll(() => focusTestPage.isFocused()).toBe(true);

    // TEST: Close the popup by pressing Escape.
    await page.keyboard.press('Escape');

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([popupId, 'part.right', popupId, 'part.right', popupId, null]);
  });
});

/**
 * Adds a part logging the active workbench element.
 */
function addActiveWorkbenchElementPart(part: PartId): (layout: WorkbenchLayout) => WorkbenchLayout {
  return (layout: WorkbenchLayout) => layout
    .addPart(part, {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal', ɵactivityId: 'activity.log'})
    .navigatePart(part, ['active-workbench-element-log'])
    .activatePart(part);
}
