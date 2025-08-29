/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {eMESSAGE_BOX_MESSAGE_PARAM, WorkbenchMessageBox} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {Translatable} from '../../../text/workbench-text-provider.model';
import {TextPipe} from '../../../text/text.pipe';
import {createRemoteTranslatable} from '../../text/remote-text-provider';

/**
 * Displays the text message for the built-in message box capability.
 *
 * This component is designed to be displayed in {@link MicrofrontendHostMessageBoxComponent}.
 */
@Component({
  selector: 'wb-text-message',
  styleUrls: ['./text-message.component.scss'],
  templateUrl: './text-message.component.html',
  imports: [
    TextPipe,
  ],
})
export default class TextMessageComponent {

  protected message: Translatable | undefined;

  constructor() {
    const messageBox = inject(WorkbenchMessageBox);
    const translatable = messageBox.params.get(eMESSAGE_BOX_MESSAGE_PARAM) as Translatable | undefined;
    this.message = createRemoteTranslatable(translatable, {appSymbolicName: messageBox.referrer.appSymbolicName});
  }
}

/**
 * Route for the built-in text message box capability provided by the workbench host application.
 */
export const TEXT_MESSAGE_BOX_CAPABILITY_ROUTE = '~/messagebox';
/**
 * Property to identify the built-in text message box capability.
 */
export const TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY = 'ɵidentity';
/**
 * Value to identify the built-in text message box capability.
 */
export const TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY = UUID.randomUUID();
