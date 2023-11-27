/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect, isPresent, waitUntilStable} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PartSashPO} from './part-sash.po';
import {PartActionPO} from './part-action.po';
import {ViewListMenuPO} from './view-list-menu.po';

/**
 * Handle for interacting with a workbench part.
 */
export class PartPO {

  private readonly _partBarLocator: Locator;

  /**
   * Handle to the active view of this part.
   */
  public readonly activeView: ViewPO;

  /**
   * Handle for interacting with the sash that contains this part.
   */
  public readonly sash: PartSashPO;

  constructor(private readonly _locator: Locator) {
    this._partBarLocator = this._locator.locator('wb-part-bar');
    this.activeView = new ViewPO(this._locator.locator('wb-view'), new ViewTabPO(this._locator.locator('wb-view-tab.active'), this));
    this.sash = new PartSashPO(this._locator);
  }

  public async getPartId(): Promise<string> {
    return (await this._locator.getAttribute('data-partid'))!;
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  /**
   * Opens the view list menu of this part.
   */
  public async openViewListMenu(): Promise<ViewListMenuPO> {
    await this._locator.locator('wb-part-bar wb-view-list-button').click();
    const partId = await this.getPartId();
    return new ViewListMenuPO(this._locator.page().locator(`div.cdk-overlay-pane wb-view-list[data-partid="${partId}"]`));
  }

  /**
   * Handle to the specified action of this part.
   */
  public action(locateBy: {cssClass: string}): PartActionPO {
    return new PartActionPO(this._partBarLocator.locator('wb-part-action-bar').locator(`li.e2e-part-action.${locateBy.cssClass}`));
  }

  /**
   * Returns the ids of the views contained in this part in the order as displayed in the tab bar.
   */
  public async getViewIds(locateBy?: {cssClass?: string}): Promise<string[]> {
    const viewTabsLocator = locateBy?.cssClass ? this._locator.locator(`wb-view-tab.${locateBy.cssClass}`) : this._locator.locator('wb-view-tab');
    await waitUntilStable(() => viewTabsLocator.count());

    const viewIds = [];
    for (let i = 0; i < await viewTabsLocator.count(); i++) {
      viewIds.push((await viewTabsLocator.nth(i).getAttribute('data-viewid'))!);
    }
    return viewIds;
  }

  /**
   * Indicates if this part is contained in the main area.
   */
  public isInMainArea(): Promise<boolean> {
    return isPresent(this._locator.page().locator('wb-main-area-layout[data-partid="main-area"]', {has: this._locator}));
  }

  /**
   * Returns whether the tab bar is displaying.
   * The tab bar is displayed when this part contains at least one view or action.
   */
  public async isPartBarPresent(): Promise<boolean> {
    return isPresent(this._partBarLocator);
  }

  /**
   * Returns the bounding box of the part bar.
   */
  public async getPartBarBoundingBox(): Promise<DomRect> {
    return fromRect(await this._partBarLocator.boundingBox());
  }

  /**
   * Closes all views of this part.
   */
  public async closeViewTabs(): Promise<void> {
    await this._partBarLocator.locator('wb-view-tab').first().press('Control+Alt+Shift+K');
  }

  public locator(selector: string): Locator {
    return this._locator.locator(selector);
  }
}
