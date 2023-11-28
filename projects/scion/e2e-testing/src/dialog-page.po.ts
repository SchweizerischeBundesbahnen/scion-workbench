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
import {WorkbenchDialogSize} from '@scion/workbench';

/**
 * Page object to interact with {@link DialogPageComponent}.
 */
export class DialogPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;
  private readonly _title: Locator;
  private readonly _closeButton: Locator;
  private readonly _closeWithErrorButton: Locator;
  private readonly _dialogSizeAccordion: SciAccordionPO;
  private readonly _contentSizeAccordion: SciAccordionPO;
  private readonly _behaviorAccordion: SciAccordionPO;
  private readonly _stylesAccordion: SciAccordionPO;
  private readonly _returnValueAccordion: SciAccordionPO;

  constructor(dialog: DialogPO) {
    this.locator = dialog.locator.locator('app-dialog-page');
    this.input = this.locator.locator('input.e2e-input');
    this._title = this.locator.locator('input.e2e-title');
    this._dialogSizeAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-dialog-size'));
    this._contentSizeAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-content-size'));
    this._behaviorAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-behavior'));
    this._stylesAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-styles'));
    this._returnValueAccordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    this._closeButton = this.locator.locator('button.e2e-close');
    this._closeWithErrorButton = this.locator.locator('button.e2e-close-with-error');
  }

  public getComponentInstanceId(): Promise<string> {
    return this.locator.locator('input.e2e-component-instance-id').inputValue();
  }

  public async enterTitle(title: string): Promise<void> {
    await this._title.fill(title);
  }

  public async setClosable(closable: boolean): Promise<void> {
    await this._behaviorAccordion.expand();
    await new SciCheckboxPO(this._behaviorAccordion.itemLocator().locator('sci-checkbox.e2e-closable')).toggle(closable);
    await this._behaviorAccordion.collapse();
  }

  public async setResizable(resizable: boolean): Promise<void> {
    await this._behaviorAccordion.expand();
    await new SciCheckboxPO(this._behaviorAccordion.itemLocator().locator('sci-checkbox.e2e-resizable')).toggle(resizable);
    await this._behaviorAccordion.collapse();
  }

  public async enterDialogSize(size: WorkbenchDialogSize): Promise<void> {
    await this._dialogSizeAccordion.expand();
    await this._dialogSizeAccordion.itemLocator().locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await this._dialogSizeAccordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    await this._dialogSizeAccordion.itemLocator().locator('input.e2e-max-height').fill(size.maxHeight ?? '');
    await this._dialogSizeAccordion.itemLocator().locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await this._dialogSizeAccordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
    await this._dialogSizeAccordion.itemLocator().locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await this._dialogSizeAccordion.collapse();
  }

  public async enterContentSize(size: {width?: string; height?: string}): Promise<void> {
    await this._contentSizeAccordion.expand();
    await this._contentSizeAccordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    await this._contentSizeAccordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
    await this._contentSizeAccordion.collapse();
  }

  public async setPadding(padding: string): Promise<void> {
    await this._stylesAccordion.expand();
    await this._stylesAccordion.itemLocator().locator('input.e2e-padding').fill(padding);
    await this._stylesAccordion.collapse();
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
    await this._returnValueAccordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);
    await this._returnValueAccordion.collapse();
  }
}
