/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';
import {commandsToPath} from '../../../helper/testing.util';

export class AngularRouterTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly location: Locator;

  constructor(public view: ViewPO) {
    this.outlet = new SciRouterOutletPO(view.locator.page(), {name: view.locateBy?.id, cssClass: view.locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-angular-router-test-page');
    this.location = this.locator.locator('span.e2e-location');
  }

  public async navigate(commands: unknown[], extras?: {queryParams?: {[key: string]: unknown}}): Promise<void> {
    await this.locator.locator('input.e2e-commands').fill(commandsToPath(commands));

    if (extras?.queryParams) {
      const queryParamsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-query-params'));
      await queryParamsField.clear();
      await queryParamsField.addEntries(extras.queryParams);
    }

    await this.locator.locator('button.e2e-navigate').click();
  }
}
