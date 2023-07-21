/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AsyncPipe, NgIf} from '@angular/common';
import {WorkbenchStartup} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    RouterOutlet,
    HeaderComponent,
  ],
})
export class AppComponent {

  /**
   * Unique id that is set after a navigation has been performed.
   *
   * Used in end-to-end tests to detect when the navigation has completed.
   * @see RouterPagePO
   */
  @HostBinding('attr.data-navigationid')
  protected navigationId: string | undefined;

  constructor(private _router: Router, protected workbenchStartup: WorkbenchStartup) {
    this.installRouterEventListeners();
  }

  private installRouterEventListeners(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.navigationId = UUID.randomUUID();
      });
  }
}
