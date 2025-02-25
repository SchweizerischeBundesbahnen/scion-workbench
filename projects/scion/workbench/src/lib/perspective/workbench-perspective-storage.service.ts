/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {WorkbenchStorage} from '../storage/workbench-storage';
import {MPerspectiveLayout} from './workbench-perspective.model';
import {WorkbenchPerspectiveSerializer} from './workench-perspective-serializer.service';
import {Logger} from '../logging';

/**
 * Provides API to read/write perspective data from/to {@link WorkbenchStorage}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveStorageService {

  private readonly _storage = inject(WorkbenchStorage);
  private readonly _workbenchPerspectiveSerializer = inject(WorkbenchPerspectiveSerializer);
  private readonly _logger = inject(Logger);

  /**
   * Reads the layout of given perspective from storage, applying necessary migrations if the serialized layout is outdated.
   */
  public async loadPerspectiveLayout(perspectiveId: string): Promise<MPerspectiveLayout | null> {
    const storageKey = storageKeys.perspectiveLayout(perspectiveId);
    const serialized = await this._storage.load(storageKey);
    try {
      return this._workbenchPerspectiveSerializer.deserialize(serialized);
    }
    catch (error) {
      this._logger.error(`[SerializeError] Failed to deserialize perspective '${perspectiveId}'. Please clear your browser storage and reload the application.`, error);
      return null;
    }
  }

  /**
   * Writes the layout of a perspective to storage.
   */
  public async storePerspectiveLayout(perspectiveId: string, data: MPerspectiveLayout): Promise<void> {
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
