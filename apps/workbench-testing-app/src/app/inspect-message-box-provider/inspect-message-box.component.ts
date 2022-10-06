/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, OnDestroy} from '@angular/core';
import {MessageBox} from '@scion/workbench';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UUID} from '@scion/toolkit/uuid';

const TITLE = 'title';
const SEVERITY = 'severity';
const CSS_CLASS = 'cssClass';
const ACTIONS = 'actions';
const RETURN_VALUE = 'returnValue';

@Component({
  selector: 'app-inspect-message-box',
  templateUrl: './inspect-message-box.component.html',
  styleUrls: ['./inspect-message-box.component.scss'],
})
export class InspectMessageBoxComponent implements OnDestroy {

  public readonly TITLE = TITLE;
  public readonly SEVERITY = SEVERITY;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly ACTIONS = ACTIONS;
  public readonly RETURN_VALUE = RETURN_VALUE;

  private _destroy$ = new Subject<void>();

  public uuid = UUID.randomUUID();
  public form: UntypedFormGroup;

  constructor(public messageBox: MessageBox<Map<string, any>>, formBuilder: UntypedFormBuilder) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [ACTIONS]: formBuilder.array([]),
      [RETURN_VALUE]: formBuilder.control(''),
    });

    this.form.get(TITLE).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(title => {
        this.messageBox.setTitle(title || undefined);
      });

    this.form.get(SEVERITY).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(severity => {
        this.messageBox.setSeverity(severity || undefined);
      });

    this.form.get(CSS_CLASS).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(cssClass => {
        this.messageBox.setCssClass(cssClass.split(/\s+/).filter(Boolean));
      });

    this.form.get(ACTIONS).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((actions: Array<{paramName: string; paramValue: string}>) => {
        this.messageBox.setActions(actions.map(action => ({
            key: action.paramName,
            label: action.paramValue,
            onAction: () => `${action.paramName} => ${this.form.get(RETURN_VALUE).value}`,
          })),
        );
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
