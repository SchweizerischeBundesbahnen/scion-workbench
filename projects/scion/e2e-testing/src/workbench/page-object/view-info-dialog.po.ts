/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {DialogPO} from '../../dialog.po';
import {WorkbenchDialogPagePO} from './workbench-dialog-page.po';
import {NavigationData, NavigationState, ViewId} from '@scion/workbench';
import {Data, Params} from '@angular/router';

/**
 * Page object to interact with {@link ViewInfoDialogComponent}.
 */
export class ViewInfoDialogPO implements WorkbenchDialogPagePO {

  public readonly locator: Locator;

  constructor(public dialog: DialogPO) {
    this.locator = this.dialog.locator.locator('app-view-info-dialog');
  }

  public async getInfo(): Promise<ViewInfo> {
    const routeParams = this.locator.locator('sci-key-value.e2e-route-params');
    const routeData = this.locator.locator('sci-key-value.e2e-route-data');
    const navigationData = this.locator.locator('sci-key-value.e2e-navigation-data');
    const navigationState = this.locator.locator('sci-key-value.e2e-navigation-state');

    return {
      viewId: await this.locator.locator('span.e2e-view-id').innerText() as ViewId,
      alternativeId: await this.locator.locator('span.e2e-alternative-view-id').innerText(),
      partId: await this.locator.locator('span.e2e-part-id').innerText(),
      title: await this.locator.locator('span.e2e-title').innerText(),
      heading: await this.locator.locator('span.e2e-heading').innerText(),
      urlSegments: await this.locator.locator('span.e2e-url-segments').innerText(),
      navigationHint: await this.locator.locator('span.e2e-navigation-hint').innerText(),
      routeParams: await routeParams.isVisible() ? await new SciKeyValuePO(routeParams).readEntries() : {},
      routeData: await routeData.isVisible() ? await new SciKeyValuePO(routeData).readEntries() : {},
      navigationData: await navigationData.isVisible() ? await new SciKeyValuePO(navigationData).readEntries() : {},
      navigationState: await navigationState.isVisible() ? await new SciKeyValuePO(navigationState).readEntries() : {},
    };
  }
}

export interface ViewInfo {
  viewId: ViewId;
  alternativeId: string;
  partId: string;
  title: string;
  heading: string;
  urlSegments: string;
  navigationHint: string;
  routeParams: Params;
  routeData: Data;
  navigationData: NavigationData;
  navigationState: NavigationState;
}
