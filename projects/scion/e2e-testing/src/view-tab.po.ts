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
   * Moves this view tab to the center of the specified area without releasing the mouse button.
   */
  public async moveToArea(area: 'main-area' | 'peripheral-area'): Promise<void> {
    const mouse = this._locator.page().mouse;

    // 1. Perform a "mousedown" on the view tab.
    await this.mousedown();

    // 2. Move the mouse pointer over the specified area.
    const targetAreaLocator = this._locator.page().locator(area === 'main-area' ? 'wb-main-area-layout' : 'wb-workbench-layout');
    const targetAreaBounds = fromRect(await targetAreaLocator.boundingBox());
    await mouse.move(targetAreaBounds.hcenter, targetAreaBounds.vcenter, {steps: 1});
  }

  /**
   * Moves this view tab to the center of the specified part without releasing the mouse button.
   */
  public async moveToPart(partId: string, options?: {steps?: number}): Promise<void> {
    const mouse = this._locator.page().mouse;

    // 1. Perform a "mousedown" on the view tab.
    await this.mousedown();

    // 2. Move the mouse pointer over the specified part.
    const targetPartLocator = this._locator.page().locator(`wb-part[data-partid="${partId}"]`).locator('div.e2e-active-view');
    const targetPartBounds = fromRect(await targetPartLocator.boundingBox());
    await mouse.move(targetPartBounds.hcenter, targetPartBounds.vcenter, {steps: options?.steps ?? 1});
  }

  /**
   * Drags this view tab to the specified region of a part.
   *
   * @param target - Specifies part and region where to drop this view tab.
   *        @property partId - Identifies the target part by its id; if not set, defaults to "this" part
   *        @property region - Specifies the region where to drop this view tab in the specified part
   * @param options - Controls the drag operation.
   *        @property steps - Sets the number of intermediate events to be emitted while dragging; defaults to `2`.
   *        @property performDrop - Controls whether to perform the drop; defaults to `true`.
   */
  public async dragToPart(target: {partId?: string; region: 'north' | 'east' | 'south' | 'west' | 'center'}, options?: {steps?: number; performDrop?: boolean}): Promise<void> {
    const partId = target.partId ?? await this.part.getPartId();

    // We cannot use {@link Locator#dragTo} because the workbench dynamically inserts drop zones when dragging over the target part.
    // For this reason, we first perform a "mousedown" on the view tab, move the mouse to the specified region of the target part, and then perform a "mouseup".

    // 1. Move the view tab over the specified part to activate the drop zones.
    await this.moveToPart(partId, options);

    // 2. Move the view tab over the drop zone.
    const dropZoneLocator = this._locator.page().locator(`wb-part[data-partid="${partId}"]`).locator(`div.e2e-view-drop-zone.e2e-${target.region}.e2e-part`);
    await this.moveMouseToDropZone(dropZoneLocator, target.region);

    // 3. Perform a "mouseup".
    if (options?.performDrop ?? true) {
      await this._locator.page().mouse.up();
    }
  }

  /**
   * Drags this view tab to the specified region of the specified area.
   *
   * @param target - Specifies area and region where to drop this view tab.
   *        @property area - Identifies the target area
   *        @property region - Specifies the region where to drop this view tab in the specified area
   */
  public async dragToArea(target: {area: 'main-area' | 'peripheral-area'; region: 'north' | 'east' | 'south' | 'west' | 'center'}): Promise<void> {
    // We cannot use {@link Locator#dragTo} because the workbench dynamically inserts drop zones when dragging over the target part.
    // For this reason, we first perform a "mousedown" on the view tab, move the mouse to the specified region of the target part, and then perform a "mouseup".
    // 1. Move the view tab over the specified area to activate the drop zones.
    await this.moveToArea(target.area);

    // 2. Move the view tab over the drop zone.
    const dropZoneLocator = this._locator.page().locator(`div.e2e-view-drop-zone.e2e-${target.region}.e2e-${target.area}`);
    await this.moveMouseToDropZone(dropZoneLocator, target.region);

    // 3. Perform a "mouseup".
    await this._locator.page().mouse.up();
  }

  /**
   * Moves the mouse pointer to the edge or center of the specified drop zone.
   *
   * @param dropZoneLocator - The drop zone element to move the mouse to.
   * @param region - The region of the drop zone where the mouse should be moved.
   *   - 'north': Moves the mouse to the bottom edge, just one pixel inside the drop zone
   *   - 'south': Moves the mouse to the top edge, just one pixel inside the drop zone
   *   - 'west': Moves the mouse to the right edge, just one pixel inside the drop zone
   *   - 'east': Moves the mouse to the left edge, just one pixel inside the drop zone
   *   - 'center': Moves the mouse to the center of the drop zone.
   */
  private async moveMouseToDropZone(dropZoneLocator: Locator, region: 'north' | 'east' | 'south' | 'west' | 'center'): Promise<void> {
    const dropZoneBounds = fromRect(await dropZoneLocator.boundingBox());
    const mouse = this._locator.page().mouse;
    switch (region) {
      case 'north':
        await mouse.move(dropZoneBounds.hcenter, dropZoneBounds.bottom - 1, {steps: 1});
        break;
      case 'south':
        await mouse.move(dropZoneBounds.hcenter, dropZoneBounds.top + 1, {steps: 1});
        break;
      case 'west':
        await mouse.move(dropZoneBounds.right - 1, dropZoneBounds.vcenter, {steps: 1});
        break;
      case 'east':
        await mouse.move(dropZoneBounds.left + 1, dropZoneBounds.vcenter, {steps: 1});
        break;
      case 'center':
        await mouse.move(dropZoneBounds.hcenter, dropZoneBounds.vcenter, {steps: 1});
        break;
    }
  }
}

export interface ViewTabContextMenuPO {

  clickCloseAllTabs(): Promise<void>;

  clickMoveToNewWindow(): Promise<void>;
}
