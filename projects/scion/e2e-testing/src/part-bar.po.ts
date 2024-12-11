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
import {PartActionPO} from './part-action.po';
import {ViewListMenuPO} from './view-list-menu.po';
import {PartPO} from './part.po';

/**
 * Handle for interacting with the workbench part bar.
 */
export class PartBarPO {

  public readonly tabBar: Locator;
  public readonly viewListButton: Locator;

  constructor(public locator: Locator, public part: PartPO) {
    this.tabBar = this.locator.locator('wb-view-tab-bar');
    this.viewListButton = this.locator.locator('wb-view-list-button');
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
   * Opens the view list menu.
   */
  public async openViewListMenu(): Promise<ViewListMenuPO> {
    await this.viewListButton.click();
    return new ViewListMenuPO(this.locator.page().locator(`div.cdk-overlay-pane wb-view-list[data-partid="${await this.part.getPartId()}"]`));
  }

  /**
   * Gets the handle to the specified part action.
   */
  public action(locateBy: {cssClass: string}): PartActionPO {
    return new PartActionPO(this.locator.locator('wb-part-action-bar').locator(`div.e2e-part-action.${locateBy.cssClass}`));
  }

  /**
   * Gets the bounding box of this part bar.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  /**
   * Gets the bounding box of the tab viewport.
   */
  public async getTabViewportBoundingBox(): Promise<DomRect> {
    return fromRect(await this.tabBar.boundingBox());
  }

  /**
   * Gets the specified CSS property of the tab viewport client.
   */
  public getTabViewportClientCssProperty(property: string): Promise<string> {
    return this.tabBar.locator('sci-viewport.e2e-tab-viewport div[part="content"]').evaluate((viewportClient: HTMLElement, property: string) => {
      return getComputedStyle(viewportClient).getPropertyValue(property);
    }, property);
  }

  /**
   * Sets the horizontal scroll position of the tab viewport.
   */
  public async setTabViewportScrollLeft(scrollLeft: number): Promise<void> {
    const tabbarViewport = this.tabBar.locator('sci-viewport.e2e-tab-viewport div.viewport');
    await tabbarViewport.evaluate((viewport: HTMLElement, scrollLeft: number) => {
      viewport.scrollLeft = scrollLeft;
    }, scrollLeft);
  }

  /**
   * Closes all tabs.
   */
  public async closeTabs(): Promise<void> {
    await this.tabBar.locator('wb-view-tab').first().press('Control+Alt+Shift+K');
  }

  /**
   * Gets the number of currently hidden tabs.
   */
  public async getHiddenTabCount(): Promise<number> {
    const hiddenTabCount = this.viewListButton.locator('span.e2e-hidden-tab-count');
    if (await hiddenTabCount.count()) {
      return Number.parseInt(await hiddenTabCount.innerText());
    }
    return 0;
  }
}
