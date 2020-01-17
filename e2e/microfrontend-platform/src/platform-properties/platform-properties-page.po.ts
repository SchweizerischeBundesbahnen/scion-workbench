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
import { SwitchToIframeFn } from '../browser-outlet/browser-outlet.po';
import { SciPropertyPO } from '@scion/ɵtoolkit/widgets.po';

export class PlatformPropertiesPagePO {

  public static readonly pageUrl = 'platform-properties'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-platform-properties');

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async getPlatformProperties(): Promise<Map<string, any>> {
    await this._switchToIframeFn();
    return new SciPropertyPO(this._pageFinder.$('sci-property.e2e-properties')).readAsMap();
  }
}
