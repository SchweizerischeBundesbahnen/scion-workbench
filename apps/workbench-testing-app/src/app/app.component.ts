/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DoCheck, DOCUMENT, inject, NgZone, Signal} from '@angular/core';
import {filter, map, scan} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID, WorkbenchService, WorkbenchStartup} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SettingsService} from './settings.service';
import {installFocusHighlighter} from './focus-highlight/focus-highlighter';
import {installGlasspaneHighlighter} from './glasspane-highlight/glasspane-highlighter';
import {installMicrofrontendApplicationLabels} from './microfrontend-application-labels/microfrontend-application-labels';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  host: {
    '[attr.data-workbench-id]': 'workbenchId',
    '[attr.data-perspective-id]': 'activePerspective()?.id',
    '[attr.data-navigationid]': 'navigationId()',
  },
})
export class AppComponent implements DoCheck {

  private readonly _zone = inject(NgZone);
  private readonly _logAngularChangeDetectionCycles = toSignal(inject(SettingsService).observe$('logAngularChangeDetectionCycles'));

  protected readonly workbenchStartup = inject(WorkbenchStartup);
  protected readonly activePerspective = inject(WorkbenchService).activePerspective;
  protected readonly workbenchId = inject(WORKBENCH_ID);
  /**
   * Unique id that is set after a navigation has been performed.
   *
   * @see RouterPagePO
   */
  protected readonly navigationId = this.computeNavigationId();

  constructor() {
    this.installPropagatedKeyboardEventLogger();
    this.provideWorkbenchService();
    installFocusHighlighter();
    installGlasspaneHighlighter();
    installMicrofrontendApplicationLabels();
  }

  public ngDoCheck(): void {
    if (this._logAngularChangeDetectionCycles()) {
      console.log('[AppComponent] Angular change detection cycle');
    }
  }

  private computeNavigationId(): Signal<string | undefined> {
    const navigationId$ = inject(Router).events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
        scan(navigationId => navigationId + 1, 0),
        map(navigationId => `${navigationId}`),
      );
    return toSignal(navigationId$, {initialValue: undefined});
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
