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
import {MPartGridV4, MPartV4, MTreeNodeV4, MViewV4} from './model/workbench-layout-migration-v4.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MPartGridV5, MPartV5, MTreeNodeV5, MViewV5} from './model/workbench-layout-migration-v5.model';
import {UID} from '../../common/uid.util';

/**
 * Migrates the workbench layout from version 4 to version 5.
 *
 * TODO [Angular 20] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV5 implements WorkbenchMigration {

  public migrate(json: string): string {
    const partGridV4: MPartGridV4 = JSON.parse(json);

    // Migrate the grid.
    const partGridV5: MPartGridV5 = {
      ...partGridV4,
      root: migrateGridElement(partGridV4.root),
    };
    return JSON.stringify(partGridV5);

    function migrateGridElement(elementV4: MTreeNodeV4 | MPartV4): MTreeNodeV5 | MPartV5 {
      switch (elementV4.type) {
        case 'MTreeNode':
          return migrateNode(elementV4);
        case 'MPart':
          return migratePart(elementV4);
        default:
          throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=4, element=${JSON.stringify(elementV4)}]`);
      }
    }

    function migrateNode(nodeV4: MTreeNodeV4): MTreeNodeV5 {
      return {
        ...nodeV4,
        id: UID.randomUID(),
        child1: migrateGridElement(nodeV4.child1),
        child2: migrateGridElement(nodeV4.child2),
      };
    }

    function migratePart(partV4: MPartV4): MPartV5 {
      return {...partV4, views: partV4.views.map(migrateView)};
    }

    function migrateView(viewV4: MViewV4): MViewV5 {
      const viewV5: MViewV5 = {
        ...viewV4,
        uid: UID.randomUID(),
        navigation: viewV4.navigation ? {...viewV4.navigation, id: UID.randomUID()} : undefined,
      };
      if (!viewV5.navigation) {
        delete viewV5.navigation;
      }
      return viewV5;
    }
  }
}
