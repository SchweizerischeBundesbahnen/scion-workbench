/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, signal} from '@angular/core';
import {WorkbenchStorage} from '../storage/workbench-storage';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/**
 * Represents the key to associate whether widescreen mode is enabled.
 */
const WIDESCREEN_STORAGE_KEY = 'scion.workbench.widescreen';

@Injectable({providedIn: 'root'})
export class WorkbenchWidescreenLayoutSwitcher {

  public readonly widescreen = signal(false);

  constructor(private _workbenchStorage: WorkbenchStorage) {
    void this.readWidescreenLayoutFromStorage();
  }

  public async toggleWidescreenLayout(enabled: boolean): Promise<void> {
    this.widescreen.set(enabled);
    await this._workbenchStorage.store(WIDESCREEN_STORAGE_KEY, `${enabled}`);
  }

  private async readWidescreenLayoutFromStorage(): Promise<void> {
    const enabled = await this._workbenchStorage.load(WIDESCREEN_STORAGE_KEY);
    if (enabled) {
      this.widescreen.set(coerceBooleanProperty(enabled));
      await this._workbenchStorage.store(WIDESCREEN_STORAGE_KEY, enabled);
    }
  }
}
