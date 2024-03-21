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
import {MPartGridV2, MPartV2, MTreeNodeV2, MViewV2} from './model/workbench-layout-migration-v2.model';
import {MPartGridV3, MPartV3, MTreeNodeV3, MViewV3, VIEW_ID_PREFIX_V3, ViewIdV3} from './model/workbench-layout-migration-v3.model';
import {PRIMARY_OUTLET, Router, UrlTree} from '@angular/router';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {RouterUtils} from '../../routing/router.util';

/**
 * Migrates a workbench layout in version 2 to version 3.
 *
 * TODO [Angular 20] Remove migrator.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutMigrationV3 implements WorkbenchMigration {

  constructor(private _router: Router) {
  }

  public migrate(json: string): string {
    const partGridV2: MPartGridV2 = JSON.parse(json);

    // Exclude view ids of view outlets in the URL. Otherwise, when migrating the main area and using a view id used in the perspective, the view oultet would not be removed, causing the migrated view to display 'page not found' or wrong content.
    const viewOutlets = RouterUtils.parseViewOutlets(this.getCurrentUrl());
    const usedViewIds = new Set<ViewIdV3>([...viewOutlets.keys(), ...collectViewIds(partGridV2.root)]);
    const partGridV3: MPartGridV3 = {
      root: migrateGridElement(partGridV2.root),
      activePartId: partGridV2.activePartId,
    };
    return JSON.stringify(partGridV3);

    function migrateGridElement(elementV2: MTreeNodeV2 | MPartV2): MTreeNodeV3 | MPartV3 {
      switch (elementV2.type) {
        case 'MTreeNode':
          return migrateNode(elementV2);
        case 'MPart':
          return migratePart(elementV2);
        default:
          throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=2, element=${JSON.stringify(elementV2)}]`);
      }
    }

    function migrateNode(nodeV2: MTreeNodeV2): MTreeNodeV3 {
      return {
        type: 'MTreeNode',
        nodeId: nodeV2.nodeId,
        child1: migrateGridElement(nodeV2.child1),
        child2: migrateGridElement(nodeV2.child2),
        ratio: nodeV2.ratio,
        direction: nodeV2.direction,
      };
    }

    function migratePart(partV2: MPartV2): MPartV3 {
      const partV3: MPartV3 = {
        type: 'MPart',
        id: partV2.id,
        structural: partV2.structural,
        views: new Array<MViewV3>(), // added when iterating through the views
        activeViewId: undefined, // set when iterating through the views
      };

      partV2.views.forEach((viewV2: MViewV2) => {
        const viewV3: MViewV3 = migrateView(viewV2);
        if (partV2.activeViewId === viewV2.id) {
          partV3.activeViewId = viewV3.id;
        }
        partV3.views.push(viewV3);
        usedViewIds.add(viewV3.id);
      });

      return partV3;
    }

    function migrateView(viewV2: MViewV2): MViewV3 {
      if (isPrimaryViewId(viewV2.id)) {
        return {id: viewV2.id, navigation: {outlet: PRIMARY_OUTLET}};
      }
      else {
        return {id: computeNextViewId(usedViewIds), navigation: {outlet: viewV2.id}};
      }
    }
  }

  private getCurrentUrl(): UrlTree {
    return this._router.getCurrentNavigation()?.initialUrl ?? this._router.parseUrl(this._router.url);
  }
}

function computeNextViewId(viewIds: Iterable<ViewIdV3>): ViewIdV3 {
  const ids = Array.from(viewIds)
    .map(viewId => Number(viewId.substring(VIEW_ID_PREFIX_V3.length)))
    .reduce((set, id) => set.add(id), new Set<number>());

  for (let i = 1; i <= ids.size; i++) {
    if (!ids.has(i)) {
      return VIEW_ID_PREFIX_V3.concat(`${i}`) as ViewIdV3;
    }
  }
  return VIEW_ID_PREFIX_V3.concat(`${ids.size + 1}`) as ViewIdV3;
}

function isPrimaryViewId(viewId: string): viewId is ViewIdV3 {
  return viewId.startsWith(VIEW_ID_PREFIX_V3);
}

function collectViewIds(node: MPartV2 | MTreeNodeV2): Set<ViewIdV3> {
  if (node.type === 'MPart') {
    return new Set(node.views.map(view => view.id).filter(isPrimaryViewId));
  }
  else {
    return new Set([...collectViewIds(node.child1), ...collectViewIds(node.child2)]);
  }
}
