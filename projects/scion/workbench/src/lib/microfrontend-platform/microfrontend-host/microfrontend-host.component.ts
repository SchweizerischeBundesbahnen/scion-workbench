/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Injector, input, Signal, untracked} from '@angular/core';
import {Logger, LoggerNames} from '../../logging';
import {rootEffect} from '../../common/rxjs-interop.util';
import {RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {WorkbenchAuxiliaryRouteInstaller} from '../../routing/workbench-auxiliary-route-installer.service';
import {ActivatedMicrofrontend} from './microfrontend-host.model';
import {Routing} from '../../routing/routing.util';
import {WORKBENCH_ELEMENT} from '../../workbench-element-references';
import {MicrofrontendHostOutlet} from './microfrontend-host-routes';

/**
 * Embeds the microfrontend of a capability provided by the workbench host application.
 */
@Component({
  selector: 'wb-microfrontend-host',
  styleUrls: ['./microfrontend-host.component.scss'],
  templateUrl: './microfrontend-host.component.html',
  imports: [
    RouterOutlet,
    RouterOutletRootContextDirective,
  ],
  host: {
    '[attr.data-capabilityid]': 'capability().metadata!.id',
    '[attr.data-app]': 'capability().metadata!.appSymbolicName',
    '[attr.data-focus]': `workbenchElement.focused() ? '' : null`,
  },
  providers: [
    // Provide `ActivatedMicrofrontend` for DI in router outlet. Otherwise, `ActivatedMicrofrontend` would not be available, most likely because provided on the route level.
    // TODO [Angular 22] Check if still required. If not, remove this TODO.
    {provide: ActivatedMicrofrontend, useFactory: () => inject(ActivatedMicrofrontend, {skipSelf: true})},
  ],
})
export class MicrofrontendHostComponent {

  /**
   * Parameters passed to the microfrontend, required to reduce inputs for notification capabilities.
   *
   * @see MicrofrontendNotificationIntentHandler
   */
  public readonly params = input<Map<string, unknown>>();

  private readonly _logger = inject(Logger);

  protected readonly workbenchElement = inject(WORKBENCH_ELEMENT);
  protected readonly capability = inject(ActivatedMicrofrontend).capability;
  protected readonly outlet = this.computeOutlet();

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendHostComponent. [${this.workbenchElement}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.registerOutletAuxiliaryRoutes();
  }

  /**
   * Computes the router outlet name for the host microfrontend based on the workbench element and capability id.
   */
  private computeOutlet(): Signal<MicrofrontendHostOutlet> {
    return computed((): MicrofrontendHostOutlet => `workbench.microfrontend.host.${this.capability().metadata!.id}.${this.workbenchElement.id}`);
  }

  /**
   * Registers auxiliary routes of top-level primary routes for use as host microfrontend.
   */
  private registerOutletAuxiliaryRoutes(): void {
    const auxiliaryRouteInstaller = inject(WorkbenchAuxiliaryRouteInstaller);
    const injector = inject(Injector);

    // Use root effect to run even if the parent component is detached from change detection.
    rootEffect(onCleanup => {
      const outlet = this.outlet();

      untracked(() => {
        const auxiliaryRoutes = auxiliaryRouteInstaller.registerAuxiliaryRoutes([outlet], {notFoundRoute: true});
        this._logger.debug(() => `Registered auxiliary routes for host microfrontend: ${outlet}`, LoggerNames.ROUTING, auxiliaryRoutes);
        void Routing.runCanMatchGuards({injector});

        onCleanup(() => {
          this._logger.debug(() => `Unregistered auxiliary routes for host microfrontend: ${outlet}`, LoggerNames.ROUTING, auxiliaryRoutes);
          auxiliaryRouteInstaller.unregisterAuxiliaryRoutes([outlet]);
        });
      });
    });
  }
}
