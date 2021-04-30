/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Arrays } from '@scion/toolkit/util';
import { Notification } from './notification';
import { NotificationConfig } from './notification.config';
import { TextNotificationComponent } from './text-notification.component';

export class ɵNotification<T = any> implements Notification<T> { // tslint:disable-line:class-name

  public readonly input: T;
  public readonly title$: BehaviorSubject<string | undefined | Observable<string>>;
  public readonly severity$: BehaviorSubject<'info' | 'warn' | 'error'>;
  public readonly duration$: BehaviorSubject<'short' | 'medium' | 'long' | 'infinite' | number>;
  public readonly cssClass$: BehaviorSubject<string[]>;
  public readonly component: Type<any>;

  constructor(public config: NotificationConfig) {
    this.title$ = new BehaviorSubject(this.config.title);
    this.severity$ = new BehaviorSubject(this.config.severity ?? 'info');
    this.duration$ = new BehaviorSubject(this.config.duration ?? 'medium');
    this.cssClass$ = new BehaviorSubject(Arrays.coerce(this.config.cssClass));
    if (this.config.content === undefined || typeof this.config.content === 'string') {
      this.component = TextNotificationComponent;
      this.input = this.config.content as any;
    }
    else {
      this.component = this.config.content;
      this.input = this.config.componentInput;
    }
  }

  public setTitle(title: string | undefined | Observable<string>): void {
    this.title$.next(title);
  }

  public setSeverity(severity: 'info' | 'warn' | 'error' | undefined): void {
    this.severity$.next(severity ?? 'info');
  }

  public setDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number | undefined): void {
    this.duration$.next(duration ?? 'medium');
  }

  public setCssClass(cssClass: string | string[]): void {
    this.cssClass$.next(Arrays.coerce(this.config.cssClass).concat(Arrays.coerce(cssClass)));
  }
}
