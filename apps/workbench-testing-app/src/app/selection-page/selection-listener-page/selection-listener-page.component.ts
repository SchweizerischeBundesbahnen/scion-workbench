/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, EffectRef, inject, Injector, signal, untracked} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {WorkbenchSelection, WorkbenchSelectionService} from '@scion/workbench';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-selection-listener-page',
  templateUrl: './selection-listener-page.component.html',
  styleUrls: ['./selection-listener-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
  ],
})
export default class SelectionListenerPageComponent {

  private readonly _selectionService = inject(WorkbenchSelectionService);
  private readonly _injector = inject(Injector);

  protected workbenchSelection = signal<WorkbenchSelection | undefined>(undefined);

  private _effectRef: EffectRef | undefined;

  protected onSubscribe(): void {
    this._effectRef = effect(() => {
      const selection = this._selectionService.selection();

      untracked(() => this.workbenchSelection.set(selection))
    }, {injector: this._injector});
  }

  public onUnsubscribe(): void {
    this._effectRef!.destroy();
    this._effectRef = undefined;
    this.workbenchSelection.set(undefined);
  }

  public get isSubscribed(): boolean {
    return !!this._effectRef;
  }
}
