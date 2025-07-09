/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DomRect, fromRect} from './helper/testing.util';

/**
 * Handle for interacting with an activity panel.
 */
export class ActivityPanelPO {

  constructor(public readonly locator: Locator) {
  }

  public async getPanel(): Promise<'left' | 'right' | 'bottom'> {
    return (await this.locator.getAttribute('data-panel')) as 'left' | 'right' | 'bottom';
  }

  /**
   * Resizes this panel.
   */
  public async resize(distance: number): Promise<void> {
    const mouse = this.locator.page().mouse;
    const steps = Math.ceil(Math.abs(distance) / 5);

    const panelBounds = fromRect(await this.locator.boundingBox());
    switch (await this.getPanel()) {
      case 'left': {
        await mouse.move(panelBounds.right + 1, panelBounds.vcenter); // Move mouse slightly to the right of the panel to not target splitter separating this panel.
        await mouse.down();
        await mouse.move(panelBounds.right + 1 + distance, panelBounds.vcenter, {steps});
        await mouse.up();
        break;
      }
      case 'right': {
        await mouse.move(panelBounds.left - 1, panelBounds.vcenter); // Move mouse slightly to the left of the panel to not target splitter separating this panel.
        await mouse.down();
        await mouse.move(panelBounds.left - 1 + distance, panelBounds.vcenter, {steps});
        await mouse.up();
        break;
      }
      case 'bottom': {
        await mouse.move(panelBounds.hcenter, panelBounds.top - 1); // Move mouse slightly above the panel to not target splitter separating this panel.
        await mouse.down();
        await mouse.move(panelBounds.hcenter, panelBounds.top - 1 + distance, {steps});
        await mouse.up();
        break;
      }
    }
  }

  /**
   * Moves splitter between activities displayed in this panel.
   */
  public async moveSplitter(distance: number): Promise<void> {
    const mouse = this.locator.page().mouse;
    const steps = Math.ceil(Math.abs(distance) / 5);

    const [activityBounds] = (await this.getActivityBoundingBoxes()) as [DomRect, ...DomRect[]];
    switch (await this.getPanel()) {
      case 'left':
      case 'right': {
        await mouse.move(activityBounds.hcenter, activityBounds.bottom);
        await mouse.down();
        await mouse.move(activityBounds.hcenter, activityBounds.bottom + distance, {steps});
        await mouse.up();
        break;
      }
      case 'bottom': {
        await mouse.move(activityBounds.right, activityBounds.vcenter);
        await mouse.down();
        await mouse.move(activityBounds.right + distance, activityBounds.vcenter, {steps});
        await mouse.up();
        break;
      }
    }
  }

  /**
   * Gets the bounding box of this panel.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  /**
   * Gets the bounding boxes of activities displayed in this panel.
   */
  public async getActivityBoundingBoxes(): Promise<DomRect[]> {
    const boundingBoxes = new Array<DomRect>();
    const locators = await this.locator.locator('wb-grid').all();
    for (const locator of locators) {
      boundingBoxes.push(fromRect(await locator.boundingBox()));
    }
    return boundingBoxes;
  }
}
