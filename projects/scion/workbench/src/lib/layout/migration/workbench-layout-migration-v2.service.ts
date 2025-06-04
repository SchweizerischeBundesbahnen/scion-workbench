/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {PerspectiveDataV1} from './model/workbench-layout-migration-v1.model';
import {MPerspectiveLayoutV2} from './model/workbench-layout-migration-v2.model';
import {Commands} from '../../routing/routing.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';

/**
 * Migrates the perspective layout from version 1 to version 2.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV2 implements WorkbenchMigration {

  public migrate(json: string): string {
    const perspectiveDataV1 = JSON.parse(json) as PerspectiveDataV1;
    const perspectiveLayoutV2: MPerspectiveLayoutV2 = {
      userLayout: {
        workbenchGrid: perspectiveDataV1.workbenchGrid,
        viewOutlets: this.migrateViewOutlets(perspectiveDataV1.viewOutlets),
      },
      referenceLayout: {
        workbenchGrid: perspectiveDataV1.initialWorkbenchGrid,
        viewOutlets: JSON.stringify({}),
      },
    };
    return JSON.stringify(perspectiveLayoutV2);
  }

  private migrateViewOutlets(viewOutlets: {[viewId: string]: Commands}): string {
    return JSON.stringify(Object.fromEntries(Object.entries(viewOutlets)
      .map(([viewId, commands]: [string, Commands]): [string, MUrlSegmentV2[]] => {
        return [viewId, commandsToSegments(commands)];
      }),
    ));
  }
}

function commandsToSegments(commands: Commands): MUrlSegmentV2[] {
  const segments = new Array<MUrlSegmentV2>();

  commands.forEach(command => {
    if (typeof command === 'string') {
      segments.push({path: command, parameters: {}});
    }
    else {
      segments.at(-1)!.parameters = command as Record<string, string>;
    }
  });

  return segments;
}

interface MUrlSegmentV2 {
  path: string;
  parameters: {[name: string]: string};
}
