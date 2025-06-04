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
import {MPartGridV3, MPartV3, MTreeNodeV3, MViewV3} from './model/workbench-grid-migration-v3.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MPartGridV4, MPartV4, MTreeNodeV4, MViewV4} from './model/workbench-grid-migration-v4.model';

/**
 * Migrates the workbench layout from version 3 to version 4.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchGridMigrationV4 implements WorkbenchMigration {

  public migrate(json: string): string {
    const partGridV3 = JSON.parse(json) as MPartGridV3;

    // Migrate the grid.
    const partGridV4: MPartGridV4 = {
      ...partGridV3,
      root: migrateGridElement(partGridV3.root),
    };
    return JSON.stringify(partGridV4);

    function migrateGridElement(elementV3: MTreeNodeV3 | MPartV3): MTreeNodeV4 | MPartV4 {
      switch (elementV3.type) {
        case 'MTreeNode':
          return migrateNode(elementV3);
        case 'MPart':
          return migratePart(elementV3);
        default:
          throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=3, element=${JSON.stringify(elementV3)}]`);
      }
    }

    function migrateNode(nodeV3: MTreeNodeV3): MTreeNodeV4 {
      return {
        ...nodeV3,
        child1: migrateGridElement(nodeV3.child1),
        child2: migrateGridElement(nodeV3.child2),
      };
    }

    function migratePart(partV3: MPartV3): MPartV4 {
      return {...partV3, views: partV3.views.map(migrateView)};
    }

    function migrateView(viewV3: MViewV3): MViewV4 {
      return {...viewV3, uid: undefined!}; // `uid` is transient, i.e., set when deserializing the grid.
    }
  }
}
