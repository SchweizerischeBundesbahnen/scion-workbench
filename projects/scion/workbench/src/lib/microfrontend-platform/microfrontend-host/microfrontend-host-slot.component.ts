/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Injector, runInInjectionContext, Signal, StaticProvider, untracked} from '@angular/core';
import {Logger, LoggerNames} from '../../logging';
import {rootEffect} from '../../common/rxjs-interop.util';
import {RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {WorkbenchAuxiliaryRouteInstaller} from '../../routing/workbench-auxiliary-route-installer.service';
import {MicrofrontendHostOutlet} from './microfrontend-host-route-guards';
import {ActivatedMicrofrontend} from './microfrontend-host.model';
import {WORKBENCH_ELEMENT} from '../../workbench.model';
import {Capability} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {Routing} from '../../routing/routing.util';
import {NgTemplateOutlet} from '@angular/common';
import {HostSlotConfig} from './microfrontend-host-slot.config';

/**
 * Embeds the microfrontend of a capability provided by the workbench host application.
 */
@Component({
  selector: 'wb-microfrontend-host-slot',
  styleUrls: ['./microfrontend-host-slot.component.scss'],
  templateUrl: './microfrontend-host-slot.component.html',
  imports: [
    RouterOutlet,
    RouterOutletRootContextDirective,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostSlotComponent {

  private readonly _config = inject(HostSlotConfig);
  private readonly _logger = inject(Logger);

  protected readonly outlet = this.computeHostOutlet();

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendHostSlotComponent for ${inject(WORKBENCH_ELEMENT).id}.`, LoggerNames.MICROFRONTEND_ROUTING);
    this.registerOutletAuxiliaryRoutes();
    this.installOnLoad();
  }

  /**
   * Registers auxiliary routes of top-level primary routes for use as host microfrontend.
   */
  private registerOutletAuxiliaryRoutes(): void {
    const auxiliaryRouteInstaller = inject(WorkbenchAuxiliaryRouteInstaller);
    const injector = inject(Injector);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(onCleanup => {
      const outlet = this.outlet();
      if (!outlet) {
        return undefined;
      }

      untracked(() => {
        const auxiliaryRoutes = auxiliaryRouteInstaller.registerAuxiliaryRoutes([outlet.name], {notFoundRoute: true})
        this._logger.debug(() => `Registered auxiliary routes for host microfrontend: ${outlet.name}`, LoggerNames.ROUTING, auxiliaryRoutes);
        void Routing.evaluateCanMatchGuards({injector});

        onCleanup(() => {
          this._logger.debug(() => `Unregistered auxiliary routes for host microfrontend: ${outlet.name}`, LoggerNames.ROUTING, auxiliaryRoutes);
          auxiliaryRouteInstaller.unregisterAuxiliaryRoutes([outlet.name])
        });
      });
    });
  }

  /**
   * Computes the outlet to display the host microfrontend, or `undefined` if the capability is not found.
   */
  private computeHostOutlet(): Signal<HostOutlet | undefined> {
    const injector = inject(Injector);
    const workbenchElement = inject(WORKBENCH_ELEMENT);
    const capability = inject(ManifestObjectCache).getCapability(this._config.capabilityId);

    return computed(() => {
      if (!capability()) {
        return undefined;
      }

      return {
        name: `microfrontend.host.${workbenchElement.id}.${capability()!.metadata!.id}`,
        injector: Injector.create({
          parent: injector,
          providers: [provideActivatedMicrofrontend(capability()!, this._config.params)],
        }),
      }
    });
  }

  /**
   * Invokes the configured {@link HostSlotConfig.onLoad} callback when loading the microfrontend, triggered each time the capability changes.
   */
  private installOnLoad(): void {
    if (!this._config.onLoad) {
      return;
    }

    // Run as root effect to run even if the parent component is detached from change detection.
    rootEffect(onCleanup => {
      const outlet = this.outlet();
      if (!outlet) {
        return;
      }

      untracked(() => {
        const injector = Injector.create({parent: outlet.injector, providers: []})
        onCleanup(() => injector.destroy());
        runInInjectionContext(injector, this._config.onLoad!);
      });
    });
  }
}

/**
 * Provides {@link ActivatedMicrofrontend} for injection in the host microfrontend.
 */
function provideActivatedMicrofrontend(capability: Capability, params: Signal<Map<string, unknown>>): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useValue: new class implements ActivatedMicrofrontend {
      public readonly capability = capability;
      public readonly params = params;
    }(),
  };
}

/**
 * Configures {@link RouterOutlet} to display a host microfrontend.
 */
interface HostOutlet {
  /**
   * Specifies the name of the router outlet.
   */
  name: MicrofrontendHostOutlet;
  /**
   * Specifies the injection context for the microfrontend.
   */
  injector: Injector;
}
