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
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {DialogPO} from '../../dialog.po';
import {WorkbenchDialogPagePO} from './workbench-dialog-page.po';
import {Translatable} from '@scion/workbench';
import {DomRect, fromRect} from '../../helper/testing.util';
import {ActivatedMicrofrontendPO} from './activated-microfrontend.po';

/**
 * Page object to interact with {@link DialogPageComponent}.
 */
export class DialogPagePO implements WorkbenchDialogPagePO {

  public readonly locator: Locator;
  public readonly activatedMicrofrontend: ActivatedMicrofrontendPO;
  public readonly input: Locator;

  constructor(public dialog: DialogPO) {
    this.locator = this.dialog.locator.locator('app-dialog-page');
    this.activatedMicrofrontend = new ActivatedMicrofrontendPO(this.locator.locator('app-activated-microfrontend'));
    this.input = this.locator.locator('input.e2e-input');
  }

  public getComponentInstanceId(): Promise<string> {
    return this.locator.locator('input.e2e-component-instance-id').inputValue();
  }

  public async enterTitle(title: Translatable): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async setClosable(closable: boolean): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-behavior'));
    await accordion.expand();
    await new SciCheckboxPO(accordion.itemLocator().locator('sci-checkbox.e2e-closable')).toggle(closable);
    await accordion.collapse();
  }

  public async setResizable(resizable: boolean): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-behavior'));
    await accordion.expand();
    await new SciCheckboxPO(accordion.itemLocator().locator('sci-checkbox.e2e-resizable')).toggle(resizable);
    await accordion.collapse();
  }

  public async enterDialogSize(size: WorkbenchDialogSize): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-dialog-size'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    await accordion.itemLocator().locator('input.e2e-max-height').fill(size.maxHeight ?? '');
    await accordion.itemLocator().locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await accordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
    await accordion.itemLocator().locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await accordion.collapse();
  }

  public async enterContentSize(size: {width?: string; height?: string}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-content-size'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    await accordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
    await accordion.collapse();
  }

  public async setPadding(padding: boolean): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-styles'));
    await accordion.expand();
    await new SciCheckboxPO(accordion.itemLocator().locator('sci-checkbox.e2e-padding')).toggle(padding);
    await accordion.collapse();
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

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  private async enterReturnValue(returnValue: string): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    await accordion.expand();
    await accordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);
    await accordion.collapse();
  }
}

export interface WorkbenchDialogSize {
  height?: string;
  width?: string;
  minHeight?: string;
  maxHeight?: string;
  minWidth?: string;
  maxWidth?: string;
}
