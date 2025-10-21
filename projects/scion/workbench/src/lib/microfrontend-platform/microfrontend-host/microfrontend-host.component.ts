/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, signal, Signal, StaticProvider, untracked} from '@angular/core';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPartCapability} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {NgTemplateOutlet} from '@angular/common';
import {rootEffect} from '../../common/rxjs-interop.util';
import {Router, RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {WorkbenchAuxiliaryRouteInstaller} from '../../routing/workbench-auxiliary-route-installer.service';
import {MicrofrontendHostOutlet} from '../microfrontend-host/microfrontend-host-route-guards';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {ActivatedMicrofrontend} from './microfrontend-host.model';
import {WORKBENCH_ELEMENT} from '../../workbench.model';
import {MicrofrontendHostContext} from './microfrontend-host-context';

/**
 * Embeds the microfrontend of a capability provided by the workbench host application.
 */
@Component({
  selector: 'wb-microfrontend-host',
  styleUrls: ['./microfrontend-host.component.scss'],
  templateUrl: './microfrontend-host.component.html',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterOutletRootContextDirective,
  ],
})
export class MicrofrontendHostComponent {

  private readonly _capabilityId: Signal<string>;
  private readonly _params: Signal<Map<string, unknown>>;

  private readonly _logger = inject(Logger);

  protected readonly outlet = this.computeMicrofrontendOutlet();

  constructor() {
    const microfrontendHostContext = inject(MicrofrontendHostContext);
    this._capabilityId = microfrontendHostContext.capabilityId;
    this._params = microfrontendHostContext.params;

    this._logger.debug(() => `Constructing MicrofrontendHostComponent for ${inject(WORKBENCH_ELEMENT).id}.`, LoggerNames.MICROFRONTEND_ROUTING);
    this.registerOutletAuxiliaryRoutes();
    microfrontendHostContext.init?.();
  }

  /**
   * Registers auxiliary routes of top-level primary routes for use as host microfrontend.
   */
  private registerOutletAuxiliaryRoutes(): void {
    const auxiliaryRouteInstaller = inject(WorkbenchAuxiliaryRouteInstaller);
    const angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);
    const router = inject(Router);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(onCleanup => {
      const outlet = this.outlet();
      if (!outlet) {
        return undefined;
      }

      untracked(() => {
        const auxiliaryRoutes = auxiliaryRouteInstaller.registerAuxiliaryRoutes([outlet.name], {notFoundRoute: true})
        this._logger.debug(() => `Registered auxiliary routes for host microfrontend: ${outlet.name}`, LoggerNames.ROUTING, auxiliaryRoutes);

        // Perform navigation for Angular to evaluate `CanMatch` guards to display the microfrontend.
        // Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations.
        void angularRouterMutex.submit(() => router.navigate([], {skipLocationChange: true, queryParamsHandling: 'preserve', preserveFragment: true}));

        onCleanup(() => {
          this._logger.debug(() => `Unregistered auxiliary routes for host microfrontend: ${outlet.name}`, LoggerNames.ROUTING, auxiliaryRoutes);
          auxiliaryRouteInstaller.unregisterAuxiliaryRoutes([outlet.name])
        });
      });
    });
  }

  /**
   * Computes the outlet to display the host microfrontend.
   */
  private computeMicrofrontendOutlet(): Signal<MicrofrontendOutlet | null | undefined> {
    const outlet = signal<MicrofrontendOutlet | null | undefined>(undefined);
    const manifestObjectCache = inject(ManifestObjectCache);
    const workbenchElement = inject(WORKBENCH_ELEMENT);
    const injector = inject(Injector);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(onCleanup => {
      const capabilityId = this._capabilityId();

      untracked(() => {
        const subscription = manifestObjectCache.observeCapability$<WorkbenchPartCapability>(capabilityId)
          .subscribe(capability => {
            outlet.set(capability && {
              name: `microfrontend.host.${workbenchElement.id}.${capability.metadata!.id}`,
              injector: Injector.create({
                parent: injector,
                providers: [provideActivatedMicrofrontend(capability, this._params)],
              }),
            });
          });
        onCleanup(() => subscription.unsubscribe());
      });
    });
    return outlet;
  }
}

function provideActivatedMicrofrontend(capability: WorkbenchPartCapability, params: Signal<Map<string, unknown>>): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useValue: new class implements ActivatedMicrofrontend {
      public readonly capability = capability;
      public readonly params = params;
    }(),
  };
}

interface MicrofrontendOutlet {
  name: MicrofrontendHostOutlet;
  injector: Injector;
}
