/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {Locator} from '@playwright/test';
import {WorkbenchPerspectiveDefinition} from '@scion/workbench';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';

/**
 * Page object to interact {@link PerspectivePageComponent}.
 */
export class PerspectivePagePO {

  private readonly _locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewPO = appPO.view({viewId});
    this.viewTabPO = this.viewPO.viewTab;
    this._locator = this.viewPO.locator('app-perspective-page');
  }

  public async registerPerspective(definition: Omit<WorkbenchPerspectiveDefinition, 'layout'>): Promise<void> {
    await this._locator.locator('input.e2e-id').fill(definition.id);
    await this.enterData(definition.data);
    await this._locator.locator('button.e2e-register').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this._locator.locator('output.e2e-register-success')),
      rejectWhenAttached(this._locator.locator('output.e2e-register-error')),
    ]);
  }

  private async enterData(data: {[key: string]: any} | undefined): Promise<void> {
    const keyValueFieldPO = new SciKeyValueFieldPO(this._locator.locator('sci-key-value-field.e2e-data'));
    await keyValueFieldPO.clear();
    await keyValueFieldPO.addEntries(data ?? {});
  }
}
