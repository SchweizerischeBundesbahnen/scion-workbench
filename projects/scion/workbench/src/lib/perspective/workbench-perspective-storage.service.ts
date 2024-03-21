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
import {MPerspectiveLayouts} from './workbench-perspective.model';
import {WorkbenchPerspectiveSerializer} from './workench-perspective-serializer.service';

/**
 * Provides API to read/write perspective data from/to {@link WorkbenchStorage}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveStorageService {

  constructor(private _storage: WorkbenchStorage, private _workbenchPerspectiveSerializer: WorkbenchPerspectiveSerializer) {
  }

  /**
   * Reads the layouts of given perspective from storage.
   */
  public async loadPerspectiveLayouts(perspectiveId: string): Promise<MPerspectiveLayouts | null> {
    const storageKey = storageKeys.perspectiveLayout(perspectiveId);
    const serialized = await this._storage.load(storageKey);
    return this._workbenchPerspectiveSerializer.deserialize(serialized);
  }

  /**
   * Writes the layouts of a perspective to storage.
   */
  public async storePerspectiveLayouts(perspectiveId: string, data: MPerspectiveLayouts): Promise<void> {
    const serialized = this._workbenchPerspectiveSerializer.serialize(data);
    const storageKey = storageKeys.perspectiveLayout(perspectiveId);
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
  perspectiveLayout: (perspectiveId: string): string => `scion.workbench.perspectives.${perspectiveId}`,
  activePerspectiveId: 'scion.workbench.perspective',
};
