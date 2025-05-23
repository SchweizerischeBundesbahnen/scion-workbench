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
import {ViewPagePO} from './page-object/view-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {fromRect} from '../helper/testing.util';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';

test.describe('Workbench View Tab', () => {

  test('should close context menu when view gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open some views for the context menu not to overlay the input field of the test view.
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();

    // Open test view.
    const testPage = await InputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);

    // Open context menu.
    const contextMenu = await testPage.view.tab.openContextMenu();
    await expect(contextMenu.locator).toBeAttached();

    // When focusing the view.
    await testPage.clickInputField();
    // Expect the context menu to be closed.
    await expect(contextMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should close context menu when popup gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test popup.
    const testPage = await InputFieldTestPagePO.openInPopup(appPO, workbenchNavigator, {closeOnFocusLost: false});

    // Open context menu.
    const contextMenu = await viewPage.view.tab.openContextMenu();
    await expect(contextMenu.locator).toBeAttached();

    // When focusing the popup.
    await testPage.clickInputField();
    // Expect the context menu to be closed.
    await expect(contextMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should have a title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');

    // Expect the view tab to have a title.
    await expect(viewTab.title).toHaveText('View Title');

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect the drag image to have a title.
      await expect(dragHandle.dragImage.title).toHaveText('View Title');
    });
  });

  test('should have a heading', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.enterHeading('View Heading');

    // Expect the view tab to have a title and heading.
    await expect(viewTab.title).toHaveText('View Title');
    await expect(viewTab.heading).toHaveText('View Heading');
    await expect(viewTab.heading).toBeVisible();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect the drag image to have a title and heading.
      await expect(dragHandle.dragImage.title).toHaveText('View Title');
      await expect(dragHandle.dragImage.heading).toHaveText('View Heading');
      await expect(dragHandle.dragImage.heading).toBeVisible();
    });
  });

  test('should have a dirty marker', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkDirty(true);

    // Expect the view tab to have a dirty marker.
    await expect(viewTab.dirty).toBeVisible();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect the drag image to have a dirty marker.
      await expect(dragHandle.dragImage.dirty).toBeVisible();
    });
  });

  test('should have close button if view is closable', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkClosable(true);

    // Expect the view tab to have a close button.
    await expect(viewTab.closeButton).toBeVisible();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect the drag image to have a close button.
      await expect(dragHandle.dragImage.closeButton).toBeVisible();
    });
  });

  test('should not have close button if view is not closable', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-min-width', '0');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkClosable(false);

    // Expect the view tab not to have a close button.
    await expect(viewTab.closeButton).not.toBeAttached();

    // Expect the title to fully fill the tab, i.e., has no space reserved for the close button.
    await expect(async () => {
      const contentBounds = fromRect(await viewTab.content.boundingBox());
      const titleBounds = fromRect(await viewTab.title.boundingBox());
      expect(contentBounds.width).toEqual(titleBounds.width);
    }).toPass();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect the drag image not to have a close button.
      await expect(dragHandle.dragImage.closeButton).not.toBeAttached();

      // Expect the title to fully fill the drag image, i.e., has no space reserved for the close button.
      await expect(async () => {
        const contentBounds = fromRect(await dragHandle.dragImage.content.boundingBox());
        const titleBounds = fromRect(await dragHandle.dragImage.title.boundingBox());
        expect(contentBounds.width).toEqual(titleBounds.width);
      }).toPass();
    });
  });

  test('should not have close button if view is blocked', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Open dialog opener.
    const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
    await dialogOpenerPage.view.tab.moveTo('part.initial', {region: 'east'});

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkClosable(true);

    // Block the view by opening a modal dialog.
    await dialogOpenerPage.open('dialog-page', {modality: 'view', context: {viewId: await viewTab.getViewId()}, cssClass: 'testee'});

    // Expect the close button not to be visible.
    await expect(viewTab.closeButton).not.toBeVisible();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect the drag image not to have a close button.
      await expect(dragHandle.dragImage.closeButton).not.toBeVisible();

      // Cancel the drag operation.
      await dragHandle.cancel();
    });

    // Close the dialog.
    await appPO.dialog({cssClass: 'testee'}).close();

    // Expect the close button to be visible.
    await expect(viewTab.closeButton).toBeVisible();
  });

  test('should not overlap title and close button', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-min-width', '0');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkClosable(true);

    // Expect title not to overlap the close button.
    await expect(async () => {
      const titleBounds = fromRect(await viewTab.title.boundingBox());
      const closeButtonBounds = fromRect(await viewTab.closeButton.boundingBox());
      expect(titleBounds.right).toBeLessThanOrEqual(closeButtonBounds.left);
    }).toPass();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect title not to overlap the close button.
      await expect(async () => {
        const titleBounds = fromRect(await dragHandle.dragImage.title.boundingBox());
        const closeButtonBounds = fromRect(await dragHandle.dragImage.closeButton.boundingBox());
        expect(titleBounds.right).toBeLessThanOrEqual(closeButtonBounds.left);
      }).toPass();
    });
  });

  test('should not change tab width when blocking/unblocking the view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-min-width', '0');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Open dialog opener.
    const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
    await dialogOpenerPage.view.tab.moveTo('part.initial', {region: 'east'});

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkClosable(true);
    const viewTabBounds = await viewTab.getBoundingBox();

    // Block the view by opening a modal dialog.
    await dialogOpenerPage.open('dialog-page', {modality: 'view', context: {viewId: await viewTab.getViewId()}, cssClass: 'testee'});

    // Expect the tab width not to change.
    await expect.poll(() => viewTab.getBoundingBox()).toEqual(viewTabBounds);

    // Close the dialog.
    await appPO.dialog({cssClass: 'testee'}).close();

    // Expect the tab width not to change.
    await expect.poll(() => viewTab.getBoundingBox()).toEqual(viewTabBounds);
  });

  test('should use full tab width to render the heading', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-min-width', '0');
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterHeading('View Heading');
    await viewPage.checkClosable(true);

    // Expect heading to render below close button to the end.
    await expect(async () => {
      const headingBounds = fromRect(await viewTab.heading.boundingBox());
      const closeButtonBounds = fromRect(await viewTab.closeButton.boundingBox());
      expect(headingBounds.top).toBeGreaterThan(closeButtonBounds.bottom);
      expect(headingBounds.right).toBeGreaterThan(closeButtonBounds.left);
    }).toPass();

    await test.step('drag image', async () => {
      // Start dragging the view tab.
      const dragHandle = await viewTab.startDrag();
      await dragHandle.dragTo({x: appPO.viewportBoundingBox().hcenter, y: appPO.viewportBoundingBox().vcenter});

      // Expect heading to render below close button to the end.
      await expect(async () => {
        const headingBounds = fromRect(await dragHandle.dragImage.heading.boundingBox());
        const closeButtonBounds = fromRect(await dragHandle.dragImage.closeButton.boundingBox());
        expect(headingBounds.top).toBeGreaterThan(closeButtonBounds.bottom);
        expect(headingBounds.right).toBeGreaterThan(closeButtonBounds.left);
      }).toPass();
    });
  });

  test('should not displace title vertically when marking view dirty', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');

    // Capture title bounds.
    const titleBounds = fromRect(await viewTab.title.boundingBox());

    // Mark view dirty.
    await viewPage.checkDirty(true);

    // Expect the title to render at the same y-position.
    await expect.poll(async () => fromRect(await viewTab.title.boundingBox()).y).toEqual(titleBounds.y);
    await expect.poll(async () => fromRect(await viewTab.title.boundingBox()).height).toEqual(titleBounds.height);
  });

  test('should not displace dirty marker vertically when clearing/entering title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.checkDirty(true);

    // Capture dirty marker bounds;
    const dirtyMarkerBounds = fromRect(await viewTab.dirty.boundingBox());

    // Clear title
    await viewPage.enterTitle('');

    // Expect the dirty marker to render at the same y-position.
    await expect.poll(async () => fromRect(await viewTab.dirty.boundingBox()).y).toEqual(dirtyMarkerBounds.y);
    await expect.poll(async () => fromRect(await viewTab.dirty.boundingBox()).height).toEqual(dirtyMarkerBounds.height);

    // Enter title
    await viewPage.enterTitle('View Title');

    // Expect the dirty marker to render at the same y-position.
    await expect.poll(async () => fromRect(await viewTab.dirty.boundingBox()).y).toEqual(dirtyMarkerBounds.y);
    await expect.poll(async () => fromRect(await viewTab.dirty.boundingBox()).height).toEqual(dirtyMarkerBounds.height);
  });

  test('should not displace heading vertically when marking view dirty', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.enterHeading('View Heading');

    // Capture heading bounds.
    const headingBounds = fromRect(await viewTab.heading.boundingBox());

    // Mark view dirty.
    await viewPage.checkDirty(true);

    // Expect the heading to render at the same y-position.
    await expect.poll(async () => fromRect(await viewTab.heading.boundingBox()).y).toEqual(headingBounds.y);
    await expect.poll(async () => fromRect(await viewTab.heading.boundingBox()).height).toEqual(headingBounds.height);
  });

  test('should not displace heading vertically when clearing/entering title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTab = viewPage.view.tab;

    // Prepare test view.
    await viewPage.enterTitle('View Title');
    await viewPage.enterHeading('View Heading');
    await viewPage.checkDirty(true);

    // Capture heading bounds.
    const headingBounds = fromRect(await viewTab.heading.boundingBox());

    // Clear title
    await viewPage.enterTitle('');

    // Expect the heading to render at the same y-position.
    await expect.poll(async () => fromRect(await viewTab.heading.boundingBox()).y).toEqual(headingBounds.y);
    await expect.poll(async () => fromRect(await viewTab.heading.boundingBox()).height).toEqual(headingBounds.height);

    // Enter title
    await viewPage.enterTitle('View Title');

    // Expect the heading to render at the same y-position.
    await expect.poll(async () => fromRect(await viewTab.heading.boundingBox()).y).toEqual(headingBounds.y);
    await expect.poll(async () => fromRect(await viewTab.heading.boundingBox()).height).toEqual(headingBounds.height);
  });
});
