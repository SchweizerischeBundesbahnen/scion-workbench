/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Signal} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {fromMutation$} from '@scion/toolkit/observable';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {WorkbenchStorage} from '../storage/workbench-storage';
import {WorkbenchTheme} from '../workbench.model';
import {toSignal} from '@angular/core/rxjs-interop';

/**
 * Represents the key to associate the activated theme in the storage.
 */
const THEME_STORAGE_KEY = 'scion.workbench.theme';

/**
 * Enables switching between workbench themes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchThemeSwitcher {

  private readonly _workbenchStorage = inject(WorkbenchStorage);
  private readonly _documentRoot = inject(DOCUMENT).documentElement;

  /**
   * Provides the current workbench theme.
   */
  public readonly theme = this.detectTheme();

  constructor() {
    void this.activateThemeFromStorage();
  }

  /**
   * Switches the theme of the workbench.
   *
   * @param theme - The name of the theme to switch to.
   */
  public async switchTheme(theme: string): Promise<void> {
    this._documentRoot.setAttribute('sci-theme', theme);
    await this._workbenchStorage.store(THEME_STORAGE_KEY, theme);
  }

  /**
   * Detects the current workbench theme from the HTML root element.
   */
  private detectTheme(): Signal<WorkbenchTheme | null> {
    return toSignal(fromMutation$(this._documentRoot, {attributeFilter: ['sci-theme']})
      .pipe(
        startWith(undefined as void),
        map((): WorkbenchTheme | null => {
          const activeTheme = getComputedStyle(this._documentRoot).getPropertyValue('--sci-theme') || null;
          if (!activeTheme) {
            return null;
          }
          return {
            name: activeTheme,
            colorScheme: getComputedStyle(this._documentRoot).colorScheme as 'light' | 'dark',
          };
        }),
        distinctUntilChanged((a, b) => a?.name === b?.name),
      ), {requireSync: true});
  }

  /**
   * Activates the theme from storage, if any.
   */
  private async activateThemeFromStorage(): Promise<void> {
    const theme = await this._workbenchStorage.load(THEME_STORAGE_KEY);
    if (theme) {
      await this.switchTheme(theme);
    }
  }
}
