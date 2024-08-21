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
import {ViewPO} from '../../view.po';
import {ViewId} from '@scion/workbench';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact with a workbench view, which has not been navigated.
 */
export class BlankViewPagePO implements WorkbenchViewPagePO {

  public readonly view: ViewPO;
  public readonly locator: Locator;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('wb-blank');
  }
}
