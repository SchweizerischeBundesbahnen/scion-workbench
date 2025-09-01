/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, IterableDiffers} from '@angular/core';
import {Capability, ManifestService, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapabilityV2, WorkbenchViewCapability, WorkbenchViewRef} from '@scion/workbench-client';
import {WorkbenchService} from '../../workbench.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MAIN_AREA, MAIN_AREA_ALTERNATIVE_ID, WorkbenchLayout} from '../../layout/workbench-layout';
import {firstValueFrom} from 'rxjs';
import {WorkbenchLayoutFactory} from '../../layout/workbench-layout.factory';
import {MicrofrontendViewRoutes} from '../microfrontend-view/microfrontend-view-routes';
import {Logger, LoggerNames} from '../../logging';
import {Objects} from '../../common/objects.util';
import {WorkbenchPerspectiveData} from './workbench-perspective-data';
import {computeViewId} from '../../workbench.identifiers';
import {createRemoteTranslatable} from '../text/remote-text-provider';
import {MicrofrontendPartNavigationData} from '../microfrontend-part/microfrontend-part-navigation-data';
import {Arrays} from '@scion/toolkit/util';
import {Translatable} from '../../text/workbench-text-provider.model';
import {MICROFRONTEND_PART_NAVIGATION_HINT} from '../microfrontend-part/microfrontend-part-routes';
import {Params, ParamValidator} from './param-validator';

/**
 * Registers perspectives provided as workbench perspective capabilities.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveInstaller {

  private readonly _manifestService = inject(ManifestService);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _logger = inject(Logger);
  private readonly _paramValidator = new ParamValidator();

  constructor() {
    const differ = inject(IterableDiffers).find([]).create<WorkbenchPerspectiveCapabilityV2>((_index, perspectiveCapability) => perspectiveCapability.metadata!.id);
    this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapabilityV2>({type: WorkbenchCapabilities.Perspective})
      .pipe(takeUntilDestroyed())
      .subscribe(perspectiveCapabilities => {
        const changes = differ.diff(perspectiveCapabilities);
        changes?.forEachAddedItem(({item: perspectiveCapability}) => void this.registerPerspective(perspectiveCapability));
      });
  }

  /**
   * Creates and registers a workbench perspective from given perspective capability.
   */
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
   * Adds given part as the initial part to the layout.
   */
  private async addInitialPart(partRef: Omit<WorkbenchPartRef, 'position'>, perspectiveCapability: WorkbenchPerspectiveCapabilityV2, layoutFactory: WorkbenchLayoutFactory): Promise<WorkbenchLayout> {
    const partCapabilities = await this.lookupCapabilities<WorkbenchPartCapability>(WorkbenchCapabilities.Part, partRef.qualifier, {requester: perspectiveCapability});

    // Expect single initial part.
    if (!partCapabilities.length) {
      this._logger.error(`[PerspectiveDefinitionError] Missing required initial part: The initial part '${partRef.id}' of perspective capability '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' does not resolve to any part capabilities.`, LoggerNames.MICROFRONTEND);
      return layoutFactory.addPart(partRef.id);
    }
    if (partCapabilities.length > 1) {
      this._logger.error(`[PerspectiveDefinitionError] Multiple initial parts: The initial part '${partRef.id}' of perspective capability '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' resolves to multiple part capabilities.`, LoggerNames.MICROFRONTEND);
      return layoutFactory.addPart(partRef.id);
    }
    const [partCapability] = partCapabilities as [WorkbenchPartCapability];

    // Validate part capability.
    if (!this.validatePartCapability(partCapability, partRef, {perspectiveCapability})) {
      return layoutFactory.addPart(partRef.id);
    }

    // Validate params and migrate deprecated params.
    const params = this._paramValidator.validatePartParams(partRef.params, partCapability, {perspectiveCapability, partId: partRef.id});
    if (!params) {
      return layoutFactory.addPart(partRef.id);
    }
    partRef.params = params;

    // Add the initial part to the layout.
    let layout = layoutFactory.addPart(partRef.id, {
      title: createCapabilityRemoteTranslatable(partCapability.properties.title || undefined, partCapability, partRef.params),
      cssClass: [...Arrays.coerce(partCapability.properties.cssClass), ...Arrays.coerce(partRef.cssClass)],
      activate: partRef.active,
    });

    // Navigate the initial part.
    layout = this.navigatePart(partRef, partCapability, layout);

    // Add views to the initial part.
    for (const viewRef of partCapability.properties.views ?? []) {
      layout = await this.addView(viewRef, partRef, partCapability, layout);
    }
    return layout;
  }

  /**
   * Adds given part to the layout.
   */
  private async addPart(partRef: WorkbenchPartRef, perspectiveCapability: WorkbenchPerspectiveCapabilityV2, layout: WorkbenchLayout): Promise<WorkbenchLayout> {
    const partCapabilities = await this.lookupCapabilities<WorkbenchPartCapability>(WorkbenchCapabilities.Part, partRef.qualifier, {requester: perspectiveCapability});

    for (const partCapability of partCapabilities) {
      // Validate part capability.
      if (!this.validatePartCapability(partCapability, partRef, {perspectiveCapability})) {
        break;
      }

      // Validate params and migrate deprecated params.
      const params = this._paramValidator.validatePartParams(partRef.params, partCapability, {perspectiveCapability, partId: partRef.id});
      if (!params) {
        break;
      }
      partRef.params = params;

      if (typeof partRef.position === 'string') { // docked part
        const dockedPartExtras = partCapability.properties.extras!;
        layout = layout.addPart(partRef.id, {dockTo: partRef.position}, {
          icon: dockedPartExtras.icon,
          label: createCapabilityRemoteTranslatable(dockedPartExtras.label, partCapability, partRef.params),
          title: partCapability.properties.title === false ? false : createCapabilityRemoteTranslatable(partCapability.properties.title, partCapability, partRef.params),
          tooltip: createCapabilityRemoteTranslatable(dockedPartExtras.tooltip, partCapability, partRef.params),
          cssClass: [...Arrays.coerce(partCapability.properties.cssClass), ...Arrays.coerce(partRef.cssClass)],
          activate: partRef.active,
        });
      }
      else if (!partRef.position.relativeTo || layout.hasPart(partRef.position.relativeTo)) {
        layout = layout.addPart(partRef.id, {
          relativeTo: partRef.position.relativeTo,
          align: partRef.position.align,
          ratio: partRef.position.ratio,
        }, {
          title: createCapabilityRemoteTranslatable(partCapability.properties.title || undefined, partCapability, partRef.params),
          cssClass: [...Arrays.coerce(partCapability.properties.cssClass), ...Arrays.coerce(partRef.cssClass)],
          activate: partRef.active,
        });
      }
      else {
        this._logger.error(`[PerspectiveDefinitionError] Missing required part: The perspective capability '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' aligns the part '${partRef.id}' relative to the missing part '${partRef.position.relativeTo}'.`, LoggerNames.MICROFRONTEND);
        break;
      }

      // Navigate the part.
      layout = this.navigatePart(partRef, partCapability, layout);

      // Add views to the part.
      for (const viewRef of partCapability.properties.views ?? []) {
        layout = await this.addView(viewRef, partRef, partCapability, layout);
      }
    }

    return layout;
  }

  /**
   * Navigates specified part if declaring a path.
   */
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

  /**
   * Adds specified view to specified part.
   */
  private async addView(viewRef: WorkbenchViewRef, partRef: Omit<WorkbenchPartRef, 'position'> | WorkbenchPartRef, partCapability: WorkbenchPartCapability, layout: WorkbenchLayout): Promise<WorkbenchLayout> {
    const viewCapabilities = await this.lookupCapabilities<WorkbenchViewCapability>(WorkbenchCapabilities.View, viewRef.qualifier, {requester: partCapability});

    for (const viewCapability of viewCapabilities) {
      // Validate params and migrate deprecated params.
      const params = this._paramValidator.validateViewParams(partRef.params, viewCapability, {partCapability});
      if (!params) {
        break;
      }

      // Add and navigate view.
      const commands = MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(viewCapability.metadata!.id, params);
      const viewId = computeViewId();

      layout = layout
        .addView(viewId, {partId: partRef.id, activateView: viewRef.active})
        .navigateView(viewId, commands, {cssClass: [...Arrays.coerce(viewCapability.properties.cssClass), ...Arrays.coerce(viewRef.cssClass)]});
    }

    return layout;
  }

  /**
   * Looks up capabilities matching the specified qualifier and are visible to the requester.
   */
  private async lookupCapabilities<T extends Capability>(type: string, qualifier: Qualifier, context: {requester: Capability}): Promise<T[]> {
    const {requester} = context;
    const capabilities = await firstValueFrom(this._manifestService.lookupCapabilities$<T>({type, qualifier}));

    // Filter capabilities visible to the requester.
    const visibleCapabilities = new Array<T>();
    for (const capability of capabilities) {
      const visible = await firstValueFrom(this._manifestService.isApplicationQualified$(requester.metadata!.appSymbolicName, {capabilityId: capability.metadata!.id}));
      if (visible) {
        visibleCapabilities.push(capability);
      }
    }

    if (!capabilities.length) {
      this._logger.debug(`[NullProviderError] Cannot find ${type} capability '${Objects.toMatrixNotation(qualifier)}' referenced in ${requester.type} capability '${Objects.toMatrixNotation(requester.qualifier)}' of app '${app(requester)}'. Maybe, the capability does not exist or the providing application is not available.`, LoggerNames.MICROFRONTEND);
    }

    if (!visibleCapabilities.length && capabilities.length) {
      this._logger.warn(`[NotQualifiedError] Application '${app(requester)}' is not qualified to reference ${type} capability '${Objects.toMatrixNotation(qualifier)}' in ${requester.type} capability '${Objects.toMatrixNotation(requester.qualifier)}'. Ensure to have declared an intention and the capability is not private.`, LoggerNames.MICROFRONTEND);
    }

    // Ensure stable capability order if multiple capabilities are found.
    if (visibleCapabilities.length) {
      visibleCapabilities.sort((capability1, capability2) => capability1.metadata!.id.localeCompare(capability2.metadata!.id));
    }

    return visibleCapabilities;
  }

  /**
   * Validates properties of a part capability.
   */
  private validatePartCapability(partCapability: WorkbenchPartCapability, partRef: WorkbenchPartRef | Omit<WorkbenchPartRef, 'position'>, context: {perspectiveCapability: WorkbenchPerspectiveCapabilityV2}): boolean {
    // Validate main area part not to have views.
    const isMainAreaPart = partRef.id === MAIN_AREA || partRef.id === MAIN_AREA_ALTERNATIVE_ID;
    if (isMainAreaPart && partCapability.properties.views?.length) {
      this._logger.error(`[PartDefinitionError] Views not allowed in the main area part: The part capability '${qualifier(partCapability)}' of app '${app(partCapability)}' is used as main area part in the perspective '${qualifier(context.perspectiveCapability)}' and must not have views.`, LoggerNames.MICROFRONTEND);
      return false;
    }

    // Validate extras of docked part.
    if ('position' in partRef && typeof partRef.position === 'string') {
      const dockedPartExtras = partCapability.properties.extras;
      if (!dockedPartExtras?.label || !dockedPartExtras.icon) {
        this._logger.error(`[PartDefinitionError] Part capability requires the 'extras' property with 'label' and 'icon': The part capability '${qualifier(partCapability)}' of app '${app(partCapability)}' requires a label and icon as it is used as docked part in the perspective '${qualifier(context.perspectiveCapability)}.`, LoggerNames.MICROFRONTEND);
        return false;
      }
    }

    return true;
  }
}

/**
 * Creates a remote translatable from given translatable for given capability.
 */
function createCapabilityRemoteTranslatable(translatable: Translatable, capability: WorkbenchPartCapability, params: Params | undefined): string;
function createCapabilityRemoteTranslatable(translatable: Translatable | undefined, capability: WorkbenchPartCapability, params: Params | undefined): string | undefined;
function createCapabilityRemoteTranslatable(translatable: Translatable | undefined, capability: WorkbenchPartCapability, params: Params | undefined): string | undefined {
  return createRemoteTranslatable(translatable, {
    appSymbolicName: capability.metadata!.appSymbolicName,
    valueParams: params,
    topicParams: capability.properties.resolve,
  });
}

/**
 * Returns the qualifier as string.
 */
function qualifier(capability: Capability): string {
  return Objects.toMatrixNotation(capability.qualifier);
}

/**
 * Returns the app symbolic name.
 */
function app(capability: Capability): string {
  return capability.metadata!.appSymbolicName;
}
