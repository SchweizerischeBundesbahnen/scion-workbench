/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {Locator} from '@playwright/test';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Params} from '@angular/router';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {NavigationData, ViewId, ViewState} from '@scion/workbench';

/**
 * Page object to interact with {@link ViewPageComponent}.
 */
export class ViewPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewId: Locator;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-view-page');
    this.viewId = this.locator.locator('span.e2e-view-id');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getParams(): Promise<Params> {
    if (await this.locator.locator('sci-accordion.e2e-params').isHidden()) {
      return {};
    }
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getNavigationData(): Promise<NavigationData> {
    if (await this.locator.locator('sci-accordion.e2e-navigation-data').isHidden()) {
      return {};
    }
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-navigation-data'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-navigation-data')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getState(): Promise<ViewState> {
    if (await this.locator.locator('sci-accordion.e2e-state').isHidden()) {
      return {};
    }
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-state'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-state')).readEntries();
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

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  public async checkClosable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async checkConfirmClosing(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-confirm-closing')).toggle(check);
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
}

export interface WorkbenchPartActionDescriptor {
  content: string;
  align?: 'start' | 'end';
  cssClass?: string;
}
