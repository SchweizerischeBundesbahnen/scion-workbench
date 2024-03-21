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
import {Commands, ReferencePart, ViewId} from '@scion/workbench';
import {SciTabbarPO} from '../../../@scion/components.internal/tabbar.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {NavigateViewPagePO} from './navigate-view-page.po';
import {ViewState} from '../../../../../workbench/src/lib/routing/routing.model';
import {AddPartPagePO} from './add-part-page.po';
import {AddViewPagePO} from './add-view-page.po';
import {ActivateViewPagePO} from './activate-view-page.po';
import {RegisterPartActionPagePO} from './register-part-action-page.po';

/**
 * Page object to interact with {@link LayoutPageComponent}.
 */
export class LayoutPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  private readonly _tabbar: SciTabbarPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-layout-page');
    this._tabbar = new SciTabbarPO(this.locator.locator('sci-tabbar'));
  }

  public async addPart(partId: string, relativeTo: ReferencePart, options?: {activate?: boolean}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-add-part');

    const testPage = new AddPartPagePO(this.locator.locator('app-add-part-page'));
    return testPage.addPart(partId, relativeTo, options);
  }

  public async addView(viewId: string, options: {partId: string; position?: number; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-add-view');

    const testPage = new AddViewPagePO(this.locator.locator('app-add-view-page'));
    return testPage.addView(viewId, options);
  }

  public async navigateView(viewId: string, commands: Commands, extras?: {outlet?: string; state?: ViewState; cssClass?: string | string[]}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-navigate-view');

    const testPage = new NavigateViewPagePO(this.locator.locator('app-navigate-view-page'));
    return testPage.navigateView(viewId, commands, extras);
  }

  public async activateView(viewId: string, options?: {activatePart?: boolean}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-activate-view');

    const testPage = new ActivateViewPagePO(this.locator.locator('app-activate-view-page'));
    return testPage.activateView(viewId, options);
  }

  public async registerPartAction(content: string, options?: {align?: 'start' | 'end'; viewId?: string | string[]; partId?: string | string[]; grid?: 'workbench' | 'mainArea'; cssClass?: string | string[]}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-register-part-action');

    const testPage = new RegisterPartActionPagePO(this.locator.locator('app-register-part-action-page'));
    return testPage.registerPartAction(content, options);
  }
}
