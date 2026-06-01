/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciThrobberComponent} from '@scion/components/throbber';

@Component({
  selector: 'wb-microfrontend-splash',
  templateUrl: './microfrontend-splash.component.html',
  styleUrls: ['./microfrontend-splash.component.scss'],
  imports: [SciThrobberComponent],
})
export class MicrofrontendSplashComponent {
}
