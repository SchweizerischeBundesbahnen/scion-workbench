/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PartSashPO} from './part-sash.po';
import {PartBarPO} from './part-bar.po';

/**
 * Handle for interacting with a workbench part.
 */
export class PartPO {

  /**
   * Handle for interacting with the part bar.
   */
  public readonly bar: PartBarPO;

  /**
   * Handle to the active view of this part.
   */
  public readonly activeView: ViewPO;

  /**
   * Handle to resize this part.
   */
  public readonly sash: PartSashPO;

  constructor(private readonly _locator: Locator) {
    this.bar = new PartBarPO(this._locator.locator('wb-part-bar'), this);
    this.activeView = new ViewPO(this._locator.locator('wb-view'), new ViewTabPO(this._locator.locator('wb-view-tab.active'), this));
    this.sash = new PartSashPO(this._locator);
  }

  public async getPartId(): Promise<string> {
    return (await this._locator.getAttribute('data-partid'))!;
  }

  /**
   * Indicates if this part is contained in the main area.
   */
  public async isInMainArea(): Promise<boolean> {
    const count = await this._locator.page().locator('wb-main-area-layout[data-partid="main-area"]', {has: this._locator}).count();
    return count > 0;
  }
}
