/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertElementVisible, coerceArray, isPresent} from '../../helper/testing.util';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {Locator} from '@playwright/test';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {SciPropertyPO} from '../../components.internal/property.po';
import {Params} from '@angular/router';

/**
 * Page object to interact {@link ViewPageComponent}.
 */
export class ViewPagePO {

  private readonly _locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewPO = appPO.findView({viewId: viewId});
    this.viewTabPO = appPO.findViewTab({viewId: viewId});
    this._locator = this.viewPO.locator('app-view-page');
  }

  public async isPresent(): Promise<boolean> {
    return await this.viewTabPO.isPresent() && await isPresent(this._locator);
  }

  public async getViewId(): Promise<string> {
    await assertElementVisible(this._locator);
    return this._locator.locator('span.e2e-view-id').innerText();
  }

  public async getComponentInstanceId(): Promise<string> {
    await assertElementVisible(this._locator);
    return this._locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getRouteParams(): Promise<Params> {
    await assertElementVisible(this._locator);

    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-route-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._locator.locator('sci-property.e2e-route-params')).readProperties();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterTitle(title: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-title').fill(title);
  }

  public async enterHeading(heading: string): Promise<void> {
    await assertElementVisible(this._locator);
    await this._locator.locator('input.e2e-heading').fill(heading);
  }

  public async checkDirty(check: boolean): Promise<void> {
    await assertElementVisible(this._locator);
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-dirty')).toggle(check);
  }

  public async checkClosable(check: boolean): Promise<void> {
    await assertElementVisible(this._locator);
    await new SciCheckboxPO(this._locator.locator('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async clickClose(): Promise<void> {
    await assertElementVisible(this._locator);

    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-view-actions'));
    await accordionPO.expand();
    await this._locator.locator('button.e2e-close').click();
  }

  public async addViewAction(viewpartAction: ViewpartAction, options?: {append?: boolean}): Promise<void> {
    await assertElementVisible(this._locator);

    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-viewpart-actions'));
    await accordionPO.expand();
    try {
      const inputLocator = this._locator.locator('input.e2e-viewpart-actions');
      if (options?.append ?? true) {
        const input = await inputLocator.inputValue() || null;
        const presentActions: ViewpartAction[] = coerceArray(input ? JSON.parse(input) : null);
        await inputLocator.fill(JSON.stringify(presentActions.concat(viewpartAction)));
      }
      else {
        await inputLocator.fill(JSON.stringify(new Array<ViewpartAction>().concat(viewpartAction)));
      }
    }
    finally {
      await accordionPO.collapse();
    }
  }
}

export interface ViewpartAction {
  icon: string;
  align?: 'start' | 'end';
  cssClass?: string;
}
