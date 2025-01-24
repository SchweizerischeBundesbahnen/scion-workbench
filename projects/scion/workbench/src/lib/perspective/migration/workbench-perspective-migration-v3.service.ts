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
import {MPerspectiveLayoutV2} from './model/workbench-perspective-migration-v2.model';
import {MPerspectiveLayoutV3} from './model/workbench-perspective-migration-v3.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';

/**
 * Migrates the perspective layout from version 2 to version 3.
 *
 * TODO [Angular 20] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveMigrationV3 implements WorkbenchMigration {

  public migrate(json: string): string {
    const perspectiveLayoutV2: MPerspectiveLayoutV2 = JSON.parse(json);
    const perspectiveLayoutV3: MPerspectiveLayoutV3 = {
      userLayout: {
        workbenchGrid: perspectiveLayoutV2.userLayout.workbenchGrid,
        outlets: perspectiveLayoutV2.userLayout.viewOutlets,
      },
      referenceLayout: {
        workbenchGrid: perspectiveLayoutV2.referenceLayout.workbenchGrid,
        outlets: perspectiveLayoutV2.referenceLayout.viewOutlets,
      },
    };
    return JSON.stringify(perspectiveLayoutV3);
  }
}
