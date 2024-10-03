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
import {NavigationData} from '@scion/workbench';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';

/**
 * Page object to interact with {@link DesktopPageComponent}.
 */
export class DesktopPagePO implements WorkbenchDesktopPagePO {

  public readonly locator: Locator;
  public readonly desktop: DesktopPO;

  constructor(appPO: AppPO, locateBy: {cssClass: string}) {
    this.desktop = appPO.desktop({cssClass: locateBy.cssClass});
    this.locator = this.desktop.locator.locator('app-desktop-page');
  }

  public async getNavigationData(): Promise<NavigationData> {
    if (await this.locator.locator('sci-accordion.e2e-navigation-data').isHidden()) {
      return {};
    }
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-navigation-data'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-navigation-data')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public getPath(): Promise<string> {
    return this.locator.locator('span.e2e-url-segments').innerText();
  }

  public getNavigationHint(): Promise<string> {
    return this.locator.locator('span.e2e-navigation-hint').innerText();
  }
}

