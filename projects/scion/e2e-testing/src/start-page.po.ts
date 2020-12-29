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
import { AppPO, ViewPO, ViewTabPO } from './app.po';
import { WebdriverExecutionContexts } from './helper/webdriver-execution-context';
import { Arrays } from '@scion/toolkit/util';

/**
 * Page object to interact {@link StartPageComponent}.
 */
export class StartPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;
  private _tabbarFinder: ElementFinder;
  private _tabbarPO: SciTabbarPO;

  public readonly viewPO?: ViewPO;
  public readonly viewTabPO?: ViewTabPO;

  constructor(public viewId?: string | undefined) {
    if (viewId) {
      this.viewPO = this._appPO.findView({viewId: viewId});
      this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
      this._pageFinder = this._appPO.findView({viewId}).$('app-start-page');
    }
    else {
      this._pageFinder = this._appPO.findActivePart().$('app-start-page');
    }
    this._tabbarFinder = this._pageFinder.$('sci-tabbar');
    this._tabbarPO = new SciTabbarPO(this._tabbarFinder);
  }

  /**
   * Clicks the workbench view tile with specified CSS class set.
   */
  public async openWorkbenchView(viewCssClass: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await this._tabbarPO.selectTab('e2e-workbench-views');
    await this._tabbarFinder.$(`.e2e-workbench-view-tiles a.${viewCssClass}`).click();
  }

  /**
   * Clicks the microfrontend view tile with specified CSS classes set.
   */
  public async openMicrofrontendView(...viewCssClass: string[]): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await this._tabbarPO.selectTab('e2e-microfrontend-views');
    await this._tabbarFinder.$(`.e2e-microfrontend-view-tiles a.${Arrays.coerce(viewCssClass).join('.')}`).click();
  }

  public async isPresent(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isPresent();
  }
}
