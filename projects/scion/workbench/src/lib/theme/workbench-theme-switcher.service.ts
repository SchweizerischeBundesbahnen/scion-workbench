/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable, ReplaySubject, share} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {fromMutation$} from '@scion/toolkit/observable';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {WorkbenchStorage} from '../storage/workbench-storage';

/**
 * Represents the key to associate the activated theme in the storage.
 */
const THEME_STORAGE_KEY = 'scion.workbench.theme';

/**
 * Enables switching between workbench themes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchThemeSwitcher {

  private readonly _documentRoot = inject<Document>(DOCUMENT).documentElement;

  /**
   * Emits the name of the current workbench theme.
   *
   * Upon subscription, emits the name of the current theme, and then continuously emits when switching the theme. It never completes.
   */
  public readonly theme$: Observable<string | null>;

  constructor(private _workbenchStorage: WorkbenchStorage) {
    this.theme$ = this.detectTheme$();
    this.activateThemeFromStorage().then();
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
  private detectTheme$(): Observable<string | null> {
    return new Observable<string | null>(observer => {
      const subscription = fromMutation$(this._documentRoot, {attributeFilter: ['sci-theme']})
        .pipe(
          startWith(undefined as void),
          map(() => getComputedStyle(this._documentRoot).getPropertyValue('--sci-theme') || null),
          distinctUntilChanged(),
          share({connector: () => new ReplaySubject(1), resetOnRefCountZero: false}),
        )
        .subscribe(observer);

      return () => subscription.unsubscribe();
    });
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
