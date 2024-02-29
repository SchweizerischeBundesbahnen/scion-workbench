/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, NgZone} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AsyncPipe, DOCUMENT, NgIf} from '@angular/common';
import {WORKBENCH_ID, WorkbenchStartup, WorkbenchViewMenuItemDirective} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeInside} from '@scion/toolkit/operators';

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
    WorkbenchViewMenuItemDirective,
  ],
})
export class AppComponent {

  @HostBinding('attr.data-workbench-id')
  public workbenchId = inject(WORKBENCH_ID);

  /**
   * Unique id that is set after a navigation has been performed.
   *
   * Used in end-to-end tests to detect when the navigation has completed.
   * @see RouterPagePO
   */
  @HostBinding('attr.data-navigationid')
  protected navigationId: string | undefined;

  constructor(private _router: Router,
              private _zone: NgZone,
              protected workbenchStartup: WorkbenchStartup) {
    this.installRouterEventListeners();
    this.installPropagatedKeyboardEventLogger();
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

  /**
   * Logs propagated keyboard events, i.e., keyboard events propagated across iframe boundaries.
   *
   * Do not install via host listener to not trigger change detection for each keyboard event.
   */
  private installPropagatedKeyboardEventLogger(): void {
    fromEvent<KeyboardEvent>(inject(DOCUMENT), 'keydown')
      .pipe(
        subscribeInside(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe((event: KeyboardEvent) => {
        if (!event.isTrusted && (event.target as Element).tagName === 'SCI-ROUTER-OUTLET') {
          console.debug(`[AppComponent][synth-event][event=${event.type}][key=${event.key}][key.control=${event.ctrlKey}][key.shift=${event.shiftKey}][key.alt=${event.altKey}][key.meta=${event.metaKey}]`);
        }
      });
  }
}
