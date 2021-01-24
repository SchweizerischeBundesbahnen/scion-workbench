/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy } from '@angular/core';
import { Notification } from '@scion/workbench';
import { Subject } from 'rxjs';
import { UUID } from '@scion/toolkit/uuid';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

const TITLE = 'title';
const SEVERITY = 'severity';
const DURATION = 'duration';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-inspect-notification',
  templateUrl: './inspect-notification.component.html',
  styleUrls: ['./inspect-notification.component.scss'],
})
export class InspectNotificationComponent implements OnDestroy {

  public readonly TITLE = TITLE;
  public readonly SEVERITY = SEVERITY;
  public readonly DURATION = DURATION;
  public readonly CSS_CLASS = CSS_CLASS;

  private _destroy$ = new Subject<void>();

  public uuid = UUID.randomUUID();
  public form: FormGroup;

  constructor(public notification: Notification<Map<string, any>>, formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [DURATION]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
    });

    this.form.get(TITLE).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(title => {
        this.notification.setTitle(title || undefined);
      });

    this.form.get(SEVERITY).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(severity => {
        this.notification.setSeverity(severity || undefined);
      });

    this.form.get(DURATION).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(duration => {
        this.notification.setDuration(this.parseDurationFromUI(duration));
      });

    this.form.get(CSS_CLASS).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(cssClass => {
        this.notification.setCssClass(cssClass.split(/\s+/).filter(Boolean) || undefined);
      });
  }

  private parseDurationFromUI(duration: 'short' | 'medium' | 'long' | 'infinite' | any): 'short' | 'medium' | 'long' | 'infinite' | number | undefined {
    if (duration === '') {
      return undefined;
    }
    if (isNaN(Number(duration))) {
      return duration;
    }
    return Number(duration);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
