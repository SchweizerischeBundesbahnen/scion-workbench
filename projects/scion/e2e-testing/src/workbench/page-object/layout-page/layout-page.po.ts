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
import {PartId, ViewId, WorkbenchLayout} from '@scion/workbench';
import {SciTabbarPO} from '../../../@scion/components.internal/tabbar.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {RegisterPartActionPagePO} from './register-part-action-page.po';
import {ModifyLayoutPagePO} from './modify-layout-page.po';
import {CreatePerspectivePagePO, PerspectiveDefinition} from './create-perspective-page.po';

/**
 * Page object to interact with {@link LayoutPageComponent}.
 */
export class LayoutPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  private readonly _tabbar: SciTabbarPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.view.locator.locator('app-layout-page');
    this._tabbar = new SciTabbarPO(this.locator.locator('sci-tabbar'));
  }

  /**
   * Creates a perspective based on the given definition.
   *
   * @see WorkbenchService.registerPerspective
   */
  public async createPerspective(id: string, definition: PerspectiveDefinition): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-create-perspective');

    const createPerspectivePage = new CreatePerspectivePagePO(this.locator.locator('app-create-perspective-page'));
    return createPerspectivePage.createPerspective(id, definition);
  }

  /**
   * Modifies the current workbench layout.
   *
   * @see WorkbenchRouter.navigate
   */
  public async modifyLayout(fn: (layout: WorkbenchLayout) => WorkbenchLayout): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-modify-layout');

    const modifyLayoutPage = new ModifyLayoutPagePO(this.locator.locator('app-modify-layout-page'));
    return modifyLayoutPage.modify(fn);
  }

  public async registerPartAction(content: string, options?: {align?: 'start' | 'end'; viewId?: ViewId | ViewId[]; partId?: PartId | PartId[]; grid?: 'workbench' | 'mainArea'; cssClass?: string | string[]}): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-register-part-action');

    const registerPartActionPage = new RegisterPartActionPagePO(this.locator.locator('app-register-part-action-page'));
    return registerPartActionPage.registerPartAction(content, options);
  }
}
