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
import { TextNotificationComponent } from '../../notification/text-notification.component';

/**
 * Allows for the convenient contribution of a notification capability to control the presentation of a notification,
 * such as displaying structured content or providing out-of-the-box notification templates. The use of a qualifier
 * distinguishes different notification providers.
 *
 * The following steps are performed:
 * - Registration of a notification capability
 * - Subscription to notification intents
 * - Displaying a notification when a fulfilling intent is received
 *
 * The following example illustrates how to provide a custom notification.
 *
 * ```typescript
 * @Injectable()
 * class TaskCompletionNotificationProvider implements MicrofrontendNotificationProvider {
 *   qualifier = {alert: 'task-completion'};
 *   component = TaskCompletionNotificationComponent; // Component used to display the notification
 *   requiredParams = ['task'];
 *   description = 'Informs the user that a task has been completed.';
 * }
 *
 * export function provideTaskCompletionNotification(): Provider[] {
 *   return [
 *     {
 *       provide: MicrofrontendNotificationProvider, // DI token for the contribution of custom providers
 *       useClass: TaskCompletionNotificationProvider,
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
 *     provideTaskCompletionNotification(),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * In the custom notification component, you can inject the notification handle {@link Notification} to read passed
 * input. It is a {Map}, which, under the key `$implicit`, contains the content to be displayed, along with requested
 * params and information about the issuing intent, such as qualifier and message headers. See {MessageHeaders} for
 * available message headers.
 *
 * @Component({...})
 * export class TaskCompletionNotificationComponent {
 *
 *   constructor(notification: Notification) {
 *     const input: Map<string, any> = notification.input;
 *     const task = input.get('task');
 *   }
 * }
 */
@Injectable()
export abstract class MicrofrontendNotificationProvider {
  /**
   * Qualifier to identify this notification capability.
   */
  public abstract readonly qualifier: Qualifier;
  /**
   * A short description to explain this capability.
   */
  public abstract readonly description: string;
  /**
   * Component for displaying the notification.
   *
   * In the component, you can inject the notification handle {@link Notification} to read passed input.
   * It is a {Map}, which, under the key `$implicit`, contains the content to be displayed, along with requested
   * params and information about the issuing intent, such as qualifier and message headers. See {MessageHeaders} for
   * available message headers.
   */
  public abstract readonly component: Type<any>;
  /**
   * Parameters that the caller must pass when displaying the notification.
   */
  public abstract readonly requiredParams?: string[];
  /**
   * Parameters that the caller can optionally pass when displaying the notification.
   */
  public abstract readonly optionalParams?: string[];
  /**
   * Specifies the group which this notification belongs to.
   * If specified, a notification will replace any previously displayed notification of the same group.
   */
  public abstract readonly group?: string;
  /**
   * Use in combination with {@link group} to reduce the input to be passed to a notification.
   *
   * Note that the reducer function, if specified, is only invoked for notifications that belong to a group.
   * If no reducer is specified, the input of the notification is passed as is.
   *
   * Each time when to display a notification that belongs to a group and if there is already present a
   * notification of that group, the reduce function is called with the input of that present notification
   * and the input of the new notification, allowing for the aggregation of the input values.
   */
  public groupInputReduceFn?: (prevInput: Map<string, any>, currInput: Map<string, any>) => Map<string, any>;
}

/**
 * Built-in notification provider for the display of a plain text notification.
 */
@Injectable()
class ɵMicrofrontendNotificationProvider implements MicrofrontendNotificationProvider { // tslint:disable-line:class-name
  public readonly qualifier = {};
  public readonly component = TextNotificationComponent;
  public readonly description = 'Allows displaying a text notification to the user.';
}

/**
 * Provides the built-in provider for microfrontends to display a plain text notification.
 */
export function provideDefaultNotification(): Provider[] {
  return [
    {
      provide: MicrofrontendNotificationProvider,
      useClass: ɵMicrofrontendNotificationProvider,
      multi: true,
    },
  ];
}
