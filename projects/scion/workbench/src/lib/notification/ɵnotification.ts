/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Signal, signal, Type, untracked, WritableSignal} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Arrays} from '@scion/toolkit/util';
import {Notification} from './notification';
import {NotificationConfig} from './notification.config';
import {TextNotificationComponent} from './text-notification.component';
import {Translatable} from '../text/workbench-text-provider.model';
import {NotificationService} from './notification.service';

export class ɵNotification implements Notification {

  private readonly _notificationService = inject(NotificationService);
  private readonly _title: WritableSignal<Translatable | undefined>;

  public readonly input: unknown;
  public readonly severity$: BehaviorSubject<'info' | 'warn' | 'error'>;
  public readonly duration$: BehaviorSubject<'short' | 'medium' | 'long' | 'infinite' | number>;
  public readonly cssClass$: BehaviorSubject<string[]>;
  public readonly component: Type<any>;

  constructor(public config: NotificationConfig) {
    this._title = signal(this.config.title);
    this.severity$ = new BehaviorSubject(this.config.severity ?? 'info');
    this.duration$ = new BehaviorSubject(this.config.duration ?? 'medium');
    this.cssClass$ = new BehaviorSubject(Arrays.coerce(this.config.cssClass));
    if (typeof this.config.content === 'string') {
      this.component = TextNotificationComponent;
      this.input = this.config.content;
    }
    else {
      this.component = this.config.content;
      this.input = this.config.componentInput;
    }
  }

  public get title(): Signal<Translatable | undefined> {
    return this._title;
  }

  /** @inheritDoc */
  public setTitle(title: Translatable | undefined): void {
    untracked(() => this._title.set(title));
  }

  public setSeverity(severity: 'info' | 'warn' | 'error'): void {
    this.severity$.next(severity);
  }

  public setDuration(duration: 'short' | 'medium' | 'long' | 'infinite' | number): void {
    this.duration$.next(duration);
  }

  public setCssClass(cssClass: string | string[]): void {
    this.cssClass$.next(Arrays.coerce(this.config.cssClass).concat(Arrays.coerce(cssClass)));
  }

  public close(): void {
    this._notificationService.closeNotification(this);
  }
}
