/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {eNOTIFICATION_MESSAGE_PARAM} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {Translatable} from '../../../text/workbench-text-provider.model';
import {TextPipe} from '../../../text/text.pipe';
import {createRemoteTranslatable} from '../../microfrontend-text/remote-text-provider';
import {ActivatedMicrofrontend} from '../../microfrontend-host/microfrontend-host.model';

/**
 * Displays the notification for the built-in notification capability.
 *
 * This component is designed to be displayed in {@link MicrofrontendHostComponent}.
 */
@Component({
  selector: 'wb-notification-text-message',
  styleUrls: ['./notification-text-message.component.scss'],
  templateUrl: './notification-text-message.component.html',
  imports: [
    TextPipe,
  ],
  host: {
    '[class.empty]': '!message?.length',
  },
})
export default class NotificationTextMessageComponent {

  protected message: Translatable | undefined;

  constructor() {
    const {params, referrer} = inject(ActivatedMicrofrontend);
    const translatable = params().get(eNOTIFICATION_MESSAGE_PARAM) as Translatable | undefined;
    this.message = createRemoteTranslatable(translatable, {appSymbolicName: referrer()});
  }
}

/**
 * Property to identify the built-in text notification capability.
 */
export const TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY = 'ɵidentity';
/**
 * Value to identify the built-in text notification capability.
 */
export const TEXT_NOTIFICATION_CAPABILITY_IDENTITY = UUID.randomUUID();
