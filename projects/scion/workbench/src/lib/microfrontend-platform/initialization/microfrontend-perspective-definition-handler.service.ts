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
import {WorkbenchPerspectiveDefinition} from '../../perspective/workbench-perspective.model';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {Logger} from '../../logging';

@Injectable()
export class MicrofrontendPerspectiveDefinitionHandler {

  constructor(private _manifestService: ManifestService,
              private _workbenchService: WorkbenchService,
              private _logger: Logger) {
    this.registerPerspectives().then();
  }

  private async registerPerspectives(): Promise<void> {
    const workbenchPerspectiveCapabilities: WorkbenchPerspectiveCapability[] = await this.lookupWorkbenchPerspectiveCapabilities();

    const wbPerspectives: WorkbenchPerspectiveDefinition[] = [];
    workbenchPerspectiveCapabilities.forEach(perspectiveCapability => this.addToPerspectiveDefinition(perspectiveCapability, wbPerspectives));

    wbPerspectives.forEach(wbPerspective => {
      this._workbenchService.registerPerspective(wbPerspective);
      this._logger.info(() => `Registered workbench perspective ${wbPerspective}`);
    });
  }

  private addToPerspectiveDefinition(perspectiveCapability: WorkbenchPerspectiveCapability, wbPerspectives: WorkbenchPerspectiveDefinition[]): void {
    const wbPerspective: WorkbenchPerspectiveDefinition = {
      id: perspectiveCapability.qualifier.id,
      data: perspectiveCapability.properties.data,
      layout: (layout: WorkbenchLayout) => this.mapLayout(layout, perspectiveCapability.properties.layout),
    };

    wbPerspectives.push(wbPerspective);
  }

  private mapLayout(layout: WorkbenchLayout, layoutDef: LayoutDefinition): WorkbenchLayout {
    for (const partDef of layoutDef.parts) {
      layout = layout.addPart(partDef.id, {relativeTo: partDef.relativeTo, align: partDef.align, ratio: partDef.ratio}, {activate: true});
    }

    // TODO testing replace with perspective extension
    return layout.addView('todos', {partId: 'left', activateView: true});
  }

  private lookupWorkbenchPerspectiveCapabilities(): Promise<WorkbenchPerspectiveCapability[]> {
    return firstValueFrom(this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective}));
  }
}
