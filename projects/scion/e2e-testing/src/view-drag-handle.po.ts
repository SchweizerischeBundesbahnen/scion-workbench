/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect} from './helper/testing.util';
import {Locator, Mouse, Page} from '@playwright/test';

/**
 * Reference to the drag handle of a view to control drag and drop.
 */
export class ViewDrageHandlePO {

  private _x = 0;
  private _y = 0;
  private _page: Page;
  private _mouse: Mouse;

  constructor(public readonly locator: Locator, mousePosition: {x: number; y: number}) {
    this._x = mousePosition.x;
    this._y = mousePosition.y;
    this._page = locator.page();
    this._mouse = locator.page().mouse;
  }

  /**
   * Drags this tab to the specified coordinate.
   *
   * The coordinate can be either absolute or relative to the current position.
   */
  public async dragTo(to: CoordinateOrDelta, options?: {steps?: number}): Promise<void> {
    if ('x' in to) {
      this._x = to.x;
      this._y = to.y;
    }
    else {
      this._x += to.deltaX;
      this._y += to.deltaY;
    }

    await this._mouse.move(this._x, this._y, {steps: options?.steps ?? 100});
  }

  /**
   * Drags this tab to the specified region in the specified part.
   */
  public async dragToPart(partId: string, options: {region: 'north' | 'east' | 'south' | 'west' | 'center'; steps?: number}): Promise<void> {
    const steps = options.steps ?? 100;

    // 1. Activate drop zones by dragging the drag handle over the part.
    const targetBounds = fromRect(await this._page.locator(`wb-part[data-partid="${partId}"]`).locator('div.e2e-active-view').boundingBox());
    await this._mouse.move(targetBounds.hcenter, targetBounds.vcenter, {steps});

    // 2. Move the drag handle over the specified region.
    if (options.region !== 'center') {
      const dropZoneLocator = this._page.locator(`wb-part[data-partid="${partId}"]`).locator(`div.e2e-view-drop-zone.e2e-${options.region}.e2e-part`);
      await this.moveMouseToRegion(dropZoneLocator, options.region, {steps});
    }
  }

  /**
   * Drags this tab to the specified region of specified grid.
   */
  public async dragToGrid(grid: 'workbench' | 'mainArea', options: {region: 'north' | 'east' | 'south' | 'west' | 'center'; steps?: number}): Promise<void> {
    const steps = options.steps ?? 100;

    // 1. Activate drop zones by dragging the drag handle over the grid.
    const targetBounds = fromRect(await this._page.locator(grid === 'mainArea' ? 'wb-main-area-layout' : 'wb-workbench-layout').boundingBox());
    await this._mouse.move(targetBounds.hcenter, targetBounds.vcenter, {steps});

    // 2. Move the drag handle over the specified region.
    if (options.region !== 'center') {
      const dropZoneCssClass = grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
      const dropZoneLocator = this._page.locator(`div.e2e-view-drop-zone.e2e-${options.region}.${dropZoneCssClass}`);
      await this.moveMouseToRegion(dropZoneLocator, options.region, {steps});
    }
  }

  /**
   * Performs a drop, finishing the drag operation.
   */
  public async drop(): Promise<void> {
    await this._mouse.up();
  }

  /**
   * Cancels the drag operation.
   */
  public async cancel(): Promise<void> {
    await this._page.keyboard.press('Escape');
  }

  /**
   * Gets the bounding box of the drag image.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  /**
   * Gets the specified CSS property of the drag image.
   */
  public getCssPropertyValue(property: string): Promise<string> {
    return this.locator.evaluate((dragImage: HTMLElement, property: string) => {
      return getComputedStyle(dragImage).getPropertyValue(property);
    }, property);
  }

  /**
   * Moves the mouse over the specified region of given element.
   */
  private async moveMouseToRegion(locator: Locator, region: 'north' | 'east' | 'south' | 'west' | 'center', options: {steps: number}): Promise<void> {
    const {top, right, bottom, left, hcenter, vcenter} = fromRect(await locator.boundingBox());
    const steps = options.steps;
    const mouse = this._mouse;

    switch (region) {
      case 'north':
        // Moves the mouse to the bottom edge, just one pixel inside the drop zone
        await mouse.move(hcenter, bottom - 1, {steps});
        break;
      case 'south':
        // Moves the mouse to the top edge, just one pixel inside the drop zone
        await mouse.move(hcenter, top + 1, {steps});
        break;
      case 'west':
        // Moves the mouse to the right edge, just one pixel inside the drop zone
        await mouse.move(right - 1, vcenter, {steps});
        break;
      case 'east':
        // Moves the mouse to the left edge, just one pixel inside the drop zone
        await mouse.move(left + 1, vcenter, {steps});
        break;
      case 'center':
        // Moves the mouse to the center of the drop zone.
        await mouse.move(hcenter, vcenter, {steps});
        break;
    }
  }
}

/**
 * Represents an absolute coordinate or a delta relative to the current position.
 */
export type CoordinateOrDelta = {x: number; y: number} | {deltaX: number; deltaY: number};
