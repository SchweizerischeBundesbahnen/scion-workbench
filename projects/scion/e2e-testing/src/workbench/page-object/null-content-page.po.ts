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
import {PartPO} from '../../part.po';

/**
 * Page object to interact with {@link NullContentComponent}.
 */
export class NullContentPagePO implements WorkbenchViewPagePO {

  public static readonly selector = 'wb-null-content';

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(locateBy: PartPO | ViewPO) {
    this.locator = locateBy.locator.locator('wb-null-content');
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
  }
}
