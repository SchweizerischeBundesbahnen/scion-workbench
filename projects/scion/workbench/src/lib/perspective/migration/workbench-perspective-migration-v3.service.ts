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
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MPerspectiveLayoutV3} from './model/workbench-perspective-migration-v3.model';
import {MPerspectiveLayoutV2} from './model/workbench-perspective-migration-v2.model';

/**
 * Migrates the perspective layout from version 2 to version 3.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveMigrationV3 implements WorkbenchMigration {

  public migrate(json: string): string {
    const perspectiveDataV2: MPerspectiveLayoutV2 = JSON.parse(json);
    const perspectiveLayoutV3: MPerspectiveLayoutV3 = {
      userLayout: {
        workbenchGrid: perspectiveDataV2.userLayout.workbenchGrid,
        outlets: perspectiveDataV2.userLayout.viewOutlets,
        desktop: JSON.stringify({}),
      },
      referenceLayout: {
        workbenchGrid: perspectiveDataV2.referenceLayout.workbenchGrid,
        outlets: perspectiveDataV2.referenceLayout.viewOutlets,
        desktop: JSON.stringify({}),
      },
    };
    return JSON.stringify(perspectiveLayoutV3);
  }
}
