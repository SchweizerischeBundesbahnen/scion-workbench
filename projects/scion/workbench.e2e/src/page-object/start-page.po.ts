/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ElementFinder } from 'protractor';
import { SciTabbarPO } from '@scion/toolkit.internal/widgets.po';
import { AppPO } from './app.po';

/**
 * Page object to interact {@link StartPageComponent}.
 */
export class StartPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;
  private _tabbarFinder: ElementFinder;
  private _tabbarPO: SciTabbarPO;

  constructor(viewId?: string) {
    if (viewId) {
      this._pageFinder = this._appPO.findView({viewId}).$('app-start-page');
    }
    else {
      this._pageFinder = this._appPO.findActivePart().$('app-start-page');
    }
    this._tabbarFinder = this._pageFinder.$('sci-tabbar');
    this._tabbarPO = new SciTabbarPO(this._tabbarFinder);
  }

  public async openWorkbenchView(viewCssClass: string | 'e2e-test-view' | 'e2e-test-router'): Promise<void> {
    await this._tabbarPO.selectTab('e2e-workbench-views');
    await this._tabbarFinder.$(`.e2e-workbench-view-tiles a.${viewCssClass}`).click();
  }

  public async openMicrofrontendView(viewCssClass: string | 'e2e-test-view' | 'e2e-test-router'): Promise<void> {
    await this._tabbarPO.selectTab('e2e-microfrontend-views');
    await this._tabbarFinder.$(`.e2e-microfrontend-view-tiles a.${viewCssClass}`).click();
  }

  public async isPresent(): Promise<boolean> {
    return this._pageFinder.isPresent();
  }
}
