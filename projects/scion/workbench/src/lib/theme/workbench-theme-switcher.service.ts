/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {effect, inject, Injectable, untracked} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {fromMutation$} from '@scion/toolkit/observable';
import {map, subscribeOn} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {renderingFlag} from '../layout/rendering-flag';
import {readCssVariable} from '../common/dom.util';
import {animationFrameScheduler} from 'rxjs';

/**
 * Enables switching between workbench themes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchThemeSwitcher {

  /**
   * Specifies the workbench theme.
   *
   * Defaults to the `sci-theme` attribute set on the HTML root element, or to the user's OS color scheme preference if not set.
   *
   * Built-in themes: `scion-light` and `scion-dark`.
   */
  public readonly theme = renderingFlag<string | null>(
    'scion.workbench.theme',
    readCssVariable(inject(DOCUMENT).documentElement, '--sci-theme', null),
  );

  constructor() {
    this.installThemeAttributeSynchronizer();
  }

  /**
   * Synchronizes {@link WorkbenchService.settings.theme} and 'sci-theme' attribute on HTML root element.
   *
   * ```html
   * <html [attr.sci-theme]="workbenchService.settings.theme">
   *   ...
   * </html>
   * ```
   */
  private installThemeAttributeSynchronizer(): void {
    const documentRoot = inject(DOCUMENT).documentElement;

    // Add theme attribute to the HTML root element.
    effect(() => {
      const theme = this.theme();
      untracked(() => {
        if (theme) {
          documentRoot.setAttribute('sci-theme', theme);
        }
        else {
          documentRoot.removeAttribute('sci-theme');
        }
      });
    });

    // Read theme from HTML root element.
    fromMutation$(documentRoot, {attributeFilter: ['sci-theme']})
      .pipe(
        subscribeOn(animationFrameScheduler), // ensure styles of theme to be applied when reading computed styles
        map(() => getComputedStyle(documentRoot).getPropertyValue('--sci-theme') || null),
        takeUntilDestroyed(),
      )
      .subscribe(theme => {
        this.theme.set(theme);
      });
  }
}
