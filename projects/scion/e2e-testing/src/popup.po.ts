/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DomRect, getCssClasses, hasCssClass, isPresent, isVisible, waitUntilBoundingBoxStable} from './helper/testing.util';

/**
 * Handle for interacting with a workbench popup.
 */
export class PopupPO {

  public readonly locator: Locator;

  constructor(private readonly _overlayLocator: Locator) {
    this.locator = this._overlayLocator.locator('wb-popup');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return isVisible(this.locator);
  }

  public async getBoundingBox(selector: 'cdk-overlay' | 'wb-popup' = 'wb-popup'): Promise<DomRect> {
    const locator = selector === 'cdk-overlay' ? this._overlayLocator : this.locator;
    await locator.waitFor({state: 'visible'});
    return waitUntilBoundingBoxStable(locator);
  }

  public async getAlign(): Promise<'east' | 'west' | 'north' | 'south'> {
    const cssClasses = await getCssClasses(this._overlayLocator);
    if (cssClasses.includes('wb-east')) {
      return 'east';
    }
    if (cssClasses.includes('wb-west')) {
      return 'west';
    }
    if (cssClasses.includes('wb-north')) {
      return 'north';
    }
    if (cssClasses.includes('wb-south')) {
      return 'south';
    }
    throw Error('[PopupAlignError] Popup not aligned.');
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }

  public hasVerticalOverflow(): Promise<boolean> {
    return hasCssClass(this.locator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.vertical'), 'overflow');
  }

  public hasHorizontalOverflow(): Promise<boolean> {
    return hasCssClass(this.locator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.horizontal'), 'overflow');
  }

  public locate(selector: string): Locator {
    return this.locator.locator(selector);
  }

  public async waitUntilClosed(): Promise<void> {
    await this.locator.waitFor({state: 'detached'});
  }

  public async waitUntilAttached(): Promise<void> {
    await this.locator.waitFor({state: 'attached'});
  }

  public async pressEscape(): Promise<void> {
    await this.locator.click();
    await this.locator.press('Escape');
  }

  public async waitUntilVisible(): Promise<void> {
    await this.locator.waitFor({state: 'visible'});
  }
}
