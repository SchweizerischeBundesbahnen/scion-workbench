/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {NotificationListComponent} from './notification-list.component';
import {TextNotificationComponent} from './text-notification.component';
import {NotificationComponent} from './notification.component';
import {CoerceObservablePipe} from './coerce-observable.pipe';
import {NotificationCssClassesPipe} from './notification-css-classes.pipe';

/**
 * Allows displaying a notification to the user.
 *
 * A notification is a closable message that appears in the top right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 */
@NgModule({
  imports: [
    CommonModule,
    PortalModule,
  ],
  declarations: [
    NotificationListComponent,
    NotificationComponent,
    TextNotificationComponent,
    CoerceObservablePipe,
    NotificationCssClassesPipe,
  ],
  exports: [
    NotificationListComponent,
  ],
})
export class NotificationModule {
}
