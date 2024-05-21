/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciTabbarComponent, SciTabDirective} from '@scion/components.internal/tabbar';
import RegisterCapabilityPageComponent from './register-capability-page/register-capability-page.component';
import {PublishMesagePageComponent} from './publish-message-page/publish-message-page.component';
import {RegisterIntentionPageComponent} from './register-intention-page/register-intention-page.component';
import {UnregisterCapabilityPageComponent} from './unregister-capability-page/unregister-capability-page.component';

@Component({
  selector: 'app-microfrontend-platform-page',
  templateUrl: './microfrontend-platform-page.component.html',
  styleUrls: ['./microfrontend-platform-page.component.scss'],
  standalone: true,
  imports: [
    SciTabDirective,
    SciTabbarComponent,
    PublishMesagePageComponent,
    RegisterCapabilityPageComponent,
    RegisterIntentionPageComponent,
    UnregisterCapabilityPageComponent,
  ],
})
export default class MicrofrontendPlatformPageComponent {
}
