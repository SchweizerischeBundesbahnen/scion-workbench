/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect} from './helper/testing.util';
import {Locator} from '@playwright/test';

/**
 * Handle for interacting with the workbench view tab bar.
 */
export class ViewTabBarPO {

  constructor(public locator: Locator) {
  }

  /**
   * Gets the view ids of the tabs in display order.
   */
  public async getViewIds(locateBy?: {cssClass?: string; visible?: true}): Promise<string[]> {
    const locateByCssClass = locateBy?.cssClass ? `:scope.${locateBy?.cssClass}` : ':scope';
    const viewIds = [];
    for (const viewTabLocator of await this.locator.locator('wb-view-tab').locator(locateByCssClass).all()) {
      if (locateBy?.visible && !await viewTabLocator.isVisible()) {
        continue;
      }
      viewIds.push((await viewTabLocator.getAttribute('data-viewid'))!);
    }
    return viewIds;
  }

  /**
   * Gets the bounding box of this view tab bar.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  /**
   * Gets the specified CSS property of the tab viewport client.
   */
  public getViewportClientCssProperty(property: string): Promise<string> {
    return this.locator.locator('sci-viewport.e2e-tab-viewport div[part="content"]').evaluate((viewportClient: HTMLElement, property: string) => {
      return getComputedStyle(viewportClient).getPropertyValue(property);
    }, property);
  }

  /**
   * Sets the horizontal scroll position of the tab viewport.
   */
  public async setViewportScrollLeft(scrollLeft: number): Promise<void> {
    const tabbarViewport = this.locator.locator('sci-viewport.e2e-tab-viewport div.viewport');
    await tabbarViewport.evaluate((viewport: HTMLElement, scrollLeft: number) => {
      viewport.scrollLeft = scrollLeft;
    }, scrollLeft);
  }

  /**
   * Closes all tabs.
   */
  public async closeTabs(): Promise<void> {
    await this.locator.locator('wb-view-tab').first().press('Control+Alt+Shift+K');
  }
}
