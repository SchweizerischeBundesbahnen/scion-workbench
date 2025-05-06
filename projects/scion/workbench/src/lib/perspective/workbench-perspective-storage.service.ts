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
import {Logger} from '../logging';
import {WorkbenchLayoutSerializer} from '../layout/workench-layout-serializer.service';
import {MWorkbenchLayout} from '../layout/workbench-layout';

/**
 * Provides API to read/write perspective data from/to {@link WorkbenchStorage}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveStorageService {

  private readonly _storage = inject(WorkbenchStorage);
  private readonly _workbenchLayoutSerializer = inject(WorkbenchLayoutSerializer);
  private readonly _logger = inject(Logger);

  /**
   * Reads the layout of given perspective from storage, applying necessary migrations if the serialized layout is outdated.
   */
  public async loadLayout(perspectiveId: string): Promise<MWorkbenchLayout | null> {
    const storageKey = storageKeys.layout(perspectiveId);
    const serialized = await this._storage.load(storageKey);
    try {
      return this._workbenchLayoutSerializer.deserialize(serialized);
    }
    catch (error) {
      this._logger.error(`[SerializeError] Failed to deserialize perspective '${perspectiveId}'. Please clear your browser storage and reload the application.`, error);
      return null;
    }
  }

  /**
   * Writes the layout of a perspective to storage.
   */
  public async storeLayout(perspectiveId: string, data: MWorkbenchLayout): Promise<void> {
    const serialized = this._workbenchLayoutSerializer.serialize(data);
    const storageKey = storageKeys.layout(perspectiveId);
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
  layout: (perspectiveId: string): string => `scion.workbench.perspectives.${perspectiveId}`,
  activePerspectiveId: 'scion.workbench.perspective',
};
