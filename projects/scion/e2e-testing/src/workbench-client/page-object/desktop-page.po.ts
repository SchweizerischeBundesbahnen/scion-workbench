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
import {Params} from '@angular/router';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendDesktopPagePO} from '../../workbench/workbench-desktop.po';
import {DesktopPO} from '../../desktop.po';

/**
 * Page object to interact with {@link DesktopPageComponent} of workbench-client testing app.
 */
export class DesktopPagePO implements MicrofrontendDesktopPagePO {

  public readonly locator: Locator;
  public readonly desktop: DesktopPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly path: Locator;

  constructor(appPO: AppPO, locateBy: {cssClass: string}) {
    this.desktop = appPO.desktop({cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-desktop-page');
    this.path = this.locator.locator('span.e2e-path');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getAppInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-app-instance-id').innerText();
  }

  public async getRouteParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }
}
