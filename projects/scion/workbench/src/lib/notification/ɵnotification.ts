/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable} from '../text/workbench-text-provider.model';
import {Notification} from './notification';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {inject} from '@angular/core';
import {UID} from '../common/uid.util';

/**
 * @inheritDoc
 *
 * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
 */
export class ɵNotification<T = any> implements Notification<T> {

  private readonly _notification = inject(ɵWorkbenchNotification);

  public readonly input: T | undefined;

  constructor() {
    this.input = this._notification.inputs?.[LEGACY_NOTIFICATION_INPUT] as T | undefined;
  }

  /** @inheritDoc */
  public setTitle(title: Translatable | undefined): void {
    this._notification.title = title;
  }

  /** @inheritDoc */
  public setSeverity(severity: 'info' | 'warn' | 'error'): void {
    this._notification.severity = severity;
  }

  /** @inheritDoc */
  public setDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number): void {
    if (typeof duration === 'number') {
      this._notification.duration = duration * 1000;
    }
    else {
      this._notification.duration = duration;
    }
  }

  /** @inheritDoc */
  public setCssClass(cssClass: string | string[]): void {
    this._notification.cssClass = cssClass;
  }

  /** @inheritDoc */
  public close(): void {
    this._notification.close();
  }
}

/**
 * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
 */
export const LEGACY_NOTIFICATION_INPUT = `${UID.randomUID()}-auto-generated`;
