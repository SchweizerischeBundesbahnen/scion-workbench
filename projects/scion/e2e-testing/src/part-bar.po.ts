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
import {MenuPO} from './menu.po';
import {PartPO} from './part.po';
import {ViewTabBarPO} from './view-tab-bar.po';
import {ToolbarPO} from './toolbar.po';

/**
 * Handle for interacting with the workbench part bar.
 */
export class PartBarPO {

  public readonly viewTabBar: ViewTabBarPO;
  public readonly titleBar: ToolbarPO;
  public readonly tabBar: ToolbarPO;
  public readonly toolBar: ToolbarPO;
  public readonly viewListButton: Locator;
  public readonly minimizeButton: Locator;
  public readonly title: Locator;
  public readonly filler: Locator;

  constructor(public locator: Locator, public part: PartPO) {
    this.viewTabBar = new ViewTabBarPO(this.locator.locator('wb-view-tab-bar'));
    this.titleBar = new ToolbarPO(this.locator.locator('sci-toolbar[name="toolbar:workbench.part.titlebar"]'));
    this.tabBar = new ToolbarPO(this.locator.locator('sci-toolbar[name="toolbar:workbench.part.tabbar"]'));
    this.toolBar = new ToolbarPO(this.locator.locator('sci-toolbar[name="toolbar:workbench.part.toolbar"]'));
    this.viewListButton = this.locator.locator('button.e2e-view-list');
    this.minimizeButton = this.locator.locator('button.e2e-minimize');
    this.title = this.locator.locator(':scope > span.e2e-title');
    this.filler = this.locator.locator(':scope > div.e2e-filler');
  }

  /**
   * Opens the view list menu.
   */
  public async openViewListMenu(): Promise<MenuPO> {
    await this.viewListButton.click();
    return new MenuPO(this.locator.page().locator(`sci-menu.e2e-view-list`));
  }

  /**
   * Gets the number of currently hidden tabs.
   */
  public async getHiddenTabCount(): Promise<number> {
    const hiddenTabCount = this.locator.locator('span.e2e-hidden-tab-count');
    if (await hiddenTabCount.count()) {
      return Number.parseInt(await hiddenTabCount.innerText());
    }
    return 0;
  }

  /**
   * Gets the bounding box of this part bar.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }
}
