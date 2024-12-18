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
import {WorkbenchPartPagePO} from './workbench-part-page.po';
import {PartPO} from '../../part.po';
import {PartId} from '@scion/workbench';

/**
 * Page object to interact with {@link PartPageComponent}.
 */
export class PartPagePO implements WorkbenchPartPagePO {

  public readonly locator: Locator;
  public readonly part: PartPO;

  constructor(appPO: AppPO, locateBy: {partId?: PartId; cssClass?: string}) {
    this.part = appPO.part({partId: locateBy?.partId, cssClass: locateBy?.cssClass});
    this.locator = this.part.locator.locator('app-part-page');
  }
}
