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
import {WorkbenchLayoutSerializer} from './workbench-layout-serializer.service';
import {MWorkbenchLayout} from './workbench-layout';

/**
 * Provides API for reading and writing the workbench layout to storage.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutStorageService {

  private readonly _storage = inject(WorkbenchStorage);
  private readonly _workbenchLayoutSerializer = inject(WorkbenchLayoutSerializer);
  private readonly _logger = inject(Logger);

  /**
   * Loads specified layout from storage, applying necessary migrations if the serialized layout is outdated.
   */
  public async load(perspectiveId: string): Promise<MWorkbenchLayout | null> {
    const layoutStorageKey = storageKeys.layout(perspectiveId);
    const serialized = await this._storage.load(layoutStorageKey);
    try {
      return this._workbenchLayoutSerializer.deserialize(serialized);
    }
    catch (error) {
      this._logger.error(`[WorkbenchSerializeError] Failed to deserialize the layout of the perspective '${perspectiveId}'. Please clear your browser storage and reload the application.`, error);
      return null;
    }
  }

  /**
   * Stores specified layout to storage.
   */
  public async store(perspectiveId: string, layout: MWorkbenchLayout): Promise<void> {
    const serialized = this._workbenchLayoutSerializer.serialize(layout);
    const layoutStorageKey = storageKeys.layout(perspectiveId);
    await this._storage.store(layoutStorageKey, serialized);
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
