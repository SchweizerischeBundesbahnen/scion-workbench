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
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapability, WorkbenchViewCapability, WorkbenchViewRef} from '@scion/workbench-client';
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
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {MicrofrontendPartNavigationData} from '../microfrontend-part/microfrontend-part-navigation-data';
import {Arrays} from '@scion/toolkit/util';
import {Translatable} from '../../text/workbench-text-provider.model';
import {MICROFRONTEND_PART_NAVIGATION_HINT} from '../microfrontend-part/microfrontend-part-routes';
import {Params, ParamValidator} from './param-validator';

/**
 * Registers perspectives provided as workbench perspective capabilities.
 *
 * @see WorkbenchPerspectiveCapability
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveInstaller {

  private readonly _manifestService = inject(ManifestService);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _logger = inject(Logger);
  private readonly _paramValidator = new ParamValidator();

  constructor() {
    const differ = inject(IterableDiffers).find([]).create<WorkbenchPerspectiveCapability>((_index, perspectiveCapability) => perspectiveCapability.metadata!.id);
    this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective})
      .pipe(takeUntilDestroyed())
      .subscribe(perspectiveCapabilities => {
        const changes = differ.diff(perspectiveCapabilities);
        changes?.forEachAddedItem(({item: perspectiveCapability}) => void this.registerPerspective(perspectiveCapability));
      });
  }

  /**
   * Creates and registers a workbench perspective from given perspective capability.
   */
  private async registerPerspective(perspectiveCapability: WorkbenchPerspectiveCapability): Promise<void> {
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
   *
   * - If multiple part capabilities are found, logs an error and uses the first.
   * - If no part capability is found, adds an empty part and logs an error.
   * - If the part is not valid, adds an empty part and logs an error.
   * - A part is navigated only if the capability specifies a path.
   */
  private async addInitialPart(partRef: Omit<WorkbenchPartRef, 'position'>, perspectiveCapability: WorkbenchPerspectiveCapability, layoutFactory: WorkbenchLayoutFactory): Promise<WorkbenchLayout> {
    const partCapability = await this.lookupCapability<WorkbenchPartCapability>(WorkbenchCapabilities.Part, partRef.qualifier, {requester: perspectiveCapability, logLevelIfEmpty: 'error'});
    if (!partCapability) {
      return layoutFactory.addPart(partRef.id, {cssClass: partRef.cssClass, activate: partRef.active});
    }

    // Validate part capability. If not valid, add an empty initial part to the layout.
    if (!this.validatePartCapability(partCapability, partRef, {perspectiveCapability})) {
      return layoutFactory.addPart(partRef.id, {cssClass: partRef.cssClass, activate: partRef.active});
    }

    // Validate params and migrate deprecated params. If not valid, add an empty initial part to the layout.
    const params = this._paramValidator.validatePartParams(partRef.params, partCapability, {perspectiveCapability, partId: partRef.id});
    if (!params) {
      return layoutFactory.addPart(partRef.id, {cssClass: partRef.cssClass, activate: partRef.active});
    }

    // Replace parameters as they may have been migrated.
    partRef.params = params;

    // Add the initial part to the layout.
    let layout = layoutFactory.addPart(partRef.id, {
      title: createCapabilityRemoteTranslatable(partCapability.properties?.title || undefined, partCapability, partRef.params),
      cssClass: [...Arrays.coerce(partCapability.properties?.cssClass), ...Arrays.coerce(partRef.cssClass)],
      activate: partRef.active,
    });

    // Navigate the initial part.
    if (partCapability.properties?.path) {
      layout = this.navigatePart(partRef, partCapability, layout);
    }

    // Add views to the initial part.
    for (const viewRef of partCapability.properties?.views ?? []) {
      layout = await this.addView(viewRef, partRef, partCapability, layout);
    }
    return layout;
  }

  /**
   * Adds given part to the layout.
   *
   * - If multiple part capabilities are found, logs an error and uses the first.
   * - If no part capability is found, ignores the part if a docked part, or adds an empty part otherwise.
   *   No error is logged to support conditional parts, unless there are parts not visible to the perspective provider.
   * - If a relative aligned part and the reference part cannot be found, ignores the part.
   *   No error is logged to support conditional parts, i.e., if aligned relative to a conditional docked part.
   * - If the part is not valid, ignores the part and logs an error.
   * - A part is navigated only if the capability specifies a path.
   */
  private async addPart(partRef: WorkbenchPartRef, perspectiveCapability: WorkbenchPerspectiveCapability, layout: WorkbenchLayout): Promise<WorkbenchLayout> {
    // If a relative aligned part and the reference part cannot be found, ignore the part.
    // Do not log an error to support conditional parts, i.e., if aligned relative to a conditional docked part.
    if (typeof partRef.position === 'object' && partRef.position.relativeTo && !layout.hasPart(partRef.position.relativeTo)) {
      this._logger.debug(`[PerspectiveDefinitionInfo] Perspective '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' aligns part '${partRef.id}' relative to missing part '${partRef.position.relativeTo}'. The reference part may not be available. Ignoring part.`, LoggerNames.MICROFRONTEND);
      return layout;
    }

    // If capability cannot be found, ignore the part if docked, or add an empty part otherwise, required to support layouts with conditional reference parts.
    const partCapability = await this.lookupCapability<WorkbenchPartCapability>(WorkbenchCapabilities.Part, partRef.qualifier, {requester: perspectiveCapability, logLevelIfEmpty: 'debug'});
    if (!partCapability) {
      return typeof partRef.position === 'string' ? layout : layout.addPart(partRef.id, {
        relativeTo: partRef.position.relativeTo,
        align: partRef.position.align,
        ratio: partRef.position.ratio,
      }, {
        activate: partRef.active,
        cssClass: partRef.cssClass,
      });
    }

    // Validate part capability. If not valid, ignore the part.
    if (!this.validatePartCapability(partCapability, partRef, {perspectiveCapability})) {
      return layout;
    }

    // Validate params and migrate deprecated params. If not valid, ignore the part.
    const params = this._paramValidator.validatePartParams(partRef.params, partCapability, {perspectiveCapability, partId: partRef.id});
    if (!params) {
      return layout;
    }

    // Replace parameters as they may have been migrated.
    partRef.params = params;

    if (typeof partRef.position === 'string') { // docked part
      const dockedPartExtras = partCapability.properties!.extras!; // docked parts have been validated to have extras
      layout = layout.addPart(partRef.id, {dockTo: partRef.position}, {
        icon: dockedPartExtras.icon,
        label: createCapabilityRemoteTranslatable(dockedPartExtras.label, partCapability, partRef.params),
        title: partCapability.properties!.title === false ? false : createCapabilityRemoteTranslatable(partCapability.properties!.title, partCapability, partRef.params),
        tooltip: createCapabilityRemoteTranslatable(dockedPartExtras.tooltip, partCapability, partRef.params),
        cssClass: [...Arrays.coerce(partCapability.properties!.cssClass), ...Arrays.coerce(partRef.cssClass)],
        activate: partRef.active,
        ɵactivityId: partRef.ɵactivityId,
      });
    }
    else {
      layout = layout.addPart(partRef.id, {
        relativeTo: partRef.position.relativeTo,
        align: partRef.position.align,
        ratio: partRef.position.ratio,
      }, {
        title: createCapabilityRemoteTranslatable(partCapability.properties?.title || undefined, partCapability, partRef.params),
        activate: partRef.active,
        cssClass: [...Arrays.coerce(partCapability.properties?.cssClass), ...Arrays.coerce(partRef.cssClass)],
      });
    }

    // Navigate the part.
    if (partCapability.properties?.path) {
      layout = this.navigatePart(partRef, partCapability, layout);
    }

    // Add views to the part.
    for (const viewRef of partCapability.properties?.views ?? []) {
      layout = await this.addView(viewRef, partRef, partCapability, layout);
    }

    return layout;
  }

  /**
   * Navigates specified part.
   */
  private navigatePart(partRef: Omit<WorkbenchPartRef, 'position'> | WorkbenchPartRef, partCapability: WorkbenchPartCapability, layout: WorkbenchLayout): WorkbenchLayout {
    return layout.navigatePart(partRef.id, [], {
      hint: MICROFRONTEND_PART_NAVIGATION_HINT,
      data: {
        capabilityId: partCapability.metadata!.id,
        params: partRef.params ?? {},
      } satisfies MicrofrontendPartNavigationData,
    });
  }

  /**
   * Adds given view to specified part.
   *
   * - If multiple view capabilities are found, logs an error and uses the first.
   * - If no view capability is found, ignores the view. No error is logged to support conditional views, unless there are views not visible to the part provider.
   */
  private async addView(viewRef: WorkbenchViewRef, partRef: Omit<WorkbenchPartRef, 'position'> | WorkbenchPartRef, partCapability: WorkbenchPartCapability, layout: WorkbenchLayout): Promise<WorkbenchLayout> {
    const viewCapability = await this.lookupCapability<WorkbenchViewCapability>(WorkbenchCapabilities.View, viewRef.qualifier, {requester: partCapability, logLevelIfEmpty: 'debug'});
    if (!viewCapability) {
      return layout;
    }

    // Validate params and migrate deprecated params.
    const params = this._paramValidator.validateViewParams(viewRef.params, viewCapability, {partCapability});
    if (!params) {
      return layout;
    }

    // Add and navigate view.
    const commands = MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(viewCapability.metadata!.id, params);
    const viewId = computeViewId();

    return layout
      .addView(viewId, {partId: partRef.id, activateView: viewRef.active})
      .navigateView(viewId, commands, {cssClass: [...Arrays.coerce(viewCapability.properties.cssClass), ...Arrays.coerce(viewRef.cssClass)]});
  }

  /**
   * Looks up capabilities matching the specified qualifier and are visible to the requester.
   */
  private async lookupCapability<T extends Capability>(type: string, qualifier: Qualifier, context: {requester: Capability; logLevelIfEmpty: 'debug' | 'error'}): Promise<T | undefined> {
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

    if (visibleCapabilities.length > 1) {
      this._logger.error(`[PerspectiveDefinitionError] Multiple ${type} capabilities found for qualifier '${Objects.toMatrixNotation(qualifier)}' in ${requester.type} '${Objects.toMatrixNotation(requester.qualifier)}' of app '${app(requester)}'. Defaulting to first. Ensure ${type} capabilities to have a unique qualifier.`, LoggerNames.MICROFRONTEND);
    }
    else if (!visibleCapabilities.length && capabilities.length) {
      this._logger.error(`[PerspectiveDefinitionError] Application '${app(requester)}' is not qualified to use ${type} capability '${Objects.toMatrixNotation(qualifier)}' in ${requester.type} '${Objects.toMatrixNotation(requester.qualifier)}'. Ensure to have declared an intention and the capability is not private.`, LoggerNames.MICROFRONTEND);
    }
    else if (!visibleCapabilities.length) {
      const message = `No ${type} capability found for qualifier '${Objects.toMatrixNotation(qualifier)}' in ${requester.type} '${Objects.toMatrixNotation(requester.qualifier)}' of app '${app(requester)}'. The qualifier may be incorrect, the capability not registered, or the providing application not available.`;
      if (context.logLevelIfEmpty === 'error') {
        this._logger.error(`[PerspectiveDefinitionError] ${message}`, LoggerNames.MICROFRONTEND);
      }
      else {
        this._logger.debug(`[PerspectiveDefinitionInfo] ${message}`, LoggerNames.MICROFRONTEND);
      }
    }

    return visibleCapabilities[0];
  }

  /**
   * Validates properties of a part capability.
   *
   * The part:
   * - must not have views if the main area part.
   * - requires a label and icon if a docked part.
   */
  private validatePartCapability(partCapability: WorkbenchPartCapability, partRef: WorkbenchPartRef | Omit<WorkbenchPartRef, 'position'>, context: {perspectiveCapability: WorkbenchPerspectiveCapability}): boolean {
    // Validate main area part not to have views.
    const isMainAreaPart = partRef.id === MAIN_AREA || partRef.id === MAIN_AREA_ALTERNATIVE_ID;
    if (isMainAreaPart && partCapability.properties?.views?.length) {
      this._logger.error(`[PerspectiveDefinitionError] Part '${qualifier(partCapability)}' of app '${app(partCapability)}' is used as main area part in perspective '${qualifier(context.perspectiveCapability)}' and defines views. Views cannot be added to the main area of a perspective. Ignoring part.`, LoggerNames.MICROFRONTEND);
      return false;
    }

    // Validate extras of docked part.
    if ('position' in partRef && typeof partRef.position === 'string') {
      const dockedPartExtras = partCapability.properties?.extras;
      if (!dockedPartExtras?.label || !dockedPartExtras.icon) {
        this._logger.error(`[PerspectiveDefinitionError] Part '${qualifier(partCapability)}' of app '${app(partCapability)}' is used as a docked part in perspective '${qualifier(context.perspectiveCapability)}' but does not define an icon and label. A docked part must define both an icon and a label: { properties: { extras: { icon: '<icon-name>', label: '<text>' } } }. Ignoring part.`, LoggerNames.MICROFRONTEND);
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
    topicParams: capability.properties?.resolve,
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
