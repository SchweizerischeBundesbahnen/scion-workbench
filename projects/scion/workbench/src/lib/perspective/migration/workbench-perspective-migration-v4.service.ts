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
import {MPerspectiveLayoutV3} from './model/workbench-perspective-migration-v3.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MPerspectiveLayoutV4} from './model/workbench-perspective-migration-v4.model';

/**
 * Migrates the perspective layout from version 3 to version 4.
 *
 * TODO [Angular 20] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveMigrationV4 implements WorkbenchMigration {

  public migrate(json: string): string {
    const perspectiveLayoutV3: MPerspectiveLayoutV3 = JSON.parse(json);
    const perspectiveLayoutV4: MPerspectiveLayoutV4 = {
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
    return JSON.stringify(perspectiveLayoutV4);
  }
}
