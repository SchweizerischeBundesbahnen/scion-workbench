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
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {DialogPO} from '../../../dialog.po';
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';

export class DialogPropertiesTestPagePO implements MicrofrontendDialogPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  constructor(public dialog: DialogPO) {
    this.outlet = new SciRouterOutletPO(new AppPO(dialog.locator.page()), {locator: dialog.locator.locator('sci-router-outlet')});
    this.locator = this.outlet.frameLocator.locator('app-dialog-properties-test-page');
  }

  public async installTitleObservable1(): Promise<void> {
    await this.locator.locator('section.e2e-title-observable-1').locator('button.e2e-install-observable').click();
  }

  public async installTitleObservable2(): Promise<void> {
    await this.locator.locator('section.e2e-title-observable-2').locator('button.e2e-install-observable').click();
  }

  public async emitTitle1(text: string): Promise<void> {
    await this.locator.locator('section.e2e-title-observable-1').locator('input.e2e-title').fill(text);
    await this.locator.locator('section.e2e-title-observable-1').locator('button.e2e-emit-title').click();
  }

  public async emitTitle2(text: string): Promise<void> {
    await this.locator.locator('section.e2e-title-observable-2').locator('input.e2e-title').fill(text);
    await this.locator.locator('section.e2e-title-observable-2').locator('button.e2e-emit-title').click();
  }
}
