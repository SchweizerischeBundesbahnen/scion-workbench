/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, OnDestroy, runInInjectionContext, StaticProvider} from '@angular/core';
import {WorkbenchPopup, ɵPopupContext} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {Popup, ɵPopup} from '../../popup/popup.config';
import {NgTemplateOutlet} from '@angular/common';
import {Defined} from '@scion/toolkit/util';
import {POPUP_ID_PREFIX} from '../../workbench.constants';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {Objects} from '../../common/objects.util';

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
  standalone: true,
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostPopupComponent implements OnDestroy {

  public readonly outletName: string;
  public readonly outletInjector: Injector;

  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  constructor(popup: ɵPopup<ɵPopupContext>,
              private _injector: Injector,
              private _router: Router) {
    const popupContext = popup.input!;
    const capability = popupContext.capability;
    const path = Defined.orElseThrow(capability.properties.path, () => Error(`[PopupProviderError] Missing required path for popup capability [application="${capability.metadata!.appSymbolicName}", capability=${Objects.toMatrixNotation(capability.qualifier)}]`));
    const params = popupContext.params;
    this.outletName = POPUP_ID_PREFIX.concat(popup.id);
    this.outletInjector = Injector.create({
      parent: this._injector,
      providers: [provideWorkbenchPopupHandle(popupContext)],
    });

    // Perform navigation in the named router outlet.
    void this.navigate(path, {outletName: this.outletName, params}).then(success => {
      if (!success) {
        popup.close(Error('[PopupNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.'));
      }
    });
  }

  /**
   * Performs navigation in the specified outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras: {outletName: string; params?: Map<string, any>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras.params);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => Routing.pathToCommands(path)) : null);
    const commands: Commands = [{outlets: {[extras.outletName]: outletCommands}}];
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
  }

  public ngOnDestroy(): void {
    void this.navigate(null, {outletName: this.outletName}); // Remove the outlet from the URL
  }
}

/**
 * Provides the {WorkbenchPopup} handle to the routed component.
 */
function provideWorkbenchPopupHandle(popupContext: ɵPopupContext): StaticProvider {
  return {
    provide: WorkbenchPopup,
    useFactory: (): WorkbenchPopup => {
      const popup = inject(Popup);

      return new class implements WorkbenchPopup {
        public readonly capability = popupContext.capability;
        public readonly params = popupContext.params;
        public readonly referrer = popupContext.referrer;

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
