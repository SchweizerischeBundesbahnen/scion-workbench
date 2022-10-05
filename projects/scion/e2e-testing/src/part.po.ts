/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {isPresent, waitUntilStable} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';

/**
 * Handle for interacting with a workbench part.
 */
export class PartPO {

  private readonly _partBarLocator: Locator;

  /**
   * Handle to the active view of this part.
   */
  public readonly activeView: ViewPO;

  constructor(private readonly _locator: Locator) {
    this._partBarLocator = this._locator.locator('wb-view-part-bar');
    this.activeView = new ViewPO(this._locator.locator('wb-view'), new ViewTabPO(this._locator.locator('wb-view-tab.active'), this));
  }

  public async getPartId(): Promise<string> {
    return (await this._locator.getAttribute('data-partid'))!;
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  /**
   * Handle to the specified action of this part.
   */
  public action(locateBy: {cssClass: string}): PartActionPO {
    const actionLocator = this._partBarLocator.locator(`button.${locateBy.cssClass}`);

    return new class ViewPartActionPO {
      public async isPresent(): Promise<boolean> {
        return isPresent(actionLocator);
      }

      public async click(): Promise<void> {
        return actionLocator.click();
      }
    };
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
   * Returns whether this part is displaying the default page because no view is present.
   */
  public async isDefaultPagePresent(componentSelector: string): Promise<boolean> {
    return isPresent(this._locator.locator('sci-viewport.views-absent-outlet').locator(componentSelector));
  }

  /**
   * Returns whether the tab bar is displaying.
   * The tab bar is displayed when this part contains at least one view or action.
   */
  public async isPartBarPresent(): Promise<boolean> {
    return isPresent(this._partBarLocator);
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

/**
 * Handle for interacting with a part action.
 */
export interface PartActionPO {
  isPresent(): Promise<boolean>;

  click(): Promise<void>;
}
