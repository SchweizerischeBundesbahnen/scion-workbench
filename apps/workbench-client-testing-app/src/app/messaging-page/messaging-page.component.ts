/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {SciTabbarComponent, SciTabDirective} from '@scion/components.internal/tabbar';
import {WorkbenchView} from '@scion/workbench-client';
import {PublishMessagePageComponent} from './publish-message-page/publish-message-page.component';
import {PublishIntentPageComponent} from './publish-intent-page/publish-intent-page.component';

@Component({
  selector: 'app-messaging-page',
  templateUrl: './messaging-page.component.html',
  styleUrls: ['./messaging-page.component.scss'],
  imports: [
    SciTabDirective,
    SciTabbarComponent,
    PublishMessagePageComponent,
    PublishIntentPageComponent,
  ],
})
export default class MessagingPageComponent {

  constructor() {
    inject(WorkbenchView).signalReady();
  }
}
