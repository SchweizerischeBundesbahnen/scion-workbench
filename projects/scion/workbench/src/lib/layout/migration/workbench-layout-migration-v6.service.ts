/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MWorkbenchLayoutV5} from './model/workbench-layout-migration-v5.model';
import {WorkbenchLayoutSerializer} from '../workench-layout-serializer.service';
import {MWorkbenchLayoutV6} from './model/workbench-layout-migration-v6.model';
import {ActivityId, MActivity} from '../../activity/workbench-activity.model';
import {PartId} from '../../part/workbench-part.model';

/**
 * Migrates the workbench layout from version 5 to version 6.
 *
 * Moves the `referencePartId` property from `MActivity` to `MPartGrid`.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV6 implements WorkbenchMigration {

  private readonly _injector = inject(Injector);

  public migrate(json: string): string {
    const workbenchLayoutV5 = JSON.parse(json) as MWorkbenchLayoutV5;

    const workbenchLayoutV6: MWorkbenchLayoutV6 = runInInjectionContext(this._injector, () => ({
      userLayout: this.migrateLayout(workbenchLayoutV5.userLayout),
      referenceLayout: this.migrateLayout(workbenchLayoutV5.referenceLayout),
    }));
    return JSON.stringify(workbenchLayoutV6);
  }

  private migrateLayout(layoutV5: MWorkbenchLayoutV5['referenceLayout'] | MWorkbenchLayoutV5['userLayout']): MWorkbenchLayoutV6['referenceLayout'] | MWorkbenchLayoutV6['userLayout'] {
    const activityLayout = inject(WorkbenchLayoutSerializer).deserializeActivityLayout(layoutV5.activityLayout);
    const activities = [
      ...activityLayout.toolbars.leftTop.activities,
      ...activityLayout.toolbars.leftBottom.activities,
      ...activityLayout.toolbars.rightTop.activities,
      ...activityLayout.toolbars.rightBottom.activities,
      ...activityLayout.toolbars.bottomLeft.activities,
      ...activityLayout.toolbars.bottomRight.activities,
    ];
    const activityGrids = new Map<ActivityId, string>();

    // Move `referencePartId` property from `MActivity` to `MPartGrid`.
    activities.forEach((activity: (MActivity & {referencePartId?: PartId})) => {
      // Add `referencePartId` to `MPartGrid`.
      activityGrids.set(activity.id, this.migrateGrid(layoutV5.grids[activity.id]!, activity.referencePartId!));
      // Remove `referencePartId` from `MActivity`.
      delete activity.referencePartId;
    });

    return {
      activityLayout: inject(WorkbenchLayoutSerializer).serializeActivityLayout(activityLayout),
      grids: {...layoutV5.grids, ...Object.fromEntries(activityGrids)},
      outlets: layoutV5.outlets,
    };
  }

  private migrateGrid(serializedGrid: string, referencePartId: PartId): string {
    const grid = inject(WorkbenchLayoutSerializer).deserializeGrid(serializedGrid);
    grid.referencePartId = referencePartId;
    return inject(WorkbenchLayoutSerializer).serializeGrid(grid);
  }
}
