/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Injector, signal, Signal, StaticProvider, untracked} from '@angular/core';
import {Capability} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPartCapability} from '@scion/workbench-client';
import {Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {NgTemplateOutlet} from '@angular/common';
import {rootEffect} from '../../common/rxjs-interop.util';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {ComponentType} from '@angular/cdk/portal';
import {RouterOutlet} from '@angular/router';

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

  ],
})
class MicrofrontendHostPartComponent {

  private readonly _manifestObjectCache = inject(ManifestObjectCache);
  private readonly _logger = inject(Logger);
  private readonly _injector = inject(Injector);

  protected readonly part = inject(ɵWorkbenchPart);

  protected readonly navigationContext = this.computeNavigationContext();
  protected readonly outletInjector = this.computeOutletInjector();
  protected readonly component = computed(() => this.navigationContext()?.capability?.properties?.component as ComponentType<unknown> ?? null)

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendHostPartComponent. [partId=${this.part.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
  }

  private computeOutletInjector(): Signal<Injector | undefined> {
    const injector = inject(Injector);

    return computed(() => {
      const context = this.navigationContext();
      if (!context) {
        return undefined;
      }

      return untracked(() => Injector.create({
        parent: injector,
        providers: [provideActivatedMicrofrontend(context)],
      }));
    });
  }

  /**
   * Computes the current navigation of this microfrontend part.
   */
  private computeNavigationContext(): Signal<NavigationContext | undefined> {
    const context = signal<NavigationContext | undefined>(undefined);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(onCleanup => {
      const {capabilityId, params} = this.part.navigation()!.data as unknown as MicrofrontendPartNavigationData;

      untracked(() => {
        const subscription = this._manifestObjectCache.observeCapability$<WorkbenchPartCapability>(capabilityId).subscribe(capability => {
          context.set({capabilityId, capability, params: params});
        });
        onCleanup(() => subscription.unsubscribe());
      });
    });
    return context;
  }
}

export default MicrofrontendHostPartComponent

function provideActivatedMicrofrontend(context: NavigationContext): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useValue: new class implements ActivatedMicrofrontend {
      public readonly capability = context.capability!;
      public readonly params = Maps.coerce(context.params);
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
  capabilityId: string;
  capability: WorkbenchPartCapability | null;
  params: Record<string, unknown>;
}
