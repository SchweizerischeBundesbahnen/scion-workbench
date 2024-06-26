/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciKeyValuePO} from './@scion/components.internal/key-value.po';
import {Data, Params} from '@angular/router';
import {ViewState} from '@scion/workbench';

/**
 * Handle for interacting with a workbench desktop.
 */
export class DesktopPO {

  constructor(public readonly locator: Locator) {
  }

  public async getInfo(): Promise<DesktopInfo> {
    const routeParams = this.locator.locator('sci-key-value.e2e-route-params');
    const routeData = this.locator.locator('sci-key-value.e2e-route-data');
    const state = this.locator.locator('sci-key-value.e2e-state');

    return {
      urlSegments: await this.locator.locator('span.e2e-url-segments').innerText(),
      navigationHint: await this.locator.locator('span.e2e-navigation-hint').innerText(),
      routeParams: await routeParams.isVisible() ? await new SciKeyValuePO(routeParams).readEntries() : {},
      routeData: await routeData.isVisible() ? await new SciKeyValuePO(routeData).readEntries() : {},
      state: await state.isVisible() ? await new SciKeyValuePO(state).readEntries() : {},
    };
  }
}

export interface DesktopInfo {
  urlSegments: string;
  navigationHint: string;
  routeParams: Params;
  routeData: Data;
  state: ViewState;
}
