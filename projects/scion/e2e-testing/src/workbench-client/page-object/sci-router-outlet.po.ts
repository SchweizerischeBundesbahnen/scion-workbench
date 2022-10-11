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
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';

/**
 * Page object to interact with {@link SciRouterOutletElement}.
 */
export class SciRouterOutletPO {

  private readonly _locator: Locator;

  constructor(appPO: AppPO, outletName: string) {
    this._locator = appPO.page.locator(ElementSelectors.routerOutlet({outletName}));
  }

  public getCapabilityId(): Promise<string | null> {
    return this._locator.getAttribute('data-capabilityid');
  }

  public getAppSymbolicName(): Promise<string | null> {
    return this._locator.getAttribute('data-app');
  }
}
