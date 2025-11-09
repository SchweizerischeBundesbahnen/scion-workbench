/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect, Locator} from '@playwright/test';
import {MicrofrontendPopupPagePO, WorkbenchPopupPagePO} from '../workbench/page-object/workbench-popup-page.po';
import {fromRect} from '../helper/testing.util';
import {POPUP_DIAMOND_ANCHOR_SIZE} from '../workbench/workbench-layout-constants';
import {PopupPO} from '../popup.po';
import {BottomLeftPoint, BottomRightPoint, TopLeftPoint, TopRightPoint} from '@scion/workbench';

/**
 * Asserts state and presence of a popup.
 */
export function expectPopup(popupPage: WorkbenchPopupPagePO | MicrofrontendPopupPagePO): PopupMatcher {
  if (isMicrofrontendPopup(popupPage)) {
    return expectMicrofrontendPopup(popupPage);
  }
  return expectWorkbenchPopup(popupPage);
}

/**
 * Returns a {@link PopupMatcher} to expect the workbench popup.
 */
function expectWorkbenchPopup(popupPage: WorkbenchPopupPagePO): PopupMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeVisible();
      await expect(popupPage.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeAttached();
      await expect(popupPage.popup.locator).not.toBeVisible();
      await expect(popupPage.locator).toBeAttached();
      await expect(popupPage.locator).not.toBeVisible();
      await expect.poll(() => popupPage.popup.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the popup.
    },
    toHavePosition: async (alignment: 'north' | 'south' | 'east' | 'west', element: Locator | 'viewport', position?: TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void> => {
      await expectPopupPosition(popupPage.popup, alignment, element, position);
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(popupPage.popup.locator).not.toBeAttached();
        await expect(popupPage.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Returns a {@link PopupMatcher} to expect the microfrontend popup.
 */
function expectMicrofrontendPopup(popupPage: MicrofrontendPopupPagePO): PopupMatcher {
  return {
    toBeVisible: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeVisible();
      await expect(popupPage.locator).toBeVisible();
      await expect(popupPage.outlet.locator).toBeVisible();
    },
    toBeHidden: async (): Promise<void> => {
      await expect(popupPage.popup.locator).toBeAttached();
      await expect(popupPage.popup.locator).not.toBeVisible();
      await expect(popupPage.outlet.locator).toBeAttached();
      await expect(popupPage.outlet.locator).not.toBeVisible();
      await expect(popupPage.locator).toBeVisible(); // iframe content is always visible, but not displayed because the outlet is hidden
      await expect.poll(() => popupPage.popup.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the popup.
      await expect.poll(() => popupPage.outlet.locator.boundingBox()).not.toBeNull(); //  assert to use `visibility: hidden` and not `display: none` to preserve the dimension of the popup.
    },
    toHavePosition: async (alignment: 'north' | 'south' | 'east' | 'west', element: Locator | 'viewport', position?: TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void> => {
      await expectPopupPosition(popupPage.popup, alignment, element, position);
    },
    not: {
      toBeAttached: async (): Promise<void> => {
        await expect(popupPage.popup.locator).not.toBeAttached();
        await expect(popupPage.locator).not.toBeAttached();
        await expect(popupPage.outlet.locator).not.toBeAttached();
      },
    },
  };
}

/**
 * Asserts state and presence of a popup.
 */
export interface PopupMatcher {
  /**
   * Expects the popup to be visible.
   */
  toBeVisible(): Promise<void>;

  /**
   * Expects the popup to be in the DOM but not visible.
   */
  toBeHidden(): Promise<void>;

  /**
   * Expects the popup to open with specified alignment on an edge of specified element, or at a coordinate relative to the element.
   */
  toHavePosition(alignment: 'north' | 'south' | 'east' | 'west', element: Locator | 'viewport', position?: TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void>;

  not: {
    /**
     * Expects the popup not to be in the DOM.
     */
    toBeAttached(): Promise<void>;
  };
}

function isMicrofrontendPopup(popupPage: WorkbenchPopupPagePO | MicrofrontendPopupPagePO): popupPage is MicrofrontendPopupPagePO {
  return !!(popupPage as MicrofrontendPopupPagePO).outlet;
}

/**
 * Expects the popup to open with specified alignment on an edge of specified element, or at a coordinate relative to the element.
 */
async function expectPopupPosition(popup: PopupPO, alignment: 'north' | 'south' | 'east' | 'west', element: Locator | 'viewport', position?: TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint): Promise<void> {
  // Expect alignment.
  await expect.poll(() => popup.getAlign()).toEqual(alignment);

  // Expect anchor.
  await expect(async () => {
    const anchorBounds = await (async () => {
      const elementBounds = fromRect(element === 'viewport' ? popup.locator.page().viewportSize() : await element.boundingBox());
      if (position) {
        const topLeft = position as Partial<TopLeftPoint>;
        if (topLeft.top !== undefined && topLeft.left !== undefined) {
          return fromRect({x: elementBounds.left + topLeft.left, y: elementBounds.top + topLeft.top});
        }
        const topRight = position as Partial<TopRightPoint>;
        if (topRight.top !== undefined && topRight.right !== undefined) {
          return fromRect({x: elementBounds.right - topRight.right, y: elementBounds.top + topRight.top});
        }
        const bottomLeft = position as Partial<BottomLeftPoint>;
        if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
          return fromRect({x: elementBounds.left + bottomLeft.left, y: elementBounds.bottom - bottomLeft.bottom});
        }
        const bottomRight = position as Partial<BottomRightPoint>;
        if (bottomRight.bottom !== undefined && bottomRight.right !== undefined) {
          return fromRect({x: elementBounds.right - bottomRight.right, y: elementBounds.bottom - bottomRight.bottom});
        }
        throw Error('[PageObjectError] Illegal position; must be "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
      }
      else {
        return elementBounds;
      }
    })();

    const popupBounds = await popup.getBoundingBox();
    switch (alignment) {
      case 'north': {
        expect(popupBounds.bottom + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorBounds.top, 0);
        expect(popupBounds.hcenter).toBeCloseTo(anchorBounds.hcenter, 0);
        break;
      }
      case 'south': {
        expect(popupBounds.top - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorBounds.bottom, 0);
        expect(popupBounds.hcenter).toBeCloseTo(anchorBounds.hcenter, 0);
        break;
      }
      case 'east': {
        expect(popupBounds.left - POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorBounds.right, 0);
        expect(popupBounds.vcenter).toBeCloseTo(anchorBounds.vcenter, 0);
        break;
      }
      case 'west': {
        expect(popupBounds.right + POPUP_DIAMOND_ANCHOR_SIZE).toBeCloseTo(anchorBounds.left, 0);
        expect(popupBounds.vcenter).toBeCloseTo(anchorBounds.vcenter, 0);
        break;
      }
    }
  }).toPass();
}
