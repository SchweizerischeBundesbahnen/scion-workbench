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
import {SciTabbarPO} from '../../@scion/components.internal/tabbar.po';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewId} from '@scion/workbench-client';

/**
 * Page object to interact with {@link MessagingPageComponent}.
 */
export class MessagingPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  private readonly _tabbar: SciTabbarPO;

  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-messaging-page');
    this._tabbar = new SciTabbarPO(this.locator.locator('sci-tabbar.e2e-messaging'));
  }

  public async publishMessage(topic: string): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-publish-message');

    const locator = this.locator.locator('app-publish-message-page');
    await locator.locator('input.e2e-topic').fill(topic);
    await locator.locator('button.e2e-publish').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const successLocator = locator.locator('output.e2e-publish-success');
    const errorLocator = locator.locator('output.e2e-publish-error');
    await Promise.race([
      waitUntilAttached(successLocator),
      rejectWhenAttached(errorLocator),
    ]);
  }
}
