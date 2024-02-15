/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciRouterOutletElement} from '@scion/microfrontend-platform';
import {DestroyRef, Injectable} from '@angular/core';
import {ɵTHEME_CONTEXT_KEY} from '@scion/workbench-client';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchTheme} from '../../workbench.model';

/**
 * Propagates workbench theme to a microfrontend.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata. Should be provided by each microfrontend component to share its life-cycle. */)
export class MicrofrontendThemePropagator {

  constructor(private _workbenchService: WorkbenchService,
              private _destroyRef: DestroyRef) {
  }

  /**
   * Propagates current theme and color scheme to the embedded content in the provided router outlet element.
   */
  public install(sciRouterOutletElement: SciRouterOutletElement): void {
    this._workbenchService.theme$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(theme => {
        if (theme) {
          sciRouterOutletElement.setContextValue<WorkbenchTheme>(ɵTHEME_CONTEXT_KEY, theme);
          sciRouterOutletElement.setContextValue('color-scheme', theme.colorScheme);
        }
        else {
          sciRouterOutletElement.removeContextValue(ɵTHEME_CONTEXT_KEY);
          sciRouterOutletElement.removeContextValue('color-scheme');
        }
      });
  }
}
