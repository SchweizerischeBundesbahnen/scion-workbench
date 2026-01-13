/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchView} from '../../view/workbench-view.model';
import {CanMatchFn, Params, Route, UrlSegment} from '@angular/router';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {Capability, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {Crypto} from '@scion/toolkit/crypto';
import {MICROFRONTEND_VIEW_NAVIGATION_HINT} from './microfrontend-view-routes';
import {MicrofrontendViewNavigationData} from './microfrontend-view-navigation-data';
import {canMatchWorkbenchView} from '../../routing/workbench-route-guards';

/**
 * Provides the route for migrating legacy microfrontend view navigations.
 *
 * Navigates the view to migrate:
 * - path-based navigation (~/capabilityId) to empty-path, hint-based navigation
 * - capability id to the new format (including capability type in the hash)
 *
 * @deprecated since version 21.0.0-beta.2. Marked for removal in version 23.
 */
export function provideLegacyMicrofrontendViewRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '~/:viewCapabilityId',
        component: MicrofrontendViewNavigationMigrationComponent,
        canMatch: [canMatchLegacyMicrofrontendViewNavigation()],
      }),
      multi: true,
    },
  ]);
}

/**
 * Matches if a legacy microfrontend view navigation.
 */
function canMatchLegacyMicrofrontendViewNavigation(): CanMatchFn {
  return async (route, segments): Promise<boolean> => {
    if (!canMatchWorkbenchView(true)(route, segments)) {
      return false;
    }

    // Guards cannot block waiting for platform startup, as the platform may start later in the bootstrapping, causing a deadlock.
    // Guards are re-evaluated after startup. See `runCanMatchGuardsAfterStartup`.
    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false;
    }

    // Test if a legacy capability id.
    const legacyMicrofrontendViewUrl = parseLegacyMicrofrontendViewUrl(segments);
    return await findCapabilityByLegacyCapabilityId(legacyMicrofrontendViewUrl.legacyCapabilityId) !== null;
  };
}

/**
 * Migrates a legacy microfrontend view path and capability id to the new format.
 */
@Component({
  selector: 'wb-microfrontend-view-navigation-migration',
  template: 'Migrating View...',
})
class MicrofrontendViewNavigationMigrationComponent {

  constructor() {
    void this.migrateView();
  }

  private async migrateView(): Promise<void> {
    const view = inject(WorkbenchView);
    const router = inject(WorkbenchRouter);

    const microfrontendUrl = parseLegacyMicrofrontendViewUrl(view.navigation()!.path);
    const capability = (await findCapabilityByLegacyCapabilityId(microfrontendUrl.legacyCapabilityId))!;

    await router.navigate(layout => layout.navigateView(view.id, [], {
      hint: MICROFRONTEND_VIEW_NAVIGATION_HINT,
      data: {
        capabilityId: capability.metadata!.id,
        params: microfrontendUrl.params,
        referrer: '',
      } satisfies MicrofrontendViewNavigationData,
    }), {skipLocationChange: true, replaceUrl: true});
  }
}

/**
 * Finds a capability by its legacy capability identifier.
 */
async function findCapabilityByLegacyCapabilityId(legacyCapabilityId: string): Promise<Capability | null> {
  const capabilities = inject(ManifestObjectCache).capabilities();
  for (const capability of capabilities.values()) {
    if (legacyCapabilityId === await generateLegacyCapabilityIdentifier(capability)) {
      return capability;
    }
  }
  return null;
}

/**
 * Generates the legacy identifier for given capability.
 */
async function generateLegacyCapabilityIdentifier(capability: Capability): Promise<string> {
  const qualifier = capability.qualifier!;
  const application = capability.metadata!.appSymbolicName;

  // Create identifier consisting of vendor and sorted qualifier entries.
  const identifier = Object.entries(qualifier)
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .reduce(
      (acc, [key, value]) => acc.concat(key).concat(`${value}`),
      [application],
    )
    .join(';');

  // Hash the identifier.
  const identifierHash = await Crypto.digest(identifier);
  // Use the first 7 digits of the hash.
  return identifierHash.substring(0, 7);
}

/**
 * Parses given URL segments, returning capability id and parameters if a legacy microfrontend view URL.
 */
function parseLegacyMicrofrontendViewUrl(segments: UrlSegment[]): {legacyCapabilityId: string; params: Params} {
  return {
    legacyCapabilityId: segments[1]!.path,
    params: segments[1]!.parameters,
  };
}
