/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {computed, effect, inject, Injector, linkedSignal, Signal, untracked} from '@angular/core';
import {WorkbenchPartCapability} from '@scion/workbench-client';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {throwError} from '../../common/throw-error.util';
import {Maps} from '@scion/toolkit/util';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {MicrofrontendPartNavigationData} from '../microfrontend-part/microfrontend-part-navigation-data';
import {Routing} from '../../routing/routing.util';

/** @inheritDoc */
export class MicrofrontendHostPart implements ActivatedMicrofrontend {

  public readonly capability: Signal<WorkbenchPartCapability>;
  public readonly params: Signal<Map<string, unknown>>;
  public readonly referrer: Signal<string>;

  constructor(part: ɵWorkbenchPart) {
    const navigationData = computed(() => part.navigation()!.data as unknown as MicrofrontendPartNavigationData);
    this.capability = this.trackPartCapability(navigationData);
    this.params = computed(() => Maps.coerce(navigationData().params));
    this.referrer = computed(() => navigationData().referrer);
    this.runCanMatchGuardsIfCapabilityNotFound(navigationData);
  }

  private trackPartCapability(navigationData: Signal<MicrofrontendPartNavigationData>): Signal<WorkbenchPartCapability> {
    const capability = inject(ManifestObjectCache).capability<WorkbenchPartCapability>(computed(() => navigationData().capabilityId));

    return linkedSignal({
      source: capability,
      computation: (capability, previous) => {
        if (capability) {
          return capability;
        }

        // Fallback to previous capability, e.g., when unregistering the part capability while the part is open. See `runCanMatchGuardsIfCapabilityNotFound`.
        return previous?.value ?? throwError(`[NullCapabilityError] Part capability '${navigationData().capabilityId}' not found.`);
      },
    });
  }

  /**
   * Instructs Angular to evaluate `CanMatch` route guards to display the "Not Found" page when unregistering the part capability while the part is open.
   */
  private runCanMatchGuardsIfCapabilityNotFound(navigationData: Signal<MicrofrontendPartNavigationData>): void {
    const injector = inject(Injector);
    const capability = inject(ManifestObjectCache).capability<WorkbenchPartCapability>(computed(() => navigationData().capabilityId));

    effect(() => {
      if (!capability()) {
        untracked(() => void Routing.runCanMatchGuards({injector}));
      }
    });
  }
}
