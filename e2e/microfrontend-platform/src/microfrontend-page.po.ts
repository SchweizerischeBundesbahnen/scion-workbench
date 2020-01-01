/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $ } from 'protractor';
import { SwitchToIframeFn } from './browser-outlet.po';
import { getInputValue } from './spec.util';
import { SciPropertyPO } from '@scion/ɵtoolkit/widgets.po';

export abstract class MicrofrontendPagePO {

  private _pageFinder = $('app-microfrontend');

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async getAppInstanceId(): Promise<string> {
    await this._switchToIframeFn();
    return getInputValue(this._pageFinder.$('input.e2e-app-instance-id'));
  }

  public async getComponentInstanceId(): Promise<string> {
    await this._switchToIframeFn();
    return getInputValue(this._pageFinder.$('input.e2e-component-instance-id'));
  }

  public async getMatrixParams(): Promise<Map<string, string>> {
    await this._switchToIframeFn();
    return new SciPropertyPO(this._pageFinder.$('sci-property.e2e-matrix-params')).readAsMap();
  }

  public async getQueryParams(): Promise<Map<string, string>> {
    await this._switchToIframeFn();
    return new SciPropertyPO(this._pageFinder.$('sci-property.e2e-query-params')).readAsMap();
  }

  public async getFragment(): Promise<string> {
    await this._switchToIframeFn();
    return getInputValue(this._pageFinder.$('input.e2e-fragment'));
  }
}
