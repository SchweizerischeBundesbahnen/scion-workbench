/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, OnDestroy} from '@angular/core';
import {filter, takeUntil} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  /**
   * Unique id that is set after a navigation has been performed.
   *
   * Used in end-to-end tests to detect when the navigation has completed.
   * @see RouterPagePO
   */
  @HostBinding('attr.data-navigationid')
  public navigationId: string | undefined;

  constructor(private _router: Router) {
    this.installRouterEventListeners();
  }

  private installRouterEventListeners(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this.navigationId = UUID.randomUUID();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
