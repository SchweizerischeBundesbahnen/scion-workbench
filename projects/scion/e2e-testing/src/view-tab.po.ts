/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromRect, getCssClasses, getPerspectiveId, hasCssClass} from './helper/testing.util';
import {Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewTabContextMenuPO} from './view-tab-context-menu.po';
import {ViewMoveDialogTestPagePO} from './workbench/page-object/test-pages/view-move-dialog-test-page.po';
import {AppPO} from './app.po';
import {ViewId} from '@scion/workbench';

/**
 * Handle for interacting with a workbench view tab.
 */
export class ViewTabPO {

  /**
   * Handle to the part in which this view tab is contained.
   */
  public readonly part: PartPO;

  /**
   * Locates the title of the view tab.
   */
  public readonly title = this.locator.locator('.e2e-title');

  /**
   * Locates the heading of the view tab.
   */
  public readonly heading = this.locator.locator('.e2e-heading');

  /**
   * Locates the close button of the view tab.
   */
  public readonly closeButton = this.locator.locator('.e2e-close');

  constructor(public readonly locator: Locator, part: PartPO) {
    this.part = part;
  }

  public async getViewId(): Promise<ViewId> {
    return (await this.locator.getAttribute('data-viewid'))! as ViewId;
  }

  public async click(): Promise<void> {
    await this.locator.click();
  }

  public async dblclick(): Promise<void> {
    await this.locator.dblclick();
  }

  /**
   * Performs a mouse down on this view tab.
   */
  public async mousedown(): Promise<void> {
    const bounds = fromRect(await this.locator.boundingBox());
    const mouse = this.locator.page().mouse;
    await mouse.move(bounds.hcenter, bounds.vcenter);
    await mouse.down();
  }

  public async close(): Promise<void> {
    await this.locator.hover();
    await this.locator.locator('.e2e-close').click();
  }

  public isDirty(): Promise<boolean> {
    return hasCssClass(this.locator, 'e2e-dirty');
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }

  /**
   * Opens the context menu of this view tab.
   */
  public async openContextMenu(): Promise<ViewTabContextMenuPO> {
    await this.locator.click({button: 'right'});
    const viewId = await this.getViewId();
    return new ViewTabContextMenuPO(this.locator.page().locator(`div.cdk-overlay-pane wb-view-menu[data-viewid="${viewId}"]`));
  }

  /**
   * Activates drop zones on the specified target by moving the tab over the specified target.
   */
  public async activateDropZones(target: {partId: string}, options?: {steps?: number}): Promise<void>;
  public async activateDropZones(target: {grid: 'workbench' | 'mainArea'}, options?: {steps?: number}): Promise<void>;
  public async activateDropZones(target: {partId?: string; grid?: 'workbench' | 'mainArea'}, options?: {steps?: number}): Promise<void> {
    // 1. Perform a "mousedown" on the view tab.
    const mouse = this.locator.page().mouse;
    await this.mousedown();

    // 2. Locate the target.
    const targetLocator = (() => {
      if (target.partId) {
        return this.locator.page().locator(`wb-part[data-partid="${target.partId}"]`).locator('div.e2e-active-view');
      }
      else {
        return this.locator.page().locator(target.grid === 'mainArea' ? 'wb-main-area-layout' : 'wb-workbench-layout');
      }
    })();

    // 3. Move the mouse pointer over the target.
    const targetElementBounds = fromRect(await targetLocator.boundingBox());
    await mouse.move(targetElementBounds.hcenter, targetElementBounds.vcenter, {steps: options?.steps ?? 1});
  }

  /**
   * Moves this view to a new browser window.
   */
  public async moveToNewWindow(): Promise<AppPO> {
    const contextMenu = await this.openContextMenu();

    // Wait for the specified window to open; must be invoked prior to opening the window.
    const newPagePredicate = async (page: Page): Promise<boolean> => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null;
    const [newPage] = await Promise.all([
      this.locator.page().waitForEvent('popup', {predicate: newPagePredicate}),
      contextMenu.menuItems.moveToNewWindow.click(),
    ]);

    // Wait until the workbench in the new page completed startup.
    const newAppPO = new AppPO(newPage);
    await newAppPO.waitUntilWorkbenchStarted();
    return newAppPO;
  }

  /**
   * Moves this view to a different or new part in the specified region.
   *
   * Unlike the {@link dragTo} method, this operation does not perform a drag and drop operation but
   * moves the view programmatically. Use this method to move a view to another window as not supported
   * by Playwright.
   */
  public async moveTo(partId: string, options?: {region?: 'north' | 'south' | 'west' | 'east'; workbenchId?: string}): Promise<void> {
    await this.click();

    const contextMenu = await this.openContextMenu();
    await contextMenu.menuItems.moveView.click();

    const dialog = new AppPO(this.locator.page()).dialog({cssClass: 'e2e-move-view'});

    const dialogPage = new ViewMoveDialogTestPagePO(dialog);
    await dialogPage.enterWorkbenchId(options?.workbenchId ?? '');
    await dialogPage.enterPartId(partId);
    await dialogPage.enterRegion(options?.region ?? '');
    await dialogPage.pressOK();
  }

  /**
   * Drags this view tab to the specified region of specified part or grid.
   *
   * @param target - Specifies the part or grid where to drop this view tab.
   * @param target.partId - Specifies the part where to drag this tab.
   * @param target.grid - Specifies the grid where to drag this tab.
   * @param target.region - Specifies the region where to drop this tab in the specified target.
   * @param options - Controls the drag operation.
   * @param options.steps - Sets the number of intermediate events to be emitted while dragging; defaults to `2`.
   * @param options.performDrop - Controls whether to perform the drop; defaults to `true`.
   */
  public async dragTo(target: {partId: string; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void>;
  public async dragTo(target: {grid: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void>;
  public async dragTo(target: {partId?: string; grid?: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void> {
    // We cannot use {@link Locator#dragTo} because the workbench dynamically inserts drop zones when dragging over the target part.
    // For this reason, we first perform a "mousedown" on the view tab, move the mouse to the specified region of the target element, and then perform a "mouseup".
    // 1. Activate drop zones by moving the mouse over the specified target.
    if (target.partId) {
      await this.activateDropZones({partId: target.partId}, {steps: options?.steps});
    }
    else {
      await this.activateDropZones({grid: target.grid!}, {steps: options?.steps});
    }

    // 2. Locate the drop zone.
    const dropZoneLocator = (() => {
      if (target.partId) {
        return this.locator.page().locator(`wb-part[data-partid="${target.partId}"]`).locator(`div.e2e-view-drop-zone.e2e-${target.region}.e2e-part`);
      }
      else {
        const dropZoneCssClass = target.grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
        return this.locator.page().locator(`div.e2e-view-drop-zone.e2e-${target.region}.${dropZoneCssClass}`);
      }
    })();

    // 3. Move the view tab over the drop zone.
    const dropZoneBounds = fromRect(await dropZoneLocator.boundingBox());
    const mouse = this.locator.page().mouse;
    switch (target.region) {
      case 'north':
        // Moves the mouse to the bottom edge, just one pixel inside the drop zone
        await mouse.move(dropZoneBounds.hcenter, dropZoneBounds.bottom - 1, {steps: 1});
        break;
      case 'south':
        // Moves the mouse to the top edge, just one pixel inside the drop zone
        await mouse.move(dropZoneBounds.hcenter, dropZoneBounds.top + 1, {steps: 1});
        break;
      case 'west':
        // Moves the mouse to the right edge, just one pixel inside the drop zone
        await mouse.move(dropZoneBounds.right - 1, dropZoneBounds.vcenter, {steps: 1});
        break;
      case 'east':
        // Moves the mouse to the left edge, just one pixel inside the drop zone
        await mouse.move(dropZoneBounds.left + 1, dropZoneBounds.vcenter, {steps: 1});
        break;
      case 'center':
        // Moves the mouse to the center of the drop zone.
        await mouse.move(dropZoneBounds.hcenter, dropZoneBounds.vcenter, {steps: 1});
        break;
    }

    // 4. Perform a "mouseup".
    if (options?.performDrop ?? true) {
      await this.locator.page().mouse.up();
    }
  }
}
