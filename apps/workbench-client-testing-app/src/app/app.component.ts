/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {FocusMonitor, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {AsyncPipe} from '@angular/common';
import {SciViewportComponent} from '@scion/components/viewport';
import {RouterOutlet} from '@angular/router';
import {A11yModule} from '@angular/cdk/a11y';
import {APP_SYMBOLIC_NAME} from './workbench-client/workbench-client.provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    AsyncPipe,
    RouterOutlet,
    A11yModule,
    SciViewportComponent,
  ],
})
export class AppComponent {

  protected readonly focusMonitor = inject(FocusMonitor, {optional: true}); // only available if running in the workbench context
  protected readonly appSymbolicName = inject(APP_SYMBOLIC_NAME, {optional: true}); // only available if running in the workbench context
  protected readonly workbenchContextActive = MicrofrontendPlatformClient.isConnected();
}
