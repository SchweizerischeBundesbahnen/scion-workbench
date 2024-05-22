/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {ViewPO} from '../../../view.po';
import {Locator} from '@playwright/test';
import {ViewId} from '@scion/workbench';
import {SciTabbarPO} from '../../../@scion/components.internal/tabbar.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {SelectionProviderPagePO} from './selection-provider-page.po';
import {SelectionListenerPagePO} from './selection-listener-page.po';

/**
 * Page object to interact with {@link LayoutPageComponent}.
 */
export class SelectionPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  private readonly _tabbar: SciTabbarPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-selection-page');
    this._tabbar = new SciTabbarPO(this.locator.locator('sci-tabbar'));
  }

  public async setSelection(selection: {[type: string]: unknown[]}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-provide-selection');

    const testPage = new SelectionProviderPagePO(this.locator.locator('app-selection-provider-page'));
    return testPage.setSelection(selection);
  }

  public async getSelection(): Promise<{[type: string]: unknown[]}> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-observe-selection');

    const testPage = new SelectionListenerPagePO(this.locator.locator('app-selection-listener-page'));
    return testPage.getSelection();
  }

  public async subscribe(): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-observe-selection');

    const testPage = new SelectionListenerPagePO(this.locator.locator('app-selection-listener-page'));
    return testPage.subscribe();
  }

  public async unsubscribe(): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-observe-selection');

    const testPage = new SelectionListenerPagePO(this.locator.locator('app-selection-listener-page'));
    return testPage.unsubscribe();
  }
}
