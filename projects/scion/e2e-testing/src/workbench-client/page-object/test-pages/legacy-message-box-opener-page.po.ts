/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitUntilAttached} from '../../../helper/testing.util';
import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {WorkbenchMessageBoxLegacyOptions} from '@scion/workbench-client';
import {ViewPO} from '../../../view.po';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RouterPagePO} from '../router-page.po';

/**
 * Page object to interact with {@link LegacyMessageBoxOpenerPageComponent}.
 *
 * @deprecated since workbench version 17.0.0-beta.9; PO will be removed in a future release.
 */
export class LegacyMessageBoxOpenerPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly closeAction: Locator;

  constructor(private _appPO: AppPO, locateBy: {cssClass?: string}) {
    this.view = this._appPO.view({cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-legacy-message-box-opener-page');
    this.closeAction = this.locator.locator('output.e2e-close-action');
  }

  public async open(options?: WorkbenchMessageBoxLegacyOptions): Promise<void> {
    if (options?.content) {
      await this.locator.locator('input.e2e-content').fill(options.content);
    }

    if (options?.title) {
      await this.locator.locator('input.e2e-title').fill(options?.title);
    }

    if (options?.cssClass) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(options?.cssClass).join(' '));
    }

    await this.locator.locator('button.e2e-open').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    return Promise.race([
      waitUntilAttached(this._appPO.messagebox({cssClass: options?.cssClass}).locator),
      rejectWhenAttached(this.locator.locator('output.e2e-open-error')),
    ]);
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<LegacyMessageBoxOpenerPagePO> {
    // Register view capability.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {test: 'legacy-message-box-opener'},
      properties: {
        path: 'test-pages/legacy-message-box-opener-page',
        cssClass: 'legacy-message-box-opener',
        title: 'Legacy Message Box Opener',
        pinToDesktop: true,
      },
    });

    // Navigate to view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({test: 'legacy-message-box-opener'}, {
      cssClass: 'legacy-message-box-opener',
    });
    return new LegacyMessageBoxOpenerPagePO(appPO, {cssClass: 'legacy-message-box-opener'});
  }
}
