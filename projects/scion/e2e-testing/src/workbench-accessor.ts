/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Page} from '@playwright/test';
import {PartId, ViewId, WorkbenchService} from '@scion/workbench';
import {RequireOne} from './helper/utility-types';

/**
 * Enables programmatic interaction with the Workbench API.
 */
export class WorkbenchAccessor {

  constructor(private _page: Page) {
  }

  public closeViews(...viewIds: ViewId[]): Promise<boolean> {
    return this._page.evaluate((viewIds: ViewId[]) => {
      const workbenchService = (window as unknown as Record<string, unknown>).__workbenchService as WorkbenchService;
      return workbenchService.closeViews(...viewIds);
    }, viewIds);
  }

  /**
   * Finds views based on given criteria.
   */
  public views(findBy?: {id?: ViewId; alternativeId?: string}): Promise<E2EWorkbenchView[]> {
    return this._page.evaluate(findBy => {
      const workbenchService = (window as unknown as Record<string, unknown>).__workbenchService as WorkbenchService;
      return workbenchService.views()
        .filter(view => {
          if (findBy?.id && findBy.id !== view.id) {
            return false;
          }
          if (findBy?.alternativeId && findBy.alternativeId !== view.alternativeId) {
            return false;
          }
          return true;
        })
        .map(view => ({
          id: view.id,
          alternativeId: view.alternativeId,
          partId: view.part().id,
          navigation: {
            path: view.navigation()?.path.join('/'),
            hint: view.navigation()?.hint,
          },
        }));
    }, findBy);
  }

  /**
   * Finds parts based on given criteria.
   */
  public parts(findBy?: {id?: PartId; alternativeId?: string}): Promise<E2EWorkbenchPart[]> {
    return this._page.evaluate(findBy => {
      const workbenchService = (window as unknown as Record<string, unknown>).__workbenchService as WorkbenchService;
      return workbenchService.parts()
        .filter(part => {
          if (findBy?.id && findBy.id !== part.id) {
            return false;
          }
          if (findBy?.alternativeId && findBy.alternativeId !== part.alternativeId) {
            return false;
          }
          return true;
        })
        .map(part => ({
          id: part.id,
          alternativeId: part.alternativeId,
          navigation: {
            path: part.navigation()?.path.join('/'),
            hint: part.navigation()?.hint,
          },
        }));
    }, findBy);
  }

  /**
   * Finds a view based on given criteria, throwing an error if none or multiple views are found.
   */
  public async view(findBy: RequireOne<{id: ViewId; alternativeId: string}>): Promise<E2EWorkbenchView> {
    const views = await this.views(findBy);
    if (!views.length) {
      throw Error(`[PageObjectError] No view found: ${JSON.stringify(findBy)}`);
    }
    if (views.length > 1) {
      throw Error(`[PageObjectError] Multiple views found: ${JSON.stringify(findBy)}`);
    }
    return views[0]!;
  }

  /**
   * Finds a part based on given criteria, throwing an error if none or multiple parts are found.
   */
  public async part(findBy: RequireOne<{id: PartId; alternativeId: string}>): Promise<E2EWorkbenchPart> {
    const parts = await this.parts(findBy);
    if (!parts.length) {
      throw Error(`[PageObjectError] No part found: ${JSON.stringify(findBy)}`);
    }
    if (parts.length > 1) {
      throw Error(`[PageObjectError] Multiple parts found: ${JSON.stringify(findBy)}`);
    }
    return parts[0]!;
  }
}

export interface E2EWorkbenchView {
  id: ViewId;
  alternativeId: string | undefined;
  partId: PartId;
  navigation: E2EWorkbenchViewNavigation;
}

export interface E2EWorkbenchPart {
  id: PartId;
  alternativeId: string | undefined;
  navigation: E2EWorkbenchViewNavigation;
}

export interface E2EWorkbenchViewNavigation {
  path?: string;
  hint?: string;
}
