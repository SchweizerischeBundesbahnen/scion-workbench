/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ManifestService} from '@scion/microfrontend-platform';
import {LayoutDefinition, ViewDefinition, WorkbenchCapabilities, WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {Logger} from '../../logging';
import {WorkbenchInitializer} from '../../startup/workbench-initializer';

@Injectable()
export class MicrofrontendPerspectiveDefinitionHandler implements WorkbenchInitializer {

  constructor(private _manifestService: ManifestService,
              private _workbenchService: WorkbenchService,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    const registeredPerspectivePromises: Promise<void>[] = Array.from(await this.lookupPerspectiveAndExtensionCapabilities())
      .reduce((acc, [perspectiveCapability, extensionCapabilities]) => acc.concat(
          this.registerPerspective(perspectiveCapability, extensionCapabilities),
        )
        , [] as Promise<void>[]);

    // wait until all perspectives are registered
    await Promise.all(registeredPerspectivePromises);
  }

  private async lookupPerspectiveAndExtensionCapabilities(): Promise<Map<WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability[]>> {
    const perspectiveCapabilities = await firstValueFrom(
      this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective}),
    );
    const perspectiveExtensionCapabilities = await firstValueFrom(
      this._manifestService.lookupCapabilities$<WorkbenchPerspectiveExtensionCapability>({type: WorkbenchCapabilities.PerspectiveExtension}),
    );

    return perspectiveCapabilities.reduce((acc, perspectiveCapability) => acc.set(
        perspectiveCapability,
        perspectiveExtensionCapabilities.filter(perspectiveExtensionCapability => perspectiveExtensionCapability.properties.perspectiveId === perspectiveCapability.properties.id))
      , new Map<WorkbenchPerspectiveCapability, WorkbenchPerspectiveExtensionCapability[]>());
  }

  private async registerPerspective(perspectiveCapability: WorkbenchPerspectiveCapability, perspectiveExtensionCapabilities: WorkbenchPerspectiveExtensionCapability[]): Promise<void> {
    const layoutDefinition = perspectiveCapability.properties.layout;
    const viewDefinitions = perspectiveExtensionCapabilities.flatMap(perspectiveExtensionCapability => perspectiveExtensionCapability.properties.views);
    this._logger.debug('Registering workbench perspective', perspectiveCapability.properties.id, layoutDefinition, viewDefinitions);

    await this._workbenchService.registerPerspective({
      id: perspectiveCapability.properties.id,
      data: perspectiveCapability.properties.data,
      layout: layout => this.mapToLayout(layout, layoutDefinition, viewDefinitions),
    });
    this._logger.info('Registered workbench perspective', perspectiveCapability.properties.id);

  }

  private mapToLayout(layout: WorkbenchLayout, layoutDefinition: LayoutDefinition, viewDefinitions: ViewDefinition[]): WorkbenchLayout {
    const layoutWithParts = layoutDefinition.parts.reduce((acc, partDefinition) => acc.addPart(partDefinition.id, {
        relativeTo: partDefinition.relativeTo,
        align: partDefinition.align,
        ratio: partDefinition.ratio,
      }, {activate: partDefinition.activate}),
      layout);

    return viewDefinitions.reduce((acc, viewDefinition) => acc.addView(viewDefinition.id, {
        partId: viewDefinition.partId,
        position: viewDefinition.position,
        activateView: viewDefinition.activateView,
        activatePart: viewDefinition.activatePart,
      }),
      layoutWithParts);
  }
}
