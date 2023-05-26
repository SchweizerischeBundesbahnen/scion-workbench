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
import {LayoutDefinition, WorkbenchCapabilities, WorkbenchPerspectiveCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {Logger} from '../../logging';
import {Crypto} from '@scion/toolkit/crypto';
import {WorkbenchInitializer} from '../../startup/workbench-initializer';

@Injectable()
export class MicrofrontendPerspectiveDefinitionHandler implements WorkbenchInitializer {

  constructor(private _manifestService: ManifestService,
              private _workbenchService: WorkbenchService,
              private _logger: Logger) {
  }

  public async init(): Promise<void> {
    const workbenchPerspectiveCapabilities: WorkbenchPerspectiveCapability[] = await this.lookupWorkbenchPerspectiveCapabilities();
    for (const perspectiveCapability of workbenchPerspectiveCapabilities) {
      await this.registerPerspective(perspectiveCapability);
    }
  }

  private async registerPerspective(perspectiveCapability: WorkbenchPerspectiveCapability): Promise<void> {
    await this._workbenchService.registerPerspective({
      id: await Crypto.digest(JSON.stringify(perspectiveCapability.qualifier)),
      data: perspectiveCapability.properties.data,
      layout: layout => this.mapLayout(layout, perspectiveCapability.properties.layout),
    });
    this._logger.info(() => 'Registered workbench perspective', perspectiveCapability);
  }

  private mapLayout(layout: WorkbenchLayout, perspectiveLayoutDefinition: LayoutDefinition): WorkbenchLayout {
    return perspectiveLayoutDefinition.parts.reduce((acc, partDef) => layout.addPart(partDef.id, {
        relativeTo: partDef.relativeTo,
        align: partDef.align,
        ratio: partDef.ratio,
      }, {activate: true}),
      layout)
      // TODO testing replace with perspective extension
      .addView('todos', {partId: 'left', activateView: true});
  }

  private lookupWorkbenchPerspectiveCapabilities(): Promise<WorkbenchPerspectiveCapability[]> {
    return firstValueFrom(this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective}));
  }
}
