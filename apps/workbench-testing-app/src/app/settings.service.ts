/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, isDevMode} from '@angular/core';
import {WebStorage} from '@scion/toolkit/storage';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../environments/environment';

/**
 * Provides settings for the workbench testing application.
 */
@Injectable({providedIn: 'root'})
export class SettingsService {

  private _sessionStorage = new WebStorage(sessionStorage);

  /**
   * Toggles specified setting.
   */
  public toggle(setting: Setting): void {
    const currentValue = this.isEnabled(setting);
    if (currentValue === SETTINGS[setting].default) {
      this._sessionStorage.put(SETTINGS[setting].storageKey, !currentValue);
    }
    else {
      this._sessionStorage.remove(SETTINGS[setting].storageKey);
    }
  }

  /**
   * Returns whether given setting is enabled.
   */
  public isEnabled(setting: Setting): boolean {
    return this._sessionStorage.get(SETTINGS[setting].storageKey) ?? SETTINGS[setting].default;
  }

  /**
   * Observes given setting. Upon subscription, emits the current setting, and then emits continuously when the setting changes.
   */
  public observe$(setting: Setting): Observable<boolean> {
    return this._sessionStorage.observe$<boolean | undefined>(SETTINGS[setting].storageKey, {emitIfAbsent: true})
      .pipe(map(enabled => enabled ?? SETTINGS[setting].default));
  }
}

/**
 * Settings of the workbench testing application.
 */
const SETTINGS = {
  resetFormsOnSubmit: {
    default: true,
    storageKey: 'scion.workbench.testing-app.settings.reset-forms-on-submit',
  },
  highlightFocus: {
    default: false,
    storageKey: 'scion.workbench.testing-app.settings.highlight-focus',
  },
  logAngularChangeDetectionCycles: {
    default: environment.logAngularChangeDetectionCycles,
    storageKey: 'scion.workbench.testing-app.settings.log-angular-change-detection-cycles',
  },
  displaySkeletons: {
    default: !isDevMode(),
    storageKey: 'scion.workbench.testing-app.settings.display-skeletons',
  },
  showTestPerspectives: {
    default: isDevMode(),
    storageKey: 'scion.workbench.testing-app.settings.show-test-perspectives',
  },
} as const;

/**
 * Setting of the workbench testing application.
 */
export type Setting = keyof typeof SETTINGS;
