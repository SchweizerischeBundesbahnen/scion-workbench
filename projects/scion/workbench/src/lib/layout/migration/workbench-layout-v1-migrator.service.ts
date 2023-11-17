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
import {MPart, MPartGrid, MTreeNode} from '../workbench-layout.model';

/**
 * Migrates a workbench layout in version 1 to the latest version.
 *
 * TODO [Angular 18] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutV1Migrator {

  public migrate(json: string): string {
    const partsLayoutV1: MPartsLayoutV1 = JSON.parse(json);
    const partsGrid: MPartGrid = {
      root: this.migrateGridElement(partsLayoutV1.root),
      activePartId: partsLayoutV1.activePartId,
    };
    return JSON.stringify(partsGrid);
  }

  private migrateGridElement(elementV1: MTreeNodeV1 | MPartV1): MTreeNode | MPart {
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
      throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=1, element=${elementV1}]`);
    }
  }
}

interface MPartsLayoutV1 {
  root: MTreeNodeV1 | MPartV1;
  activePartId: string;
}

interface MTreeNodeV1 {
  nodeId: string;
  child1: MTreeNodeV1 | MPartV1;
  child2: MTreeNodeV1 | MPartV1;
  ratio: number;
  direction: 'column' | 'row';
}

interface MPartV1 {
  partId: string;
  parent?: MTreeNodeV1;
  viewIds: string[];
  activeViewId?: string;
}
