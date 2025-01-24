/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {Params} from '@angular/router';
import {ViewId, WorkbenchViewCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';

/**
 * Page object to interact with {@link ViewPageComponent} of workbench-client testing app.
 */
export class ViewPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly viewId: Locator;
  public readonly partId: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly path: Locator;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {name: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-view-page');
    this.viewId = this.locator.locator('span.e2e-view-id');
    this.partId = this.locator.locator('span.e2e-part-id');
    this.path = this.locator.locator('span.e2e-path');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getAppInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-app-instance-id').innerText();
  }

  public async getViewCapability(): Promise<WorkbenchViewCapability> {
    const capabilityAccordionLocator = this.locator.locator('sci-accordion.e2e-view-capability');
    const accordion = new SciAccordionPO(capabilityAccordionLocator);
    await accordion.expand();
    try {
      return JSON.parse(await this.locator.locator('div.e2e-view-capability').innerText());
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getViewParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-view-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-view-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
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

  public async getRouteQueryParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-query-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-fragment'));
    await accordion.expand();
    try {
      return this.locator.locator('span.e2e-route-fragment').innerText();
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

  public async markDirty(dirty?: boolean): Promise<void> {
    switch (dirty) {
      case true: {
        await this.locator.locator('button.e2e-mark-dirty').click();
        break;
      }
      case false: {
        await this.locator.locator('button.e2e-mark-pristine').click();
        break;
      }
      default: {
        await this.locator.locator('button.e2e-mark-dirty-noarg').click();
        break;
      }
    }
  }

  public async checkClosable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async checkConfirmClosing(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-confirm-closing')).toggle(check);
  }

  /** @deprecated since version 1.0.0-beta.28. No longer needed with the removal of class-based {@link CanClose} guard. */
  public async checkUseClassBasedCanCloseGuard(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-class-based-can-close-guard')).toggle(check);
  }

  public async clickClose(): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-view-methods'));
    await accordion.expand();
    await this.locator.locator('button.e2e-close').click();
    // do not close the accordion as this action removes the iframe from the DOM.
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public async navigateSelf(params: Params, options?: {paramsHandling?: 'merge' | 'replace'; navigatePerParam?: boolean}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-self-navigation'));
    await accordion.expand();
    try {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-accordion.e2e-self-navigation').locator('sci-key-value-field.e2e-params'));
      await keyValueField.clear();
      await keyValueField.addEntries(params);
      await this.locator.locator('sci-accordion.e2e-self-navigation').locator('select.e2e-param-handling').selectOption(options?.paramsHandling || '');
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-navigate-per-param')).toggle(options?.navigatePerParam ?? false);
      await this.locator.locator('sci-accordion.e2e-self-navigation').locator('button.e2e-navigate-self').click();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async sendKeys(key: string): Promise<void> {
    await this.locator.locator('input.e2e-title').press(key);
  }
}
