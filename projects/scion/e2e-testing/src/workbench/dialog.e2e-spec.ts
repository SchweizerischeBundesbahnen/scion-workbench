/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
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
import {DialogPagePO} from '../dialog-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from '../workbench-client/page-object/popup-page.po';
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';

test.describe('Workbench Dialog', () => {

  test.describe('Contextual View', () => {

    test('should, by default and if in the context of a view, open a view-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect(await dialog.getGlassPaneBoundingBox()).toEqual(await dialogOpenerPage.view.getBoundingBox());
    });

    test('should reject the promise when attaching the dialog to a non-existent view', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);

      // Expect to error when opening the dialog.
      await expect(dialogOpenerPage.open('blank', {modality: 'view', contextualViewId: 'non-existent'})).rejects.toThrow('[NullViewError] View \'non-existent\' not found.');

      // Expect no error to be logged to the console.
      await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    // TODO [REVIEW] Why not moving to contextual-view.e2e-spec.ts
    test('should detach dialog when its contextual view is deactivated', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});

      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expect(dialog.locator).toBeVisible();

      // Activate another view.
      await appPO.openNewViewTab();
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();

      // Re-activate the view.
      await dialogOpenerPage.viewTab.click();
      await expect(dialog.locator).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect(await dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    // TODO [REVIEW] Why not moving to contextual-view.e2e-spec.ts
    test('should detach the dialog if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open view in main area.
      const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open dialog opener view.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);

      // Drag dialog opener view into peripheral area.
      await dialogOpenerPage.viewTab.dragTo({grid: 'workbench', region: 'east'});

      // Open dialog.
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expect(dialog.locator).toBeVisible();

      // Maximize the main area.
      await viewPageInMainArea.viewTab.dblclick();
      await expect(dialogOpenerPage.view.locator).not.toBeVisible();
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();

      // Restore the layout.
      await viewPageInMainArea.viewTab.dblclick();
      await expect(dialogOpenerPage.view.locator).toBeVisible();
      await expect(dialog.locator).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect(await dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should allow opening a dialog in any view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const viewTab1 = (await appPO.openNewViewTab()).view!.viewTab;
      const viewTab2 = (await appPO.openNewViewTab()).view!.viewTab;
      const viewTab3 = (await appPO.openNewViewTab()).view!.viewTab;

      // Open the dialog in view 2.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', modality: 'view', contextualViewId: await viewTab2.getViewId()});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(await appPO.getDialogCount()).toEqual(1);
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();

      // Activate view 1.
      await viewTab1.click();
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();
      await expect(await appPO.getDialogCount()).toEqual(1);

      // Activate view 2.
      await viewTab2.click();
      await expect(dialog.locator).toBeVisible();
      await expect(await appPO.getDialogCount()).toEqual(1);

      // Activate view 3.
      await viewTab3.click();
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();
      await expect(await appPO.getDialogCount()).toEqual(1);
    });

    test('should prevent closing a view if it displays a dialog with view modality', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect close button not to be visible.
      await expect(dialogOpenerPage.viewTab.closeButton).not.toBeVisible();

      // Expect context menu item to be disabled.
      const viewTabContextMenu = await dialogOpenerPage.viewTab.openContextMenu();
      await expect(viewTabContextMenu.menuItems.closeTab.locator).toBeDisabled();

      // Expect closing the view via keystroke not to close the view.
      await page.keyboard.press('Control+K');
      await expect(dialogOpenerPage.viewTab.locator).toBeVisible();
      await expect(dialog.locator).toBeVisible();

      // Expect closing all views via keystroke not to close the view.
      await page.keyboard.press('Control+Shift+Alt+K');
      await expect(dialogOpenerPage.viewTab.locator).toBeVisible();
      await expect(dialog.locator).toBeVisible();

      // Expect view to be closable when dialog is closed.
      await dialog.close();
      await expect(dialogOpenerPage.viewTab.closeButton).toBeVisible();

      await dialogOpenerPage.viewTab.close();
      await expect(dialogOpenerPage.viewTab.locator).not.toBeAttached();
    });
  });

  test.describe('Application Modality', () => {

    test('should open an application-modal dialog if not in the context of a view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', viewContextActive: false});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect(await dialog.getGlassPaneBoundingBox()).toEqual(await appPO.workbenchBoundingBox());
    });

    test('should open an application-modal dialog if in the context of a view and application-modality selected', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', viewContextActive: true, modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect(await dialog.getGlassPaneBoundingBox()).toEqual(await appPO.workbenchBoundingBox());
    });

    test('should open an application-modal dialog with viewport scope when configured', async ({appPO, workbenchNavigator}) => {
      // Start the workbench with viewport application-modality.
      await appPO.navigateTo({microfrontendSupport: false, dialogModalityScope: 'viewport'});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect(await dialog.getGlassPaneBoundingBox()).toEqual(await appPO.pageBoundingBox());
    });

    test('should delay opening view-modal dialog until all application-modal dialogs are closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two application-modal dialogs.
      const dialogOpenerViewPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerViewPage.open('dialog-opener-page', {cssClass: 'test-application-modal', modality: 'application', count: 2});

      const applicationModalDialog1 = appPO.dialog({cssClass: 'test-application-modal', nth: 0});
      const applicationModalDialog2 = appPO.dialog({cssClass: 'test-application-modal', nth: 1});

      await expect(applicationModalDialog1.locator).toBeVisible();
      await expect(applicationModalDialog2.locator).toBeVisible();

      const dialogOpenerDialogPage = new DialogOpenerPagePO(appPO, {dialog: applicationModalDialog2});
      const contextualViewId = await dialogOpenerViewPage.view.getViewId();

      // Open view-modal dialog.
      // Expect view-modal dialog to be attached only after all application-modal dialogs are closed.
      await dialogOpenerDialogPage.open('dialog-page', {cssClass: 'testee', modality: 'view', contextualViewId, waitUntilOpened: false});

      const testeeDialog = appPO.dialog({cssClass: 'testee'});
      await expect(testeeDialog.locator).not.toBeAttached();

      await applicationModalDialog2.close();
      await expect(testeeDialog.locator).not.toBeAttached();

      await applicationModalDialog1.close();
      await expect(testeeDialog.locator).toBeVisible();
    });

    test('should hide application-modal dialog when unmounting the workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', viewContextActive: true, modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expect(dialog.locator).toBeVisible();

      // Unmount the workbench component by navigating the primary router outlet.
      await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();

      // Re-mount the workbench component by navigating the primary router.
      await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});
      await expect(dialog.locator).toBeVisible();
      await expect(await dialog.getGlassPaneBoundingBox()).toEqual(await appPO.workbenchBoundingBox());

      // Expect the component not to be constructed anew.
      await expect(await dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Focus Trap', () => {

    test('should focus first element when opened', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should not focus elements under the glass pane', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);

      await expect(dialogOpenerPage.click({timeout: 1000})).rejects.toThrowError();
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should not focus popup under the glass pane', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a global popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPosition({bottom: 100, right: 100});
      await popupOpenerPage.enterContextualViewId('<null>');
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(popup.locator).toBeVisible();
      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);

      await expect(popupPage.clickClose({timeout: 1000})).rejects.toThrowError();
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should trap focus and cycle through all elements (pressing TAB)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);

      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should trap focus and cycle through all elements (pressing SHIFT+TAB)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should restore focus after re-activating its contextual view', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);

      // Move focus.
      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      // Activate another view.
      await appPO.openNewViewTab();
      await expect(focusTestPage.middleField).not.toBeFocused();

      // Re-activate the dialog view.
      await dialogOpenerPage.viewTab.click();
      await expect(focusTestPage.middleField).toBeFocused();
    });

    test('should restore focus to application-modal dialog after re-mounting the workbench', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);

      // Move focus.
      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      // Unmount the workbench component by navigating the primary router outlet.
      await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-blank-page'});
      await expect(focusTestPage.middleField).not.toBeFocused();

      // Re-mount the workbench component by navigating the primary router.
      await appPO.header.clickMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});
      await expect(focusTestPage.middleField).toBeFocused();
    });

    test('should focus top dialog from the stack when previous top-most dialog is closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', count: 3});

      const dialog1 = appPO.dialog({cssClass: 'testee', nth: 0});
      const dialog2 = appPO.dialog({cssClass: 'testee', nth: 1});
      const dialog3 = appPO.dialog({cssClass: 'testee', nth: 2});
      const focusTestPage1 = new FocusTestPagePO(dialog1);
      const focusTestPage2 = new FocusTestPagePO(dialog2);
      const focusTestPage3 = new FocusTestPagePO(dialog3);

      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).toBeFocused();

      // Close top-most dialog.
      await dialog3.close();
      await expect(dialog3.locator).not.toBeAttached();
      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).toBeFocused();
    });

    test('should restore focus to top dialog after re-activating its contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', count: 3});

      const dialog1 = appPO.dialog({cssClass: 'testee', nth: 0});
      const dialog2 = appPO.dialog({cssClass: 'testee', nth: 1});
      const dialog3 = appPO.dialog({cssClass: 'testee', nth: 2});
      const focusTestPage1 = new FocusTestPagePO(dialog1);
      const focusTestPage2 = new FocusTestPagePO(dialog2);
      const focusTestPage3 = new FocusTestPagePO(dialog3);

      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).toBeFocused();

      // Activate another view.
      await appPO.openNewViewTab();
      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).not.toBeFocused();

      // Re-activate the dialog view.
      await dialogOpenerPage.viewTab.click();
      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).toBeFocused();
    });

    test('should restore focus to opener view when last dialog is closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 2 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', count: 2});

      const dialog1 = appPO.dialog({cssClass: 'testee', nth: 0});
      const dialog2 = appPO.dialog({cssClass: 'testee', nth: 1});

      const focusTestPage1 = new FocusTestPagePO(dialog1);
      const focusTestPage2 = new FocusTestPagePO(dialog2);

      // Expect dialog 2 to have focus.
      await expect(focusTestPage2.firstField).toBeFocused();

      // Close dialog 2.
      await dialog2.close();

      // Expect dialog 1 to have focus.
      await expect(focusTestPage1.firstField).toBeFocused();

      // Close dialog 1.
      await dialog1.close();

      // Expect open button to have focus.
      await expect(dialogOpenerPage.openButton).toBeFocused();
    });
  });

  test.describe('Title', () => {

    test('should allow setting title from the dialog component', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.enterTitle('TITLE');

      // Expect the title to be set.
      await expect(dialog.title).toHaveText('TITLE');

      // Expect no error to be thrown, e.g. ExpressionChangedAfterItHasBeenCheckedError.
      await expect(await consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    test('should not change dialog width when setting long title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const dialogPaneBoundingBox = await dialog.getDialogBoundingBox();
      await dialogPage.enterTitle('Very Long Title'.repeat(100));

      // Expect title not to change dialog width.
      await expect(await dialog.getDialogBoundingBox()).toEqual(dialogPaneBoundingBox);
    });
  });

  test.describe('Input', () => {

    test('should make inputs available as input properties.', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {inputs: {input: 'ABC'}, cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect(dialogPage.input).toHaveValue('ABC');
    });
  });

  test.describe('Closing', () => {

    test('should allow closing the dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();

      // Close the dialog.
      await dialog.close();
      await expect(dialog.locator).not.toBeAttached();
    });

    test('should close the dialog on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();

      // Close the dialog by Escape keystroke.
      await page.keyboard.press('Escape');
      await expect(dialog.locator).not.toBeAttached();
    });

    test('should allow non-closable dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();

      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.setClosable(false);

      // Expect the close button not to be visible.
      await expect(dialog.closeButton).not.toBeVisible();
    });

    test('should NOT close the dialog on escape keystroke if dialog is NOT closable', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.setClosable(false);

      // Try closing the dialog by Escape keystroke.
      await page.keyboard.press('Escape');

      // Expect dialog not to be closed.
      await expect(dialog.locator).toBeVisible();
    });

    test('should allow closing the dialog with a result', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.close({returnValue: 'SUCCESS'});

      await expect(dialogOpenerPage.returnValue).toHaveText('SUCCESS');
    });

    test('should allow closing the dialog with an error', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.close({returnValue: 'ERROR', closeWithError: true});

      await expect(dialogOpenerPage.error).toHaveText('ERROR');
    });
  });

  test.describe('Stacking', () => {

    test('should stack multiple dialogs and offset them horizontally and vertically', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', count: 3});

      const dialog1 = appPO.dialog({cssClass: 'testee', nth: 0});
      const dialog1Bounds = await dialog1.getDialogBoundingBox();

      const dialog2 = appPO.dialog({cssClass: 'testee', nth: 1});
      const dialog2Bounds = await dialog2.getDialogBoundingBox();

      const dialog3 = appPO.dialog({cssClass: 'testee', nth: 2});
      const dialog3Bounds = await dialog3.getDialogBoundingBox();

      await expect(dialog1.locator).toBeVisible();
      await expect(dialog2.locator).toBeVisible();
      await expect(dialog3.locator).toBeVisible();

      // Expect the dialogs to be displayed offset.
      expect(dialog2Bounds.left - dialog1Bounds.left).toEqual(10);
      expect(dialog2Bounds.top - dialog1Bounds.top).toEqual(10);
      expect(dialog3Bounds.left - dialog2Bounds.left).toEqual(10);
      expect(dialog3Bounds.top - dialog2Bounds.top).toEqual(10);
    });

    test('should allow interaction only with top dialog from the stack', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', count: 3});

      const firstDialog = appPO.dialog({cssClass: 'testee', nth: 0});
      await expect(firstDialog.locator).toBeVisible();

      const middleDialog = appPO.dialog({cssClass: 'testee', nth: 1});
      await expect(middleDialog.locator).toBeVisible();

      const topDialog = appPO.dialog({cssClass: 'testee', nth: 2});
      await expect(topDialog.locator).toBeVisible();

      // Expect first dialog not to be interactable.
      await expect(firstDialog.clickHeader({timeout: 1000})).rejects.toThrowError();

      // Expect middle dialog not to be interactable.
      await expect(middleDialog.clickHeader({timeout: 1000})).rejects.toThrowError();

      // Expect top dialog to be interactable.
      await expect(topDialog.clickHeader()).resolves.toBeUndefined();
    });
  });
});
