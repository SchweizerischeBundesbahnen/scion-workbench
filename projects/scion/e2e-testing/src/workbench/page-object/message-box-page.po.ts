/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MessageBoxPO} from '../../message-box.po';
import {Locator} from '@playwright/test';
import {WorkbenchMessageBoxPagePO} from './workbench-message-box-page.po';
import {ActivatedMicrofrontendPO} from './activated-microfrontend.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';

/**
 * Page object to interact with {@link MessageBoxPageComponent}.
 */
export class MessageBoxPagePO implements WorkbenchMessageBoxPagePO {

  public readonly locator: Locator;
  public readonly activatedMicrofrontend: ActivatedMicrofrontendPO;
  public readonly input: Locator;

  constructor(public messageBox: MessageBoxPO) {
    this.locator = messageBox.locator.locator('app-message-box-page');
    this.activatedMicrofrontend = new ActivatedMicrofrontendPO(this.locator.locator('app-activated-microfrontend'));
    this.input = this.locator.locator('input.e2e-input');
  }

  public getComponentInstanceId(): Promise<string> {
    return this.locator.locator('input.e2e-component-instance-id').inputValue();
  }

  public async enterContentSize(size: {width?: string; height?: string}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-content-size'));
    await accordion.expand();
    try {
      await accordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
      await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    }
    finally {
      await accordion.collapse();
    }
  }

}
