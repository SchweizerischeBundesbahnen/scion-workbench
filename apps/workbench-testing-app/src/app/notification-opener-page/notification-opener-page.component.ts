/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Type} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {NotificationService} from '@scion/workbench';
import {InspectNotificationComponent} from '../inspect-notification-provider/inspect-notification.component';
import {Observable, of} from 'rxjs';

const TITLE = 'title';
const CONTENT = 'content';
const COMPONENT = 'component';
const OBSERVABLE = 'observable';
const COMPONENT_INPUT = 'componentInput';
const SEVERITY = 'severity';
const DURATION = 'duration';
const GROUP = 'group';
const USE_GROUP_INPUT_REDUCER = 'groupInputReducer';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-notification-opener-page',
  templateUrl: './notification-opener-page.component.html',
  styleUrls: ['./notification-opener-page.component.scss'],
})
export class NotificationOpenerPageComponent {

  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly COMPONENT = COMPONENT;
  public readonly OBSERVABLE = OBSERVABLE;
  public readonly COMPONENT_INPUT = COMPONENT_INPUT;
  public readonly SEVERITY = SEVERITY;
  public readonly DURATION = DURATION;
  public readonly GROUP = GROUP;
  public readonly USE_GROUP_INPUT_REDUCER = USE_GROUP_INPUT_REDUCER;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: UntypedFormGroup;

  constructor(formBuilder: UntypedFormBuilder, private _notificationService: NotificationService) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [COMPONENT]: formBuilder.control(''),
      [OBSERVABLE]: formBuilder.control(''),
      [COMPONENT_INPUT]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [DURATION]: formBuilder.control(''),
      [GROUP]: formBuilder.control(''),
      [USE_GROUP_INPUT_REDUCER]: formBuilder.control(false),
      [CSS_CLASS]: formBuilder.control(''),
    });
  }

  public onNotificationShow(): void {
    this._notificationService.notify({
      title: this.restoreLineBreaks(this.form.get(TITLE).value) || undefined,
      content: this.getContent(),
      componentInput: (this.isUseComponent() ? this.form.get(COMPONENT_INPUT).value : undefined) || undefined,
      severity: this.form.get(SEVERITY).value || undefined,
      duration: this.parseDurationFromUI(),
      group: this.form.get(GROUP).value || undefined,
      groupInputReduceFn: this.isUseGroupInputReducer() ? concatInput : undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
    });
  }

  private getContent(): Type<any> | Observable<string> | string | undefined {
    if (this.isUseComponent()) {
      return this.parseComponentFromUI();
    }

    const text = this.restoreLineBreaks(this.form.get(CONTENT).value) || undefined;
    return this.isUseObservableContent() ? of(text) : text;
  }

  private parseComponentFromUI(): Type<any> {
    switch (this.form.get(COMPONENT).value) {
      case 'inspect-notification':
        return InspectNotificationComponent;
      default:
        throw Error(`[IllegalNotificationComponent] Notification component not supported: ${this.form.get(COMPONENT).value}`);
    }
  }

  private parseDurationFromUI(): 'short' | 'medium' | 'long' | 'infinite' | number | undefined {
    const duration = this.form.get(DURATION).value;
    if (duration === '') {
      return undefined;
    }
    if (isNaN(Number(duration))) {
      return duration;
    }
    return Number(duration);
  }

  public isUseComponent(): boolean {
    return !!this.form.get(COMPONENT).value;
  }

  public isUseObservableContent(): boolean {
    return !!this.form.get(COMPONENT).value;
  }

  public isUseGroupInputReducer(): boolean {
    return this.form.get(USE_GROUP_INPUT_REDUCER).value;
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}

function concatInput(prevInput: string, currInput: string): string {
  return `${prevInput}, ${currInput}`;
}
