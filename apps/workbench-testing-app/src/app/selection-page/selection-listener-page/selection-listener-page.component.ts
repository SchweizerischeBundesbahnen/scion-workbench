/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {WorkbenchSelectionService} from '@scion/workbench';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {Subscription} from 'rxjs';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {JsonPipe} from '@angular/common';
import {WorkbenchSelectionData} from '../../../../../../projects/scion/workbench/src/lib/selection/workbench-selection.model';

@Component({
  selector: 'app-selection-listener-page',
  templateUrl: './selection-listener-page.component.html',
  styleUrls: ['./selection-listener-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueComponent,
    JsonPipe,
  ],
})
export default class SelectionListenerPageComponent {

  public workbenchSelection: WorkbenchSelectionData | undefined;

  private _subscription: Subscription | undefined;

  constructor(private _selectionService: WorkbenchSelectionService) {
  }

  public onSubscribe(): void {
    this._subscription = this._selectionService.selection$
      .subscribe(selection => {
        this.workbenchSelection = selection;
      });
  }

  public onUnsubscribe(): void {
    this._subscription!.unsubscribe();
    this._subscription = undefined;
    this.workbenchSelection = undefined;
  }

  public get isSubscribed(): boolean {
    return !!this._subscription && !this._subscription.closed;
  }
}
