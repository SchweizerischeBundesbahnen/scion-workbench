/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ViewPO} from '../../view.po';
import {Locator} from '@playwright/test';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {PartPO} from '../../part.po';

/**
 * Page object to interact with {@link PageNotFoundComponent}.
 */
export class PageNotFoundPagePO implements WorkbenchViewPagePO {

  public static readonly selector = 'wb-page-not-found';
  public readonly locator: Locator;

  constructor(private _locateBy: ViewPO | PartPO) {
    this.locator = _locateBy.locator.locator('wb-page-not-found');
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }
}
