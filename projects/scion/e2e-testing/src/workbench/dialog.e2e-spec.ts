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
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench Dialog', () => {

  test.describe('Contextual View', () => {

    test('should, by default and if in the context of a view, open a view-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.view.getBoundingBox()]));
    });

    test('should reject the promise when attaching the dialog to a non-existent view', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);

      // Expect to error when opening the dialog.
      await expect(dialogOpenerPage.open('blank', {modality: 'view', contextualViewId: 'non-existent'})).rejects.toThrow('[NullViewError] View \'non-existent\' not found.');

      // Expect no error to be logged to the console.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
    });

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
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

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
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
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
      await expect.poll(() => appPO.getDialogCount()).toEqual(1);
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();

      // Activate view 1.
      await viewTab1.click();
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();
      await expect.poll(() => appPO.getDialogCount()).toEqual(1);

      // Activate view 2.
      await viewTab2.click();
      await expect(dialog.locator).toBeVisible();
      await expect.poll(() => appPO.getDialogCount()).toEqual(1);

      // Activate view 3.
      await viewTab3.click();
      await expect(dialog.locator).not.toBeVisible();
      await expect(dialog.locator).toBeAttached();
      await expect.poll(() => appPO.getDialogCount()).toEqual(1);
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

    test('should propagate view context', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open target view.
      const dialogTargetViewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open dialog in target view.
      const dialogOpenerPage1 = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage1.open('dialog-opener-page', {cssClass: 'testee-1', modality: 'view', contextualViewId: dialogTargetViewPage.viewId});
      const dialog1 = appPO.dialog({cssClass: 'testee-1'});
      await expect(dialog1.locator).not.toBeVisible();

      // Activate target view.
      await dialogTargetViewPage.viewTab.click();
      await expect(dialog1.locator).toBeVisible();

      // Open another dialog from the dialog (inherit dialog's view context).
      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO, {dialog: dialog1});
      await dialogOpenerPage2.open('dialog-page', {cssClass: 'testee-2'});
      const dialog2 = appPO.dialog({cssClass: 'testee-2'});

      // Expect dialog 2 to have contextual view of dialog 1, i.e., is also visible.
      await expect(dialog2.locator).toBeVisible();

      // Activate other view.
      await dialogOpenerPage1.viewTab.click();

      // Expect dialog 1 and dialog 2 not to be visible because contextual view is not active.
      await expect(dialog1.locator).not.toBeVisible();
      await expect(dialog2.locator).not.toBeVisible();

      // Activate contextual view of the dialogs.
      await dialogTargetViewPage.viewTab.click();

      // Expect dialog 1 and dialog 2 to be visible.
      await expect(dialog1.locator).toBeVisible();
      await expect(dialog2.locator).toBeVisible();
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
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
      ]));
    });

    test('should open an application-modal dialog if in the context of a view and application-modality selected', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', viewContextActive: true, modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
      ]));
    });

    test('should open an application-modal dialog with viewport scope when configured', async ({appPO, workbenchNavigator}) => {
      // Start the workbench with viewport application-modality.
      await appPO.navigateTo({microfrontendSupport: false, dialogModalityScope: 'viewport'});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('blank', {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await expect(dialog.locator).toBeVisible();
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        appPO.viewportBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
      ]));
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
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
      ]));

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Focus', () => {

    test('should focus first element when opened', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(dialog);
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
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
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
      await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(dialogPaneBoundingBox);
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

  test.describe('Moving', () => {

    test('should support moving the dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogBounds = await dialog.getDialogBoundingBox();

      await test.step('moving dialog 50px to the right and 100px to the bottom', async () => {
        await dialog.moveDialog({x: 50, y: 100});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x + 50,
          y: dialogBounds.y + 100,
          height: dialogBounds.height,
          width: dialogBounds.width,
        }));
      });

      await test.step('moving dialog 100px to the left', async () => {
        await dialog.moveDialog({x: -100, y: 0});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x - 50,
          y: dialogBounds.y + 100,
          height: dialogBounds.height,
          width: dialogBounds.width,
        }));
      });

      await test.step('moving dialog 100px to the top', async () => {
        await dialog.moveDialog({x: 0, y: -100});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x - 50,
          y: dialogBounds.y,
          height: dialogBounds.height,
          width: dialogBounds.width,
        }));
      });

      await test.step('moving dialog 50px to the right', async () => {
        await dialog.moveDialog({x: 50, y: 0});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: dialogBounds.height,
          width: dialogBounds.width,
        }));
      });
    });
  });

  test.describe('Size', () => {

    test('should adapt dialog size to the content size', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Unset padding to facilitate size assertion.
      await dialogPage.setPadding(false);

      // Capture border, header and footer height.
      const dialogBorder = 2 * await dialog.getDialogBorderWidth();
      const dialogHeaderHeight = (await dialog.getHeaderBoundingBox()).height;
      const dialogFooterHeight = (await dialog.getFooterBoundingBox()).height;

      // Change the size of the content.
      await dialogPage.enterContentSize({
        height: '500px',
        width: '500px',
      });

      // Expect the dialog to adapt to the content size.
      await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
        height: 500 + dialogBorder + dialogHeaderHeight + dialogFooterHeight,
        width: 500 + dialogBorder,
      }));

      await test.step('should not grow past max-height', async () => {
        await dialogPage.enterDialogSize({maxHeight: '300px'});

        // Expect the dialog height to be max height.
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          height: 300,
          width: 500 + dialogBorder,
        }));

        // Expect the dialog content to overflow vertically.
        await expect(dialog.contentScrollbars.vertical).toBeVisible();
        await expect(dialog.contentScrollbars.horizontal).not.toBeVisible();
      });

      await test.step('should not shrink past min-height', async () => {
        await dialogPage.enterDialogSize({minHeight: '600px'});

        // Expect the dialog height to be min height.
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          height: 600,
          width: 500 + dialogBorder,
        }));

        // Expect the dialog content not to overflow vertically.
        await expect(dialog.contentScrollbars.vertical).not.toBeVisible();
        await expect(dialog.contentScrollbars.horizontal).not.toBeVisible();
      });

      await test.step('should not grow past max-width', async () => {
        await dialogPage.enterDialogSize({maxWidth: '300px'});

        // Expect the dialog width to be max-width.
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          height: 500 + dialogBorder + dialogHeaderHeight + dialogFooterHeight,
          width: 300,
        }));

        // Expect the dialog content to overflow horizontally.
        await expect(dialog.contentScrollbars.vertical).not.toBeVisible();
        await expect(dialog.contentScrollbars.horizontal).toBeVisible();
      });

      await test.step('should not shrink past min-width', async () => {
        await dialogPage.enterDialogSize({minWidth: '600px'});

        // Expect the dialog width to be min-width.
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          height: 500 + dialogBorder + dialogHeaderHeight + dialogFooterHeight,
          width: 600,
        }));

        // Expect the dialog content not to overflow horizontally.
        await expect(dialog.contentScrollbars.vertical).not.toBeVisible();
        await expect(dialog.contentScrollbars.horizontal).not.toBeVisible();
      });
    });
  });

  test.describe('Resizing', () => {

    test('should be resizable by default', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect the dialog to be resizable.
      await expect(dialog.resizeHandles).toHaveCount(8); // top-left, top, top-right, right, bottom-right, bottom, bottom-left, left
    });

    test('should allow non-resizable dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.setResizable(false);

      // Expect the dialog not to be resizable.
      await expect(dialog.resizeHandles).toHaveCount(0);
    });

    test('should prefer minimal size over maximal size ', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      const dialogPage = new DialogPagePO(dialog);
      await dialogPage.enterDialogSize({
        minWidth: '500px',
        maxWidth: '400px',
        minHeight: '500px',
        maxHeight: '400px',
      });

      const dialogBounds = await dialog.getDialogBoundingBox();

      await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
        x: dialogBounds.x,
        y: dialogBounds.y,
        height: 500,
        width: 500,
      }));

      // Trying to resize the dialog ...
      await test.step('resizing dialog via top handle', async () => {
        await dialog.resizeTop(-10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeTop(10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via right handle', async () => {
        await dialog.resizeRight(-10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeRight(10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via bottom handle', async () => {
        await dialog.resizeBottom(-10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeBottom(10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via left handle', async () => {
        await dialog.resizeLeft(-10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeLeft(10);
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via top-right handle', async () => {
        await dialog.resizeTopRight({x: -10, y: -10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeTopRight({x: 10, y: 10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via bottom-right handle', async () => {
        await dialog.resizeBottomRight({x: -10, y: -10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeBottomRight({x: 10, y: 10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via bottom-left handle', async () => {
        await dialog.resizeBottomLeft({x: -10, y: -10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeBottomLeft({x: 10, y: 10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });

      await test.step('resizing dialog via top-left handle', async () => {
        await dialog.resizeTopLeft({x: -10, y: -10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));

        await dialog.resizeTopLeft({x: 10, y: 10});
        await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
          x: dialogBounds.x,
          y: dialogBounds.y,
          height: 500,
          width: 500,
        }));
      });
    });

    test.describe('top handle', () => {

      test('should resize the dialog when dragging the top handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the top', async () => {
          await dialog.resizeTop(-10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y - 10,
            height: dialogBounds.height + 10,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle 10px to the bottom', async () => {
          await dialog.resizeTop(10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the top handle, respecting height constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minHeight: '300px',
          maxHeight: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-height to the top', async () => {
          await dialog.resizeTop(-200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y - 100,
            height: dialogBounds.height + 100,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.hcenter, dialogBounds.top, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-height to the bottom', async () => {
          await dialog.resizeTop(200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y + 100,
            height: dialogBounds.height - 100,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.hcenter, dialogBounds.top, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('bottom handle', () => {

      test('should resize the dialog when dragging the bottom handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the bottom', async () => {
          await dialog.resizeBottom(10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height + 10,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle 10px to the top', async () => {
          await dialog.resizeBottom(-10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the bottom handle, respecting height constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minHeight: '300px',
          maxHeight: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-height to the bottom', async () => {
          await dialog.resizeBottom(200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height + 100,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.hcenter, dialogBounds.bottom, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-height to the top', async () => {
          await dialog.resizeBottom(-200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height - 100,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.hcenter, dialogBounds.bottom, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('left handle', () => {

      test('should resize the dialog when dragging the left handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the left', async () => {
          await dialog.resizeLeft(-10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x - 10,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width + 10,
          }));
        });

        await test.step('dragging handle 10px to the right', async () => {
          await dialog.resizeLeft(10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the left handle, respecting width constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-width to the left', async () => {
          await dialog.resizeLeft(-200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x - 100,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width + 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.left, dialogBounds.vcenter, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-width to the right', async () => {
          await dialog.resizeLeft(200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x + 100,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width - 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.left, dialogBounds.vcenter, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('right handle', () => {

      test('should resize the dialog when dragging the right handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the right', async () => {
          await dialog.resizeRight(10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width + 10,
          }));
        });

        await test.step('dragging handle 10px to the left', async () => {
          await dialog.resizeRight(-10);
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the right handle, respecting width constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-width to the right', async () => {
          await dialog.resizeRight(200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width + 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.right, dialogBounds.vcenter, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-width to the left', async () => {
          await dialog.resizeRight(-200, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width - 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.right, dialogBounds.vcenter, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('top-left handle', () => {

      test('should resize the dialog when dragging the top-left handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the left and 20px to the top', async () => {
          await dialog.resizeTopLeft({x: -10, y: -20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x - 10,
            y: dialogBounds.y - 20,
            height: dialogBounds.height + 20,
            width: dialogBounds.width + 10,
          }));
        });

        await test.step('dragging handle 10px to the right and 20px to the bottom', async () => {
          await dialog.resizeTopLeft({x: 10, y: 20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the top-left handle, respecting width constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
          minHeight: '300px',
          maxHeight: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-size', async () => {
          await dialog.resizeTopLeft({x: -200, y: -200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x - 100,
            y: dialogBounds.y - 100,
            height: dialogBounds.height + 100,
            width: dialogBounds.width + 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.left, dialogBounds.top, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-size', async () => {
          await dialog.resizeTopLeft({x: 200, y: 200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x + 100,
            y: dialogBounds.y + 100,
            height: dialogBounds.height - 100,
            width: dialogBounds.width - 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.left, dialogBounds.top, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('top-right handle', () => {

      test('should resize the dialog when dragging the top-right handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the right and 20px to the top', async () => {
          await dialog.resizeTopRight({x: 10, y: -20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y - 20,
            height: dialogBounds.height + 20,
            width: dialogBounds.width + 10,
          }));
        });

        await test.step('dragging handle 10px to the left and 20px to the bottom', async () => {
          await dialog.resizeTopRight({x: -10, y: 20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the top-right handle, respecting width constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
          minHeight: '300px',
          maxHeight: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-size', async () => {
          await dialog.resizeTopRight({x: 200, y: -200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y - 100,
            height: dialogBounds.height + 100,
            width: dialogBounds.width + 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.right, dialogBounds.top, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-size', async () => {
          await dialog.resizeTopRight({x: -200, y: 200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y + 100,
            height: dialogBounds.height - 100,
            width: dialogBounds.width - 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.right, dialogBounds.top, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('bottom-right handle', () => {

      test('should resize the dialog when dragging the bottom-right handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the right and 20px to the bottom', async () => {
          await dialog.resizeBottomRight({x: 10, y: 20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height + 20,
            width: dialogBounds.width + 10,
          }));
        });

        await test.step('dragging handle 10px to the left and 20px to the top', async () => {
          await dialog.resizeBottomRight({x: -10, y: -20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the bottom-right handle, respecting width constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
          minHeight: '300px',
          maxHeight: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-size', async () => {
          await dialog.resizeBottomRight({x: 200, y: 200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height + 100,
            width: dialogBounds.width + 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.right, dialogBounds.bottom, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-size', async () => {
          await dialog.resizeBottomRight({x: -200, y: -200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height - 100,
            width: dialogBounds.width - 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.right, dialogBounds.bottom, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });

    test.describe('bottom-left handle', () => {

      test('should resize the dialog when dragging the bottom-left handle', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({height: '500px', width: '500px'});
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle 10px to the left and 20px to the bottom', async () => {
          await dialog.resizeBottomLeft({x: -10, y: 20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x - 10,
            y: dialogBounds.y,
            height: dialogBounds.height + 20,
            width: dialogBounds.width + 10,
          }));
        });

        await test.step('dragging handle 10px to the right and 20px to the top', async () => {
          await dialog.resizeBottomLeft({x: 10, y: -20});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });

      test('should resize the dialog when dragging the bottom-left handle, respecting width constraints', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({microfrontendSupport: false});

        // Open the dialog.
        const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
        await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

        const dialog = appPO.dialog({cssClass: 'testee'});
        const dialogPage = new DialogPagePO(dialog);
        await dialogPage.enterDialogSize({
          height: '400px',
          width: '400px',
          minWidth: '300px',
          maxWidth: '500px',
          minHeight: '300px',
          maxHeight: '500px',
        });
        const dialogBounds = await dialog.getDialogBoundingBox();

        // Resize the dialog.
        await test.step('dragging handle past max-size', async () => {
          await dialog.resizeBottomLeft({x: -200, y: 200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x - 100,
            y: dialogBounds.y,
            height: dialogBounds.height + 100,
            width: dialogBounds.width + 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.left, dialogBounds.bottom, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });

        await test.step('dragging handle past min-size', async () => {
          await dialog.resizeBottomLeft({x: 200, y: -200}, {mouseup: false});
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x + 100,
            y: dialogBounds.y,
            height: dialogBounds.height - 100,
            width: dialogBounds.width - 100,
          }));
        });

        await test.step('dragging handle back to initial position', async () => {
          const mouse = appPO.page.mouse;
          await mouse.move(dialogBounds.left, dialogBounds.bottom, {steps: 10});
          await mouse.up();
          await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
            x: dialogBounds.x,
            y: dialogBounds.y,
            height: dialogBounds.height,
            width: dialogBounds.width,
          }));
        });
      });
    });
  });

  test.describe('Blocking', () => {

    test('should block interaction with contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogRect = await dialog.getDialogBoundingBox();
      // Move dialog to the bottom right corner.
      await dialog.moveDialog({x: appPO.viewportBoundingBox().right - dialogRect.right, y: appPO.viewportBoundingBox().bottom - dialogRect.bottom});

      // Expect interaction with contextual view to be blocked.
      await expect(dialogOpenerPage.click({timeout: 1000})).rejects.toThrowError();
      await expect(new FocusTestPagePO(dialog).firstField).toBeFocused();

      // Expect glass pane
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.view.getBoundingBox(),
      ]));
    });

    test('should block interaction with contextual dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog 1.
      const dialogOpenerViewPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerViewPage.open('dialog-opener-page', {cssClass: 'testee-1'});
      const dialog1 = appPO.dialog({cssClass: 'testee-1'});
      const dialog1Rect = await dialog1.getDialogBoundingBox();
      // Move dialog to the bottom left corner.
      await dialog1.moveDialog({x: appPO.viewportBoundingBox().left - dialog1Rect.left, y: appPO.viewportBoundingBox().bottom - dialog1Rect.bottom});

      // Open dialog 2 from dialog 1.
      const dialogOpenerDialogPage = new DialogOpenerPagePO(appPO, {dialog: dialog1});
      await dialogOpenerDialogPage.open('focus-test-page', {cssClass: 'testee-2'});
      const dialog2 = appPO.dialog({cssClass: 'testee-2'});
      const dialog2Rect = await dialog2.getDialogBoundingBox();
      // Move dialog to the bottom right corner.
      await dialog2.moveDialog({x: appPO.viewportBoundingBox().right - dialog2Rect.right, y: appPO.viewportBoundingBox().bottom - dialog2Rect.bottom});

      // Expect interaction with contextual view to be blocked.
      await expect(dialogOpenerViewPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect interaction with contextual dialog to be blocked.
      await expect(dialogOpenerDialogPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect dialog 2 to be interactable
      const focusTestPage = new FocusTestPagePO(dialog2);
      await expect(focusTestPage.firstField).toBeFocused();
      await focusTestPage.clickField('middle-field');
      await expect(focusTestPage.middleField).toBeFocused();

      // Expect glass panes
      await expect.poll(() => dialog1.getGlassPaneBoundingBoxes()).toEqual(new Set([]));
      await expect.poll(() => dialog2.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerViewPage.view.getBoundingBox(),
        await dialog1.getDialogBoundingBox(),
      ]));
    });

    test('should block interaction with contextual popup', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup
      const popupOpenerViewPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerViewPage.selectPopupComponent('dialog-opener-page');
      await popupOpenerViewPage.enterCssClass('testee');
      await popupOpenerViewPage.enterPosition({bottom: 0, left: 0});
      await popupOpenerViewPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerViewPage.clickOpen();
      const popup = appPO.popup({cssClass: 'testee'});

      // Open dialog from popup.
      const dialogOpenerPopupPage = new DialogOpenerPagePO(appPO, {popup});
      await dialogOpenerPopupPage.open('focus-test-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogRect = await dialog.getDialogBoundingBox();
      // Move dialog to the bottom right corner.
      await dialog.moveDialog({x: appPO.viewportBoundingBox().right - dialogRect.right, y: appPO.viewportBoundingBox().bottom - dialogRect.bottom});

      // Expect interaction with contextual view to be blocked.
      await expect(popupOpenerViewPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect interaction with contextual popup to be blocked.
      await expect(dialogOpenerPopupPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect dialog to be interactable
      const focusTestPage = new FocusTestPagePO(dialog);
      await expect(focusTestPage.firstField).toBeFocused();
      await focusTestPage.clickField('middle-field');
      await expect(focusTestPage.middleField).toBeFocused();

      // Expect glass panes
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await popupOpenerViewPage.view.getBoundingBox(),
        await popup.getBoundingBox('wb-popup'),
      ]));
    });

    test('should not block dialogs of other views', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two dialog opener views side by side.
      const dialogOpenerViewPage1 = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      const dialogOpenerViewPage2 = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerViewPage2.viewTab.dragTo({partId: await dialogOpenerViewPage2.viewTab.part.getPartId(), region: 'east'});

      // Open dialog 1.
      await dialogOpenerViewPage1.open('focus-test-page', {cssClass: 'testee-1'});
      const dialog1 = appPO.dialog({cssClass: 'testee-1'});
      const dialog1Rect = await dialog1.getDialogBoundingBox();

      // Open dialog 2.
      await dialogOpenerViewPage2.open('focus-test-page', {cssClass: 'testee-2'});
      const dialog2 = appPO.dialog({cssClass: 'testee-2'});
      const dialog2Rect = await dialog2.getDialogBoundingBox();

      // Move dialog 1 to the top right corner.
      await dialog1.moveDialog({x: appPO.viewportBoundingBox().right - dialog1Rect.right, y: appPO.viewportBoundingBox().top - dialog1Rect.top});

      // Move dialog 2 to the bottom right corner.
      await dialog2.moveDialog({x: appPO.viewportBoundingBox().right - dialog2Rect.right, y: appPO.viewportBoundingBox().bottom - dialog2Rect.bottom});

      // Expect interaction with contextual view of dialog 1 to be blocked.
      await expect(dialogOpenerViewPage1.click({timeout: 1000})).rejects.toThrowError();
      await expect.poll(() => dialog1.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerViewPage1.view.getBoundingBox(),
      ]));

      // Expect interaction with contextual view of dialog 2 to be blocked.
      await expect(dialogOpenerViewPage2.click({timeout: 1000})).rejects.toThrowError();
      await expect.poll(() => dialog2.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerViewPage2.view.getBoundingBox(),
      ]));

      // Expect dialog 1 to be interactable
      const focusDialog1TestPage = new FocusTestPagePO(dialog1);
      await focusDialog1TestPage.clickField('middle-field');
      await expect(focusDialog1TestPage.middleField).toBeFocused();

      // Expect dialog 2 to be interactable
      const focusDialog2TestPage = new FocusTestPagePO(dialog2);
      await focusDialog2TestPage.clickField('middle-field');
      await expect(focusDialog2TestPage.middleField).toBeFocused();
    });

    test('should block workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open router view and dialog opener view side by side.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.viewTab.dragTo({partId: await dialogOpenerPage.viewTab.part.getPartId(), region: 'east'});

      // Navigate to FocusTestPageComponent
      await routerPage.enterPath('/test-pages/focus-test-page');
      await routerPage.clickNavigateViaRouterLink();
      const focusTestPage = new FocusTestPagePO(routerPage.view);

      // Open application-modal dialog.
      await dialogOpenerPage.open('dialog-page', {modality: 'application', cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect interaction with FocusTestPageComponent to be blocked.
      await expect(focusTestPage.clickField('middle-field', {timeout: 1000})).rejects.toThrowError();

      // Expect glass panes.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
        await routerPage.view.getBoundingBox(),
      ]));
    });

    test('should block viewport', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, dialogModalityScope: 'viewport'});

      // Open router view and dialog opener view side by side.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.viewTab.dragTo({partId: await dialogOpenerPage.viewTab.part.getPartId(), region: 'east'});

      // Navigate to FocusTestPageComponent
      await routerPage.enterPath('/test-pages/focus-test-page');
      await routerPage.clickNavigateViaRouterLink();
      const focusTestPage = new FocusTestPagePO(routerPage.view);

      // Open application-modal dialog.
      await dialogOpenerPage.open('dialog-page', {modality: 'application', cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect interaction with FocusTestPageComponent to be blocked.
      await expect(focusTestPage.clickField('middle-field', {timeout: 1000})).rejects.toThrowError();

      // Expect glass panes.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        appPO.viewportBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
        await routerPage.view.getBoundingBox(),
      ]));
    });
  });
});
