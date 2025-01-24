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
import {MPartGridV7, MPartV7, MTreeNodeV7, PartIdV7} from './model/workbench-layout-migration-v7.model';
import {UID} from '../../common/uid.util';

/**
 * Migrates the workbench layout from version 6 to version 7.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV7 implements WorkbenchMigration {

  public migrate(json: string): string {
    const partGridV6: MPartGridV6 = JSON.parse(json);
    const oldActivePartId = partGridV6.activePartId;
    const newActivePartId = migratePartId(oldActivePartId);

    // Migrate the grid.
    const partGridV7: MPartGridV7 = {
      root: migrateGridElement(partGridV6.root),
      activePartId: newActivePartId,
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
      return {
        ...partV6,
        id: partV6.id === oldActivePartId ? newActivePartId : migratePartId(partV6.id),
        alternativeId: partV6.id,
      };
    }
  }
}

function migratePartId(partId: string): PartIdV7 {
  return partId === 'main-area' ? 'part.main-area' : `part.${UID.randomUID()}`;
}
