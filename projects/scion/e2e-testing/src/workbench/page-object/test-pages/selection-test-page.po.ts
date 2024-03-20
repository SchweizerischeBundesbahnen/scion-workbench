/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {ViewPO} from '../../../view.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {ViewId} from '@scion/workbench';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';

export class SelectionTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewIdInput: Locator;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-selection-test-page');
    this.viewIdInput = this.locator.locator('input.e2e-view-id');
  }

  public async setSelection(viewId: ViewId, selection: {[type: string]: unknown[]}): Promise<void> {
    await this.view.tab.click();
    await this.viewIdInput.fill(viewId);
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-selection'));
    await keyValueField.clear();
    selection = Object.entries(selection).reduce((acc, [type, elements]) => {
      return {
        ...acc,
        [type]: elements.join(' '),
      };
    }, {});
    await keyValueField.addEntries(selection);

    await this.locator.locator('button.e2e-set-selection').click();
  }
}
