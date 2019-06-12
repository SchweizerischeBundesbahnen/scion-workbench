/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents severity levels.
 */
import { IntentMessage, PlatformCapabilityTypes, Severity } from './core.model';

/**
 * Intent message to display a message box.
 */
export interface MessageBoxIntentMessage extends IntentMessage {

  type: PlatformCapabilityTypes.MessageBox;
  payload: MessageBox;
}

/**
 * Represents a message box to be displayed to the user.
 */
export interface MessageBox {

  /**
   * Specifies the optional title.
   */
  title?: string;

  /**
   * Specifies the message box text.
   */
  text: string;

  /**
   * Specifies which buttons to display in the message box.
   */
  actions?: {
    [key: string]: string;
  };

  /**
   * Specifies the optional severity.
   */
  severity?: Severity;

  /**
   * Specifies the modality context created by the message box.
   *
   * By default, and if in view context, view modality is used.
   */
  modality?: 'application' | 'view';

  /**
   * Specifies if the user can select the message box text.
   */
  contentSelectable?: boolean;

  /**
   * Specifies CSS class(es) added to the <wb-message-box> element, e.g. used for e2e testing.
   */
  cssClass?: string | string[];

  /**
   * Payload available in messagebox handlers in the host application.
   */
  payload?: any;
}
