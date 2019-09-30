/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Use this directive to model a list item for {SciListComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * ---
 * Example usage:
 *
 * <sci-list (filter)="onFilter($event)">
 *   <ng-template sciListItem *ngFor="let contact of contacts$ | async">
 *     <app-contact-list-item [contact]="contact"></app-contact-list-item>
 *   </ng-template>
 * </sci-list>
 */
@Directive({selector: 'ng-template[sciListItem]'})
export class SciListItemDirective {

  private _actionTemplates: TemplateRef<void>[] = [];

  /**
   * Optional key to identify this item and is used to emit selection and internally as key for the {TrackBy} function.
   */
  @Input()
  public key: string;

  /**
   * Provide template(s) to be rendered as actions of this list item.
   */
  @Input()
  public set actions(actions: TemplateRef<void> | TemplateRef<void>[]) {
    this._actionTemplates = (Array.isArray(actions) ? actions : actions && [actions] || []);
  }

  constructor(public readonly template: TemplateRef<void>) {
  }

  public get actionTemplates(): TemplateRef<void>[] {
    return this._actionTemplates;
  }
}
