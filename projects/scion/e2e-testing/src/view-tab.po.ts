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
      public async closeAllTabs(): Promise<void> {
        return contextMenuLocator.locator('.e2e-close-all-tabs').click();
      }
    };
  }

  /**
   * Drags this view tab to the specified part.
   *
   * @param target - Specifies part and region where to drop this view tab.
   *        <ul>
   *          <li>partId: Identifies the target part by its id; if not set, defaults to "this" part</li>
   *          <li>region: Specifies the region where to drop this view tab in the specified part</li>
   *        </ul>
   */
  public async dragToPart(target: {partId?: string; region: 'north' | 'east' | 'south' | 'west' | 'center'}): Promise<void> {
    // We cannot use {@link Locator#dragTo} because the workbench dynamically inserts drop zones when dragging over the target part.
    // For this reason, we first perform a "mousedown" on the view tab, move the mouse to the specified region of the target part, and then perform a "mouseup".
    const mouse = this._locator.page().mouse;

    // 1. Move the mouse cursor to the view tab.
    const viewTabBounds = fromRect(await this._locator.boundingBox());
    await mouse.move(viewTabBounds.hcenter, viewTabBounds.vcenter);

    // 2. Perform a "mousedown" on the view tab.
    await mouse.down();

    // 3. Move the mouse cursor to the specified region of the target part, or "this" part if not specified.
    const targetPartId = target.partId ?? await this.part.getPartId();
    const targetPartLocator = this._locator.page().locator(`wb-view-part[data-partid="${targetPartId}"]`);
    const targetPartDropZoneBounds = fromRect(await targetPartLocator.locator('[wbviewdropzone]').boundingBox()); /* ViewDropZoneDirective */

    switch (target.region) {
      case 'north':
        await mouse.move(targetPartDropZoneBounds.hcenter, targetPartDropZoneBounds.top + 1, {steps: 2});
        break;
      case 'south':
        await mouse.move(targetPartDropZoneBounds.hcenter, targetPartDropZoneBounds.bottom - 1, {steps: 2});
        break;
      case 'west':
        await mouse.move(targetPartDropZoneBounds.left + 1, targetPartDropZoneBounds.vcenter, {steps: 2});
        break;
      case 'east': {
        await mouse.move(targetPartDropZoneBounds.right - 1, targetPartDropZoneBounds.vcenter, {steps: 2});
        break;
      }
      default:
        await mouse.move(targetPartDropZoneBounds.hcenter, targetPartDropZoneBounds.vcenter, {steps: 2});
        break;
    }

    // 4. Perform a "mouseup".
    await mouse.up();
  }
}

export interface ViewTabContextMenuPO {
  closeAllTabs(): Promise<void>;
}
