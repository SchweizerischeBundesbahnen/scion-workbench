/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {DestroyRef, inject, signal, Signal} from '@angular/core';
import {WorkbenchNotificationCapability} from '@scion/workbench-client';
import {WorkbenchNotification} from '../../notification/workbench-notification.model';
import {Logger, LoggerNames} from '../../logging';

/** @inheritDoc */
export class MicrofrontendHostNotification implements ActivatedMicrofrontend {

  public readonly capability: Signal<WorkbenchNotificationCapability>;
  public readonly params: Signal<Map<string, unknown>>;
  public readonly referrer: Signal<string>;

  constructor(private _notification: WorkbenchNotification, capability: WorkbenchNotificationCapability, params: Map<string, unknown>, referrer: string) {
    this.capability = signal(capability).asReadonly();
    this.params = signal(params).asReadonly();
    this.referrer = signal(referrer).asReadonly();
    this.setNotificationProperties();
    this.installLifecycleLogger();
  }

  private setNotificationProperties(): void {
    const properties = this.capability().properties;
    this._notification.size.height = properties.size?.height;
    this._notification.size.minHeight = properties.size?.minHeight;
    this._notification.size.maxHeight = properties.size?.maxHeight;
  }

  private installLifecycleLogger(): void {
    const logger = inject(Logger);
    logger.debug(() => `Constructing MicrofrontendHostNotification [notificationId=${this._notification.id}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying MicrofrontendHostNotification [notificationId=${this._notification.id}]`, LoggerNames.LIFECYCLE));
  }
}
