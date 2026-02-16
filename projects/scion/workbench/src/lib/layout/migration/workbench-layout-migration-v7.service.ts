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

/**
 * Migrates the workbench layout from version 6 to version 7.
 *
 * Adds the docking areas `top-left` and `top-right`.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV7 implements WorkbenchMigration {

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
    const activityLayoutV6 = inject(WorkbenchLayoutSerializer).deserializeActivityLayout(layoutV6.activityLayout);
    const activityLayoutV7 = {
      ...activityLayoutV6,
      toolbars: {
        ...activityLayoutV6.toolbars,
        topLeft: {activities: []},
        topRight: {activities: []},
      },
      panels: {
        ...activityLayoutV6.panels,
        top: {
          height: 250,
          ratio: .5,
        },
      },
    };
    return {
      activityLayout: inject(WorkbenchLayoutSerializer).serializeActivityLayout(activityLayoutV7),
      grids: {...layoutV6.grids},
      outlets: layoutV6.outlets,
    };
  }
}
