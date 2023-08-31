/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromRect, getCssClasses, hasCssClass, isPresent, waitUntilStable} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {PartPO} from './part.po';

/**
 * Handle for interacting with a workbench view tab.
 */
export class ViewTabPO {

  /**
   * Handle to the part in which this view tab is contained.
   */
  public readonly part: PartPO;

  constructor(private readonly _locator: Locator, part: PartPO) {
    this.part = part;
  }

  public async getViewId(): Promise<string> {
    return (await this._locator.getAttribute('data-viewid'))!;
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async click(): Promise<void> {
    await this._locator.click();
  }

  /**
   * Performs a mouse down on this view tab.
   */
  public async mousedown(): Promise<void> {
    const bounds = fromRect(await this._locator.boundingBox());
    const mouse = this._locator.page().mouse;
    await mouse.move(bounds.hcenter, bounds.vcenter);
    await mouse.down();
  }

  public async close(): Promise<void> {
    await this._locator.hover();
    await this._locator.locator('.e2e-close').click();
  }

  public getTitle(): Promise<string> {
    return waitUntilStable(() => this._locator.locator('.e2e-title').innerText());
  }

  public getHeading(): Promise<string> {
    return waitUntilStable(() => this._locator.locator('.e2e-heading').innerText());
  }

  public isDirty(): Promise<boolean> {
    return waitUntilStable(() => hasCssClass(this._locator, 'dirty'));
  }

  public async isClosable(): Promise<boolean> {
    return (await waitUntilStable(() => this._locator.locator('.e2e-close').count()) !== 0);
  }

  public isActive(): Promise<boolean> {
    return hasCssClass(this._locator, 'active');
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this._locator);
  }

  public async openContextMenu(): Promise<ViewTabContextMenuPO> {
    await this._locator.click({button: 'right'});
    const contextMenuLocator = this._locator.page().locator('wb-view-menu');

    return new class implements ViewTabContextMenuPO {

      public async clickCloseAllTabs(): Promise<void> {
        await contextMenuLocator.locator('button.e2e-close-all-tabs').click();
      }

      public async clickMoveToNewWindow(): Promise<void> {
        await contextMenuLocator.locator('button.e2e-move-to-new-window').click();
      }
    };
  }

  /**
   * Moves this view tab to the center of the specified part or grid without releasing the mouse button.
   */
  public async moveTo(target: {partId: string}, options?: {steps?: number}): Promise<void>;
  public async moveTo(target: {grid: 'workbench' | 'mainArea'}, options?: {steps?: number}): Promise<void>;
  public async moveTo(target: {partId?: string; grid?: 'workbench' | 'mainArea'}, options?: {steps?: number}): Promise<void> {
    // 1. Perform a "mousedown" on the view tab.
    const mouse = this._locator.page().mouse;
    await this.mousedown();

    // 2. Locate the target.
    const targetLocator = (() => {
      if (target.partId) {
        return this._locator.page().locator(`wb-part[data-partid="${target.partId}"]`).locator('div.e2e-active-view');
      }
      else {
        return this._locator.page().locator(target.grid === 'mainArea' ? 'wb-main-area-layout' : 'wb-workbench-layout');
      }
    })();

    // 3. Move the mouse pointer over the target.
    const targetElementBounds = fromRect(await targetLocator.boundingBox());
    await mouse.move(targetElementBounds.hcenter, targetElementBounds.vcenter, {steps: options?.steps ?? 1});
  }

  /**
   * Drags this view tab to the specified region of specified part or grid.
   *
   * @param target - Specifies the part or grid where to drop this view tab.
   *        @property partId - Specifies the part where to drag this tab.
   *        @property grid - Specifies the grid where to drag this tab.
   *        @property region - Specifies the region where to drop this tab in the specified target.
   * @param options - Controls the drag operation.
   *        @property steps - Sets the number of intermediate events to be emitted while dragging; defaults to `2`.
   *        @property performDrop - Controls whether to perform the drop; defaults to `true`.
   */
  public async dragTo(target: {partId: string; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void>;
  public async dragTo(target: {grid: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void>;
  public async dragTo(target: {partId?: string; grid?: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void> {
    // We cannot use {@link Locator#dragTo} because the workbench dynamically inserts drop zones when dragging over the target part.
    // For this reason, we first perform a "mousedown" on the view tab, move the mouse to the specified region of the target element, and then perform a "mouseup".
    // 1. Activate drop zones by moving the mouse over the specified target.
    if (target.partId) {
      await this.moveTo({partId: target.partId}, {steps: options?.steps});
    }
    else {
      await this.moveTo({grid: target.grid!}, {steps: options?.steps});
    }

    // 2. Locate the drop zone.
    const dropZoneLocator = (() => {
      if (target.partId) {
        return this._locator.page().locator(`wb-part[data-partid="${target.partId}"]`).locator(`div.e2e-view-drop-zone.e2e-${target.region}.e2e-part`);
      }
      else {
        const dropZoneCssClass = target.grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
        return this._locator.page().locator(`div.e2e-view-drop-zone.e2e-${target.region}.${dropZoneCssClass}`);
      }
    })();

    // 3. Move the view tab over the drop zone.
    const dropZoneBounds = fromRect(await dropZoneLocator.boundingBox());
    const mouse = this._locator.page().mouse;
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
      await this._locator.page().mouse.up();
    }
  }
}

export interface ViewTabContextMenuPO {

  clickCloseAllTabs(): Promise<void>;

  clickMoveToNewWindow(): Promise<void>;
}
