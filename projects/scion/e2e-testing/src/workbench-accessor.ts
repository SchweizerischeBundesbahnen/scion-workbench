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
import {DialogId, PartId, PopupId, ViewId, WorkbenchService} from '@scion/workbench';
import {RequireOne} from './helper/utility-types';

/**
 * Enables programmatic interaction with the Workbench API.
 */
export class WorkbenchAccessor {

  constructor(private _page: Page) {
  }

  public resetPerspective(): Promise<void> {
    return this._page.evaluate(() => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.resetPerspective();
    });
  }

  public activeElement(): Promise<PartId | ViewId | DialogId | PopupId | null> {
    return this._page.evaluate(() => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.activeElement()?.id ?? null;
    });
  }

  public closeViews(...viewIds: ViewId[]): Promise<boolean> {
    return this._page.evaluate((viewIds: ViewId[]) => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.closeViews(...viewIds);
    }, viewIds);
  }

  public async closeDialogs(...dialogIds: DialogId[]): Promise<void> {
    await this._page.evaluate((dialogIds: DialogId[]) => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      dialogIds.forEach(dialogId => workbenchService.getDialog(dialogId)!.close());
    }, dialogIds);
  }

  public async closePopups(...popupIds: PopupId[]): Promise<void> {
    await this._page.evaluate((popupIds: PopupId[]) => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      popupIds.forEach(popupId => workbenchService.getPopup(popupId)!.close());
    }, popupIds);
  }

  /**
   * Finds parts based on given criteria.
   */
  public parts(findBy?: {partId?: PartId; alternativeId?: string}): Promise<WorkbenchPartE2E[]> {
    return this._page.evaluate(findBy => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.parts()
        .filter(part => {
          if (findBy?.partId && findBy.partId !== part.id) {
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
          activationInstant: part.activationInstant(),
          navigation: {
            path: part.navigation()?.path.join('/'),
            hint: part.navigation()?.hint,
            state: part.navigation()?.state,
          },
        }));
    }, findBy);
  }

  /**
   * Finds views based on given criteria.
   */
  public views(findBy?: {viewId?: ViewId; alternativeId?: string}): Promise<WorkbenchViewE2E[]> {
    return this._page.evaluate(findBy => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.views()
        .filter(view => {
          if (findBy?.viewId && findBy.viewId !== view.id) {
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
          activationInstant: view.activationInstant(),
          navigation: {
            path: view.navigation()?.path.join('/'),
            hint: view.navigation()?.hint,
            state: view.navigation()?.state,
          },
        }));
    }, findBy);
  }

  /**
   * Finds a view based on given criteria, throwing an error if none or multiple views are found.
   */
  public async view(findBy: RequireOne<{viewId: ViewId; alternativeId: string}>): Promise<WorkbenchViewE2E> {
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
  public async part(findBy: RequireOne<{partId: PartId; alternativeId: string}>): Promise<WorkbenchPartE2E> {
    const parts = await this.parts(findBy);
    if (!parts.length) {
      throw Error(`[PageObjectError] No part found: ${JSON.stringify(findBy)}`);
    }
    if (parts.length > 1) {
      throw Error(`[PageObjectError] Multiple parts found: ${JSON.stringify(findBy)}`);
    }
    return parts[0]!;
  }

  /**
   * Activates specified part.
   */
  public activatePart(partId: PartId): Promise<boolean> {
    return this._page.evaluate(partId => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.getPart(partId)!.activate();
    }, partId);
  }

  /**
   * Activates specified view.
   */
  public activateView(viewId: ViewId): Promise<boolean> {
    return this._page.evaluate(viewId => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.getView(viewId)!.activate();
    }, viewId);
  }
}

export interface WorkbenchPartE2E {
  id: PartId;
  alternativeId: string | undefined;
  activationInstant: number;
  navigation: WorkbenchPartNavigationE2E;
}

export interface WorkbenchViewE2E {
  id: ViewId;
  alternativeId: string | undefined;
  partId: PartId;
  activationInstant: number;
  navigation: WorkbenchViewNavigationE2E;
}

export interface WorkbenchPartNavigationE2E {
  path?: string;
  hint?: string;
  state?: Record<string, unknown>;
}

export interface WorkbenchViewNavigationE2E {
  path?: string;
  hint?: string;
  state?: Record<string, unknown>;
}
