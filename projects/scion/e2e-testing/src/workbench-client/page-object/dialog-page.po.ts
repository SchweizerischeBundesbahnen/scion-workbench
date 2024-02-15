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
import {WorkbenchDialogCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciRouterOutletPO} from './sci-router-outlet.po';

import {AppPO} from '../../app.po';
import {MicrofrontendDialogPagePO} from '../../workbench/page-object/workbench-dialog-page.po';
import {DialogPO} from '../../dialog.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {DomRect, fromRect} from '../../helper/testing.util';

/**
 * Page object to interact with {@link DialogPageComponent}.
 */
export class DialogPagePO implements MicrofrontendDialogPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  private readonly _hasFocusLocator: Locator;

  constructor(public dialog: DialogPO) {
    this.outlet = new SciRouterOutletPO(new AppPO(dialog.locator.page()), {locator: dialog.locator.locator('sci-router-outlet')});
    this.locator = this.outlet.frameLocator.locator('app-dialog-page');
    this._hasFocusLocator = this.outlet.frameLocator.locator('app-root').locator('.e2e-has-focus');
  }

  public async enterTitle(title: string): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('input.e2e-component-instance-id').innerText();
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public async getDialogCapability(): Promise<WorkbenchDialogCapability> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-dialog-capability'));
    await accordion.expand();
    try {
      return JSON.parse(await accordion.itemLocator().locator('div.e2e-dialog-capability').innerText());
    }
    finally {
      await accordion.collapse();
    }
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

  public async getRouteQueryParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-route-query-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-fragment'));
    await accordion.expand();
    try {
      return accordion.itemLocator().locator('span.e2e-route-fragment').innerText();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterComponentSize(size: {width?: string; height?: string}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-component-size'));
    await accordion.expand();
    try {
      await accordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
      await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    }
    finally {
      await accordion.collapse();
    }
  }

  public async close(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-with-error')).toggle(true);
    }

    await this.locator.locator('button.e2e-close').click();
  }

  private async enterReturnValue(returnValue: string): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);
    await accordion.collapse();
  }

  /**
   * Waits until this page gains focus.
   */
  public async waitForFocusIn(): Promise<void> {
    await this._hasFocusLocator.waitFor({state: 'visible'});
  }
}
