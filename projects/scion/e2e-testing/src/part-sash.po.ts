/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromRect} from './helper/testing.util';
import {Locator} from '@playwright/test';

/**
 * Handle for interacting with a sash in the workbench layout.
 */
export class PartSashPO {

  constructor(private readonly _locator: Locator) {
  }

  /**
   * Drags specified handle of the sash by the specified number of pixels.
   */
  public async drag(handle: 'top' | 'right' | 'bottom' | 'left', distance: number): Promise<void> {
    const mouse = this._locator.page().mouse;
    const steps = Math.ceil(Math.abs(distance) / 5);

    const sashBounds = fromRect(await this._locator.boundingBox());
    switch (handle) {
      case 'top': {
        await mouse.move(sashBounds.hcenter, sashBounds.top);
        await mouse.down();
        await mouse.move(sashBounds.hcenter, sashBounds.top + distance, {steps});
        await mouse.up();
        break;
      }
      case 'bottom': {
        await mouse.move(sashBounds.hcenter, sashBounds.bottom);
        await mouse.down();
        await mouse.move(sashBounds.hcenter, sashBounds.bottom + distance, {steps});
        await mouse.up();
        break;
      }
      case 'left': {
        await mouse.move(sashBounds.left, sashBounds.vcenter);
        await mouse.down();
        await mouse.move(sashBounds.left + distance, sashBounds.vcenter, {steps});
        await mouse.up();
        break;
      }
      case 'right': {
        await mouse.move(sashBounds.right, sashBounds.vcenter);
        await mouse.down();
        await mouse.move(sashBounds.right + distance, sashBounds.vcenter, {steps});
        await mouse.up();
        break;
      }
    }
  }
}

