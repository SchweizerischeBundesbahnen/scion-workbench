/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciAccordionPO} from './@scion/components.internal/accordion.po';
import {SciCheckboxPO} from './@scion/components.internal/checkbox.po';
import {DialogPO} from './dialog.po';

/**
 * Page object to interact with {@link DialogPageComponent}.
 */
export class DialogPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;
  private readonly _title: Locator;
  private readonly _closeButton: Locator;
  private readonly _closeWithErrorButton: Locator;
  private readonly _sizeAccordion: SciAccordionPO;
  private readonly _miscellaneousAccordion: SciAccordionPO;
  private readonly _returnValueAccordion: SciAccordionPO;

  constructor(dialog: DialogPO) {
    this.locator = dialog.locator.locator('app-dialog-page');
    this.input = this.locator.locator('input.e2e-input');
    this._title = this.locator.locator('input.e2e-title');
    this._sizeAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-size'));
    this._miscellaneousAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-miscellaneous'));
    this._returnValueAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    this._closeButton = this.locator.locator('button.e2e-close');
    this._closeWithErrorButton = this.locator.locator('button.e2e-close-with-error');
  }

  public async getComponentInstanceId(): Promise<string> {
    await this._miscellaneousAccordion.expand();
    try {
      return await this._miscellaneousAccordion.itemLocator().locator('input.e2e-component-instance-id').inputValue();
    }
    finally {
      await this._miscellaneousAccordion.collapse();
    }
  }

  public async enterTitle(title: string): Promise<void> {
    await this._title.fill(title);
  }

  public async setClosable(closable: boolean): Promise<void> {
    await this._miscellaneousAccordion.expand();
    try {
      await new SciCheckboxPO(this._miscellaneousAccordion.itemLocator().locator('sci-checkbox.e2e-closable')).toggle(closable);
    }
    finally {
      await this._miscellaneousAccordion.collapse();
    }
  }

  public async close(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError) {
      await this._closeWithErrorButton.click();
    }
    else {
      await this._closeButton.click();
    }
  }

  private async enterReturnValue(returnValue: string): Promise<void> {
    await this._returnValueAccordion.expand();
    try {
      await this._returnValueAccordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);
    }
    finally {
      await this._returnValueAccordion.collapse();
    }
  }
}
