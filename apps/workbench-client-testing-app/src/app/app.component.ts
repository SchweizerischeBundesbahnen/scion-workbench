/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, Inject, Optional} from '@angular/core';
import {APP_IDENTITY, FocusMonitor, MicrofrontendPlatformClient, PlatformPropertyService} from '@scion/microfrontend-platform';
import {AsyncPipe, NgIf} from '@angular/common';
import {SciViewportModule} from '@scion/components/viewport';
import {RouterOutlet} from '@angular/router';
import {A11yModule} from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    RouterOutlet,
    A11yModule,
    SciViewportModule,
  ],
})
export class AppComponent {

  public readonly workbenchContextActive = MicrofrontendPlatformClient.isConnected();

  public appSymbolicName: string;

  @HostBinding('style.--app-color')
  public appColor: string;

  constructor(@Inject(APP_IDENTITY) @Optional() symbolicName: string, // not available if not running in the workbench context
              @Optional() propertyService: PlatformPropertyService,  // not available if not running in the workbench context
              @Optional() public focusMonitor: FocusMonitor) { // not available if not running in the workbench context
    this.appSymbolicName = symbolicName;
    this.appColor = propertyService?.get<any>(symbolicName).color;
  }
}
