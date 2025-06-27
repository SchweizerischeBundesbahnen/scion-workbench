/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Injector} from '@angular/core';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MWorkbenchLayoutV5} from './model/workbench-layout-migration-v5.model';
import {ɵWorkbenchLayoutFactory} from '../ɵworkbench-layout.factory';
import {WorkbenchLayoutSerializer} from '../workench-layout-serializer.service';
import {MWorkbenchLayoutV6} from './model/workbench-layout-migration-v6.model';
import {WorkbenchLayouts} from '../workbench-layouts.util';
import {MActivityLayout} from '../../activity/workbench-activity.model';
import {ɵWorkbenchLayout} from '../ɵworkbench-layout';
import {PartId} from '../../part/workbench-part.model';

/**
 * Migrates the workbench layout from version 5 to version 6.
 *
 * Migrates the `referencePartId` property of the `MActivity` to the `MPart`.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV6 implements WorkbenchMigration {

  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _injector = inject(Injector);

  public migrate(json: string): string {
    const workbenchLayoutV5 = JSON.parse(json) as MWorkbenchLayoutV5;
    const workbenchLayoutSerializer = this._injector.get(WorkbenchLayoutSerializer);

    // Migrate user layout.
    const userLayoutV6 = this.migrateReferencePart(workbenchLayoutV5.userLayout);

    // Migrate reference layout.
    const referenceLayoutV6 = this.migrateReferencePart(workbenchLayoutV5.referenceLayout);

    const workbenchSerializer = workbenchLayoutSerializer;
    const workbenchLayoutV6: MWorkbenchLayoutV6 = {
      userLayout: {
        grids: workbenchSerializer.serializeGrids(userLayoutV6.grids),
        activityLayout: workbenchSerializer.serializeActivityLayout(userLayoutV6.activityLayout),
        outlets: workbenchSerializer.serializeOutlets(userLayoutV6.outlets({mainGrid: true, activityGrids: true})),
      },
      referenceLayout: {
        grids: workbenchSerializer.serializeGrids(referenceLayoutV6.grids),
        activityLayout: workbenchSerializer.serializeActivityLayout(referenceLayoutV6.activityLayout),
        outlets: workbenchSerializer.serializeOutlets(referenceLayoutV6.outlets({mainGrid: true, activityGrids: true})),
      },
    };
    return JSON.stringify(workbenchLayoutV6);
  }

  private migrateReferencePart(layout: Layout): ɵWorkbenchLayout {
    const workbenchLayoutSerializer = this._injector.get(WorkbenchLayoutSerializer);

    const activityLayout = workbenchLayoutSerializer.deserializeActivityLayout(layout.activityLayout);
    const referencePartIds = collectReferencePartIds(activityLayout);

    const migratedActivityGrids = WorkbenchLayouts.pickActivityGrids(WorkbenchLayouts.pickActivityGrids(layout.grids), grid => {
      const deserialized = workbenchLayoutSerializer.deserializeGrid(grid);
      const parts = WorkbenchLayouts.collectParts(deserialized.root);
      parts.forEach(part => part.referencePart = referencePartIds.has(part.id));
      return deserialized;
    });

    return this._workbenchLayoutFactory.create({
      grids: {
        main: layout.grids.main,
        ...migratedActivityGrids,
      },
      activityLayout: layout.activityLayout,
      outlets: layout.outlets,
    });
  }
}

function collectReferencePartIds(activityLayout: MActivityLayout): Set<PartId> {
  const partIds = new Set<PartId>();
  [
    ...activityLayout.toolbars.leftTop.activities.map(activity => (activity as unknown as {referencePartId: PartId}).referencePartId),
    ...activityLayout.toolbars.leftBottom.activities.map(activity => (activity as unknown as {referencePartId: PartId}).referencePartId),
    ...activityLayout.toolbars.rightTop.activities.map(activity => (activity as unknown as {referencePartId: PartId}).referencePartId),
    ...activityLayout.toolbars.rightBottom.activities.map(activity => (activity as unknown as {referencePartId: PartId}).referencePartId),
    ...activityLayout.toolbars.bottomLeft.activities.map(activity => (activity as unknown as {referencePartId: PartId}).referencePartId),
    ...activityLayout.toolbars.bottomRight.activities.map(activity => (activity as unknown as {referencePartId: PartId}).referencePartId),
  ].forEach(partId => partIds.add(partId));
  return partIds;
}

interface Layout {
  grids: {
    main: string;
    [activityId: ActivityId]: string;
  };
  activityLayout: string;
  outlets: string;
}

type ActivityId = `activity.${string}`;
