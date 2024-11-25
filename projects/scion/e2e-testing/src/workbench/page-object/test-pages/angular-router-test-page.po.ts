/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {Commands, ViewId} from '@scion/workbench';
import {commandsToPath, rejectWhenAttached} from '../../../helper/testing.util';

export class AngularRouterTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-angular-router-test-page');
  }

  public async navigate(commands: Commands, extras: {outlet: string}): Promise<void> {
    await this.locator.locator('input.e2e-commands').fill(commandsToPath(commands));
    await this.locator.locator('input.e2e-outlet').fill(extras.outlet);

    const navigationId = await this._appPO.getCurrentNavigationId();
    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      this._appPO.waitForLayoutChange({navigationId}),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }
}
