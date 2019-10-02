/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $, browser, Key } from 'protractor';
import { checkCheckbox, selectOption } from '../util/testing.util';
import { Params } from '@angular/router';
import { SciParamsEnterPanelPO } from './sci-params-enter.po';
import { WelcomePagePO } from './welcome-page.po';
import { AppPO } from './app.po';
import { MAIN_PART_ID } from '@scion/workbench/core';

export class ViewNavigationPO {

  private _viewFinder = $('wb-view app-view-navigation');

  public async navigateTo(): Promise<void> {
    await browser.get('/');
    await new WelcomePagePO().clickTile('e2e-view-navigation');
  }

  public async activateViewTab(): Promise<void> {
    await new AppPO().findViewTab(MAIN_PART_ID, {cssClass: 'e2e-view-navigation'}).click();
  }

  public async isActiveViewTab(): Promise<boolean> {
    return new AppPO().findViewTab(MAIN_PART_ID, {cssClass: 'e2e-view-navigation'}).isActive();
  }

  public async enterPath(path: string): Promise<void> {
    await this._viewFinder.$('.e2e-path').clear();
    await this._viewFinder.$('.e2e-path').sendKeys(path);
  }

  public async enterMatrixParams(params: Params): Promise<void> {
    const paramsEnterPanelPO = new SciParamsEnterPanelPO(this._viewFinder.$('.e2e-matrix-params-panel'));
    await paramsEnterPanelPO.clear();
    await paramsEnterPanelPO.enterParams(params);
  }

  public async enterQueryParams(params: Params): Promise<void> {
    const paramsEnterPanelPO = new SciParamsEnterPanelPO(this._viewFinder.$('.e2e-query-params-panel'));
    await paramsEnterPanelPO.clear();
    await paramsEnterPanelPO.enterParams(params);
  }

  public async checkActivateIfPresent(check: boolean): Promise<void> {
    await checkCheckbox(check, this._viewFinder.$('#activateIfPresent'));
  }

  public async checkCloseIfPresent(check: boolean): Promise<void> {
    await checkCheckbox(check, this._viewFinder.$('#closeIfPresent'));
  }

  public async selectTarget(value: 'self' | 'blank'): Promise<void> {
    await selectOption(value, this._viewFinder.$('select#target'));
  }

  public async setInsertionIndex(value: number | 'start' | 'end' | undefined): Promise<void> {
    await this._viewFinder.$('input#insertionIndex').sendKeys(Key.chord(Key.CONTROL, 'a'), value);
  }

  public async navigate(): Promise<void> {
    await this._viewFinder.$('button.e2e-navigate').click();
  }
}
