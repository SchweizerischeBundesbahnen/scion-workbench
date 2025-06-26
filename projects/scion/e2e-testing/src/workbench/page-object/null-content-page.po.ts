/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
import {AppPO} from '../../app.po';
import {ViewId} from '@scion/workbench';

/**
 * Page object to interact with {@link NullContentComponent}.
 */
export class NullContentPagePO implements WorkbenchViewPagePO {

  public static readonly selector = 'wb-null-content';

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.view.locator.locator('wb-null-content');
  }
}
