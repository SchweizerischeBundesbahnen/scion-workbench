/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {fromRect, hasCssClass, waitUntilStable} from './helper/testing.util';

export class ScrollbarPO {

  private readonly _thumbHandle: Locator;

  constructor(public readonly locator: Locator) {
    this._thumbHandle = this.locator.locator('div.thumb-handle');
  }

  public async scroll(distance: number): Promise<void> {
    const thumbBoundingBox = fromRect(await this._thumbHandle.boundingBox())!;
    const mouse = this.locator.page().mouse;

    // Move mouse to thumb.
    await mouse.move(thumbBoundingBox.hcenter, thumbBoundingBox.vcenter);

    // Wait until thumb is visible.
    await waitUntilStable(() => this._thumbHandle.isVisible());

    // Move thumb.
    await mouse.down();
    if (await hasCssClass(this._thumbHandle, 'vertical')) {
      await mouse.move(thumbBoundingBox.hcenter, thumbBoundingBox.vcenter + distance, {steps: 10});
    }
    else {
      await mouse.move(thumbBoundingBox.hcenter + distance, thumbBoundingBox.vcenter, {steps: 10});
    }
    await mouse.up();
  }
}
