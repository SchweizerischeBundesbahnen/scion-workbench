/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, inject, Injector, runInInjectionContext, StaticProvider} from '@angular/core';
import {WorkbenchPopup, ɵPopupContext} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {ɵPopup} from '../../popup/popup.config';
import {NgTemplateOutlet} from '@angular/common';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {toObservable} from '@angular/core/rxjs-interop';

/**
 * Displays the microfrontend of a popup capability provided by the host inside a workbench popup.
 *
 * Unlike {@link MicrofrontendPopupComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * because integrating the microfrontend directly via Angular router and not via iframe.
 */
@Component({
  selector: 'wb-microfrontend-host-popup',
  styleUrls: ['./microfrontend-host-popup.component.scss'],
  templateUrl: './microfrontend-host-popup.component.html',
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostPopupComponent {

  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly popup = inject(ɵPopup) as ɵPopup<ɵPopupContext>;
  protected readonly outletInjector: Injector;

  constructor() {
    const popupContext = this.popup.input!;
    const capability = popupContext.capability;
    const params = popupContext.params;
    this.outletInjector = Injector.create({
      parent: this._injector,
      providers: [provideWorkbenchPopupHandle(popupContext)],
    });

    // Perform navigation in the named router outlet.
    void this.navigate(capability.properties.path, {params}).then(success => {
      if (!success) {
        this.popup.close(Error('[PopupNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.'));
      }
    });

    inject(DestroyRef).onDestroy(() => void this.navigate(null)); // Remove the outlet from the URL
  }

  /**
   * Performs navigation in the specified outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, any>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras?.params);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => Routing.pathToCommands(path)) : null);
    const commands: Commands = [{outlets: {[this.popup.id]: outletCommands}}];
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
  }
}

/**
 * Provides the {WorkbenchPopup} handle to the routed component.
 */
function provideWorkbenchPopupHandle(popupContext: ɵPopupContext): StaticProvider {
  return {
    provide: WorkbenchPopup,
    useFactory: (): WorkbenchPopup => {
      const popup = inject(ɵPopup);

      return new class implements WorkbenchPopup {
        public readonly id = popup.id;
        public readonly capability = popupContext.capability;
        public readonly params = popupContext.params;
        public readonly referrer = popupContext.referrer;
        public readonly focused$ = toObservable(popup.focused, {injector: popup.injector});

        public setResult(result?: unknown): void {
          popup.setResult(result);
        }

        public close(result?: unknown | Error): void {
          popup.close(result);
        }

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      }();
    },
  };
}
