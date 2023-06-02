/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ManifestService, QualifierMatcher} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability, WorkbenchPerspectiveViewContribution} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {Logger} from '../../logging';
import {WorkbenchInitializer} from '../../startup/workbench-initializer';

@Injectable()
export class MicrofrontendPerspectiveRegistrator implements WorkbenchInitializer {

  constructor(private _manifestService: ManifestService,
              private _workbenchService: WorkbenchService,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    // Look up contributed perspectives and extensions from the manifest registry.
    const perspectives = await this.lookupPerspectiveCapabilities();

    // Register contributed perspectives.
    for (const [perspectiveCapability, perspectiveExtensionCapabilities] of perspectives.entries()) {
      await this._workbenchService.registerPerspective({
        id: perspectiveCapability.metadata!.id,
        data: perspectiveCapability.properties.data,
        layout: layout => this.createPerspectiveLayout(layout, perspectiveCapability, perspectiveExtensionCapabilities),
      });

      this._logger.info('Registered workbench perspective definition', perspectiveCapability.qualifier);
    }
  }

  private async createPerspectiveLayout(layout: WorkbenchLayout, perspectiveCapability: WorkbenchPerspectiveCapability, perspectiveExtensionCapabilities: WorkbenchPerspectiveExtensionCapability[]): Promise<WorkbenchLayout> {
    // Add contributed parts to the layout.
    for (const partContribution of perspectiveCapability.properties.parts) {
      layout = layout.addPart(partContribution.id, {
        relativeTo: partContribution.relativeTo,
        align: partContribution.align,
        ratio: partContribution.ratio,
      });
    }

    // Add contributed views to the layout.
    for (const perspectiveExtension of perspectiveExtensionCapabilities) {
      for (const viewContribution of perspectiveExtension.properties.views) {
        for (const viewId of await this.resolveViewIds(viewContribution, perspectiveExtension.metadata!.appSymbolicName)) {
          layout = layout.addView(viewId, {
            partId: viewContribution.partId,
            position: viewContribution.position,
            activateView: viewContribution.active,
          });
        }
      }
    }
    return layout;
  }

  private async resolveViewIds(view: WorkbenchPerspectiveViewContribution, providerSymbolicName: string): Promise<string[]> {
    // TODO [mfp-perspective] Filter views which the provider has a fulfilling intention for, i.e., visible to the provider and having declared a matching intention
    //                        Idea: this._manifestService.isQualified(app, {for: capabilityId})
    const viewCapabilities = await firstValueFrom(this._manifestService.lookupCapabilities$({
      type: WorkbenchCapabilities.View,
      qualifier: view.qualifier,
    }));

    return viewCapabilities.map(viewCapability => viewCapability.metadata!.id);
  }

  private async lookupPerspectiveCapabilities(): Promise<Map<WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability[]>> {
    const perspectiveCapabilities: WorkbenchPerspectiveCapability[] = await firstValueFrom(this._manifestService.lookupCapabilities$({type: WorkbenchCapabilities.Perspective}));
    const perspectiveExtensionCapabilities: WorkbenchPerspectiveExtensionCapability[] = await firstValueFrom(this._manifestService.lookupCapabilities$({type: WorkbenchCapabilities.PerspectiveExtension}));

    const result = new Map<WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability[]>();
    for (const perspectiveCapability of perspectiveCapabilities) {
      // TODO [mfp-perspective] Filter extensions which have a fulfilling intention for the perspective, i.e., visible to the provider and having declared a matching intention
      //                        Idea: this._manifestService.isQualified(app, {for: capabilityId})
      result.set(perspectiveCapability, filterExtensionsByPerspective(perspectiveCapability, perspectiveExtensionCapabilities));
    }
    return result;
  }
}

/**
 * Filters extensions for given perspective.
 */
function filterExtensionsByPerspective(perspective: WorkbenchPerspectiveCapability, perspectiveExtensions: WorkbenchPerspectiveExtensionCapability[]): WorkbenchPerspectiveExtensionCapability[] {
  const perspectiveMatcher = new QualifierMatcher(perspective.qualifier);
  return perspectiveExtensions.filter(perspectiveExtensionCapability => perspectiveMatcher.matches(perspectiveExtensionCapability.properties.perspective));
}
