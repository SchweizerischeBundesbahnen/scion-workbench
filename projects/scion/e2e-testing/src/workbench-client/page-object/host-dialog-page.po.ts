/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Params} from '@angular/router';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {WorkbenchDialogPagePO} from '../../workbench/page-object/workbench-dialog-page.po';
import {DialogPO} from '../../dialog.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {DomRect, fromRect} from '../../helper/testing.util';
import {Translatable} from '@scion/workbench-client';

/**
 * Page object to interact with {@link HostDialogPageComponent}.
 *
 * Note that {@link HostDialogPageComponent} is not an actual microfrontend integrated via an iframe,
 * but displayed directly in the host app using an Angular router-outlet.
 */
export class HostDialogPagePO implements WorkbenchDialogPagePO {

  public readonly locator: Locator;

  constructor(public dialog: DialogPO) {
    this.locator = this.dialog.locator.locator('app-host-dialog-page');
  }

  public async enterTitle(title: Translatable): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async getDialogParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-dialog-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-dialog-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public async close(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError) {
      await new SciCheckboxPO(this.dialog.footer.locator('sci-checkbox.e2e-close-with-error')).toggle(true);
    }

    await this.dialog.footer.locator('button.e2e-close').click();
  }

  private async enterReturnValue(returnValue: string): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);
    await accordion.collapse();
  }
}
