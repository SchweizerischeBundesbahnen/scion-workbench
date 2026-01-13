/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {DialogPO} from '../../../dialog.po';
import {ViewPO} from '../../../view.po';

export class TextTestPagePO implements WorkbenchDialogPagePO, WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;

  constructor(locateBy: ViewPO | DialogPO) {
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.locator = locateBy.locator.locator('app-text-test-page');
  }

  public async provideText(key: string, text: string | '<undefined>'): Promise<void> {
    await this.locator.locator('section.e2e-provide-text input.e2e-key').fill(key);
    await this.locator.locator('section.e2e-provide-text input.e2e-text').fill(text);
    await this.locator.locator('section.e2e-provide-text button.e2e-save').click();
  }

  public async provideValue(key: string, value: string | '<undefined>'): Promise<void> {
    await this.locator.locator('section.e2e-provide-value input.e2e-key').fill(key);
    await this.locator.locator('section.e2e-provide-value input.e2e-value').fill(value);
    await this.locator.locator('section.e2e-provide-value button.e2e-save').click();
  }
}
