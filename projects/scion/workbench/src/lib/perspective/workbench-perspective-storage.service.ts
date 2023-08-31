/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchStorage} from '../storage/workbench-storage';
import {Commands} from '../routing/workbench-router.service';

/**
 * Provides API to read/write perspective data from/to {@link WorkbenchStorage}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveStorageService {

  constructor(private _storage: WorkbenchStorage) {
  }

  /**
   * Reads perspective data for a given perspective from storage.
   */
  public async loadPerspectiveData(perspectiveId: string): Promise<PerspectiveData | null> {
    const storageKey = storageKeys.perspectiveData(perspectiveId);
    const serialized = await this._storage.load(storageKey);
    if (!serialized?.length) {
      return null;
    }
    const json = window.atob(serialized);
    return JSON.parse(json);
  }

  /**
   * Writes perspective data for a given perspective to storage.
   */
  public async storePerspectiveData(perspectiveId: string, data: PerspectiveData): Promise<void> {
    const storageKey = storageKeys.perspectiveData(perspectiveId);
    const json = JSON.stringify(data);
    const serialized = window.btoa(json);
    await this._storage.store(storageKey, serialized);
  }

  /**
   * Reads the id of the active perspective from storage.
   */
  public async loadActivePerspectiveId(): Promise<string | null> {
    return this._storage.load(storageKeys.activePerspectiveId);
  }

  /**
   * Writes the id of the active perspective to storage.
   */
  public async storeActivePerspectiveId(perspectiveId: string): Promise<void> {
    return this._storage.store(storageKeys.activePerspectiveId, perspectiveId);
  }
}

/**
 * Represents keys to associate data in the storage.
 */
const storageKeys = {
  perspectiveData: (perspectiveId: string): string => `scion.workbench.perspectives.${perspectiveId}`,
  activePerspectiveId: 'scion.workbench.activePerspective',
};

/**
 * Perspective data stored in persistent storage.
 */
export interface PerspectiveData {
  /**
   * The actual workbench grid.
   *
   * When activated the perspective for the first time, this grid is identical to the {@link initialWorkbenchGrid},
   * but changes when the user customizes the layout.
   */
  workbenchGrid: string | null;
  /**
   * The initial definition used to create the workbench grid.
   */
  initialWorkbenchGrid: string | null;
  /**
   * Commands of views contained in the workbench grid.
   */
  viewOutlets: {[viewId: string]: Commands};
}
