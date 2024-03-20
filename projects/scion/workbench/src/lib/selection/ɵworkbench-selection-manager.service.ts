/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchSelection, WorkbenchSelectionManagerService, ɵWorkbenchSelection} from './workbench-selection-manager.service';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {ActiveWorkbenchElementTracker} from '../workbench-active-element-tracker.service';
import {Dictionaries} from '@scion/toolkit/util';
import withoutUndefinedEntries = Dictionaries.withoutUndefinedEntries;

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchSelectionManagerService implements WorkbenchSelectionManagerService {

  private readonly _change$ = new Subject<void>();

  public readonly selection$ = new BehaviorSubject<WorkbenchSelection>({});
  public readonly _selections = new Map<string, ɵWorkbenchSelection>();

  constructor(private _activeElementTrackerService: ActiveWorkbenchElementTracker) {
    this.installSelectionListener();
  }

  public setSelection(selection: WorkbenchSelection, options: {workbenchObjectId: string}): void {
    const workbenchSelection: ɵWorkbenchSelection = {};
    Object.entries(this._selections.get(options.workbenchObjectId) ?? {}).forEach(([type]) => {
      workbenchSelection[type] = undefined;
    });
    Object.entries(selection).forEach(([type, elements]) => {
      workbenchSelection[type] = elements;
    });
    this._selections.set(options.workbenchObjectId, workbenchSelection);
    this._change$.next();
  }

  public deleteSelection(workbenchObjectId: string): void {
    const selection = this._selections.get(workbenchObjectId);
    this._selections.delete(workbenchObjectId);
    if (!selection) {
      return;
    }
    const typesToDelete = new Set<string>();
    const types = Object.entries(selection).map(([key, elements]) => key);
    types.forEach(type => {
      const matchingTypes = [];
      for (const [key, value] of this._selections.entries()) {
        Object.entries(value ?? {}).forEach(([existingType, value2]) => {
          if (existingType === type) {
            matchingTypes.push(key);
          }
        });
      }
      // If there are no more selection providers of this type, remove it
      if (matchingTypes.length === 0) {
        typesToDelete.add(type);
      }
    });
    this._deleteSelection(Array.from(typesToDelete));
  }

  private installSelectionListener(): void {
    combineLatest([this._activeElementTrackerService.activeElement$, this._change$])
      .subscribe(([activeElement]) => {
        if (activeElement) {
          const selection = this._selections.get(activeElement);
          selection && this.updateSelection(selection);
        }
      });
  }

  private updateSelection(selection: ɵWorkbenchSelection): void {
    const value = Object.entries(selection).reduce((acc, [type, elements]) => {
      return withoutUndefinedEntries({
        ...acc,
        [type]: elements,
      });
    }, this.selection$.value);
    this.selection$.next(value);
  }

  private _deleteSelection(types: string[]): void {
    const value = types.reduce((acc, type) => {
      return withoutUndefinedEntries({
        ...acc,
        [type]: undefined,
      });
    }, this.selection$.value);
    this.selection$.next(value);
  }
}
