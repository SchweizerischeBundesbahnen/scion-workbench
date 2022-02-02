/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, Inject, Optional} from '@angular/core';
import {APP_IDENTITY, MicrofrontendPlatform, PlatformPropertyService} from '@scion/microfrontend-platform';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  public readonly workbenchContextActive = MicrofrontendPlatform.isConnectedToHost();

  @HostBinding('attr.data-app-symbolic-name')
  public appSymbolicName: string;

  @HostBinding('style.--app-color')
  public appColor: string;

  constructor(@Inject(APP_IDENTITY) @Optional() symbolicName: string, // not available if not running in the workbench context
              @Optional() propertyService: PlatformPropertyService) { // not available if not running in the workbench context
    this.appSymbolicName = symbolicName;
    this.appColor = propertyService?.get<any>(symbolicName).color;
  }
}
