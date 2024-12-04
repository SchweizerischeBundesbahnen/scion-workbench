/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {coerceArray, rejectWhenAttached} from '../../helper/testing.util';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewId, WorkbenchNavigationExtras} from '@scion/workbench-client';
import {Dictionary} from '@scion/toolkit/util';

/**
 * Page object to interact with {@link RouterPageComponent} of workbench-client testing app.
 */
export class RouterPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-router-page');
  }

  /**
   * Navigates via {@link WorkbenchRouter}.
   */
  public async navigate(qualifier: Qualifier, extras?: WorkbenchNavigationExtras): Promise<void> {
    await this.enterQualifier(qualifier);
    await this.enterExtras(extras);

    const navigationId = await this._appPO.getCurrentNavigationId();
    await this.locator.locator('button.e2e-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      this._appPO.waitForLayoutChange({navigationId}),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }

  private async enterQualifier(qualifier: Qualifier): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await keyValueField.clear();
    await keyValueField.addEntries(qualifier);
  }

  private async enterExtras(extras: WorkbenchNavigationExtras | undefined): Promise<void> {
    await this.enterTarget(extras?.target);
    await this.enterPartId(extras?.partId);
    await this.enterParams(extras?.params);
    await this.checkActivate(extras?.activate);
    await this.checkClose(extras?.close);
    await this.enterPosition(extras?.position);
    await this.enterCssClass(extras?.cssClass);
  }

  private async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this.locator.locator('input.e2e-target').fill(target ?? '');
  }

  private async enterPartId(partId?: string): Promise<void> {
    await this.locator.locator('input.e2e-part-id').fill(partId ?? '');
  }

  private async enterParams(params?: Map<string, any> | Dictionary): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
    await keyValueField.clear();
    await keyValueField.addEntries(params ?? {});
  }

  private async checkActivate(check?: boolean): Promise<void> {
    if (check !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate')).toggle(check);
    }
  }

  private async checkClose(check?: boolean): Promise<void> {
    if (check !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close')).toggle(check);
    }
  }

  private async enterPosition(position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'): Promise<void> {
    await this.locator.locator('input.e2e-position').fill(`${position ?? ''}`);
  }

  private async enterCssClass(cssClass?: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }
}
