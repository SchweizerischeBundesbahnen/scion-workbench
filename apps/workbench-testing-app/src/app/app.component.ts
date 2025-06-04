/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DoCheck, DOCUMENT, HostBinding, inject, NgZone} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID, WorkbenchService, WorkbenchStartup} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SettingsService} from './settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
})
export class AppComponent implements DoCheck {

  private readonly _router = inject(Router);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _zone = inject(NgZone);

  protected readonly workbenchStartup = inject(WorkbenchStartup);

  private _logAngularChangeDetectionCycles = false;

  @HostBinding('attr.data-workbench-id')
  protected workbenchId = inject(WORKBENCH_ID);

  @HostBinding('attr.data-perspective-id')
  protected get activePerspectiveId(): string | undefined {
    return this._workbenchService.activePerspective()?.id;
  }

  /**
   * Unique id that is set after a navigation has been performed.
   *
   * Used in end-to-end tests to detect when the navigation has completed.
   * @see RouterPagePO
   */
  @HostBinding('attr.data-navigationid')
  protected navigationId: string | undefined;

  constructor() {
    this.installRouterEventListeners();
    this.installPropagatedKeyboardEventLogger();
    this.provideWorkbenchService();

    inject(SettingsService).observe$('logAngularChangeDetectionCycles')
      .pipe(takeUntilDestroyed())
      .subscribe(enabled => this._logAngularChangeDetectionCycles = enabled);
  }

  public ngDoCheck(): void {
    if (this._logAngularChangeDetectionCycles) {
      console.log('[AppComponent] Angular change detection cycle');
    }
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
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe((event: KeyboardEvent) => {
        if (!event.isTrusted && (event.target as Element).tagName === 'SCI-ROUTER-OUTLET') {
          console.debug(`[AppComponent][synth-event][event=${event.type}][key=${event.key}][key.control=${event.ctrlKey}][key.shift=${event.shiftKey}][key.alt=${event.altKey}][key.meta=${event.metaKey}]`);
        }
      });
  }

  /**
   * Injects {@link WorkbenchService} into the global window object for tests to interact with the workbench.
   */
  private provideWorkbenchService(): void {
    (window as unknown as Record<string, unknown>)['__workbenchService'] = inject(WorkbenchService);
  }
}
