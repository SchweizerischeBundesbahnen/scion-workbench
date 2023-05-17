/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchLayoutV1Migrator} from './workbench-layout-v1-migrator.service';

/**
 * Migrates a workbench layout to the latest version.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrator {

  constructor(private _workbenchLayoutV1Migrator: WorkbenchLayoutV1Migrator) {
  }

  /**
   * Migrates a workbench layout to the latest version.
   */
  public migrate(version: number, json: string): string {
    switch (version) {
      case 1:
        return this._workbenchLayoutV1Migrator.migrate(json);
      default:
        throw Error(`[WorkbenchLayoutError] Unsupported workbench layout version. Unable to migrate to the latest version. [version=${version}, layout=${json}]`);
    }
  }
}
