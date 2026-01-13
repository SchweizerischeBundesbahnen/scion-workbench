/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator, Page} from '@playwright/test';
import {coerceArray, DomRect, fromRect, getCssClasses, hasCssClass, selectBy} from './helper/testing.util';
import {POPUP_DIAMOND_ANCHOR_SIZE} from './workbench/workbench-layout-constants';
import {PopupId} from '@scion/workbench';
import {RequireOne} from './helper/utility-types';

/**
 * Handle for interacting with a workbench popup.
 */
export class PopupPO {

  public readonly locator: Locator;
  public readonly overlay: Locator;
  public readonly locateBy?: {id?: PopupId; cssClass?: string[]};

  constructor(page: Page, locateBy: RequireOne<{popupId: PopupId; cssClass: string | string[]}>, options?: {nth?: number}) {
    this.locateBy = {id: locateBy.popupId, cssClass: coerceArray(locateBy.cssClass)};
    this.locator = page.locator(selectBy('wb-popup', {attributes: {'data-popupid': locateBy.popupId}, cssClass: locateBy.cssClass})).nth(options?.nth ?? 0);
    this.overlay = this.locator.page().locator('.cdk-overlay-pane.wb-popup', {has: this.locator});
  }

  public async getPopupId(): Promise<PopupId> {
    return (await this.locator.getAttribute('data-popupid')) as PopupId;
  }

  /**
   * Retrieves the bounding box of the popup. By default, includes borders ('border-box').
   *
   * @param options - Specifies whether to include borders ('border-box') or not ('content-box').
   */
  public async getBoundingBox(options?: {box?: 'border-box' | 'content-box'}): Promise<DomRect> {
    const locator = options?.box === 'content-box' ? this.locator : this.overlay;
    return fromRect(await locator.boundingBox());
  }

  /**
   * Returns the computed style of the popup element.
   */
  public getComputedStyle(): Promise<CSSStyleDeclaration> {
    return this.locator.evaluate((popupElement: HTMLElement) => getComputedStyle(popupElement));
  }

  public async getAlign(): Promise<'east' | 'west' | 'north' | 'south'> {
    const cssClasses = await getCssClasses(this.overlay);
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

  public async getAnchorPosition(): Promise<{x: number; y: number}> {
    const boundingBox = await this.getBoundingBox({box: 'border-box'});
    const align = await this.getAlign();
    switch (align) {
      case 'south':
        return {
          x: boundingBox.hcenter,
          y: boundingBox.y - POPUP_DIAMOND_ANCHOR_SIZE,
        };
      case 'north':
        return {
          x: boundingBox.hcenter,
          y: boundingBox.bottom + POPUP_DIAMOND_ANCHOR_SIZE,
        };
      case 'east':
        return {
          x: boundingBox.x - POPUP_DIAMOND_ANCHOR_SIZE,
          y: boundingBox.vcenter,
        };
      case 'west':
        return {
          x: boundingBox.right + POPUP_DIAMOND_ANCHOR_SIZE,
          y: boundingBox.vcenter,
        };
      default:
        throw Error('[PageObjectError] Illegal position; must be north, south, west or east');
    }
  }
}
