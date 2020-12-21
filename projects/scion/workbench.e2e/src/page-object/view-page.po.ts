/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { enterText, getInputValue } from '../util/testing.util';
import { Params } from '@angular/router';
import { AppPO, ViewPO, ViewTabPO } from './app.po';
import { SciCheckboxPO, SciPropertyPO } from '@scion/toolkit.internal/widgets.po';
import { Arrays } from '@scion/toolkit/util';
import { ElementFinder } from 'protractor';

/**
 * Page object to interact {@link ViewPageComponent}.
 */
export class ViewPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = this.viewPO.$('app-view-page');
  }

  public async getViewId(): Promise<string> {
    return this._pageFinder.$('span.e2e-view-id').getText();
  }

  public async getPartId(): Promise<string> {
    return this._pageFinder.$('span.e2e-part-id').getText();
  }

  public async getComponentInstanceId(): Promise<string> {
    return this._pageFinder.$('span.e2e-component-instance-id').getText();
  }

  public async getRouteParams(): Promise<Params> {
    return new SciPropertyPO(this._pageFinder.$('sci-property.e2e-route-params')).readAsDictionary();
  }

  public async getRouteQueryParams(): Promise<Params> {
    return new SciPropertyPO(this._pageFinder.$('sci-property.e2e-route-query-params')).readAsDictionary();
  }

  public async getTitle(): Promise<string> {
    return getInputValue(this._pageFinder.$('input.e2e-title'));
  }

  public async enterTitle(title: string): Promise<void> {
    await enterText(title, this._pageFinder.$('input.e2e-title'));
  }

  public async getHeading(): Promise<string> {
    return getInputValue(this._pageFinder.$('input.e2e-heading'));
  }

  public async enterHeading(heading: string): Promise<void> {
    await enterText(heading, this._pageFinder.$('input.e2e-heading'));
  }

  public async isDirty(): Promise<boolean> {
    return new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-dirty')).isChecked();
  }

  public async checkDirty(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-dirty')).toggle(check);
  }

  public async isClosable(): Promise<boolean> {
    return new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-closable')).isChecked();
  }

  public async checkClosable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async isBlocked(): Promise<boolean> {
    return new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-blocked')).isChecked();
  }

  public async checkBlocked(check: boolean): Promise<void> {
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-blocked')).toggle(check);
  }

  public async activeLog(): Promise<string[]> {
    const log: string = await getInputValue(this._pageFinder.$('textarea.e2e-view-active-log'));
    return log.split('\n');
  }

  public async clickClose(): Promise<void> {
    await this._pageFinder.$('button.e2e-close').click();
  }

  public async addViewAction(viewpartAction: ViewpartAction): Promise<void> {
    const inputFinder = this._pageFinder.$('input.e2e-viewpart-actions');
    const actions: ViewpartAction[] = Arrays.coerce(JSON.parse(await getInputValue(inputFinder) || null)).concat(viewpartAction);
    await enterText(JSON.stringify(actions), inputFinder, 'setValue');
  }

  public async clearViewActions(): Promise<void> {
    await enterText('', this._pageFinder.$('input.e2e-viewpart-actions'), 'setValue');
  }

  /**
   * Opens the page to test the workbench view in a new view tab.
   */
  public static async openInNewTab(): Promise<ViewPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openWorkbenchView('e2e-test-view');
    const viewId = await appPO.findActiveView().getViewId();
    return new ViewPagePO(viewId);
  }
}

export interface ViewpartAction {
  icon: string;
  align?: 'start' | 'end';
  cssClass?: string;
}
