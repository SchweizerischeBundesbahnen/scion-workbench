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
import {Capability} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPartCapability} from '@scion/workbench-client';
import {Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {NgTemplateOutlet} from '@angular/common';
import {rootEffect} from '../../common/rxjs-interop.util';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {Router, RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {WorkbenchAuxiliaryRouteInstaller} from '../../routing/workbench-auxiliary-route-installer.service';
import {MicrofrontendHostOutlet} from '../microfrontend-host/microfrontend-host-route-guards';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';

/**
 * Embeds the microfrontend of a part capability provided by the workbench host application.
 */
@Component({
  selector: 'wb-microfrontend-host-part',
  styleUrls: ['./microfrontend-host-part.component.scss'],
  templateUrl: './microfrontend-host-part.component.html',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterOutletRootContextDirective,
  ],
})
export class MicrofrontendHostPartComponent {

  private readonly _part = inject(ɵWorkbenchPart);
  private readonly _manifestObjectCache = inject(ManifestObjectCache);
  private readonly _auxiliaryRouteInstaller = inject(WorkbenchAuxiliaryRouteInstaller);
  private readonly _router = inject(Router);
  private readonly _logger = inject(Logger);
  // /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly navigationContext = this.computeNavigationContext();

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendHostPartComponent. [partId=${this._part.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.registerOutletRoutes();
  }

  /**
   * Registers auxiliary routes of top-level primary routes for use as host microfrontend.
   */
  private registerOutletRoutes(): void {
    rootEffect(onCleanup => {
      const context = this.navigationContext();
      if (!context) {
        return undefined;
      }

      untracked(() => {
        const auxiliaryRoutes = this._auxiliaryRouteInstaller.registerAuxiliaryRoutes([context.outlet], {notFoundRoute: true})
        this._logger.debug(() => `Registered auxiliary routes for microfrontend host part: ${context.outlet}`, LoggerNames.ROUTING, auxiliaryRoutes);

        // Perform navigation for Angular to evaluate `CanMatch` guards to display the microfrontend.
        void this._angularRouterMutex.submit(() => this._router.navigate([], {skipLocationChange: true, queryParamsHandling: 'preserve', preserveFragment: true}));

        onCleanup(() => {
          this._logger.debug(() => `Unregistered auxiliary routes for microfrontend host part: ${context.outlet}`, LoggerNames.ROUTING, auxiliaryRoutes);
          this._auxiliaryRouteInstaller.unregisterAuxiliaryRoutes([context.outlet])
        });
      });
    });
  }

  /**
   * Computes the current navigation of this microfrontend part.
   */
  private computeNavigationContext(): Signal<NavigationContext | undefined | null> {
    const context = signal<NavigationContext | undefined | null>(undefined);
    const injector = inject(Injector);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(onCleanup => {
      const {capabilityId, params} = this._part.navigation()!.data as unknown as MicrofrontendPartNavigationData;

      untracked(() => {
        const subscription = this._manifestObjectCache.observeCapability$<WorkbenchPartCapability>(capabilityId).subscribe(capability => {
          context.set(capability && {
            capability,
            params,
            outlet: `microfrontend.host.${this._part.id}.${capability.metadata!.id}`,
            injector: Injector.create({
              parent: injector,
              providers: [provideActivatedMicrofrontend(capability, params)],
            }),
          });
        });
        onCleanup(() => subscription.unsubscribe());
      });
    });
    return context;
  }
}

function provideActivatedMicrofrontend(capability: WorkbenchPartCapability, params: {[name: string]: unknown}): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useValue: new class implements ActivatedMicrofrontend {
      public readonly capability = capability;
      public readonly params = Maps.coerce(params);
    }(),
  };
}

export abstract class ActivatedMicrofrontend<T extends Capability = Capability> {
  public abstract readonly params: Map<string, unknown>;
  public abstract readonly capability: T;
}

/**
 * Context available during a navigation.
 */
interface NavigationContext {
  capability: WorkbenchPartCapability;
  params: Record<string, unknown>;
  outlet: MicrofrontendHostOutlet;
  injector: Injector;
}
