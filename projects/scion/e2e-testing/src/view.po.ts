/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect, getCssClasses, isPresent} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewTabPO} from './view-tab.po';

/**
 * Handle for interacting with a workbench view.
 */
export class ViewPO {

  /**
   * Handle to the tab of the view in the tab bar.
   */
  public readonly viewTab: ViewTabPO;

  constructor(public readonly locator: Locator, viewTab: ViewTabPO) {
    this.viewTab = viewTab;
  }

  public async getViewId(): Promise<string> {
    return this.viewTab.getViewId();
  }

  /**
   * Handle to the part in which this view is contained.
   */
  public get part(): PartPO {
    return this.viewTab.part;
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  public async isActive(): Promise<boolean> {
    return await isPresent(this.locator) && await this.viewTab.isActive();
  }

  public waitUntilAttached(): Promise<void> {
    return this.locator.waitFor({state: 'attached'});
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  /**
   * Indicates if this view is contained in the main area.
   */
  public isInMainArea(): Promise<boolean> {
    return isPresent(this.locator.page().locator('wb-main-area-layout[data-partid="main-area"]', {has: this.locator}));
  }

  public locate(selector: string): Locator {
    return this.locator.locator(selector);
  }
}
