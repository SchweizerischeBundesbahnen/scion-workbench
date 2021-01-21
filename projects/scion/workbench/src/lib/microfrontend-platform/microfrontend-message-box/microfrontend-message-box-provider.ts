/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Provider, Type } from '@angular/core';
import { Qualifier } from '@scion/microfrontend-platform';
import { TextMessageComponent } from '../../message-box/text-message.component';

/**
 * Allows for the convenient contribution of a message box capability to control the presentation of a message in a message box,
 * such as displaying structured content or providing out-of-the-box message templates. The use of a qualifier distinguishes
 * different message box providers.
 *
 * The following steps are performed:
 * - Registration of a message box capability
 * - Subscription to message box intents
 * - Opening a message box when a fulfilling intent is received
 *
 * The following example illustrates how to provide a custom message box.
 *
 * ```typescript
 * @Injectable()
 * export class ConfirmDeletionMessageBoxProvider implements MicrofrontendMessageBoxProvider {
 *   qualifier = {alert: 'confirm-deletion'};
 *   component = ConfirmDeletionComponent; // Component used to display the message
 *   optionalParams = ['items'];
 *   description = 'Prompts the user to confirm the deletion of the selected items.';
 * }
 *
 * export function provideConfirmDeletionMessageBox(): Provider[] {
 *   return [
 *     {
 *       provide: MicrofrontendMessageBoxProvider, // DI token for the contribution of custom providers
 *       useClass: ConfirmDeletionMessageBoxProvider,
 *       multi: true,
 *     },
 *   ];
 * }
 * ```
 *
 * In the `app.module`, register the provider as following:
 *
 * ```typescript
 * @NgModule({
 *   ...
 *   providers: [
 *     provideConfirmDeletionMessageBox(),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * In the custom message box component, you can inject the message box handle {@link MessageBox} to read passed
 * input. It is a {Map}, which, under the key `$implicit`, contains the content to be displayed, along with requested
 * params and information about the issuing intent, such as qualifier and message headers. See {MessageHeaders} for
 * available message headers.
 *
 * @Component({...})
 * export class ConfirmDeletionComponent {
 *
 *   constructor(messageBox: MessageBox) {
 *     const input: Map<string, any> = messageBox.input;
 *     const items = input.get('items');
 *   }
 * }
 */
@Injectable()
export abstract class MicrofrontendMessageBoxProvider {
  /**
   * Qualifier to identify this message box capability.
   */
  public abstract readonly qualifier: Qualifier;
  /**
   * A short description to explain this capability.
   */
  public abstract readonly description: string;
  /**
   * Component for displaying the message.
   *
   * In component, you can inject the message box handle {@link MessageBox} to read passed input.
   * It is a {Map}, which, under the key `$implicit`, contains the content to be displayed, along with requested
   * params and information about the issuing intent, such as qualifier and message headers. See {MessageHeaders} for
   * available message headers.
   */
  public abstract readonly component: Type<any>;
  /**
   * Parameters that the caller must pass when opening the message box.
   */
  public abstract readonly requiredParams?: string[];
  /**
   * Parameters that the caller can optionally pass when opening the message box.
   */
  public abstract readonly optionalParams?: string[];
}

/**
 * Built-in message box provider for the display of a plain text message.
 */
@Injectable()
class ɵMicrofrontendMessageBoxProvider implements MicrofrontendMessageBoxProvider { // tslint:disable-line:class-name
  public readonly qualifier = {};
  public readonly component = TextMessageComponent;
  public readonly description = 'Allows displaying a text message to the user.';
}

/**
 * Provides the built-in provider for microfrontends to display a plain text message.
 */
export function provideDefaultMessageBox(): Provider[] {
  return [
    {
      provide: MicrofrontendMessageBoxProvider,
      useClass: ɵMicrofrontendMessageBoxProvider,
      multi: true,
    },
  ];
}
