/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect, throwError} from './helper/testing.util';
import {Locator, Mouse, Page} from '@playwright/test';
import {ActivityId, PartId} from '@scion/workbench';

/**
 * Reference to the drag handle of a view to control drag and drop.
 */
export class ViewDrageHandlePO {

  private _x = 0;
  private _y = 0;
  private _page: Page;
  private _mouse: Mouse;

  public dragImage: {
    /**
     * Locates the title of the view tab.
     */
    title: Locator;
    /**
     * Locates the heading of the view tab.
     */
    heading: Locator;
    /**
     * Locates the dirty marker of the view tab.
     */
    dirty: Locator;
    /**
     * Locates the content of the view tab.
     */
    content: Locator;
    /**
     * Locates the close button of the view tab.
     */
    closeButton: Locator;
  };

  constructor(public readonly locator: Locator, mousePosition: {x: number; y: number}) {
    this._x = mousePosition.x;
    this._y = mousePosition.y;
    this._page = locator.page();
    this._mouse = locator.page().mouse;
    this.dragImage = {
      title: this.locator.locator('.e2e-title'),
      heading: this.locator.locator('.e2e-heading'),
      dirty: this.locator.locator('.e2e-dirty'),
      content: this.locator.locator('wb-view-tab-content'),
      closeButton: this.locator.locator('button.e2e-close'),
    };
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
   *
   * @param partId - Specifies the part to drag the tab into.
   * @param options - Controls the drag operation.
   * @param options.region - Specifies into which region of the part to drag the view.
   * @param options.dragFromCenter - If `false`, starts dragging from the current pointer position. Defaults to `true`, starting from the center of the part.
   * @param options.orElse - If `false` and the drop zone cannot be located, returns `false` instead of throwing an error.
   */
  public async dragToPart(partId: PartId, options: {region: 'north' | 'east' | 'south' | 'west' | 'center'; dragFromCenter?: false; orElse?: false}): Promise<boolean> {
    if (options.dragFromCenter ?? true) {
      const partBounds = fromRect(await this._page.locator(`wb-part[data-partid="${partId}"]`).boundingBox());
      await this.dragTo({x: partBounds.hcenter, y: partBounds.vcenter});
    }

    return this.dragToRegion(options.region, {
      dropZoneLocator: this._page.locator(`wb-part[data-partid="${partId}"]`).locator(`div.e2e-part-drop-zone[data-partid="${partId}"]`),
      orElse: options.orElse,
    });
  }

  /**
   * Drags this tab to the specified region in the specified grid.
   *
   * @param dragTo - Specifies where to drag this tab to.
   * @param dragTo.grid - Specifies the target grid.
   * @param dragTo.region - Specifies the drop region.
   * @param options - Controls the drag operation.
   * @param options.dragFromCenter - If `false`, starts dragging from the current pointer position. Defaults to `true`, starting from the center.
   * @param options.orElse - If `false` and the drop zone cannot be located, returns `false` instead of throwing an error.
   */
  public async dragToGrid(dragTo: {grid: 'main' | 'main-area' | ActivityId; region: 'north' | 'east' | 'south' | 'west'}, options?: {dragFromCenter?: false; orElse?: false}): Promise<boolean> {
    if (options?.dragFromCenter ?? true) {
      const {hcenter, vcenter} = fromRect(this._page.viewportSize());
      await this.dragTo({x: hcenter, y: vcenter});
    }

    return this.dragToRegion(dragTo.region, {
      dropZoneLocator: this._page.locator('wb-layout').locator(`div.e2e-grid-drop-zone[data-grid="${dragTo.grid}"]`),
      orElse: options?.orElse,
    });
  }

  private async dragToRegion(region: 'north' | 'east' | 'south' | 'west' | 'center', options: {dropZoneLocator: Locator; orElse?: false}): Promise<boolean> {
    const dropZoneLocator = options.dropZoneLocator;

    // Move the drag handle over the specified region.
    const {top, right, bottom, left} = fromRect(await dropZoneLocator.boundingBox());
    switch (region) {
      case 'north':
        while ((await dropZoneLocator.getAttribute('data-region')) !== 'north' && this._y > top) {
          await this.dragTo({deltaY: -5, deltaX: 0}, {steps: 1});
        }
        break;
      case 'south':
        while ((await dropZoneLocator.getAttribute('data-region')) !== 'south' && this._y < bottom) {
          await this.dragTo({deltaY: 5, deltaX: 0}, {steps: 1});
        }
        break;
      case 'west':
        while ((await dropZoneLocator.getAttribute('data-region')) !== 'west' && this._x > left) {
          await this.dragTo({deltaY: 0, deltaX: -5}, {steps: 1});
        }
        break;
      case 'east':
        while ((await dropZoneLocator.getAttribute('data-region')) !== 'east' && this._x < right) {
          await this.dragTo({deltaY: 0, deltaX: 5}, {steps: 1});
        }
        break;
    }

    // Simulate an extra 'dragover' event as Playwright does not continuously trigger 'dragover' events when not moving the pointer.
    await this.dragTo({deltaY: 0, deltaX: 0}, {steps: 1});

    // Check if activated the requested region.
    if (await dropZoneLocator.getAttribute('data-region') !== region) {
      return options.orElse ?? throwError(`[PageObjectError] Failed to locate drop zone '${region}'.`);
    }

    // Verify drop placeholder to render.
    const dropZoneId = await dropZoneLocator.getAttribute('data-id');
    const dropPlaceholder = this._page.locator(`div.e2e-drop-placeholder[data-dropzoneid="${dropZoneId}"]`);
    if (!await dropPlaceholder.isVisible()) {
      return options.orElse ?? throwError(`[PageObjectError] Failed to locate drop zone '${region}'.`);
    }

    return true;
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
   * Gets the specified CSS property of the drag image or specified target.
   */
  public getCssPropertyValue(property: string, options?: {target?: 'drag-image' | 'close-button'}): Promise<string> {
    const target = options?.target ?? 'drag-image';
    const locator = target === 'drag-image' ? this.locator : this.locator.locator('button.e2e-close');

    return locator.evaluate((dragImage: HTMLElement, property: string) => {
      return getComputedStyle(dragImage).getPropertyValue(property);
    }, property);
  }
}

/**
 * Represents an absolute coordinate or a delta relative to the current position.
 */
export type CoordinateOrDelta = {x: number; y: number} | {deltaX: number; deltaY: number};
