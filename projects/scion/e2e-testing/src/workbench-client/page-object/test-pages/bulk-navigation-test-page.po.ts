/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {coerceArray, waitUntilStable} from '../../../helper/testing.util';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {AppPO} from '../../../app.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';
import {WorkbenchNavigationExtras} from '@scion/workbench-client';

export class BulkNavigationTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  private readonly _appPO: AppPO;

  constructor(public view: ViewPO) {
    this.outlet = new SciRouterOutletPO(view.locator.page(), {name: view.locateBy?.id, cssClass: view.locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-bulk-navigation-test-page');
    this._appPO = new AppPO(this.locator.page());
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   */
  public async clickNavigateNoAwait(qualifier: Qualifier, extras: NavigationExtras): Promise<void> {
    await this.enterQualifier(qualifier);
    await this.enterNavigationCount(extras.count);
    await this.enterTarget(extras.target);
    await this.enterCssClass(extras.cssClass);

    await this.locator.locator('button.e2e-navigate').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  /**
   * Clicks on a button to navigate via {@link WorkbenchRouter}.
   */
  public async clickNavigateAwait(qualifier: Qualifier, extras: NavigationExtras): Promise<void> {
    await this.enterQualifier(qualifier);
    await this.enterNavigationCount(extras.count);
    await this.enterTarget(extras.target);
    await this.enterCssClass(extras.cssClass);

    await this.locator.locator('button.e2e-navigate-await').click();
    // Wait for the URL to become stable after navigating.
    await waitUntilStable(() => this._appPO.getCurrentNavigationId());
  }

  private async enterQualifier(qualifier: Qualifier): Promise<void> {
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();
    await qualifierField.addEntries(qualifier);
  }

  private async enterNavigationCount(navigationCount: number): Promise<void> {
    await this.locator.locator('input.e2e-navigation-count').fill(`${navigationCount}`);
  }

  private async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this.locator.locator('input.e2e-target').fill(target ?? '');
  }

  private async enterCssClass(cssClass?: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }
}

export type NavigationExtras = Pick<WorkbenchNavigationExtras, 'target' | 'cssClass'> & {
  count: number;
};
