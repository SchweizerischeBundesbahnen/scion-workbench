/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy } from '@angular/core';
import { provideWorkbenchPopup, WorkbenchPopup } from '@scion/workbench-application.angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Communication } from '../communication.model';
import { CommunicationService } from '../communication.service';
import { ActivatedRoute } from '@angular/router';
import { UUID } from '@scion/app/common';

const CHANNEL = 'channel';
const DATE = 'date';
const SUBJECT = 'subject';
const MESSAGE = 'message';

@Component({
  selector: 'app-communication-new-popup',
  templateUrl: './communication-new-popup.component.html',
  styleUrls: ['./communication-new-popup.component.scss'],
  providers: [
    provideWorkbenchPopup(CommunicationNewPopupComponent),
  ],
})
export class CommunicationNewPopupComponent implements OnDestroy {

  public readonly CHANNEL = CHANNEL;
  public readonly DATE = DATE;
  public readonly SUBJECT = SUBJECT;
  public readonly MESSAGE = MESSAGE;

  private _destroy$ = new Subject<void>();
  public form: FormGroup;

  constructor(private _popup: WorkbenchPopup,
              private _communicationService: CommunicationService,
              private _route: ActivatedRoute,
              formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      [CHANNEL]: formBuilder.control('email', Validators.required),
      [DATE]: formBuilder.control(nowAsIsoString(), Validators.required),
      [SUBJECT]: formBuilder.control('', Validators.required),
      [MESSAGE]: formBuilder.control('', Validators.required),
    });
  }

  public onOk(): void {
    const contactId = this._route.snapshot.params['contactId'];

    const communication: Communication = {
      id: UUID.randomUUID(),
      contactId: contactId,
      channel: this.form.get(CHANNEL).value,
      date: this.form.get(DATE).value,
      subject: this.form.get(SUBJECT).value,
      message: this.form.get(MESSAGE).value,
    };

    this._communicationService.create$(communication)
      .pipe(takeUntil(this._destroy$))
      .subscribe(noop, noop, () => this._popup.close());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function nowAsIsoString(): string {
  const now = /(\d{4})-(\d{2})-(\d{2})/.exec(new Date().toISOString());
  return `${now[1]}-${now[2]}-${now[3]}`;
}
