/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, Injectable, IterableDiffers, makeEnvironmentProviders} from '@angular/core';
import {Capability, ManifestService, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapabilityV2, WorkbenchViewCapability, WorkbenchViewRef} from '@scion/workbench-client';
import {WorkbenchService} from '../../workbench.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {firstValueFrom} from 'rxjs';
import {WorkbenchLayoutFactory} from '../../layout/workbench-layout.factory';
import {MicrofrontendViewRoutes} from '../microfrontend-view/microfrontend-view-routes';
import {Logger, LoggerNames} from '../../logging';
import {Objects} from '../../common/objects.util';
import {WorkbenchPerspectiveData} from './workbench-perspective-data';
import {provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer.provider';
import {computeViewId} from '../../workbench.identifiers';
import {createRemoteTranslatable} from '../text/remote-text-provider';
import {MicrofrontendPartNavigationData} from '../microfrontend-part/microfrontend-part-navigation-data';
import {Arrays} from '@scion/toolkit/util';
import {Translatable} from '../../text/workbench-text-provider.model';
import {MICROFRONTEND_PART_NAVIGATION_HINT} from '../microfrontend-part/microfrontend-part-routes';

@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
class MicrofrontendPerspectiveInstallerV2 {

  private readonly _manifestService = inject(ManifestService);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _logger = inject(Logger);

  constructor() {
    const differ = inject(IterableDiffers).find([]).create<WorkbenchPerspectiveCapabilityV2>((_index, perspectiveCapability) => perspectiveCapability.metadata!.id);
    this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapabilityV2>({type: WorkbenchCapabilities.PerspectiveV2})
      .pipe(takeUntilDestroyed())
      .subscribe(perspectiveCapabilities => {
        const changes = differ.diff(perspectiveCapabilities);
        changes?.forEachAddedItem(({item: perspectiveCapability}) => void this.registerPerspective(perspectiveCapability));
      });
  }

  private async registerPerspective(perspectiveCapability: WorkbenchPerspectiveCapabilityV2): Promise<void> {
    return this._workbenchService.registerPerspective({
      id: perspectiveCapability.metadata!.id,
      layout: async (factory: WorkbenchLayoutFactory) => {
        const [initialPartRef, ...partRefs] = perspectiveCapability.properties.parts;

        // Add initial part.
        let layout = await this.addInitialPart(initialPartRef, perspectiveCapability, factory);

        // Add other parts.
        for (const partRef of partRefs) {
          layout = await this.addPart(partRef, perspectiveCapability, layout);
        }
        return layout;
      },
      data: {
        ...perspectiveCapability.properties.data,
        [WorkbenchPerspectiveData.capability]: perspectiveCapability,
      },
    });
  }

  /**
   * Adds the initial part to the layout.
   */
  private async addInitialPart(partRef: Omit<WorkbenchPartRef, 'position'>, perspectiveCapability: WorkbenchPerspectiveCapabilityV2, layoutFactory: WorkbenchLayoutFactory): Promise<WorkbenchLayout> {
    const partCapabilities = await this.lookupCapabilities<WorkbenchPartCapability>(WorkbenchCapabilities.Part, partRef.qualifier, {requester: perspectiveCapability});
    // TODO [activity] Validate params and migrate deprecated params (@scion/microfrontend-platform:  IntentParams.validateParams)
    if (!partCapabilities.length) {
      throw Error(`[PerspectiveDefinitionError] Missing required initial part: Initial part '${partRef.id}' of perspective '${Objects.toMatrixNotation(perspectiveCapability.qualifier)}' from app '${perspectiveCapability.metadata!.appSymbolicName}' does not resolve to any part capabilities.`);
    }
    if (partCapabilities.length > 1) {
      throw Error(`[PerspectiveDefinitionError] Multiple initial parts: Initial part '${partRef.id}' of perspective '${Objects.toMatrixNotation(perspectiveCapability.qualifier)}' from app '${perspectiveCapability.metadata!.appSymbolicName}' resolves to multiple part capabilities.`);
    }
    const partCapability = partCapabilities.at(0)!;

    // Add the initial part to the layout.
    let layout = layoutFactory.addPart(partRef.id, {
      title: createRemotePartTranslatable(partCapability.properties.title || undefined, partCapability, partRef.params), // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
      cssClass: [...Arrays.coerce(partCapability.properties.cssClass), ...Arrays.coerce(partRef.cssClass)],
      activate: partRef.active,
    });

    // Navigate the initial part.
    layout = this.navigatePart(partRef, partCapability, layout);

    // Add views to the initial part.
    for (const viewRef of partCapability.properties.views ?? []) {
      layout = await this.addView(viewRef, partRef, perspectiveCapability, layout);
    }
    return layout;
  }

  /**
   * Adds a part to the layout.
   */
  private async addPart(partRef: WorkbenchPartRef, perspectiveCapability: WorkbenchPerspectiveCapabilityV2, layout: WorkbenchLayout): Promise<WorkbenchLayout> {
    const partCapabilities = await this.lookupCapabilities<WorkbenchPartCapability>(WorkbenchCapabilities.Part, partRef.qualifier, {requester: perspectiveCapability});
    // TODO [activity] Validate params and migrate deprecated params (@scion/microfrontend-platform:  IntentParams.validateParams)

    for (const partCapability of partCapabilities) {
      if (typeof partRef.position === 'string') { // docked part
        const dockedPartExtras = partCapability.properties.extras!;
        layout = layout.addPart(partRef.id, {dockTo: partRef.position}, {
          icon: dockedPartExtras.icon,
          label: createRemotePartTranslatable(dockedPartExtras.label, partCapability, partRef.params),
          title: partCapability.properties.title === false ? false : createRemotePartTranslatable(partCapability.properties.title, partCapability, partRef.params),
          tooltip: createRemotePartTranslatable(dockedPartExtras.tooltip, partCapability, partRef.params),
          cssClass: [...Arrays.coerce(partCapability.properties.cssClass), ...Arrays.coerce(partRef.cssClass)],
          activate: partRef.active,
        });
      }
      else {
        layout = layout.addPart(partRef.id, {
          relativeTo: partRef.position.relativeTo,
          align: partRef.position.align,
          ratio: partRef.position.ratio,
        }, {
          title: createRemotePartTranslatable(partCapability.properties.title || undefined, partCapability, partRef.params), // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
          cssClass: [...Arrays.coerce(partCapability.properties.cssClass), ...Arrays.coerce(partRef.cssClass)],
          activate: partRef.active,
        });
      }

      // Navigate the part.
      layout = this.navigatePart(partRef, partCapability, layout);

      // Add views to the part.
      for (const viewRef of partCapability.properties.views ?? []) {
        layout = await this.addView(viewRef, partRef, perspectiveCapability, layout);
      }
    }

    return layout;
  }

  private navigatePart(partRef: Omit<WorkbenchPartRef, 'position'> | WorkbenchPartRef, partCapability: WorkbenchPartCapability, layout: WorkbenchLayout): WorkbenchLayout {
    if (partCapability.properties.path) {
      layout = layout.navigatePart(partRef.id, [], {
        hint: MICROFRONTEND_PART_NAVIGATION_HINT,
        data: {
          capabilityId: partCapability.metadata!.id,
          params: partRef.params ?? {},
        } satisfies MicrofrontendPartNavigationData,
      });
    }
    return layout;
  }

  private async addView(viewRef: WorkbenchViewRef, partRef: Omit<WorkbenchPartRef, 'position'> | WorkbenchPartRef, perspectiveCapability: WorkbenchPerspectiveCapabilityV2, layout: WorkbenchLayout): Promise<WorkbenchLayout> {
    const viewCapabilities = await this.lookupCapabilities<WorkbenchViewCapability>(WorkbenchCapabilities.View, viewRef.qualifier, {requester: perspectiveCapability});
    // TODO [activity] Validate params and migrate deprecated params (@scion/microfrontend-platform:  IntentParams.validateParams)

    for (const viewCapability of viewCapabilities) {
      const viewCapabilityId = viewCapability.metadata!.id;
      const commands = MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(viewCapabilityId, viewRef.params ?? {});
      const viewId = computeViewId();

      // TODO [activity] When to migrate to hint-based navigation?
      layout = layout
        .addView(viewId, {partId: partRef.id, activateView: viewRef.active})
        .navigateView(viewId, commands, {cssClass: [...Arrays.coerce(viewCapability.properties.cssClass), ...Arrays.coerce(viewRef.cssClass)]});
    }

    return layout;
  }

  /**
   * Looks up capabilities that match the specified qualifier and are accessible to the perspective provider, i.e.,
   * its own capabilities or public capabilities of other applications the perspective  has an intention for.
   */
  private async lookupCapabilities<T extends Capability>(type: string, qualifier: Qualifier, context: {requester: WorkbenchPerspectiveCapabilityV2}): Promise<T[]> {
    const perspective = {
      provider: context.requester.metadata!.appSymbolicName,
      qualifier: context.requester.qualifier,
    };
    const capabilities = await firstValueFrom(this._manifestService.lookupCapabilities$<T>({type, qualifier}));

    const qualifiedCapabilities = new Array<T>();
    for (const capability of capabilities) {
      const qualified = await firstValueFrom(this._manifestService.isApplicationQualified$(perspective.provider, {capabilityId: capability.metadata!.id}));
      if (qualified) {
        qualifiedCapabilities.push(capability);
      }
    }

    if (!qualifiedCapabilities.length && capabilities.length) {
      this._logger.warn(`[NotQualifiedError] Application '${(perspective.provider)}' is not qualified to reference the ${type} capability '${Objects.toMatrixNotation(qualifier)}' in its perspective '${Objects.toMatrixNotation(perspective.qualifier)}'. Ensure the application declares an intention and the capability is not private.`, LoggerNames.MICROFRONTEND);
    }

    // Ensure stable capability order in case multiple capabilities match the qualifier.
    if (qualifiedCapabilities.length) {
      qualifiedCapabilities.sort((capability1, capability2) => capability1.metadata!.id.localeCompare(capability2.metadata!.id));
    }

    return qualifiedCapabilities;
  }
}

function createRemotePartTranslatable(translatable: Translatable, capability: WorkbenchPartCapability, params: {[name: string]: unknown} | undefined): string;
function createRemotePartTranslatable(translatable: Translatable | undefined, capability: WorkbenchPartCapability, params: {[name: string]: unknown} | undefined): string | undefined;
function createRemotePartTranslatable(translatable: Translatable | undefined, capability: WorkbenchPartCapability, params: {[name: string]: unknown} | undefined): string | undefined {
  return createRemoteTranslatable(translatable, {
    appSymbolicName: capability.metadata!.appSymbolicName,
    valueParams: params,
    topicParams: capability.properties.resolve,
  });
}

/**
 * Provides a set of DI providers registering perspectives provided via workbench perspective capabilities.
 */
export function providePerspectiveInstallerV2(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendPerspectiveInstallerV2,
    provideMicrofrontendPlatformInitializer(() => void inject(MicrofrontendPerspectiveInstallerV2)),
  ]);
}
