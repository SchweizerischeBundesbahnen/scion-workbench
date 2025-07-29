/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {WorkbenchSelectionManagerService} from './workbench-selection-manager.service';
import {Dictionaries} from '@scion/toolkit/util';
import {WorkbenchSelection, ɵWorkbenchSelection} from './workbench-selection.model';
import {WorkbenchFocusMonitor} from '../focus/workbench-focus-tracker.service';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import withoutUndefinedEntries = Dictionaries.withoutUndefinedEntries;

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchSelectionManagerService implements WorkbenchSelectionManagerService {

  private readonly _workbenchFocusMonitor = inject(WorkbenchFocusMonitor);

  private readonly _change$ = new Subject<void>();

  public readonly selection = new BehaviorSubject<ɵWorkbenchSelection>({
    data: {},
    provider: undefined!,
    propagate: true,
  });
  public readonly _selections = new Map<string, ɵWorkbenchSelection>();

  constructor() {
    this.installSelectionChangeListener();
  }

  /**
   * Sets the given selection for the specified workbench object.
   *
   * The selection is only emitted when the specified workbench object is the active element.
   */
  public setSelection(selection: ɵWorkbenchSelection): void {
    const workingCopy: ɵWorkbenchSelection = {
      ...selection,
      data: {...selection.data},
    };
    console.log('>>> workingcopy', workingCopy.propagate);
    // Mark selections as undefined, so they can later be removed.
    Object.keys(this._selections.get(selection.provider)?.data ?? {}).forEach(type => {
      workingCopy.data[type] = undefined!;
    });
    // Fill selection.
    Object.entries(selection.data).forEach(([type, elements]) => {
      workingCopy.data[type] = elements;
    });
    this._selections.set(selection.provider, workingCopy);
    selection.propagate && this._change$.next();
  }

  /**
   * Deletes the selection of the given provider.
   */
  public deleteSelection(provider: string): void {
    const selection = this._selections.get(provider);
    if (!selection) {
      return;
    }
    this._selections.delete(provider);
    this.updateSelection(this.createSelectionToBeDeleted(selection));
  }

  private installSelectionChangeListener(): void {
    const activeElement$ = toObservable(this._workbenchFocusMonitor.activeElement);

    combineLatest([activeElement$, this._change$])
      .subscribe(([activeElement]) => {
        if (activeElement) {
          const selection = this._selections.get(activeElement.id);
          selection && this.updateSelection(selection);
        }
      });
  }

  // private installSelectionChangeListener(): void {
  //   effect(() => {
  //     const activeElement = this._workbenchFocusMonitor.activeElement();
  //     this._change();
  //
  //     untracked(() => {
  //       if (!activeElement) {
  //         return;
  //       }
  //
  //       const selection = this._selections.get(activeElement.id);
  //       selection && this.updateSelection(selection);
  //     });
  //   });
  // }

  /**
   * Updates the selection, removing `undefined` entries.
   */
  private updateSelection(selection: ɵWorkbenchSelection): void {
    const value = Object.entries(selection.data).reduce((acc, [type, elements]) => {
      return withoutUndefinedEntries({
        ...acc,
        [type]: elements,
      });
    }, this.selection.value.data);
    console.log('>>> updateSelection', selection.propagate);
    this.selection.next({data: value, provider: selection.provider, propagate: selection.propagate});
  }

  private createSelectionToBeDeleted(selection: ɵWorkbenchSelection): ɵWorkbenchSelection {
    const selectionTypes = this.getSelectionTypes();
    const typesToBeRemoved = Object.keys(selection.data).filter(type => !selectionTypes.has(type));
    const value = typesToBeRemoved.reduce((acc, type) => {
      acc[type] = undefined!;
      return acc;
    }, {} as WorkbenchSelection);
    return {
      data: value,
      provider: selection.provider,
      propagate: selection.propagate,
    };
  }

  private getSelectionTypes(): Set<string> {
    const selectionTypes = Array.from(this._selections.values())
      .flatMap(value => Object.keys(value.data));
    return new Set(selectionTypes);
  }
}
