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
import {MPartsLayoutV1, MPartV1, MTreeNodeV1} from './model/workbench-layout-migration-v1.model';
import {MPartGridV2, MPartV2, MTreeNodeV2} from './model/workbench-layout-migration-v2.model';
import {WorkbenchMigration} from '../../migration/workbench-migration';

/**
 * Migrates the workbench layout from version 1 to version 2.
 *
 * TODO [Angular 20] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV2 implements WorkbenchMigration {
  public migrate(json: string): string {
    const partsLayoutV1: MPartsLayoutV1 = JSON.parse(json);
    const partsGridV2: MPartGridV2 = {
      root: this.migrateGridElement(partsLayoutV1.root),
      activePartId: partsLayoutV1.activePartId,
    };
    return JSON.stringify(partsGridV2);
  }

  private migrateGridElement(elementV1: MTreeNodeV1 | MPartV1): MTreeNodeV2 | MPartV2 {
    if (elementV1.hasOwnProperty('partId')) { // eslint-disable-line no-prototype-builtins
      const partV1 = elementV1 as MPartV1;
      return {
        type: 'MPart',
        id: partV1.partId,
        views: partV1.viewIds.map(viewId => ({id: viewId})),
        activeViewId: partV1.activeViewId,
        structural: false,
      };
    }
    else if (elementV1.hasOwnProperty('nodeId')) { // eslint-disable-line no-prototype-builtins
      const treeNodeV1 = elementV1 as MTreeNodeV1;
      return {
        type: 'MTreeNode',
        nodeId: treeNodeV1.nodeId,
        child1: this.migrateGridElement(treeNodeV1.child1),
        child2: this.migrateGridElement(treeNodeV1.child2),
        ratio: treeNodeV1.ratio,
        direction: treeNodeV1.direction,
      };
    }
    else {
      throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=1, element=${JSON.stringify(elementV1)}]`);
    }
  }
}
