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
import {MWorkbenchLayoutV4} from './model/workbench-layout-migration-v4.model';
import {MWorkbenchLayoutV5} from './model/workbench-layout-migration-v5.model';
import {ɵWorkbenchLayoutFactory} from '../ɵworkbench-layout.factory';
import {UID} from '../../common/uid.util';
import {WorkbenchLayoutSerializer} from '../workbench-layout-serializer.service';

/**
 * Migrates the workbench layout from version 4 to version 5.
 *
 * Migrates sequential view identifiers to "random" view identifiers and renames associated outlets.
 *
 * This migrator is required for views in the peripheral area not to collide with views in the main area.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV5 implements WorkbenchMigration {

  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _injector = inject(Injector);

  public migrate(json: string): string {
    const workbenchLayoutV4 = JSON.parse(json) as MWorkbenchLayoutV4;
    const sequentialViewFormat = /^view\.\d+$/;

    // Migrate user layout.
    let userLayoutV4 = this._workbenchLayoutFactory.create({
      grids: workbenchLayoutV4.userLayout.grids,
      activityLayout: workbenchLayoutV4.userLayout.activityLayout,
      outlets: workbenchLayoutV4.userLayout.outlets,
    });

    // Rename sequential view identifiers to "random" view identifiers.
    userLayoutV4.views().forEach(view => {
      if (sequentialViewFormat.test(view.id)) {
        userLayoutV4 = userLayoutV4.renameView(view.id, `view.${UID.randomUID()}`);
      }
    });

    // Migrate reference layout.
    let referenceLayoutV4 = this._workbenchLayoutFactory.create({
      grids: workbenchLayoutV4.referenceLayout.grids,
      activityLayout: workbenchLayoutV4.referenceLayout.activityLayout,
      outlets: workbenchLayoutV4.referenceLayout.outlets,
    });

    // Rename sequential view identifiers to "random" view identifiers.
    referenceLayoutV4.views().forEach(view => {
      if (sequentialViewFormat.test(view.id)) {
        referenceLayoutV4 = referenceLayoutV4.renameView(view.id, `view.${UID.randomUID()}`);
      }
    });

    const workbenchSerializer = this._injector.get(WorkbenchLayoutSerializer);
    const workbenchLayoutV5: MWorkbenchLayoutV5 = {
      userLayout: {
        grids: workbenchSerializer.serializeGrids(userLayoutV4.grids),
        activityLayout: workbenchSerializer.serializeActivityLayout(userLayoutV4.activityLayout),
        outlets: workbenchSerializer.serializeOutlets(userLayoutV4.outlets({mainGrid: true, activityGrids: true})),
      },
      referenceLayout: {
        grids: workbenchSerializer.serializeGrids(referenceLayoutV4.grids),
        activityLayout: workbenchSerializer.serializeActivityLayout(referenceLayoutV4.activityLayout),
        outlets: workbenchSerializer.serializeOutlets(referenceLayoutV4.outlets({mainGrid: true, activityGrids: true})),
      },
    };
    return JSON.stringify(workbenchLayoutV5);
  }
}
