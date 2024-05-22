/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Signal} from '@angular/core';
import {WorkbenchSelectionService, WorkbenchView} from '@scion/workbench';
import {Item, ITEMS} from './selection-list-page.component';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciViewportComponent} from '@scion/components/viewport';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-properties-page',
  templateUrl: './properties-page.component.html',
  styleUrls: ['./properties-page.component.scss'],
  standalone: true,
  imports: [
    SciKeyValueComponent,
    SciViewportComponent,
  ],
})
export default class PropertiesPageComponent {

  protected selectedItems: Signal<Item[]>;

  constructor(private _selectionService: WorkbenchSelectionService, public view: WorkbenchView) {
    this.selectedItems = toSignal(this._selectionService.selection$
      .pipe(
        map(selection => {
          const elements = selection && Object.entries(selection).flatMap(([key, value]) => value);
          const ids = new Set(elements);
          return ITEMS.filter(item => ids.has(item.id));
        }),
      ), {requireSync: true});
  }
}

