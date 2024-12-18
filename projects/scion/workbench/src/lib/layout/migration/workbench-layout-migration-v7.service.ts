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
import {MPartGridV6, MPartV6, MTreeNodeV6} from './model/workbench-layout-migration-v6.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MPartGridV7, MPartV7, MTreeNodeV7} from './model/workbench-layout-migration-v7.model';

/**
 * Migrates the workbench layout from version 6 to version 7.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV7 implements WorkbenchMigration {

  public migrate(json: string): string {
    const partGridV6: MPartGridV6 = JSON.parse(json);

    // Migrate the grid.
    const partGridV7: MPartGridV7 = {
      root: migrateGridElement(partGridV6.root),
      activePartId: `part.${partGridV6.activePartId}`,
    };
    return JSON.stringify(partGridV7);

    function migrateGridElement(elementV6: MTreeNodeV6 | MPartV6): MTreeNodeV7 | MPartV7 {
      switch (elementV6.type) {
        case 'MTreeNode':
          return migrateNode(elementV6);
        case 'MPart':
          return migratePart(elementV6);
        default:
          throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=6, element=${JSON.stringify(elementV6)}]`);
      }
    }

    function migrateNode(nodeV6: MTreeNodeV6): MTreeNodeV7 {
      return {
        ...nodeV6,
        child1: migrateGridElement(nodeV6.child1),
        child2: migrateGridElement(nodeV6.child2),
      };
    }

    function migratePart(partV6: MPartV6): MPartV7 {
      const partV7: MPartV7 = {...partV6, id: `part.${partV6.id}`};
      if (partV6.id !== 'main-area') {
        partV7.alternativeId = partV6.id;
      }
      return partV7;
    }
  }
}
