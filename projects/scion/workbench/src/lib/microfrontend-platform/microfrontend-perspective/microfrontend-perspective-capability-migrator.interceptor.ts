/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor, ManifestService, Qualifier, QualifierMatcher} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapabilityV2, WorkbenchViewRef} from '@scion/workbench-client';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {UID} from '../../common/uid.util';
import {Beans} from '@scion/toolkit/bean-manager';

/**
 * Asserts perspective capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveCapabilityMigrator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type === WorkbenchCapabilities.Perspective && 'layout' in (capability.properties ?? {})) {
      return this.migrate(capability as WorkbenchPerspectiveCapabilityV1);
    }
    return capability;
  }

  private migrate(perspectiveCapabilityV1: WorkbenchPerspectiveCapabilityV1): WorkbenchPerspectiveCapabilityV2 {
    // TODO [activity] Log deprecation warning and how to migrate!
    const perspectiveProvider = perspectiveCapabilityV1.metadata!.appSymbolicName;
    const [initialPartV1, ...partsV1] = perspectiveCapabilityV1.properties.layout;
    return {
      type: WorkbenchCapabilities.PerspectiveV2,
      qualifier: perspectiveCapabilityV1.qualifier,
      properties: {
        parts: [
          this.migrateInitialPart(initialPartV1, perspectiveProvider),
          ...partsV1.map(partV1 => this.migratePart(partV1, perspectiveProvider)),
        ],
        data: perspectiveCapabilityV1.properties.data,
      },
      metadata: perspectiveCapabilityV1.metadata,
    };
  }

  private migrateInitialPart(initialPartV1: Pick<WorkbenchPerspectivePartV1, 'id' | 'views'>, perspectiveProvider: string): Omit<WorkbenchPartRef, 'position'> {
    const qualifier: Qualifier = {part: `${UID.randomUID()}-auto-generated`, vendor: 'scion', app: perspectiveProvider};
    const partCapability: WorkbenchPartCapability = {
      type: WorkbenchCapabilities.Part,
      qualifier,
      properties: {
        views: initialPartV1.views?.map(view => this.migrateViewRef(view)),
      },
    };

    // Register part capability.
    // TODO [Acticity] We should block, but messaging is not enabled yet. Requires changes in @scion/microfrontend-platform.
    void Beans.get(ManifestService).registerCapability(partCapability);

    return {
      id: initialPartV1.id,
      qualifier,
    };
  }

  private migratePart(partV1: WorkbenchPerspectivePartV1, perspectiveProvider: string): WorkbenchPartRef {
    const qualifier: Qualifier = {part: `${UID.randomUID()}-auto-generated`, vendor: 'scion', app: perspectiveProvider};
    const partCapability: WorkbenchPartCapability = {
      type: WorkbenchCapabilities.Part,
      qualifier,
      properties: {
        views: partV1.views?.map(view => this.migrateViewRef(view)),
      },
    };

    // Register part capability.
    // TODO [Acticity] We should block, but messaging is not enabled yet. Requires changes in @scion/microfrontend-platform.
    void Beans.get(ManifestService).registerCapability(partCapability);

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

// TODO [Acticity] Required because we cannot register an intention in the name of another app (perspective provider).
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPartTransferOwnershipInterceptor implements CapabilityInterceptor {

  private _qualifierMatcher = new QualifierMatcher({part: '*', vendor: 'scion', app: '*'});

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type === WorkbenchCapabilities.Part && this._qualifierMatcher.matches(capability.qualifier)) {
      return {
        ...capability,
        metadata: {
          ...capability.metadata!,
          appSymbolicName: capability.qualifier!['app'] as string,
        },
      };
    }
    return capability;
  }
}
