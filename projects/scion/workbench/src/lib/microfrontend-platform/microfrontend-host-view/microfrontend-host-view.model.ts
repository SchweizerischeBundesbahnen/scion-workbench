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
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {MicrofrontendViewNavigationData} from '../microfrontend-view/microfrontend-view-navigation-data';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {Maps} from '@scion/toolkit/util';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {throwError} from '../../common/throw-error.util';
import {Routing} from '../../routing/routing.util';

/** @inheritDoc */
export class MicrofrontendHostView implements ActivatedMicrofrontend {

  public readonly capability: Signal<WorkbenchViewCapability>;
  public readonly params: Signal<Map<string, unknown>>;
  public readonly referrer: Signal<string>;

  constructor(view: ɵWorkbenchView) {
    const navigationData = computed(() => view.navigation()!.data as unknown as MicrofrontendViewNavigationData);
    this.capability = this.trackViewCapability(navigationData);
    this.params = computed(() => Maps.coerce(navigationData().params));
    this.referrer = computed(() => navigationData().referrer);
    this.setViewProperties(view);
    this.runCanMatchGuardsIfCapabilityNotFound(navigationData);
  }

  private setViewProperties(view: ɵWorkbenchView): void {
    // Unset view state on capability change.
    effect(() => {
      const capability = this.capability();

      untracked(() => {
        view.title = null;
        view.heading = null;
        view.classList.application = capability.properties.cssClass;
        view.closable = capability.properties.closable ?? true;
        view.dirty = false;
      });
    });

    // Set title and heading on both capability and parameter changes to substitute interpolation parameters.
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        // Compute title, if configured.
        if (capability.properties.title) {
          view.title = createRemoteTranslatable(capability.properties.title, {appSymbolicName: capability.metadata!.appSymbolicName, valueParams: params, topicParams: capability.properties.resolve});
        }
        // Compute heading, if configured.
        if (capability.properties.heading) {
          view.heading = createRemoteTranslatable(capability.properties.heading, {appSymbolicName: capability.metadata!.appSymbolicName, valueParams: params, topicParams: capability.properties.resolve});
        }
      });
    });
  }

  private trackViewCapability(navigationData: Signal<MicrofrontendViewNavigationData>): Signal<WorkbenchViewCapability> {
    const capability = inject(ManifestObjectCache).capability<WorkbenchViewCapability>(computed(() => navigationData().capabilityId));

    return linkedSignal({
      source: capability,
      computation: (capability, previous) => {
        if (capability) {
          return capability;
        }

        // Fallback to previous capability, e.g., when unregistering the part capability while the part is open. See `runCanMatchGuardsIfCapabilityNotFound`.
        return previous?.value ?? throwError(`[NullCapabilityError] View capability '${navigationData().capabilityId}' not found.`);
      },
    });
  }

  /**
   * Instructs Angular to evaluate `CanMatch` route guards to display the "Not Found" page when unregistering the view capability while the view is open.
   */
  private runCanMatchGuardsIfCapabilityNotFound(navigationData: Signal<MicrofrontendViewNavigationData>): void {
    const injector = inject(Injector);
    const capability = inject(ManifestObjectCache).capability<WorkbenchViewCapability>(computed(() => navigationData().capabilityId));

    effect(() => {
      if (!capability()) {
        untracked(() => void Routing.runCanMatchGuards({injector}));
      }
    });
  }
}
