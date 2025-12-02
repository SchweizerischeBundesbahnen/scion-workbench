/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchMigration} from '../../migration/workbench-migration';
import {MPartGridV7, MPartV7, MTreeNodeV7, MViewV7} from './model/workbench-grid-migration-v7.model';
import {MPartGridV8, MPartV8, MTreeNodeV8, MViewV8} from './model/workbench-grid-migration-v8.model';
import {Params, UrlSegment} from '@angular/router';
import {MICROFRONTEND_VIEW_NAVIGATION_HINT} from '../../microfrontend-platform/microfrontend-view/microfrontend-view-routes';
import {MicrofrontendViewNavigationData} from '../../microfrontend-platform/microfrontend-view/microfrontend-view-navigation-data';
import {WorkbenchGridMigrationContext} from './workbench-grid-migration-context';

/**
 * Migrates the workbench grid layout model from version 7 to version 8.
 *
 * The grid model has not changed, but outlets have changed from '~/capabilityId' paths to empty-path hint-based navigations.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchGridMigrationV8 implements WorkbenchMigration<WorkbenchGridMigrationContext> {

  public migrate(json: string, context: WorkbenchGridMigrationContext): string {
    const partGridV7 = JSON.parse(json) as MPartGridV7;

    // Migrate the grid.
    const partGridV8: MPartGridV8 = {
      root: migrateGridElement(partGridV7.root),
      activePartId: partGridV7.activePartId,
      referencePartId: partGridV7.referencePartId,
    };
    return JSON.stringify(partGridV8);

    function migrateGridElement(elementV7: MTreeNodeV7 | MPartV7): MTreeNodeV8 | MPartV8 {
      switch (elementV7.type) {
        case 'MTreeNode':
          return migrateNode(elementV7);
        case 'MPart':
          return migratePart(elementV7);
        default:
          throw Error(`[WorkbenchLayoutError] Unable to migrate to the latest version. Expected element to be of type 'MPart' or 'MTreeNode'. [version=7, element=${JSON.stringify(elementV7)}]`);
      }
    }

    function migrateNode(nodeV7: MTreeNodeV7): MTreeNodeV8 {
      return {
        ...nodeV7,
        child1: migrateGridElement(nodeV7.child1),
        child2: migrateGridElement(nodeV7.child2),
      };
    }

    function migratePart(partV7: MPartV7): MPartV8 {
      return {
        ...partV7,
        views: partV7.views.map(migrateView),
      };
    }

    function migrateView(viewV7: MViewV7): MViewV8 {
      const urlSegments = context.getOutlet(viewV7.id);
      const microfrontendURL = parseLegacyMicrofrontendUrl(urlSegments ?? []);
      if (!microfrontendURL) {
        return viewV7;
      }

      // Remove the outlet from the URL.
      context.deleteOutlet(viewV7.id);

      // Create microfrontend view navigation.
      return {
        ...viewV7,
        navigation: {
          ...viewV7.navigation!,
          hint: MICROFRONTEND_VIEW_NAVIGATION_HINT,
          data: {
            capabilityId: microfrontendURL.capabilityId,
            params: microfrontendURL.params,
          } satisfies MicrofrontendViewNavigationData,
        },
      };
    }
  }
}

/**
 * Parses given URL segments, returning capability id and parameters if a legacy microfrontend view URL.
 */
function parseLegacyMicrofrontendUrl(segments: UrlSegment[]): {capabilityId: string; params: Params} | null {
  if (segments.length === 2 && segments[0]!.path === '~') {
    return {
      capabilityId: segments[1]!.path,
      params: segments[1]!.parameters,
    };
  }
  return null;
}
