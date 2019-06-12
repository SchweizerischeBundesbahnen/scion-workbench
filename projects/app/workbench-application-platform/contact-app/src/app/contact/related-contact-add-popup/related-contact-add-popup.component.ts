/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy, TrackByFunction } from '@angular/core';
import { provideWorkbenchPopup, WorkbenchPopup } from '@scion/workbench-application.angular';
import { ContactService, filterContacts } from '../contact.service';
import { BehaviorSubject, combineLatest, noop, Observable, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Contact } from '../contact.model';

@Component({
  selector: 'app-related-contact-add-popup',
  templateUrl: './related-contact-add-popup.component.html',
  styleUrls: ['./related-contact-add-popup.component.scss'],
  providers: [
    provideWorkbenchPopup(RelatedContactAddPopupComponent),
  ],
})
export class RelatedContactAddPopupComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _relatedContactId: string;
  private _filter$ = new BehaviorSubject<string>(null);

  public contacts$: Observable<Contact[]>;

  constructor(private _route: ActivatedRoute,
              private _popup: WorkbenchPopup,
              private _contactService: ContactService) {
    this.contacts$ = combineLatest([this._filter$, this._contactService.contacts$()]).pipe(filterContacts());
  }

  public onOption(relatedContactId: string): void {
    this._relatedContactId = relatedContactId;
  }

  public onOk(): void {
    this._contactService.contact$(this._route.snapshot.params['id'], {once: true})
      .pipe(
        switchMap(contact => this._contactService.update$({...contact, relatedContactIds: [...contact.relatedContactIds, this._relatedContactId]})),
        takeUntil(this._destroy$),
      )
      .subscribe(noop, noop, () => this._popup.close());
  }

  public onFilter(filterText: string): void {
    this._filter$.next(filterText);
  }

  public get valid(): boolean {
    return !!this._relatedContactId;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public trackByFn: TrackByFunction<Contact> = (index: number, contact: Contact): any => {
    return contact.id;
  };
}
