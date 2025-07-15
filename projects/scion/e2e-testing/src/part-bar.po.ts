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
import {ViewTabBarPO} from './view-tab-bar.po';

/**
 * Handle for interacting with the workbench part bar.
 */
export class PartBarPO {

  public readonly viewTabBar: ViewTabBarPO;
  public readonly viewListButton: Locator;
  public readonly minimizeButton: Locator;
  public readonly title: Locator;
  public readonly filler: Locator;

  constructor(public locator: Locator, public part: PartPO) {
    this.viewTabBar = new ViewTabBarPO(this.locator.locator('wb-view-tab-bar'));
    this.viewListButton = this.locator.locator('wb-view-list-button');
    this.minimizeButton = this.locator.locator(':scope > button.e2e-minimize');
    this.title = this.locator.locator(':scope > span.e2e-title');
    this.filler = this.locator.locator(':scope > div.e2e-filler');
  }

  /**
   * Opens the view list menu.
   */
  public async openViewListMenu(): Promise<ViewListMenuPO> {
    await this.viewListButton.click();
    return new ViewListMenuPO(this.locator.page().locator(`div.cdk-overlay-pane wb-view-list[data-partid="${await this.part.getPartId()}"]`));
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

  /**
   * Gets the handle to the specified part action.
   */
  public action(locateBy: {cssClass: string}): PartActionPO {
    return new PartActionPO(this.locator.locator(`wb-part-action.${locateBy.cssClass}`));
  }

  /**
   * Gets the bounding box of this part bar.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }
}
