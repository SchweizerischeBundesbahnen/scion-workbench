/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {SciTabbarPO} from '../../@scion/components.internal/tabbar.po';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {rejectWhenAttached} from '../../helper/testing.util';

/**
 * Page object to interact with {@link MessagingPageComponent}.
 */
export class MessagingPagePO {

  private readonly _locator: Locator;
  private readonly _tabbarPO: SciTabbarPO;

  public readonly view: ViewPO;
  public readonly viewTab: ViewTabPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.view = appPO.view({viewId});
    this.viewTab = this.view.viewTab;
    this.outlet = new SciRouterOutletPO(appPO, {name: viewId});
    this._locator = this.outlet.frameLocator.locator('app-messaging-page');
    this._tabbarPO = new SciTabbarPO(this._locator.locator('sci-tabbar.e2e-messaging'));
  }

  public async publishMessage(topic: string): Promise<void> {
    await this.view.viewTab.click();
    await this._tabbarPO.selectTab('e2e-publish-message');

    const locator = this._locator.locator('app-publish-message-page');
    await locator.locator('input.e2e-topic').fill(topic);
    await locator.locator('button.e2e-publish').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const successLocator = locator.locator('output.e2e-publish-success');
    const errorLocator = locator.locator('output.e2e-publish-error');
    await Promise.race([
      successLocator.waitFor({state: 'attached'}),
      rejectWhenAttached(errorLocator),
    ]);
  }
}
