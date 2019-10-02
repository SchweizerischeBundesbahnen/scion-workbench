/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ActivatedRoute, NavigationExtras, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from '@angular/router';
import { ACTIVITY_OUTLET_NAME, PARTS_LAYOUT_QUERY_PARAM, VIEW_REF_PREFIX } from '../workbench.constants';
import { Injectable } from '@angular/core';
import { Arrays } from '../array.util';
import { coerceArray } from '@angular/cdk/coercion';

/**
 * Allows navigating to auxiliary routes in view outlets.
 */
@Injectable()
export class ViewOutletNavigator {

  constructor(private _router: Router) {
  }

  /**
   * Navigates based on the provided array of commands, if any, and updates the URL with the given parts layout.
   */
  public navigate(params: { viewOutlet?: { name: string, commands: any[] }, partsLayout: string, extras?: NavigationExtras }): Promise<boolean> {
    const urlTree = this.createUrlTree(params);
    return this._router.navigateByUrl(urlTree, params.extras);
  }

  /**
   * Applies the provided commands and parts layout to the current URL tree and creates a new URL tree.
   */
  public createUrlTree(params: { viewOutlet?: Outlet | Outlet[], partsLayout: string, extras?: NavigationExtras }): UrlTree {
    const {viewOutlet, partsLayout, extras = {}} = params;
    const commands: any[] = this.createOutletCommands(viewOutlet);

    return this._router.createUrlTree(commands, {
      ...extras,
      queryParams: {...extras.queryParams, [PARTS_LAYOUT_QUERY_PARAM]: partsLayout},
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Normalizes commands to their absolute form.
   *
   * ---
   * As of Angular 6.x, commands which target a named outlet (auxiliary route) are not normalized, meaning that
   * relative navigational symbols like `/`, `./`, or `../` are not resolved (see `create_url_tree.ts` method: `computeNavigation`).
   *
   * Example: router.navigate([{outlets: {[outlet]: commands}}])
   *
   * To bypass that restriction, we first create an URL tree without specifying the target outlet. As expected, this translates into an
   * URL with all navigational symbols resolved. Then, we extract the URL segments of the resolved route and convert it back into commands.
   * The resulting commands are in their absolute form and may be used for the effective navigation to target a named router outlet.
   */
  public normalizeCommands(commands: any[], relativeTo?: ActivatedRoute | null): any[] {
    const normalizeFn = (outlet: string, extras?: NavigationExtras): any[] => {
      return this._router.createUrlTree(commands, extras)
        .root.children[outlet].segments
        .reduce((acc, p) => [...acc, p.path, ...(Object.keys(p.parameters).length ? [p.parameters] : [])], []);
    };

    if (!relativeTo) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    const targetOutlet = relativeTo.pathFromRoot[1] && relativeTo.pathFromRoot[1].outlet;
    if (!targetOutlet || (!targetOutlet.startsWith(VIEW_REF_PREFIX) && !targetOutlet.startsWith(ACTIVITY_OUTLET_NAME))) {
      return normalizeFn(PRIMARY_OUTLET);
    }

    return normalizeFn(targetOutlet, {relativeTo});
  }

  /**
   * Resolves present views which match the given commands.
   */
  public resolvePresentViewIds(commands: any[]): string[] {
    const serializeCommands = this.serializeCommands(commands);
    const urlTree = this._router.parseUrl(this._router.url);
    const urlSegmentGroups = urlTree.root.children;

    return Object.keys(urlSegmentGroups)
      .filter(outletName => outletName.startsWith(VIEW_REF_PREFIX))
      .filter(outletName => Arrays.equal(serializeCommands, urlSegmentGroups[outletName].segments.map((segment: UrlSegment) => segment.toString())));
  }

  /**
   * Serializes given commands into valid URL segments.
   */
  private serializeCommands(commands: any[]): string[] {
    const serializedCommands: string[] = [];

    commands.forEach(cmd => {
      // if matrix param, append it to the last segment
      if (typeof cmd === 'object') {
        serializedCommands.push(new UrlSegment(serializedCommands.pop(), cmd).toString());
      }
      else {
        serializedCommands.push(encodeURIComponent(cmd));
      }
    });

    return serializedCommands;
  }

  private createOutletCommands(viewOutlets?: Outlet | Outlet[]): any[] {
    if (!viewOutlets) {
      return [];
    }
    const outletsObject = coerceArray(viewOutlets).reduce((acc, viewOutlet) => ({...acc, [viewOutlet.name]: viewOutlet.commands}), {});
    return [{outlets: outletsObject}];
  }
}

export interface Outlet {
  name: string;
  commands: any[];
}
