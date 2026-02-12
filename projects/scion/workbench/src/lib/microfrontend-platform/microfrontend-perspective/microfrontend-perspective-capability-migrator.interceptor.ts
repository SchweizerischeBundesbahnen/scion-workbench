/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor, Qualifier} from '@scion/microfrontend-platform';
import {inject, Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapability, WorkbenchViewRef} from '@scion/workbench-client';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {UID} from '../../common/uid.util';
import {Logger, LoggerNames} from '../../logging';
import {Objects} from '@scion/toolkit/util';

/**
 * Migrates to the new perspective capability model, where parts are modeled as separate part capabilities and views referenced from part capabilities.
 *
 * TODO [Angular 22] Remove with Angular 22.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveCapabilityMigrator implements CapabilityInterceptor {

  private readonly _logger = inject(Logger);

  public async intercept(capability: Capability, manifest: CapabilityInterceptor.Manifest): Promise<Capability> {
    if (capability.type === WorkbenchCapabilities.Perspective && 'layout' in (capability.properties ?? {})) {
      return this.migrate(capability as WorkbenchPerspectiveCapabilityV1, manifest);
    }
    return capability;
  }

  private async migrate(perspectiveCapabilityV1: WorkbenchPerspectiveCapabilityV1, manifest: CapabilityInterceptor.Manifest): Promise<WorkbenchPerspectiveCapability> {
    this._logger.warn(`[PerspectiveDefinitionWarning] Deprecated perspective definition detected. The perspective capability '${Objects.toMatrixNotation(perspectiveCapabilityV1.qualifier)}' of app '${perspectiveCapabilityV1.metadata!.appSymbolicName}' uses a deprecated model. Parts must be modeled as part capabilities and views referenced from part capabilities. To migrate, update @scion/workbench-client to version '1.0.0-beta.34' or higher and refer to the documentation of 'WorkbenchPerspectiveCapability' and 'WorkbenchPartCapability'. Support for the deprecated model will be removed in SCION Workbench version 22.`, LoggerNames.MICROFRONTEND);

    const [initialPartV1, ...partsV1] = perspectiveCapabilityV1.properties.layout;
    return {
      type: WorkbenchCapabilities.Perspective,
      qualifier: perspectiveCapabilityV1.qualifier,
      properties: {
        parts: [
          await this.migrateInitialPart(initialPartV1, manifest),
          ...await Promise.all(partsV1.map(partV1 => this.migratePart(partV1, manifest))),
        ],
        data: perspectiveCapabilityV1.properties.data,
      },
      metadata: perspectiveCapabilityV1.metadata,
    };
  }

  /**
   * Migrates the initial part to the new part model.
   *
   * Parts are modeled as separate part capabilities and views referenced from part capabilities.
   */
  private async migrateInitialPart(initialPartV1: Pick<WorkbenchPerspectivePartV1, 'id' | 'views'>, manifest: CapabilityInterceptor.Manifest): Promise<Omit<WorkbenchPartRef, 'position'>> {
    const qualifier: Qualifier = {part: `${UID.randomUID()}-auto-generated`};

    // Register part capability.
    await manifest.addCapability({
      type: WorkbenchCapabilities.Part,
      qualifier,
      properties: {
        views: initialPartV1.views?.map(view => this.migrateViewRef(view)),
      },
    } satisfies WorkbenchPartCapability);

    // Return part reference.
    return {
      id: initialPartV1.id,
      qualifier,
    };
  }

  /**
   * Migrates a part to the new part model.
   *
   * Parts are modeled as separate part capabilities and views referenced from part capabilities.
   */
  private async migratePart(partV1: WorkbenchPerspectivePartV1, manifest: CapabilityInterceptor.Manifest): Promise<WorkbenchPartRef> {
    const qualifier: Qualifier = {part: `${UID.randomUID()}-auto-generated`};

    // Register part capability.
    await manifest.addCapability({
      type: WorkbenchCapabilities.Part,
      qualifier,
      properties: {
        views: partV1.views?.map(view => this.migrateViewRef(view)),
      },
    } satisfies WorkbenchPartCapability);

    // Return part reference.
    return {
      id: partV1.id,
      qualifier,
      position: {
        relativeTo: partV1.relativeTo,
        align: partV1.align,
        ratio: partV1.ratio,
      },
    };
  }

  /**
   * Migrates a view to the new view model.
   */
  private migrateViewRef(viewRefV1: WorkbenchPerspectiveViewV1): WorkbenchViewRef {
    return {
      qualifier: viewRefV1.qualifier,
      params: viewRefV1.params,
      active: viewRefV1.active,
      cssClass: viewRefV1.cssClass,
    };
  }
}

interface WorkbenchPerspectiveCapabilityV1 extends Capability {
  type: WorkbenchCapabilities.Perspective;
  qualifier: Qualifier;
  properties: {
    layout: [Pick<WorkbenchPerspectivePartV1, 'id' | 'views'>, ...WorkbenchPerspectivePartV1[]];
    data?: {[key: string]: unknown};
  };
}

interface WorkbenchPerspectivePartV1 {
  id: string | MAIN_AREA;
  relativeTo?: string;
  align: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  views?: WorkbenchPerspectiveViewV1[];
}

interface WorkbenchPerspectiveViewV1 {
  qualifier: Qualifier;
  params?: {[name: string]: unknown};
  active?: boolean;
  cssClass?: string | string[];
}
