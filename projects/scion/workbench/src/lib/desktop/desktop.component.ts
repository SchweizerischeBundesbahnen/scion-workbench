/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, OnDestroy} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {Logger, LoggerNames} from '../logging';
import {DESKTOP_OUTLET} from '../layout/workbench-layout';
import {A11yModule} from '@angular/cdk/a11y';
import {NgClass} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchDesktop} from './ɵworkbench-desktop.model';

/**
 * Renders the workbench desktop, using a router-outlet to display desktop content.
 */
@Component({
  selector: 'wb-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    A11yModule,
    SciViewportComponent,
  ],
  hostDirectives: [
    NgClass,
  ],
})
export class DesktopComponent implements OnDestroy {

  protected readonly DESKTOP_OUTLET = DESKTOP_OUTLET;

  constructor(private _desktop: ɵWorkbenchDesktop, private _logger: Logger) {
    this._logger.debug(() => `Constructing DesktopComponent`, LoggerNames.LIFECYCLE);
    this.addDesktopClassesToHost();
  }

  private addDesktopClassesToHost(): void {
    const ngClass = inject(NgClass);
    this._desktop.classList.value$
      .pipe(takeUntilDestroyed())
      .subscribe(cssClasses => {
        ngClass.ngClass = cssClasses;
      });
  }

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying DesktopComponent`, LoggerNames.LIFECYCLE);
  }
}

