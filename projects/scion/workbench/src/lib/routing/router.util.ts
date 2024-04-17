/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedRoute, ActivatedRouteSnapshot, PRIMARY_OUTLET, Router, UrlSegment, UrlTree} from '@angular/router';
import {Commands} from '../routing/routing.model';
import {DIALOG_ID_PREFIX, POPUP_ID_PREFIX} from '../workbench.constants';
import {inject} from '@angular/core';
import {ViewId} from '../view/workbench-view.model';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';

/**
 * Provides utility functions for router operations.
 */
export const RouterUtils = {

  /**
   * Converts given URL segments into an array of commands that can be passed to the Angular router for navigation.
   */
  segmentsToCommands: (segments: UrlSegment[]): Commands => {
    const commands = new Array<any>();

    segments.forEach(segment => {
      if (segment.path) {
        commands.push(segment.path);
      }
      if (segment.parameters && Object.keys(segment.parameters).length) {
        commands.push(segment.parameters);
      }
    });

    return commands;
  },

  /**
   * Constructs URL segments from given commands, resolving any relative navigational symbols.
   *
   * This function must be called inside an injection context.
   */
  commandsToSegments: (commands: Commands, options?: {relativeTo?: ActivatedRoute | null}): UrlSegment[] => {
    // Ignore `relativeTo` for absolute commands.
    const isAbsolutePath = typeof commands[0] === 'string' && commands[0].startsWith('/');
    const relativeTo = isAbsolutePath ? null : (options?.relativeTo || null);

    // Angular throws the error 'NG04003: Root segment cannot have matrix parameters' when passing an empty path command
    // followed by a matrix params object, but not when passing matrix params as the first command. For consistency, when
    // passing matrix params as the first command, we prepend an empty path for Angular to throw the same error.
    if (typeof commands[0] === 'object' && (!relativeTo || RouterUtils.hasEmptyPathFromRoot(relativeTo))) {
      commands = ['', ...commands];
    }

    const urlTree = inject(Router).createUrlTree(commands, {relativeTo});
    return urlTree.root.children[relativeTo?.pathFromRoot[1]?.outlet ?? PRIMARY_OUTLET]?.segments ?? [];
  },

  /**
   * Parses the given path and matrix parameters into an array of commands that can be passed to the Angular router for navigation.
   *
   * This function must be called inside an injection context.
   */
  pathToCommands: (path: string): Commands => {
    const urlTree = inject(Router).parseUrl(path);
    const segments = urlTree.root.children[PRIMARY_OUTLET]?.segments;
    if (!segments) {
      throw Error(`[RouterError] Cannot match any routes for path '${path}'.`);
    }
    return RouterUtils.segmentsToCommands(segments);
  },

  /**
   * Resolves to the actual {@link ActivatedRouteSnapshot} loaded into a router outlet.
   *
   * The route that is reported as the activated route of an outlet, or the route that is passed to a guard
   * or resolver, is not always the route that is actually loaded into the outlet, for example, if the route
   * is a child of a component-less route.
   */
  resolveActualRouteSnapshot: (route: ActivatedRouteSnapshot): ActivatedRouteSnapshot => {
    return route.firstChild ? RouterUtils.resolveActualRouteSnapshot(route.firstChild) : route;
  },

  /**
   * Looks for requested data on given route, or its parent route(s) if not found.
   */
  lookupRouteData: <T>(activatedRoute: ActivatedRouteSnapshot, dataKey: string): T | undefined => {
    return activatedRoute.pathFromRoot.reduceRight((resolvedData, route) => resolvedData ?? route.data[dataKey], undefined);
  },

  /**
   * Tests if the given outlet matches the format of a popup outlet.
   */
  isPopupOutlet: (outlet: string | undefined | null): outlet is `popup.${string}` => {
    return outlet?.startsWith(POPUP_ID_PREFIX) ?? false;
  },

  /**
   * Tests if the given outlet matches the format of a dialog outlet.
   */
  isDialogOutlet: (outlet: string | undefined | null): outlet is `dialog.${string}` => {
    return outlet?.startsWith(DIALOG_ID_PREFIX) ?? false;
  },

  /**
   * Reads view outlets from given URL.
   *
   * A view outlet contains the URL segments of a view contained in the workbench layout.
   */
  parseViewOutlets: (url: UrlTree): Map<ViewId, UrlSegment[]> => {
    const viewOutlets = new Map<ViewId, UrlSegment[]>();
    Object.entries(url.root.children).forEach(([outlet, segmentGroup]) => {
      if (WorkbenchLayouts.isViewId(outlet)) {
        viewOutlets.set(outlet, segmentGroup.segments);
      }
    });
    return viewOutlets;
  },

  /**
   * Tests if given route has an empty path from root.
   */
  hasEmptyPathFromRoot(route: ActivatedRoute): boolean {
    return route.snapshot.pathFromRoot.flatMap(route => route.url).filter(segment => segment.path.length).length === 0;
  },
} as const;
