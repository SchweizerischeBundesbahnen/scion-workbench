/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Type} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Arrays, Dictionary} from '@scion/toolkit/util';
import {MessageBoxConfig} from './message-box.config';
import {MessageBox, MessageBoxAction} from './message-box';
import {TextMessageComponent} from './text-message.component';

export class ɵMessageBox<T = any> implements MessageBox<T> {

  private _closeResolveFn!: (action: any) => void;

  public readonly input: T;
  public readonly title$: BehaviorSubject<string | undefined | Observable<string>>;
  public readonly actions$: BehaviorSubject<MessageBoxAction[]>;
  public readonly severity$: BehaviorSubject<'info' | 'warn' | 'error'>;
  public readonly cssClass$: BehaviorSubject<string[]>;
  public readonly blink$ = new Subject<void>();
  public readonly requestFocus$ = new Subject<void>();
  public readonly whenClose = new Promise<any>(resolve => this._closeResolveFn = resolve);
  public readonly component: Type<any>;

  constructor(public config: MessageBoxConfig) {
    this.title$ = new BehaviorSubject(this.config.title);
    this.severity$ = new BehaviorSubject(this.config.severity ?? 'info');
    this.cssClass$ = new BehaviorSubject(Arrays.coerce(this.config.cssClass));
    this.actions$ = new BehaviorSubject(this.parseActions(config.actions || {'ok': 'OK'}));
    if (this.config.content === undefined || typeof this.config.content === 'string') {
      this.component = TextMessageComponent;
      this.input = this.config.content as any;
    }
    else {
      this.component = this.config.content;
      this.input = this.config.componentInput;
    }
  }

  public setActions(actions: MessageBoxAction[]): void {
    this.actions$.next(actions || []);
  }

  public setTitle(title: string | undefined | Observable<string>): void {
    this.title$.next(title);
  }

  public setSeverity(severity: 'info' | 'warn' | 'error' | undefined): void {
    this.severity$.next(severity ?? 'info');
  }

  public setCssClass(cssClass: string | string[]): void {
    this.cssClass$.next(Arrays.coerce(this.config.cssClass).concat(Arrays.coerce(cssClass)));
  }

  public close(action: any): void {
    this._closeResolveFn(action);
  }

  public blink(): void {
    this.blink$.next();
  }

  public focus(): void {
    this.requestFocus$.next();
  }

  private parseActions(actions: Dictionary<string>): MessageBoxAction[] {
    return Object
      .entries(actions)
      .reduce((acc, [key, value]) => acc.concat({key, label: value}), new Array<MessageBoxAction>());
  }
}
