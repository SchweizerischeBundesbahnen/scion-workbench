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
import {WorkbenchPart} from '../../part/workbench-part.model';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {MICROFRONTEND_PART_NAVIGATION_HINT} from './microfrontend-part-routes';
import {CanMatchFn, Route} from '@angular/router';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {Capability, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {Crypto} from '@scion/toolkit/crypto';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {canMatchWorkbenchPart} from '../../routing/workbench-route-guards';
import {PartId} from '../../workbench.identifiers';

/**
 * Provides the route for migrating legacy microfrontend part navigations.
 *
 * Navigates the part to migrate the capability id to the new format (including capability type in the hash).
 *
 * @deprecated since version 21.0.0-beta.2. Marked for removal in version 23.
 */
export function provideLegacyMicrofrontendPartRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendPartNavigationMigrationComponent,
        canMatch: [canMatchLegacyMicrofrontendPartNavigation()],
      }),
      multi: true,
    },
  ]);
}

/**
 * Matches if a legacy microfrontend part navigation.
 */
function canMatchLegacyMicrofrontendPartNavigation(): CanMatchFn {
  return async (route, segments): Promise<boolean> => {
    if (!canMatchWorkbenchPart(MICROFRONTEND_PART_NAVIGATION_HINT)(route, segments)) {
      return false;
    }

    // Guards cannot block waiting for platform startup, as the platform may start later in the bootstrapping, causing a deadlock.
    // Guards are re-evaluated after startup. See `runCanMatchGuardsAfterStartup`.
    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false;
    }

    const partId = inject(WORKBENCH_OUTLET) as PartId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId});
    const {capabilityId: mayBeLegacyCapabilityId} = part.navigation!.data as unknown as MicrofrontendPartNavigationData;

    // Test if a legacy capability id.
    return await findCapabilityByLegacyCapabilityId(mayBeLegacyCapabilityId) !== null;
  };
}

/**
 * Migrates a legacy microfrontend part capability id to the new format (added capability type to hash).
 */
@Component({
  selector: 'wb-microfrontend-part-navigation-migration',
  template: 'Migrating Part...',
})
class MicrofrontendPartNavigationMigrationComponent {

  constructor() {
    void this.migratePart();
  }

  private async migratePart(): Promise<void> {
    const part = inject(WorkbenchPart);
    const router = inject(WorkbenchRouter);

    const navigationData = part.navigation()!.data as unknown as MicrofrontendPartNavigationData;
    const capability = (await findCapabilityByLegacyCapabilityId(navigationData.capabilityId))!;

    await router.navigate(layout => layout.navigatePart(part.id, [], {
      hint: MICROFRONTEND_PART_NAVIGATION_HINT,
      data: {
        capabilityId: capability.metadata!.id,
        params: navigationData.params,
        referrer: '',
      } satisfies MicrofrontendPartNavigationData,
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
