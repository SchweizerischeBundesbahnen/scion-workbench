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
import {getCssClasses, hasCssClass, isPresent, isVisible, waitUntilBoundingBoxStable} from './helper/testing.util';

/**
 * Handle for interacting with a workbench popup.
 */
export class PopupPO {

  private readonly _popupLocator: Locator;

  constructor(private readonly _overlayLocator: Locator) {
    this._popupLocator = this._overlayLocator.locator('wb-popup');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._popupLocator);
  }

  public async isVisible(): Promise<boolean> {
    return isVisible(this._popupLocator);
  }

  public async getBoundingBox(selector: 'cdk-overlay' | 'wb-popup' = 'wb-popup'): Promise<DOMRect> {
    const locator = selector === 'cdk-overlay' ? this._overlayLocator : this._popupLocator;
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
    return getCssClasses(this._popupLocator);
  }

  public hasVerticalOverflow(): Promise<boolean> {
    return hasCssClass(this._popupLocator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.vertical'), 'overflow');
  }

  public hasHorizontalOverflow(): Promise<boolean> {
    return hasCssClass(this._popupLocator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.horizontal'), 'overflow');
  }

  public locator(selector: string): Locator {
    return this._popupLocator.locator(selector);
  }

  public async waitUntilClosed(): Promise<void> {
    await this._popupLocator.waitFor({state: 'detached'});
  }

  public async waitUntilAttached(): Promise<void> {
    await this._popupLocator.waitFor({state: 'attached'});
  }

  public async pressEscape(): Promise<void> {
    await this._popupLocator.click();
    await this._popupLocator.press('Escape');
  }

  public async waitUntilVisible(): Promise<void> {
    await this._popupLocator.waitFor({state: 'visible'});
  }
}
