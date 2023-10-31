/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, OnDestroy, StaticProvider} from '@angular/core';
import {WorkbenchPopup, ɵPopupContext} from '@scion/workbench-client';
import {RouterUtils} from '../../routing/router.util';
import {Commands} from '../../routing/workbench-router.service';
import {Router, RouterOutlet} from '@angular/router';
import {Popup} from '../../popup/popup.config';
import {NgTemplateOutlet} from '@angular/common';
import {Defined} from '@scion/toolkit/util';
import {POPUP_ID_PREFIX} from '../../workbench.constants';

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

  constructor(popup: Popup<ɵPopupContext>,
              injector: Injector,
              private _router: Router) {
    const popupContext = popup.input!;
    const capability = popupContext.capability;
    const path = Defined.orElseThrow(capability.properties.path, () => Error(`[PopupProviderError] Missing required path for popup capability: ${JSON.stringify(capability)}`));
    const params = popupContext.params;
    this.outletName = POPUP_ID_PREFIX.concat(popupContext.popupId);
    this.outletInjector = Injector.create({
      parent: injector,
      providers: [provideWorkbenchPopupHandle(popupContext)],
    });

    // Perform navigation in the named router outlet.
    this.navigate(path, {outletName: this.outletName, params}).then(success => {
      if (!success) {
        popup.closeWithError(Error('[PopupNavigateError] Navigation canceled, most likely by a route guard.'));
      }
    });
  }

  /**
   * Performs navigation in the specified outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras: {outletName: string; params?: Map<string, any>}): Promise<boolean> {
    // Replace placeholders with the values of the qualifier and params, if any.
    path = RouterUtils.substituteNamedParameters(path, extras.params);

    const outletCommands: Commands | null = (path !== null ? RouterUtils.segmentsToCommands(RouterUtils.parsePath(this._router, path)) : null);
    const commands: Commands = [{outlets: {[extras.outletName]: outletCommands}}];
    return this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'});
  }

  public ngOnDestroy(): void {
    this.navigate(null, {outletName: this.outletName}).then(); // Remove the outlet from the URL
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

        public close<R = any>(result?: R | undefined): void {
          popup.close(result);
        }

        public closeWithError(error: Error | string): void {
          popup.closeWithError(error);
        }

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      };
    },
  };
}
