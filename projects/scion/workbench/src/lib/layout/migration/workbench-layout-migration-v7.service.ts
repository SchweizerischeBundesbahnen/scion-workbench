/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {WorkbenchLayoutSerializer} from '../workbench-layout-serializer.service';
import {MWorkbenchLayoutV6} from './model/workbench-layout-migration-v6.model';
import {MWorkbenchLayoutV7} from './model/workbench-layout-migration-v7.model';
import {ɵWorkbenchLayoutFactory} from '../ɵworkbench-layout.factory';

/**
 * Migrates the workbench layout from version 6 to version 7.
 *
 * Updates the translation key prefix for remote keys from '%workbench.external' to '%scion.workbench.internal'.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV7 implements WorkbenchMigration {

  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _injector = inject(Injector);

  public migrate(json: string): string {
    const workbenchLayoutV6 = JSON.parse(json) as MWorkbenchLayoutV6;

    const workbenchLayoutV7: MWorkbenchLayoutV7 = runInInjectionContext(this._injector, () => ({
      userLayout: this.migrateLayout(workbenchLayoutV6.userLayout),
      referenceLayout: this.migrateLayout(workbenchLayoutV6.referenceLayout),
    }));
    return JSON.stringify(workbenchLayoutV7);
  }

  private migrateLayout(layoutV6: MWorkbenchLayoutV6['referenceLayout'] | MWorkbenchLayoutV6['userLayout']): MWorkbenchLayoutV7['referenceLayout'] | MWorkbenchLayoutV7['userLayout'] {
    const activityLayout = inject(WorkbenchLayoutSerializer).deserializeActivityLayout(layoutV6.activityLayout);
    const activities = [
      ...activityLayout.toolbars.leftTop.activities,
      ...activityLayout.toolbars.leftBottom.activities,
      ...activityLayout.toolbars.rightTop.activities,
      ...activityLayout.toolbars.rightBottom.activities,
      ...activityLayout.toolbars.bottomLeft.activities,
      ...activityLayout.toolbars.bottomRight.activities,
    ];

    // Rename activity label and tooltip.
    activities.forEach(activity => {
      activity.label = activity.label.replace('%workbench.external', '%scion.workbench.internal');
      activity.tooltip = activity.tooltip?.replace('%workbench.external', '%scion.workbench.internal');
    });
    const activityLayoutV7 = inject(WorkbenchLayoutSerializer).serializeActivityLayout(activityLayout);

    // Rename part title.
    const layoutV7 = this._workbenchLayoutFactory.create({
      activityLayout: activityLayoutV7,
      grids: layoutV6.grids,
    });
    layoutV7.parts().forEach(part => {
      part.title = part.title?.replace('%workbench.external', '%scion.workbench.internal');
    });

    return {
      activityLayout: activityLayoutV7,
      grids: inject(WorkbenchLayoutSerializer).serializeGrids(layoutV7.grids),
      outlets: layoutV6.outlets,
    };
  }
}
