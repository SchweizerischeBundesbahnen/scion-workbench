/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NotificationService} from './notification.service';
import {NotificationComponent} from './notification.component';
import {AsyncPipe, NgClass} from '@angular/common';
import {NotificationCssClassesPipe} from './notification-css-classes.pipe';

/**
 * Displays notifications on the right side.  Multiple notifications are stacked vertically.
 */
@Component({
  selector: 'wb-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    NgClass,
    NotificationComponent,
    NotificationCssClassesPipe,
  ],
})
export class NotificationListComponent {

  protected readonly notifications$ = inject(NotificationService).notifications$;
}
