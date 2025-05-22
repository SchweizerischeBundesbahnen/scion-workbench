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
import {MPartGridV5, MPartV5, MTreeNodeV5, MViewV5} from './model/workbench-grid-migration-v5.model';
import {MPartGridV6, MPartV6, MTreeNodeV6, MViewV6} from './model/workbench-grid-migration-v6.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';

/**
 * Migrates the workbench layout from version 5 to version 6.
 *
 * TODO [Angular 20] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchGridMigrationV6 implements WorkbenchMigration {

  public migrate(json: string): string {
    const partGridV5 = JSON.parse(json) as MPartGridV5;

    // Migrate the grid.
    const partGridV6: MPartGridV6 = {
      ...partGridV5,
      root: migrateGridElement(partGridV5.root),
    };
    return JSON.stringify(partGridV6);

    function migrateGridElement(elementV5: MTreeNodeV5 | MPartV5): MTreeNodeV6 | MPartV6 {
      switch (elementV5.type) {
        case 'MTreeNode':
          return migrateNode(elementV5);
        case 'MPart':
          return migratePart(elementV5);
        default:
          throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=5, element=${JSON.stringify(elementV5)}]`);
      }
    }

    function migrateNode(nodeV5: MTreeNodeV5): MTreeNodeV6 {
      return {
        ...nodeV5,
        child1: migrateGridElement(nodeV5.child1),
        child2: migrateGridElement(nodeV5.child2),
      };
    }

    function migratePart(partV5: MPartV5): MPartV6 {
      return {...partV5, views: partV5.views.map(migrateView)};
    }

    function migrateView(viewV5: MViewV5): MViewV6 {
      const viewV6: MViewV6 = {...viewV5};
      delete (viewV6 as Record<keyof MViewV5, unknown>).uid;
      return viewV6;
    }
  }
}
