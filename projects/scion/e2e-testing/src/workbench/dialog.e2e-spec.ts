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
import {DialogPagePO} from './page-object/dialog-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {expectDialog} from '../matcher/dialog-matcher';
import {expectView} from '../matcher/view-matcher';
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {MAIN_AREA} from '../workbench.model';
import {fromRect} from '../helper/testing.util';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {expectPopup} from '../matcher/popup-matcher';
import {LargeTestPagePO} from './page-object/test-pages/large-test-page.po';
import {WorkbenchHandleBoundsTestPagePO} from './page-object/test-pages/workbench-handle-bounds-test-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';

test.describe('Workbench Dialog', () => {

  test.describe('View Context', () => {

    test('should, by default and if in the context of a view, open a view-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.view.getBoundingBox()]));
    });

    test('should reject the promise when attaching the dialog to a non-existent view', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);

      // Expect to error when opening the dialog.
      await expect(dialogOpenerPage.open('dialog-page', {context: 'view.100'})).rejects.toThrow('[NullViewError] View \'view.100\' not found.');

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
      await expectDialog(dialogPage).toBeVisible();

      // Activate another view.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Re-activate the view.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if view is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('size-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new SizeTestPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Open view.
      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await expectDialog(dialogPage).toBeHidden();
      await expectView(dialogOpenerPage).toBeInactive();
      await expectView(viewPage).toBeActive();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Activate dialog opener page.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();
      await expectView(dialogOpenerPage).toBeActive();
      await expectView(viewPage).toBeInactive();

      // Expect dialog not to be resized (no flickering).
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should detach the dialog if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
        .addView('view.100', {partId: 'part.activity-1'})
        .navigateView('view.100', ['test-dialog-opener'])
        .activatePart('part.activity-1'),
      );

      // Open view in main area.
      const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open dialog opener view.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.view({viewId: 'view.100'}));

      // Open dialog.
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expectDialog(dialogPage).toBeVisible();

      // Maximize the main area.
      await viewPageInMainArea.view.tab.dblclick();
      await expectDialog(dialogPage).toBeHidden();

      // Restore the layout.
      await viewPageInMainArea.view.tab.dblclick();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should allow opening a dialog in any view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const view1 = (await appPO.openNewViewTab()).view;
      const view2 = (await appPO.openNewViewTab()).view;
      const view3 = (await appPO.openNewViewTab()).view;

      // Open the dialog in view 2.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', context: await view2.getViewId()});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect(appPO.dialogs).toHaveCount(1);
      await expectDialog(dialogPage).toBeHidden();

      // Activate view 1.
      await view1.tab.click();
      await expectDialog(dialogPage).toBeHidden();
      await expect(appPO.dialogs).toHaveCount(1);

      // Activate view 2.
      await view2.tab.click();
      await expectDialog(dialogPage).toBeVisible();
      await expect(appPO.dialogs).toHaveCount(1);

      // Activate view 3.
      await view3.tab.click();
      await expectDialog(dialogPage).toBeHidden();
      await expect(appPO.dialogs).toHaveCount(1);
    });

    test('should prevent closing a view if it displays a dialog with view modality', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect close button to be disabled.
      await expect(dialogOpenerPage.view.tab.closeButton).toBeDisabled();

      // Expect context menu item to be disabled.
      const viewTabContextMenu = await dialogOpenerPage.view.tab.openContextMenu();
      await expect(viewTabContextMenu.menuItems.closeTab.locator).toBeDisabled();
      await viewTabContextMenu.pressEscape();

      // Expect closing the view via keystroke not to close the view.
      await page.keyboard.press('Control+K');
      await expect(dialogOpenerPage.view.tab.locator).toBeVisible();
      await expectDialog(dialogPage).toBeVisible();

      // Expect closing all views via keystroke not to close the view.
      await page.keyboard.press('Control+Shift+Alt+K');
      await expect(dialogOpenerPage.view.tab.locator).toBeVisible();
      await expectDialog(dialogPage).toBeVisible();

      // Expect view to be closable when dialog is closed.
      await dialog.close();
      await expect(dialogOpenerPage.view.tab.closeButton).toBeEnabled();

      await dialogOpenerPage.view.tab.close();
      await expect(dialogOpenerPage.view.tab.locator).not.toBeAttached();
    });

    test('should position dialog in workbench center if opened from peripheral view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.peripheral', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true})
        .addView('view.peripheral', {partId: 'part.peripheral'})
        .navigateView('view.peripheral', ['test-dialog-opener']),
      );

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.view({viewId: 'view.peripheral'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked('view.peripheral')).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.view.getBoundingBox()]));

      // Expect dialog to be positioned in the center of the workbench.
      const workbenchBounds = fromRect(await appPO.workbenchRoot.boundingBox());
      const dialogBounds = await dialog.getDialogBoundingBox();

      const left = workbenchBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toEqual(expect.closeTo(dialogBounds.left, 0));

      const right = workbenchBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toEqual(expect.closeTo(dialogBounds.right, 0));
    });

    test('should position dialog in view center if opened from non-peripheral view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.left', {partId: 'part.left'})
        .addView('view.right', {partId: 'part.right'})
        .navigateView('view.left', ['test-dialog-opener']),
      );

      // Assert split layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({id: 'part.left', views: [{id: 'view.left'}]}),
              child2: new MPart({id: 'part.right', views: [{id: 'view.right'}]}),
            }),
          },
        },
      });

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.view({viewId: 'view.left'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked('view.left')).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.view.getBoundingBox()]));

      // Expect dialog to be positioned in the center of the view.
      const viewBounds = await appPO.view({viewId: 'view.left'}).getBoundingBox();
      const dialogBounds = await dialog.getDialogBoundingBox();

      const left = viewBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toEqual(expect.closeTo(dialogBounds.left, 0));

      const right = viewBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toEqual(expect.closeTo(dialogBounds.right, 0));
    });
  });

  test.describe('Part Context', () => {

    test('should, by default and if in the context of a part, open a part-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true})
        .navigatePart('part.testee', ['test-dialog-opener']),
      );

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isPartBlocked('part.testee')).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.part.getBoundingBox('slot')]));
    });

    test('should reject the promise when attaching the dialog to a non-existent part', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true})
        .navigatePart('part.testee', ['test-dialog-opener']),
      );

      // Expect to error when opening the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await expect(dialogOpenerPage.open('dialog-page', {context: 'part.does-not-exist'})).rejects.toThrow('[NullPartError] Part \'part.does-not-exist\' not found.');

      // Expect no error to be logged to the console.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    test('should detach dialog when its contextual part is closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true, ɵactivityId: 'activity.1'})
        .navigatePart('part.testee', ['test-dialog-opener']),
      );

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expectDialog(dialogPage).toBeVisible();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if part is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee-1', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true, ɵactivityId: 'activity.1'})
        .addPart('part.testee-2', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.2'})
        .navigatePart('part.testee-1', ['test-dialog-opener']),
      );

      // Open dialog in part.testee-1.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee-1'}));
      await dialogOpenerPage.open('size-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new SizeTestPagePO(dialog);

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Capture dialog size.
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Activate part.testee-2.
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Activate part.testee-1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be resized (no flickering).
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should detach the dialog if contextual part is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1', activate: true})
        .navigatePart('part.testee', ['test-dialog-opener']),
      );

      // Open view in main area.
      const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expectDialog(dialogPage).toBeVisible();

      // Maximize the main area.
      await viewPageInMainArea.view.tab.dblclick();
      await expectDialog(dialogPage).toBeHidden();

      // Restore the layout.
      await viewPageInMainArea.view.tab.dblclick();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should allow opening a dialog in any part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee-1', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
        .addPart('part.testee-2', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.2'})
        .addPart('part.testee-3', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.3'}),
      );

      // Open the dialog in part 2.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', context: 'part.testee-2'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect(appPO.dialogs).toHaveCount(1);
      await expectDialog(dialogPage).toBeHidden();

      // Activate part 1.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectDialog(dialogPage).toBeHidden();
      await expect(appPO.dialogs).toHaveCount(1);

      // Activate part 2.
      await appPO.activityItem({activityId: 'activity.2'}).click();
      await expectDialog(dialogPage).toBeVisible();
      await expect(appPO.dialogs).toHaveCount(1);

      // Activate part 3.
      await appPO.activityItem({activityId: 'activity.3'}).click();
      await expectDialog(dialogPage).toBeHidden();
      await expect(appPO.dialogs).toHaveCount(1);
    });

    test('should position dialog in workbench center if opened from peripheral part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.peripheral', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true})
        .navigatePart('part.peripheral', ['test-dialog-opener']),
      );

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.peripheral'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isPartBlocked('part.peripheral')).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.part.getBoundingBox('slot')]));

      // Expect dialog to be positioned in the center of the workbench.
      const workbenchBounds = fromRect(await appPO.workbenchRoot.boundingBox());
      const dialogBounds = await dialog.getDialogBoundingBox();

      const left = workbenchBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toEqual(expect.closeTo(dialogBounds.left, 0));

      const right = workbenchBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toEqual(expect.closeTo(dialogBounds.right, 0));
    });

    test('should position dialog in part center if opened from non-peripheral part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .navigatePart('part.left', ['test-dialog-opener'])
        .navigatePart('part.right', ['test-dialog-opener']),
      );

      // Assert split layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({id: 'part.left'}),
              child2: new MPart({id: 'part.right'}),
            }),
          },
        },
      });

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.left'}));
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isPartBlocked('part.left')).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.part.getBoundingBox('slot')]));

      // Expect dialog to be positioned in the center of the part.
      const partBounds = await appPO.part({partId: 'part.left'}).getBoundingBox();
      const dialogBounds = await dialog.getDialogBoundingBox();

      const left = partBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toEqual(expect.closeTo(dialogBounds.left, 0));

      const right = partBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toEqual(expect.closeTo(dialogBounds.right, 0));
    });
  });

  test.describe('Dialog Context', () => {

    test('should, by default and if in the context of a dialog, open a dialog-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {cssClass: 'dialog-1'});
      const dialogPage1 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-1'}));

      // Open dialog from dialog.
      await dialogPage1.open('dialog-page', {cssClass: 'dialog-2'});
      const dialogPage2 = new DialogPagePO(appPO.dialog({cssClass: 'dialog-2'}));

      await expectDialog(dialogPage2).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialogPage1.dialog.getDialogId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialogPage2.dialog.getDialogId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialogPage2.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogPage1.dialog.getDialogBoundingBox()]));
    });

    test('should reject the promise when attaching the dialog to a non-existent dialog', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);

      // Expect to error when opening the dialog.
      await expect(dialogOpenerPage.open('dialog-page', {context: 'dialog.does-not-exist'})).rejects.toThrow('[NullDialogError] Dialog \'dialog.does-not-exist\' not found.');

      // Expect no error to be logged to the console.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    test('should detach dialog when its contextual dialog is detached', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {cssClass: 'dialog-1'});
      const dialogPage1 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-1'}));

      // Open dialog from dialog.
      await dialogPage1.open('dialog-page', {cssClass: 'dialog-2'});
      const dialogPage2 = new DialogPagePO(appPO.dialog({cssClass: 'dialog-2'}));

      const componentInstanceId = await dialogPage2.getComponentInstanceId();
      await expectDialog(dialogPage2).toBeVisible();

      // Detach contextual dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage2).toBeHidden();

      // Attach contextual dialog.
      await dialogOpenerPage.view.tab.click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage2).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage2.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if contextual dialog is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {cssClass: 'dialog-1'});
      const dialogPage1 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-1'}));

      // Open dialog from dialog.
      await dialogPage1.open('size-test-page', {cssClass: 'dialog-2'});
      const dialogPage2 = new SizeTestPagePO(appPO.dialog({cssClass: 'dialog-2'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage2).toBeVisible();

      // Capture dialog size.
      const dialogSize = await dialogPage2.getBoundingBox();
      const sizeChanges = await dialogPage2.getRecordedSizeChanges();

      // Detach contextual dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage2).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage2.getBoundingBox()).toEqual(dialogSize);

      // Attach contextual dialog.
      await dialogOpenerPage.view.tab.click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage2).toBeVisible();

      // Expect dialog not to be resized (no flickering).
      await expect.poll(() => dialogPage2.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should allow opening a dialog in any dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee-1', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
        .addPart('part.testee-2', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.2'})
        .navigatePart('part.testee-1', ['test-dialog-opener'])
        .activatePart('part.testee-1'),
      );

      // Open test dialog in part 1.
      const dialogOpenerPage1 = new DialogOpenerPagePO(appPO.part({partId: 'part.testee-1'}));
      await dialogOpenerPage1.open('dialog-page', {cssClass: 'dialog-1'});
      const dialogPage1 = new DialogPagePO(appPO.dialog({cssClass: 'dialog-1'}));

      // Open dialog in dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {context: await dialogPage1.dialog.getDialogId(), cssClass: 'dialog-2'});
      const dialogPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-2'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage2).toBeVisible();
      await expect.poll(() => appPO.isDialogBlocked(dialogPage1.dialog.getDialogId())).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);

      // Activate part 2.
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage2).toBeHidden();

      // Activate part 1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage2).toBeVisible();
    });

    test('should position dialog in dialog center', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {cssClass: 'dialog-1'});
      const dialogPage1 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-1'}));

      // Open dialog from dialog.
      await dialogPage1.open('dialog-page', {cssClass: 'dialog-2'});
      const dialogPage2 = new DialogPagePO(appPO.dialog({cssClass: 'dialog-2'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage2).toBeVisible();
      await expect.poll(() => appPO.isDialogBlocked(dialogPage1.dialog.getDialogId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialogPage2.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogPage1.dialog.getDialogBoundingBox()]));

      // Expect dialog to be positioned in the center of dialog 1.
      const contextualDialogBounds = await dialogPage1.dialog.getDialogBoundingBox();
      const dialogBounds = await dialogPage2.dialog.getDialogBoundingBox();

      const left = contextualDialogBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toBeCloseTo(dialogBounds.left, 0);

      const right = contextualDialogBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toBeCloseTo(dialogBounds.right, 0);
    });

    test('should prevent closing if blocked', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {cssClass: 'testee'});
      const dialogPage = new DialogOpenerPagePO(appPO.dialog({cssClass: 'testee'}));

      // Block dialog.
      await dialogPage.open('dialog-page', {cssClass: 'dialog'});

      // Close dialog.
      await appPO.workbench.closeDialogs(await dialogPage.dialog.getDialogId());

      // Expect dialog not to be closed.
      await expectDialog(dialogPage).toBeVisible();
    });
  });

  test.describe('Popup Context', () => {

    test('should, by default and if in the context of a popup, open a popup-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'popup'}));

      // Open dialog from dialog.
      await popupPage.open('dialog-page', {cssClass: 'testee'});
      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(popupOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isPopupBlocked(popupPage.popup.getPopupId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialogPage.dialog.getDialogId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialogPage.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popupPage.popup.getBoundingBox('slot')]));
    });

    test('should reject the promise when attaching the dialog to a non-existent popup', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'popup'}));

      // Expect to error when opening the popup.
      await expect(popupPage.open('dialog-page', {context: 'popup.does-not-exist'})).rejects.toThrow('[NullPopupError] Popup \'popup.does-not-exist\' not found.');

      // Expect no error to be logged to the console.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    test('should detach dialog when its contextual popup is detached', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'popup'}));

      // Open dialog from popup.
      await popupPage.open('dialog-page', {cssClass: 'testee'});
      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expectDialog(dialogPage).toBeVisible();

      // Detach contextual dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Attach contextual dialog.
      await popupOpenerPage.view.tab.click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if contextual popup is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'popup'}));

      // Open dialog from popup.
      await popupPage.open('size-test-page', {cssClass: 'testee'});
      const dialogPage = new SizeTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Capture dialog size.
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Attach contextual popup.
      await popupOpenerPage.view.tab.click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be resized (no flickering).
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should allow opening a dialog in any popup', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee-1', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
        .addPart('part.testee-2', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.2'})
        .navigatePart('part.testee-1', ['test-popup-opener'])
        .activatePart('part.testee-1'),
      );

      // Open popup in part 1.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee-1'}));
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        align: 'east',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'popup'}));

      // Open dialog in poup.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {context: await popupPage.popup.getPopupId(), cssClass: 'testee'});
      const dialogPage = new DialogOpenerPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isPopupBlocked(popupPage.popup.getPopupId())).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);

      // Activate part 2.
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Activate part 1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();
    });

    test('should position dialog in popup center', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'popup'}));

      // Open dialog from popup.
      await popupPage.open('dialog-page', {cssClass: 'testee'});
      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isPopupBlocked(popupPage.popup.getPopupId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialogPage.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popupPage.popup.getBoundingBox('slot')]));

      // Expect dialog to be positioned in the center of the popup.
      const popupBounds = await popupPage.popup.getBoundingBox();
      const dialogBounds = await dialogPage.dialog.getDialogBoundingBox();

      const left = popupBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toBeCloseTo(dialogBounds.left, 0);

      const right = popupBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toBeCloseTo(dialogBounds.right, 0);
    });

    test('should prevent closing popup if blocked and losing focus', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'testee'}));

      // Block popup, thus losing focus because dialog gains focus.
      await popupPage.open('dialog-page');

      // Expect popup not to be closed.
      await expectPopup(popupPage).toBeVisible();
    });

    test('should prevent closing popup if blocked', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('dialog-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });
      const popupPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'testee'}));

      // Block popup.
      await popupPage.open('dialog-page');

      // Close popup.
      await appPO.workbench.closePopups(await popupPage.popup.getPopupId());

      // Expect popup not to be closed.
      await expectPopup(popupPage).toBeVisible();
    });
  });

  test.describe('Notification Context', () => {

    test('should, by default and if in the context of a notification, open a notification-modal dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a notification.
      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:dialog-opener-page', {cssClass: 'notification'});
      const notificationPage = new DialogOpenerPagePO(appPO.notification({cssClass: 'notification'}));

      // Open dialog from dialog.
      await notificationPage.open('dialog-page', {cssClass: 'testee'});
      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isNotificationBlocked(notificationPage.notification.getNotificationId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialogPage.dialog.getDialogId())).toBe(false);
    });

    test('should reject the promise when attaching the dialog to a non-existent notification', async ({appPO, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a popup.
      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:dialog-opener-page', {cssClass: 'notification'});
      const notificationPage = new DialogOpenerPagePO(appPO.notification({cssClass: 'notification'}));

      // Expect to error when opening the notification.
      await expect(notificationPage.open('dialog-page', {context: 'notification.does-not-exist'})).rejects.toThrow('[NullNotificationError] Notification \'notification.does-not-exist\' not found.');

      // Expect no error to be logged to the console.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toEqual([]);
    });

    test('should allow opening a dialog in any notification', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee-1', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
        .addPart('part.testee-2', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.2'})
        .navigatePart('part.testee-1', ['test-popup-opener'])
        .activatePart('part.testee-1'),
      );

      // Open notification in part 1.
      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:dialog-opener-page', {cssClass: 'notification'});

      const notificationPage = new DialogOpenerPagePO(appPO.notification({cssClass: 'notification'}));

      // Open dialog in notification.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-opener-page', {context: await notificationPage.notification.getNotificationId(), cssClass: 'testee'});
      const dialogPage = new DialogOpenerPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isNotificationBlocked(notificationPage.notification.getNotificationId())).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
    });

    test('should position dialog in notification center', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open a notification.
      const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
      await notificationOpenerPage.show('component:dialog-opener-page', {cssClass: 'notification'});
      const notificationPage = new DialogOpenerPagePO(appPO.notification({cssClass: 'notification'}));

      // Open dialog from notification.
      await notificationPage.open('dialog-page', {cssClass: 'testee'});
      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isNotificationBlocked(notificationPage.notification.getNotificationId())).toBe(true);

      // Expect dialog to be positioned in the center of the viewport.
      const viewportBounds = appPO.viewportBoundingBox();
      const dialogBounds = await dialogPage.dialog.getDialogBoundingBox();

      const left = viewportBounds.hcenter - (dialogBounds.width / 2);
      expect(left).toBeCloseTo(dialogBounds.left, 0);

      const right = viewportBounds.hcenter + (dialogBounds.width / 2);
      expect(right).toBeCloseTo(dialogBounds.right, 0);
    });
  });

  test.describe('Application Modality', () => {

    test('should open an application-modal dialog if not in the context of a view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', rootContext: true});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(true);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
      ]));
    });

    test('should open an application-modal dialog if in the context of a view and application-modality selected', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(true);
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
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(true);
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

      const applicationModalDialog1 = appPO.dialog({cssClass: 'test-application-modal'}, {nth: 0});
      const applicationModalDialog2 = appPO.dialog({cssClass: 'test-application-modal'}, {nth: 1});

      await expect(applicationModalDialog1.locator).toBeVisible();
      await expect(applicationModalDialog2.locator).toBeVisible();

      const dialogOpenerDialogPage = new DialogOpenerPagePO(applicationModalDialog2);
      const contextualViewId = await dialogOpenerViewPage.view.getViewId();

      // Open view-modal dialog.
      // Expect view-modal dialog to be attached only after all application-modal dialogs are closed.
      await dialogOpenerDialogPage.open('dialog-page', {cssClass: 'testee', context: contextualViewId, waitUntilOpened: false});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).not.toBeAttached();

      await applicationModalDialog2.close();
      await expectDialog(dialogPage).not.toBeAttached();

      await applicationModalDialog1.close();
      await expectDialog(dialogPage).toBeVisible();
    });

    test('should hide application-modal dialog when unmounting the workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expectDialog(dialogPage).toBeVisible();

      // Unmount the workbench component by navigating the primary router outlet.
      await appPO.header.clickSettingMenuItem({cssClass: 'e2e-navigate-to-blank-page'});
      await expectDialog(dialogPage).toBeHidden();

      // Re-mount the workbench component by navigating the primary router.
      await appPO.header.clickSettingMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(true);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
      ]));

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Non-Blocking Dialog', () => {

    test('should not block contextual element', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'none'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());
    });

    test('should not block workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'none', context: null});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());
    });

    test('should bind non-blocking dialog to context', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'none'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());

      // Activate another view.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Re-activate the view.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());
    });

    test('should delay opening non-blocking dialog until all application-modal dialogs are closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two application-modal dialogs.
      const dialogOpenerViewPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerViewPage.open('dialog-opener-page', {cssClass: 'test-application-modal', modality: 'application', count: 2});

      const applicationModalDialog1 = appPO.dialog({cssClass: 'test-application-modal'}, {nth: 0});
      const applicationModalDialog2 = appPO.dialog({cssClass: 'test-application-modal'}, {nth: 1});

      await expect(applicationModalDialog1.locator).toBeVisible();
      await expect(applicationModalDialog2.locator).toBeVisible();

      const dialogOpenerDialogPage = new DialogOpenerPagePO(applicationModalDialog2);
      const contextualViewId = await dialogOpenerViewPage.view.getViewId();

      // Open non-blocking dialog.
      // Expect non-blocking dialog to be attached only after all application-modal dialogs are closed.
      await dialogOpenerDialogPage.open('dialog-page', {cssClass: 'testee', context: contextualViewId, modality: 'none', waitUntilOpened: false});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).not.toBeAttached();

      await applicationModalDialog2.close();
      await expectDialog(dialogPage).not.toBeAttached();

      await applicationModalDialog1.close();
      await expectDialog(dialogPage).toBeVisible();
    });

    test('should hide non-blocking dialog when unmounting the workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', modality: 'none', context: null});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      const componentInstanceId = await dialogPage.getComponentInstanceId();
      await expectDialog(dialogPage).toBeVisible();

      // Unmount the workbench component by navigating the primary router outlet.
      await appPO.header.clickSettingMenuItem({cssClass: 'e2e-navigate-to-blank-page'});
      await expectDialog(dialogPage).toBeHidden();

      // Re-mount the workbench component by navigating the primary router.
      await appPO.header.clickSettingMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());

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

      const focusTestPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should trap focus and cycle through all elements (pressing TAB)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const focusTestPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));

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
      const focusTestPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));

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
      const focusTestPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Move focus.
      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      // Activate another view.
      await appPO.openNewViewTab();
      await expect(focusTestPage.middleField).not.toBeFocused();

      // Re-activate the dialog view.
      await dialogOpenerPage.view.tab.click();
      await expect(focusTestPage.middleField).toBeFocused();
    });

    test('should restore focus to application-modal dialog after re-mounting the workbench', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Move focus.
      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      // Unmount the workbench component by navigating the primary router outlet.
      await appPO.header.clickSettingMenuItem({cssClass: 'e2e-navigate-to-blank-page'});
      await expect(focusTestPage.middleField).not.toBeFocused();

      // Re-mount the workbench component by navigating the primary router.
      await appPO.header.clickSettingMenuItem({cssClass: 'e2e-navigate-to-workbench-page'});
      await expect(focusTestPage.middleField).toBeFocused();
    });

    test('should focus top dialog from the stack when previous top-most dialog is closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', count: 3});

      const dialog1 = appPO.dialog({cssClass: 'testee'}, {nth: 0});
      const dialog2 = appPO.dialog({cssClass: 'testee'}, {nth: 1});
      const dialog3 = appPO.dialog({cssClass: 'testee'}, {nth: 2});
      const focusTestPage1 = new FocusTestPagePO(dialog1);
      const focusTestPage2 = new FocusTestPagePO(dialog2);
      const focusTestPage3 = new FocusTestPagePO(dialog3);

      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog3.getDialogId());

      // Close top-most dialog.
      await focusTestPage3.dialog.close();
      await expectDialog(focusTestPage3).not.toBeAttached();
      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog2.getDialogId());

      // Close top-most dialog.
      await focusTestPage2.dialog.close();
      await expectDialog(focusTestPage2).not.toBeAttached();
      await expect(focusTestPage1.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog1.getDialogId());
    });

    test('should restore focus to top dialog after re-activating its contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', count: 3});

      const focusTestPage1 = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}, {nth: 0}));
      const focusTestPage2 = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}, {nth: 1}));
      const focusTestPage3 = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}, {nth: 2}));

      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).toBeFocused();

      // Activate another view.
      await appPO.openNewViewTab();
      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).not.toBeFocused();

      // Re-activate the dialog view.
      await dialogOpenerPage.view.tab.click();
      await expect(focusTestPage1.firstField).not.toBeFocused();
      await expect(focusTestPage2.firstField).not.toBeFocused();
      await expect(focusTestPage3.firstField).toBeFocused();
    });

    test('should restore focus to opener view when last dialog is closed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 2 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee', count: 2});

      const dialog1 = appPO.dialog({cssClass: 'testee'}, {nth: 0});
      const dialog2 = appPO.dialog({cssClass: 'testee'}, {nth: 1});

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

      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      await expect(dialogPage.input).toHaveValue('ABC');
    });
  });

  test.describe('Closing', () => {

    test('should allow closing the dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();

      // Close the dialog.
      await dialog.close();
      await expectDialog(dialogPage).not.toBeAttached();
    });

    test('should close the dialog on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();

      // Close the dialog by Escape keystroke.
      await page.keyboard.press('Escape');
      await expectDialog(dialogPage).not.toBeAttached();
    });

    test('should allow non-closable dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();

      await dialogPage.setClosable(false);

      // Expect the close button not to be visible.
      await expect(dialog.closeButton).not.toBeVisible();
    });

    test('should NOT close the dialog on escape keystroke if dialog is NOT closable', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));
      await dialogPage.setClosable(false);

      // Try closing the dialog by Escape keystroke.
      await page.keyboard.press('Escape');

      // Expect dialog not to be closed.
      await expectDialog(dialogPage).toBeVisible();
    });

    test('should allow closing the dialog with a result', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee'});

      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));
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
      await dialogOpenerPage.open('dialog-page', {cssClass: 'testee', count: 3});

      const dialog1 = appPO.dialog({cssClass: 'testee'}, {nth: 0});
      const dialogPage1 = new DialogPagePO(dialog1);
      const dialogBounds1 = await dialog1.getDialogBoundingBox();

      const dialog2 = appPO.dialog({cssClass: 'testee'}, {nth: 1});
      const dialogPage2 = new DialogPagePO(dialog2);
      const dialogBounds2 = await dialog2.getDialogBoundingBox();

      const dialog3 = appPO.dialog({cssClass: 'testee'}, {nth: 2});
      const dialogPage3 = new DialogPagePO(dialog3);
      const dialogBounds3 = await dialog3.getDialogBoundingBox();

      await expectDialog(dialogPage1).toBeVisible();
      await expectDialog(dialogPage2).toBeVisible();
      await expectDialog(dialogPage3).toBeVisible();

      // Expect the dialogs to be displayed offset.
      expect(dialogBounds2.left - dialogBounds1.left).toEqual(10);
      expect(dialogBounds2.top - dialogBounds1.top).toEqual(10);
      expect(dialogBounds3.left - dialogBounds2.left).toEqual(10);
      expect(dialogBounds3.top - dialogBounds2.top).toEqual(10);
    });

    test('should allow interaction only with top dialog from the stack [animate=false]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('input-field-test-page', {cssClass: 'testee', count: 3, animate: false});

      const firstDialog = appPO.dialog({cssClass: 'testee'}, {nth: 0});
      const firstDialogPage = new InputFieldTestPagePO(firstDialog);
      await expectDialog(firstDialogPage).toBeVisible();

      const middleDialog = appPO.dialog({cssClass: 'testee'}, {nth: 1});
      const middleDialogPage = new InputFieldTestPagePO(middleDialog);
      await expectDialog(middleDialogPage).toBeVisible();

      const topDialog = appPO.dialog({cssClass: 'testee'}, {nth: 2});
      const topDialogPage = new InputFieldTestPagePO(topDialog);

      await expectDialog(topDialogPage).toBeVisible();
      await topDialog.moveDialog('bottom-right-corner');

      // Expect first dialog not to be interactable.
      await expect(firstDialog.clickHeader({timeout: 1000})).rejects.toThrowError();

      // Expect middle dialog not to be interactable.
      await expect(middleDialog.clickHeader({timeout: 1000})).rejects.toThrowError();
      await expect(new InputFieldTestPagePO(middleDialog).checkbox.check({timeout: 1000})).rejects.toThrowError();
      await expect(new InputFieldTestPagePO(middleDialog).checkbox).not.toBeChecked();

      // Expect top dialog to be interactable.
      await expect(topDialog.clickHeader()).resolves.toBeUndefined();
      await new InputFieldTestPagePO(topDialog).checkbox.check();
      await expect(new InputFieldTestPagePO(topDialog).checkbox).toBeChecked();
    });

    test('should allow interaction only with top dialog from the stack [animate=true]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open 3 dialogs.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('input-field-test-page', {cssClass: 'testee', count: 3, animate: true});

      const firstDialog = appPO.dialog({cssClass: 'testee'}, {nth: 0});
      const firstDialogPage = new InputFieldTestPagePO(firstDialog);
      await expectDialog(firstDialogPage).toBeVisible();

      const middleDialog = appPO.dialog({cssClass: 'testee'}, {nth: 1});
      const middleDialogPage = new InputFieldTestPagePO(middleDialog);
      await expectDialog(middleDialogPage).toBeVisible();

      const topDialog = appPO.dialog({cssClass: 'testee'}, {nth: 2});
      const topDialogPage = new InputFieldTestPagePO(topDialog);
      await expectDialog(topDialogPage).toBeVisible();
      await topDialog.moveDialog('bottom-right-corner');

      // Expect first dialog not to be interactable.
      await expect(firstDialog.clickHeader({timeout: 1000})).rejects.toThrowError();

      // Expect middle dialog not to be interactable.
      await expect(middleDialog.clickHeader({timeout: 1000})).rejects.toThrowError();
      await expect(new InputFieldTestPagePO(middleDialog).checkbox.check({timeout: 1000})).rejects.toThrowError();
      await expect(new InputFieldTestPagePO(middleDialog).checkbox).not.toBeChecked();

      // Expect top dialog to be interactable.
      await expect(topDialog.clickHeader()).resolves.toBeUndefined();
      await new InputFieldTestPagePO(topDialog).checkbox.check();
      await expect(new InputFieldTestPagePO(topDialog).checkbox).toBeChecked();
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

      // Shrink the content.
      await dialogPage.enterContentSize({
        height: '400px',
        width: '400px',
      });

      // Expect the dialog to adapt to the content size.
      await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(expect.objectContaining({
        height: 400 + dialogBorder + dialogHeaderHeight + dialogFooterHeight,
        width: 400 + dialogBorder,
      }));

      // Grow the content.
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

    test('should grow beyong context bounds', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Add layout with a small main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.bottom', {align: 'bottom'})
        .navigatePart('part.left', ['path/to/part'])
        .navigatePart('part.right', ['path/to/part'])
        .navigatePart('part.bottom', ['path/to/part']),
      );

      // Expect main area to be less than 1000px.
      const mainAreaBounds = await appPO.part({partId: MAIN_AREA}).getBoundingBox();
      expect(mainAreaBounds.width).toBeLessThan(1000);
      expect(mainAreaBounds.height).toBeLessThan(1000);

      // Open a large dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('large-test-page', {cssClass: 'dialog'});
      const dialogPage = new LargeTestPagePO(appPO.dialog({cssClass: 'dialog'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog to have a size of 1000x1000 pixels.
      const dialogBounds = await dialogPage.dialog.getDialogBoundingBox();
      expect(dialogBounds.width).toBeGreaterThan(1000);
      expect(dialogBounds.height).toBeGreaterThan(1000);

      const dialogSlotBounds = await dialogPage.dialog.getDialogSlotBoundingBox();
      expect(dialogSlotBounds).toMatchObject({height: 1000, width: 1000});

      // Expect dialog to be positioned in the center of the context.
      const contextBounds = await dialogOpenerPage.view.getBoundingBox();
      expect(dialogBounds.left).toBeCloseTo(contextBounds.hcenter - (dialogBounds.width / 2), 0);
      expect(dialogBounds.right).toBeCloseTo(contextBounds.hcenter + (dialogBounds.width / 2), 0);
    });

    test('should provide dialog bounds', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('workbench-handle-bounds-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const testPage = new WorkbenchHandleBoundsTestPagePO(dialog);

      await expect(async () => {
        const expectedBounds = await dialog.getDialogSlotBoundingBox();
        const handleBounds = await testPage.getBounds();
        expect(handleBounds).toEqual(expectedBounds);
      }).toPass();
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

    test('should not be resizable if blocked', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open the dialog.
      const dialogOpenerViewPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerViewPage.open('dialog-opener-page', {cssClass: 'testee'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogBoundingBox = await dialog.getDialogBoundingBox();

      // Block the dialog by opening another dialog.
      const dialogOpenerDialogPage = new DialogOpenerPagePO(dialog);
      await dialogOpenerDialogPage.open('dialog-page', {cssClass: 'top-dialog'});
      const topDialog = appPO.dialog({cssClass: 'top-dialog'});
      await topDialog.moveDialog('bottom-right-corner');

      // Try resizing the blocked dialog.
      await dialog.resizeTop(10);
      await dialog.resizeRight(10);
      await dialog.resizeBottom(10);
      await dialog.resizeLeft(10);
      await dialog.resizeTopLeft({x: 10, y: 10});
      await dialog.resizeTopRight({x: 10, y: 10});
      await dialog.resizeBottomRight({x: 10, y: 10});
      await dialog.resizeBottomLeft({x: 10, y: 10});

      // Expect the dialog not to be resized.
      await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(dialogBoundingBox);
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

      // Move dialog to the side to click view content.
      await dialog.moveDialog('bottom-right-corner');

      // Focus input field.
      const dialogPage = new FocusTestPagePO(dialog);
      await dialogPage.firstField.focus();

      // Expect interaction with contextual view to be blocked.
      await expect(dialogOpenerPage.click({timeout: 1000})).rejects.toThrowError();
      await expect(dialogPage.firstField).toBeFocused();

      // Expect glass pane
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.view.getBoundingBox(),
      ]));
    });

    test('should block interaction with contextual part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', activate: true})
        .navigatePart('part.testee', ['test-dialog-opener']),
      );

      // Open the dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await dialogOpenerPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Focus input field.
      const dialogPage = new FocusTestPagePO(dialog);
      await dialogPage.firstField.focus();

      // Expect interaction with contextual part to be blocked.
      await expect(dialogOpenerPage.click({timeout: 1000})).rejects.toThrowError();
      await expect(dialogPage.firstField).toBeFocused();

      // Expect glass pane.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.part.getBoundingBox('slot'),
      ]));
    });

    test('should block interaction with contextual dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog 1.
      const dialogOpenerViewPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerViewPage.open('dialog-opener-page', {cssClass: 'testee-1'});
      const dialog1 = appPO.dialog({cssClass: 'testee-1'});
      await dialog1.moveDialog('bottom-left-corner');

      // Open dialog 2 from dialog 1.
      const dialogOpenerDialogPage = new DialogOpenerPagePO(dialog1);
      await dialogOpenerDialogPage.open('focus-test-page', {cssClass: 'testee-2'});
      const dialog2 = appPO.dialog({cssClass: 'testee-2'});
      await dialog2.moveDialog('bottom-right-corner');

      // Focus input field.
      const focusTestPage = new FocusTestPagePO(dialog2);
      await focusTestPage.firstField.focus();

      // Expect interaction with contextual view to be blocked.
      await expect(dialogOpenerViewPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect interaction with contextual dialog to be blocked.
      await expect(dialogOpenerDialogPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect dialog 2 to be interactable
      await expect(focusTestPage.firstField).toBeFocused();
      await focusTestPage.clickField('middle-field');
      await expect(focusTestPage.middleField).toBeFocused();

      // Expect glass panes.
      await expect.poll(() => dialog1.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerViewPage.view.getBoundingBox()]));
      await expect.poll(() => dialog2.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialog1.getDialogBoundingBox()]));
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerViewPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialog1.getDialogId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialog2.getDialogId())).toBe(false);
    });

    test('should block interaction with contextual popup', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup
      const popupOpenerViewPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerViewPage.open('dialog-opener-page', {
        anchor: {bottom: 0, left: 0},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });
      const popup = appPO.popup({cssClass: 'testee'});

      // Open dialog from popup.
      const dialogOpenerPopupPage = new DialogOpenerPagePO(popup);
      await dialogOpenerPopupPage.open('focus-test-page', {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      await dialog.moveDialog('bottom-right-corner');

      // Focus input field.
      const focusTestPage = new FocusTestPagePO(dialog);
      await focusTestPage.firstField.focus();

      // Expect interaction with contextual view not to be blocked.
      await popupOpenerViewPage.click();
      await expect.poll(() => appPO.focusOwner()).toEqual(await popupOpenerViewPage.view.getViewId());

      // Expect interaction with contextual popup to be blocked.
      await expect(dialogOpenerPopupPage.click({timeout: 1000})).rejects.toThrowError();

      // Expect dialog to be interactable.
      await focusTestPage.clickField('middle-field');
      await expect(focusTestPage.middleField).toBeFocused();

      // Expect glass panes.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popup.getBoundingBox('slot')]));
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => appPO.isViewBlocked(popupOpenerViewPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isPopupBlocked(popup.getPopupId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialog.getDialogId())).toBe(false);
    });

    test('should not block dialogs of other views', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open two dialog opener views side by side.
      const dialogOpenerViewPage1 = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      const dialogOpenerViewPage2 = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      const dragHandle = await dialogOpenerViewPage2.view.tab.startDrag();
      await dragHandle.dragToPart(await dialogOpenerViewPage2.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Open dialog 1.
      await dialogOpenerViewPage1.open('focus-test-page', {cssClass: 'testee-1'});
      const dialog1 = appPO.dialog({cssClass: 'testee-1'});

      // Open dialog 2.
      await dialogOpenerViewPage2.open('focus-test-page', {cssClass: 'testee-2'});
      const dialog2 = appPO.dialog({cssClass: 'testee-2'});

      await dialog1.moveDialog('top-right-corner');
      await dialog2.moveDialog('bottom-right-corner');

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
      const focusDialogTestPage1 = new FocusTestPagePO(dialog1);
      await focusDialogTestPage1.clickField('middle-field');
      await expect(focusDialogTestPage1.middleField).toBeFocused();

      // Expect dialog 2 to be interactable
      const focusDialogTestPage2 = new FocusTestPagePO(dialog2);
      await focusDialogTestPage2.clickField('middle-field');
      await expect(focusDialogTestPage2.middleField).toBeFocused();

      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerViewPage1.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerViewPage2.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialog1.getDialogId())).toBe(false);
      await expect.poll(() => appPO.isDialogBlocked(dialog2.getDialogId())).toBe(false);
    });

    test('should block workbench', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open router view and dialog opener view side by side.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      const dragHandle = await dialogOpenerPage.view.tab.startDrag();
      await dragHandle.dragToPart(await dialogOpenerPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Navigate to FocusTestPageComponent
      await routerPage.navigate(['/test-pages/focus-test-page'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'focus-page',
      });

      // Open application-modal dialog.
      await dialogOpenerPage.open('dialog-page', {modality: 'application', cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO.view({cssClass: 'focus-page'}));

      // Expect interaction with FocusTestPageComponent to be blocked.
      await expect(focusTestPage.clickField('middle-field', {timeout: 1000})).rejects.toThrowError();

      // Expect glass panes.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
        await focusTestPage.view.getBoundingBox(),
      ]));

      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(focusTestPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialog.getDialogId())).toBe(false);
    });

    test('should block viewport', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, dialogModalityScope: 'viewport'});

      // Open router view and dialog opener view side by side.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      const dragHandle = await dialogOpenerPage.view.tab.startDrag();
      await dragHandle.dragToPart(await dialogOpenerPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Navigate to FocusTestPageComponent
      await routerPage.navigate(['/test-pages/focus-test-page'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'focus-page',
      });

      // Open application-modal dialog.
      await dialogOpenerPage.open('dialog-page', {modality: 'application', cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(appPO.view({cssClass: 'focus-page'}));

      // Expect interaction with FocusTestPageComponent to be blocked.
      await expect(focusTestPage.clickField('middle-field', {timeout: 1000})).rejects.toThrowError();

      // Expect glass panes.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        appPO.viewportBoundingBox(),
        await dialogOpenerPage.view.getBoundingBox(),
        await focusTestPage.view.getBoundingBox(),
      ]));

      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isViewBlocked(focusTestPage.view.getViewId())).toBe(true);
      await expect.poll(() => appPO.isDialogBlocked(dialog.getDialogId())).toBe(false);
    });
  });
});
