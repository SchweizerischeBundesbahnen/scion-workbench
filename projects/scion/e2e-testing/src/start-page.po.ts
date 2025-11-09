/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from './app.po';
import {ViewPO} from './view.po';
import {Locator} from '@playwright/test';
import {SciTabbarPO} from './@scion/components.internal/tabbar.po';
import {SciRouterOutletPO} from './workbench-client/page-object/sci-router-outlet.po';
import {WorkbenchViewPagePO} from './workbench/page-object/workbench-view-page.po';
import {PartId, ViewId} from '@scion/workbench';

/**
 * Page object to interact with {@link StartPageComponent}.
 */
export class StartPagePO implements WorkbenchViewPagePO {

  private readonly _tabbarLocator: Locator;
  private readonly _tabbar: SciTabbarPO;
  private readonly _view?: ViewPO;

  public readonly locator: Locator;

  constructor(private _appPO: AppPO, locateBy?: {viewId?: ViewId; cssClass?: string}) {
    if (locateBy?.viewId || locateBy?.cssClass) {
      this._view = this._appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
      this.locator = this._view.locator.locator('app-start-page');
    }
    else {
      this.locator = this._appPO.workbenchRoot.locator('app-start-page');
    }
    this._tabbarLocator = this.locator.locator('sci-tabbar');
    this._tabbar = new SciTabbarPO(this._tabbarLocator);
  }

  public get view(): ViewPO {
    if (this._view) {
      return this._view;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  /**
   * Returns the part in which this page is displayed.
   */
  public async getPartId(): Promise<PartId | null> {
    return (await this.locator.getAttribute('data-partid')) as PartId | null;
  }

  /**
   * Clicks the workbench view tile with specified CSS class set.
   */
  public async openWorkbenchView(cssClass: string): Promise<void> {
    const viewId = await this.view.getViewId();
    const navigationId = await this._appPO.getCurrentNavigationId();
    await this._tabbar.selectTab('e2e-workbench-views');
    await this._tabbarLocator.locator(`.e2e-workbench-view-tiles button.${cssClass}`).click();
    await this._appPO.view({viewId, cssClass}).waitUntilAttached();
    // Wait until completed navigation.
    await this._appPO.waitForLayoutChange({navigationId});
  }

  /**
   * Clicks the microfrontend view tile with specified CSS class set.
   */
  public async openMicrofrontendView(cssClass: string, app: string): Promise<void> {
    const viewId = await this.view.getViewId();
    const navigationId = await this._appPO.getCurrentNavigationId();
    await this._tabbar.selectTab('e2e-microfrontend-views');
    await this._tabbarLocator.locator(`.e2e-microfrontend-view-tiles button.${cssClass}.workbench-client-testing-${app}`).click();
    await this._appPO.view({viewId, cssClass}).waitUntilAttached();
    // Wait for microfrontend to be loaded.
    const frameLocator = new SciRouterOutletPO(this._appPO, {name: viewId}).frameLocator;
    await frameLocator.locator('app-root').waitFor({state: 'visible'});
    // Wait until completed navigation.
    await this._appPO.waitForLayoutChange({navigationId});
  }
}
