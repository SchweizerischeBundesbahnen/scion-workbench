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
import {signal, Signal} from '@angular/core';
import {WorkbenchNotificationCapability} from '@scion/workbench-client';
import {WorkbenchNotification} from '@scion/workbench';

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
  }

  private setNotificationProperties(): void {
    const properties = this.capability().properties;
  }
}
