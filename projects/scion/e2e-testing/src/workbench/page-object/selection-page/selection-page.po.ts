/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ViewPO} from '../../../view.po';
import {Locator} from '@playwright/test';
import {SciTabbarPO} from '../../../@scion/components.internal/tabbar.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {SelectionProviderPO} from './selection-provider.po';
import {SelectionListenerPO} from './selection-listener.po';
import {PartPO} from '../../../part.po';

/**
 * Page object to interact with {@link SelectionPageComponent}.
 */
export class SelectionPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;

  public readonly selectionProvider: SelectionProviderPO;
  private readonly _selectionListener: SelectionListenerPO;
  private readonly _tabbar: SciTabbarPO;

  constructor(private _locateBy: ViewPO | PartPO) {
    this.locator = _locateBy.locator.locator('app-selection-page');
    this.selectionProvider = new SelectionProviderPO(this.locator.locator('app-selection-provider-page'));
    this._selectionListener = new SelectionListenerPO(this.locator.locator('app-selection-listener-page'));
    this._tabbar = new SciTabbarPO(this.locator.locator('sci-tabbar'));
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  public get part(): PartPO {
    if (this._locateBy instanceof PartPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a part.');
    }
  }

  public async setSelection(selection: {[type: string]: unknown[]}): Promise<void> {
    await this._tabbar.selectTab('e2e-provide-selection');
    await this.selectionProvider.setSelection(selection);
  }

  public async getSelection(): Promise<{[type: string]: unknown[]}> {
    await this._tabbar.selectTab('e2e-observe-selection');
    return this._selectionListener.getSelection();
  }

  public async subscribe(): Promise<void> {
    await this._tabbar.selectTab('e2e-observe-selection');
    await this._selectionListener.subscribe();
  }

  public async unsubscribe(): Promise<void> {
    await this._tabbar.selectTab('e2e-observe-selection');
    await this._selectionListener.unsubscribe();
  }
}
