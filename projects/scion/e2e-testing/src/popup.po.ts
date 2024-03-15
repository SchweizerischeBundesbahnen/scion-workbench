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
import {DomRect, fromRect, getCssClasses, hasCssClass} from './helper/testing.util';

/**
 * Handle for interacting with a workbench popup.
 */
export class PopupPO {

  private readonly _overlay: Locator;

  constructor(public readonly locator: Locator) {
    this._overlay = this.locator.page().locator('.cdk-overlay-pane.wb-popup', {has: this.locator});
  }

  public async getPopupId(): Promise<string> {
    return (await this.locator.getAttribute('data-popupid'))!;
  }

  /**
   * Retrieves the bounding box of the popup. By default, includes borders ('border-box').
   *
   * @param options - Specifies whether to include borders ('border-box') or not ('content-box').
   */
  public async getBoundingBox(options?: {box?: 'border-box' | 'content-box'}): Promise<DomRect> {
    const locator = options?.box === 'content-box' ? this.locator : this._overlay;
    return fromRect(await locator.boundingBox());
  }

  /**
   * Returns the computed style of the popup element.
   */
  public getComputedStyle(): Promise<CSSStyleDeclaration> {
    return this.locator.evaluate((popupElement: HTMLElement) => getComputedStyle(popupElement));
  }

  public async getAlign(): Promise<'east' | 'west' | 'north' | 'south'> {
    const cssClasses = await getCssClasses(this._overlay);
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

  public hasVerticalOverflow(): Promise<boolean> {
    return hasCssClass(this.locator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.vertical'), 'overflow');
  }

  public hasHorizontalOverflow(): Promise<boolean> {
    return hasCssClass(this.locator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.horizontal'), 'overflow');
  }
}
