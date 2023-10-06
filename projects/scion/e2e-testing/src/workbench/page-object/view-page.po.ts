/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, isPresent} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {ViewTabPO} from '../../view-tab.po';
import {Locator} from '@playwright/test';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Params} from '@angular/router';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';

/**
 * Page object to interact with {@link ViewPageComponent}.
 */
export class ViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewTab: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.view = appPO.view({viewId});
    this.viewTab = appPO.view({viewId}).viewTab;
    this.locator = this.view.locate('app-view-page');
  }

  public async isPresent(): Promise<boolean> {
    return await this.viewTab.isPresent() && await isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return await this.view.isVisible() && await this.locator.isVisible();
  }

  public async getViewId(): Promise<string> {
    return this.locator.locator('span.e2e-view-id').innerText();
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getRouteParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterTitle(title: string): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async enterHeading(heading: string): Promise<void> {
    await this.locator.locator('input.e2e-heading').fill(heading);
  }

  public async checkDirty(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-dirty')).toggle(check);
  }

  public async checkClosable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async clickClose(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-view-actions'));
    await accordion.expand();
    await this.locator.locator('button.e2e-close').click();
  }

  public async addViewAction(partAction: WorkbenchPartActionDescriptor, options?: {append?: boolean}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-part-actions'));
    await accordion.expand();
    try {
      const inputLocator = this.locator.locator('input.e2e-part-actions');
      if (options?.append ?? true) {
        const input = await inputLocator.inputValue() || null;
        const presentActions: WorkbenchPartActionDescriptor[] = coerceArray(input ? JSON.parse(input) : null);
        await inputLocator.fill(JSON.stringify(presentActions.concat(partAction)));
      }
      else {
        await inputLocator.fill(JSON.stringify(new Array<WorkbenchPartActionDescriptor>().concat(partAction)));
      }
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterFreeText(text: string): Promise<void> {
    await this.locator.locator('input.e2e-free-text').fill(text);
  }

  public getFreeText(): Promise<string> {
    return this.locator.locator('input.e2e-free-text').inputValue();
  }
}

export interface WorkbenchPartActionDescriptor {
  content: string;
  align?: 'start' | 'end';
  cssClass?: string;
}
