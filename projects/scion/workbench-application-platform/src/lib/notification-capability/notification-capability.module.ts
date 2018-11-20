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
import { CoreModule } from '../core/core.module';
import { WorkbenchModule } from '@scion/workbench';
import { NotificationIntentHandler } from './notification-intent-handler.service';
import { INTENT_HANDLER } from '../core/metadata';
import { NilQualifier } from '@scion/workbench-application-platform.api';

/**
 * Built-in capability to show a notification.
 */
@NgModule({
  imports: [
    CoreModule,
    WorkbenchModule.forChild(),
  ],
  providers: [
    {
      provide: INTENT_HANDLER,
      useFactory: provideDefaultNotificationIntentHandler,
      multi: true,
    },
  ],
})
export class NotificationCapabilityModule {
}

export function provideDefaultNotificationIntentHandler(): NotificationIntentHandler {
  return new NotificationIntentHandler(NilQualifier, 'Shows a notification to the user.');
}
