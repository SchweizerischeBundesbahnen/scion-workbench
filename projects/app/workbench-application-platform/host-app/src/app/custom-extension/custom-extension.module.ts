/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListMessageboxComponent } from './list-messagebox/list-messagebox.component';
import { ACTIVITY_ACTION_PROVIDER, INTENT_HANDLER, MessageBoxIntentHandler, NotificationIntentHandler } from '@scion/workbench-application-platform';
import { ListNotificationComponent } from './list-notification/list-notification.component';
import { CustomNotifyActivityActionComponent } from './custom-notify-activity-action/custom-notify-activity-action.component';
import { CustomNotifyActivityActionProvider } from './custom-notify-activity-action/custom-notify-activity-action-provider.service';

@NgModule({
  declarations: [
    ListMessageboxComponent,
    ListNotificationComponent,
    CustomNotifyActivityActionComponent,
  ],
  imports: [
    CommonModule,
  ],
  entryComponents: [
    ListMessageboxComponent,
    ListNotificationComponent,
    CustomNotifyActivityActionComponent,
  ],
  providers: [
    {
      provide: INTENT_HANDLER,
      useFactory: provideListMessageBoxIntentHandler,
      multi: true,
    },
    {
      provide: INTENT_HANDLER,
      useFactory: provideListNotificationIntentHandler,
      multi: true,
    },
    {
      provide: ACTIVITY_ACTION_PROVIDER,
      useClass: CustomNotifyActivityActionProvider,
      multi: true
    },
  ],
})
export class CustomExtensionModule {
}

export function provideListMessageBoxIntentHandler(): MessageBoxIntentHandler {
  return new MessageBoxIntentHandler({'type': 'list'}, 'Displays a messagebox with list content to the user.', ListMessageboxComponent);
}

export function provideListNotificationIntentHandler(): NotificationIntentHandler {
  return new NotificationIntentHandler({'type': 'list'}, 'Shows a notification with list content to the user.', ListNotificationComponent);
}
