/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {Locator} from '@playwright/test';
import {PartPO} from '../../part.po';
import {NavigationData, NavigationState, PartId, Translatable} from '@scion/workbench';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {coerceArray} from '../../helper/testing.util';
import {Params} from '@angular/router';

/**
 * Page object to interact with {@link PartPageComponent}.
 */
export class PartPagePO {

  public static readonly selector = 'app-part-page';

  public readonly locator: Locator;
  public readonly part: PartPO;

  constructor(appPO: AppPO, locateBy: {partId?: PartId; cssClass?: string}) {
    this.part = appPO.part({partId: locateBy.partId, cssClass: locateBy.cssClass});
    this.locator = this.part.locator.locator(PartPagePO.selector);
  }

  public getComponentInstanceId(): Promise<string> {
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

  public async getRouteData(): Promise<Record<string, string>> {
    if (await this.locator.locator('sci-accordion.e2e-route-data').isHidden()) {
      return {};
    }
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-data'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-data')).readEntries();
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

  public async getNavigationState(): Promise<NavigationState> {
    if (await this.locator.locator('sci-accordion.e2e-navigation-state').isHidden()) {
      return {};
    }
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-navigation-state'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-navigation-state')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterTitle(title: Translatable | undefined): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title ?? '<undefined>');
  }

  public async enterCssClass(cssClass: string | string[]): Promise<void> {
    await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(cssClass).join(' '));
  }

  public async registerPartActions(partAction: WorkbenchPartActionDescriptor | WorkbenchPartActionDescriptor[]): Promise<void> {
    await this.locator.locator('input.e2e-part-actions').fill(JSON.stringify(coerceArray(partAction)));
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align?: 'start' | 'end';
  cssClass: string;
}
