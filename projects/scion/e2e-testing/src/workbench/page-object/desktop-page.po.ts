/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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

/**
 * Page object to interact with {@link DesktopPageComponent}.
 */
export class DesktopPagePO {

  public static readonly selector = 'app-desktop-page';

  public readonly locator: Locator;
  public readonly desktop: DesktopPO;

  constructor(appPO: AppPO) {
    this.desktop = appPO.desktop;
    this.locator = this.desktop.locator.locator(DesktopPagePO.selector);
  }

  public getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }
}
