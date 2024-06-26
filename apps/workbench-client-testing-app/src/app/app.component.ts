/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Inject, Optional} from '@angular/core';
import {APP_IDENTITY, FocusMonitor, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {AsyncPipe} from '@angular/common';
import {SciViewportComponent} from '@scion/components/viewport';
import {RouterOutlet} from '@angular/router';
import {A11yModule} from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    A11yModule,
    SciViewportComponent,
  ],
})
export class AppComponent {

  public readonly focusMonitor = inject(FocusMonitor, {optional: true}); // only available if running in the workbench context
  public readonly workbenchContextActive = MicrofrontendPlatformClient.isConnected();

  public appSymbolicName: string;

  constructor(@Inject(APP_IDENTITY) @Optional() symbolicName: string) { // only available if running in the workbench context
    this.appSymbolicName = symbolicName;
  }
}
