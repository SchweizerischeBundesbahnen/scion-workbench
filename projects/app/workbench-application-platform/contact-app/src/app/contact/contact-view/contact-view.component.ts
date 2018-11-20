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
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ContactService, filterContacts } from '../contact.service';
import { provideWorkbenchView, WorkbenchRouter, WorkbenchView } from '@scion/workbench-application.angular';
import { Popup, PopupService } from '@scion/workbench-application.core';
import { Contact } from '../contact.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const FIRSTNAME = 'firstname';
const LASTNAME = 'lastname';
const STREET = 'street';
const CITY = 'city';
const EMAIL = 'email';
const PHONE = 'phone';
const RELATED_PERSON_IDS = 'related-contact-ids';

@Component({
  selector: 'app-contact-view',
  templateUrl: './contact-view.component.html',
  styleUrls: ['./contact-view.component.scss'],
  providers: [
    provideWorkbenchView(ContactViewComponent)
  ]
})
export class ContactViewComponent implements OnDestroy {

  public readonly FIRSTNAME = FIRSTNAME;
  public readonly LASTNAME = LASTNAME;
  public readonly STREET = STREET;
  public readonly CITY = CITY;
  public readonly EMAIL = EMAIL;
  public readonly PHONE = PHONE;

  private _destroy$ = new Subject<void>();
  private _relatedContactFilter$ = new BehaviorSubject<string>(null);

  public form: FormGroup;
  public contact: Contact;
  public relatedContacts$: Observable<Contact[]>;

  constructor(route: ActivatedRoute,
              private _contactService: ContactService,
              private _view: WorkbenchView,
              private _router: WorkbenchRouter,
              formBuilder: FormBuilder,
              private _popupService: PopupService) {
    this._view.heading = 'Contact';
    this.form = new FormGroup({
      [FIRSTNAME]: formBuilder.control('', Validators.required),
      [LASTNAME]: formBuilder.control('', Validators.required),
      [STREET]: formBuilder.control('', Validators.required),
      [CITY]: formBuilder.control('', Validators.required),
      [EMAIL]: formBuilder.control('', Validators.email),
      [PHONE]: formBuilder.control(''),
      [RELATED_PERSON_IDS]: formBuilder.control([]),
    });

    route.params
      .pipe(
        map(params => params['id']),
        distinctUntilChanged(),
        switchMap(id => this.load$(id)),
        takeUntil(this._destroy$),
      )
      .subscribe();

    this.form.statusChanges
      .pipe(
        filter(() => this.form.valid),
        switchMap(() => this.store$()),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private load$(contactId: string): Observable<any> {
    return this._contactService.contact$(contactId).pipe(tap((contact: Contact) => {
        this.contact = contact;
        this._view.title = `${this.contact.firstname} ${this.contact.lastname}`;
        this.form.controls[FIRSTNAME].setValue(contact.firstname, {emitEvent: false});
        this.form.controls[LASTNAME].setValue(contact.lastname, {emitEvent: false});
        this.form.controls[STREET].setValue(contact.street, {emitEvent: false});
        this.form.controls[CITY].setValue(contact.city, {emitEvent: false});
        this.form.controls[EMAIL].setValue(contact.email, {emitEvent: false});
        this.form.controls[PHONE].setValue(contact.phone, {emitEvent: false});
        this.form.controls[RELATED_PERSON_IDS].setValue(contact.relatedContactIds, {emitEvent: false});
        this.relatedContacts$ = combineLatest(this._relatedContactFilter$, this._contactService.contacts$(contact.relatedContactIds)).pipe(filterContacts());
      })
    );
  }

  private store$(): Observable<any> {
    return this._contactService.update$({
      id: this.contact.id,
      firstname: this.form.controls[FIRSTNAME].value,
      lastname: this.form.controls[LASTNAME].value,
      street: this.form.controls[STREET].value,
      city: this.form.controls[CITY].value,
      email: this.form.controls[EMAIL].value,
      phone: this.form.controls[PHONE].value,
      relatedContactIds: this.form.controls[RELATED_PERSON_IDS].value,
    });
  }

  public onRelatedContactsFilter(filterText: string): void {
    this._relatedContactFilter$.next(filterText);
  }

  public onRelatedContactAdd(event: MouseEvent): void {
    event.preventDefault();
    const popup: Popup = {
      position: 'west',
      anchor: event.target as Element,
    };
    this._popupService.open(popup, {
      'entity': 'contact',
      'id': this.contact.id,
      'action': 'add-related-contact',
    });
  }

  public onCommunicationsOpen(event: MouseEvent): void {
    event.preventDefault();

    this._router.navigate({
        entity: 'communication',
        presentation: 'list',
        contactId: this.contact.id
      },
      {
        matrixParams: {
          contactFullName: `${this.contact.firstname} ${this.contact.lastname}`
        }
      }
    );
  }

  public onCommunicationAdd(event: MouseEvent): void {
    event.preventDefault();
    const popup: Popup = {
      position: 'east',
      anchor: event.target as Element,
    };
    this._popupService.open(popup, {
      entity: 'communication',
      action: 'create',
      contactId: this.contact.id
    });
  }

  public onRelatedContactRemove(relatedContactId: string): void {
    const relatedContactIds: string[] = this.form.controls[RELATED_PERSON_IDS].value;
    this.form.controls[RELATED_PERSON_IDS].setValue(relatedContactIds.filter(it => it !== relatedContactId));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public contactTrackByFn: TrackByFunction<Contact> = (index: number, contact: Contact): any => {
    return contact.id;
  };
}
