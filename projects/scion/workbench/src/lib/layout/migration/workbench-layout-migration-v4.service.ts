/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {MPerspectiveLayoutV3} from './model/workbench-layout-migration-v3.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MWorkbenchLayoutV4} from './model/workbench-layout-migration-v4.model';

/**
 * Migrates the workbench layout from version 3 to version 4.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV4 implements WorkbenchMigration {

  public migrate(json: string): string {
    const perspectiveLayoutV3 = JSON.parse(json) as MPerspectiveLayoutV3;
    const workbenchLayoutV4: MWorkbenchLayoutV4 = {
      userLayout: {
        grids: {
          main: perspectiveLayoutV3.userLayout.workbenchGrid,
        },
        outlets: perspectiveLayoutV3.userLayout.outlets,
        activityLayout: undefined!,
      },
      referenceLayout: {
        grids: {
          main: perspectiveLayoutV3.referenceLayout.workbenchGrid,
        },
        outlets: perspectiveLayoutV3.referenceLayout.outlets,
        activityLayout: undefined!,
      },
    };
    return JSON.stringify(workbenchLayoutV4);
  }
}
