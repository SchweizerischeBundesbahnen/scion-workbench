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
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability, WorkbenchPerspectivePartCommand, WorkbenchPerspectiveViewCommand} from '@scion/workbench-client';
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
    for (const [perspectiveCapability, extensionCapabilities] of perspectives.entries()) {
      await this.registerPerspective(perspectiveCapability, extensionCapabilities);
    }
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

  private async registerPerspective(perspective: WorkbenchPerspectiveCapability, extensions: WorkbenchPerspectiveExtensionCapability[]): Promise<void> {
    const parts = perspective.properties.parts;
    const views = extensions.flatMap(perspectiveExtensionCapability => perspectiveExtensionCapability.properties.views);

    await this._workbenchService.registerPerspective({
      id: perspective.metadata!.id,
      data: perspective.properties.data,
      layout: layout => this.createPerspectiveLayout(layout, parts, views),
    });

    this._logger.info('Registered workbench perspective definition', parts, views);
  }

  private async createPerspectiveLayout(layout: WorkbenchLayout, parts: WorkbenchPerspectivePartCommand[], views: WorkbenchPerspectiveViewCommand[]): Promise<WorkbenchLayout> {
    // Add contributed parts to the layout.
    for (const part of parts) {
      layout = layout.addPart(part.id, {
        relativeTo: part.relativeTo,
        align: part.align,
        ratio: part.ratio,
      });
    }

    // Add contributed views to the layout.
    for (const view of views) {
      for (const viewId of await this.resolveViewIds(view)) {
        layout = layout.addView(viewId, {
          partId: view.partId,
          position: view.position,
          activateView: view.active,
        });
      }
    }
    return layout;
  }

  private async resolveViewIds(view: WorkbenchPerspectiveViewCommand): Promise<string[]> {
    // TODO [mfp-perspective] Filter views which the provider has a fulfilling intention for, i.e., visible to the provider and having declared a matching intention
    //                        Idea: this._manifestService.isQualified(app, {for: capabilityId})
    const viewCapabilities = await firstValueFrom(this._manifestService.lookupCapabilities$({
      type: WorkbenchCapabilities.View,
      qualifier: view.qualifier,
    }));

    return viewCapabilities.map(viewCapability => viewCapability.metadata!.id);
  }
}

/**
 * Filters extensions for given perspective.
 */
function filterExtensionsByPerspective(perspective: WorkbenchPerspectiveCapability, perspectiveExtensions: WorkbenchPerspectiveExtensionCapability[]): WorkbenchPerspectiveExtensionCapability[] {
  const perspectiveMatcher = new QualifierMatcher(perspective.qualifier);
  return perspectiveExtensions.filter(perspectiveExtensionCapability => perspectiveMatcher.matches(perspectiveExtensionCapability.properties.perspective));
}
