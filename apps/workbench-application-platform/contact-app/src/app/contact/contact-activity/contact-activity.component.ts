/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy, TrackByFunction } from '@angular/core';
import { provideWorkbenchActivity } from '@scion/workbench-application.angular';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { ContactService, filterContacts } from '../contact.service';
import { Contact } from '../contact.model';

@Component({
  selector: 'app-contact-activity',
  templateUrl: './contact-activity.component.html',
  styleUrls: ['./contact-activity.component.scss'],
  providers: [
    provideWorkbenchActivity(ContactActivityComponent),
  ],
})
export class ContactActivityComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _filter$ = new BehaviorSubject<string>(null);

  public contacts$: Observable<Contact[]>;

  constructor(private _contactService: ContactService) {
    this.contacts$ = combineLatest([this._filter$, this._contactService.contacts$()]).pipe(filterContacts());
  }

  public onDelete(contactId: string): void {
    this._contactService.delete$(contactId)
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  public onFilter(filterText: string): void {
    this._filter$.next(filterText);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public trackByFn: TrackByFunction<Contact> = (index: number, contact: Contact): any => {
    return contact.id;
  };
}
