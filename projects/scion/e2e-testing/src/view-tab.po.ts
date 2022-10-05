/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {getCssClasses, isPresent} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {PartPO} from './part.po';

/**
 * Handle for interacting with a workbench view tab.
 */
export class ViewTabPO {

  /**
   * Handle to the part in which this view tab is contained.
   */
  public readonly part: PartPO;

  constructor(private readonly _locator: Locator, part: PartPO) {
    this.part = part;
  }

  public async getViewId(): Promise<string> {
    return (await this._locator.getAttribute('data-viewid'))!;
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async click(): Promise<void> {
    await this._locator.click();
  }

  public async close(): Promise<void> {
    await this._locator.hover();
    await this._locator.locator('.e2e-close').click();
  }

  public async getTitle(): Promise<string> {
    return this._locator.locator('.e2e-title').innerText();
  }

  public async getHeading(): Promise<string> {
    return this._locator.locator('.e2e-heading').innerText();
  }

  public async isDirty(): Promise<boolean> {
    return (await this.getCssClasses()).includes('dirty');
  }

  public isClosable(): Promise<boolean> {
    return this._locator.locator('.e2e-close').isVisible();
  }

  public async isActive(): Promise<boolean> {
    return (await this.getCssClasses()).includes('active');
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this._locator);
  }

  public async openContextMenu(): Promise<ViewTabContextMenuPO> {
    await this._locator.click({button: 'right'});
    const contextMenuLocator = this._locator.page().locator('wb-view-menu');

    return new class implements ViewTabContextMenuPO {
      public async closeAllTabs(): Promise<void> {
        return contextMenuLocator.locator('.e2e-close-all-tabs').click();
      }
    };
  }
}

export interface ViewTabContextMenuPO {
  closeAllTabs(): Promise<void>;
}
