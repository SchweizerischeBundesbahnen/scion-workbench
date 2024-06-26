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
import {DesktopPO} from '../../desktop.po';
import {WorkbenchDesktopPagePO} from '../workbench-desktop.po';

/**
 * Page object to interact with {@link DesktopPageComponent}.
 */
export class DesktopPagePO implements WorkbenchDesktopPagePO {

  public readonly locator: Locator;
  public readonly desktop: DesktopPO;

  constructor(appPO: AppPO, locateBy: {cssClass?: string}) {
    this.desktop = appPO.desktop({cssClass: locateBy?.cssClass});
    this.locator = this.desktop.locator.locator('app-desktop-page');
  }
}

