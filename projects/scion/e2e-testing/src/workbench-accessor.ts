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
import {ViewId, WorkbenchPart, WorkbenchService} from '@scion/workbench';

/**
 * Enables programmatic interaction with the Workbench API.
 */
export class WorkbenchAccessor {

  constructor(private _page: Page) {
  }

  public closeViews(...viewIds: ViewId[]): Promise<boolean> {
    return this._page.evaluate((viewIds: ViewId[]) => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.closeViews(...viewIds);
    }, viewIds);
  }

  public parts(): Promise<Array<Pick<WorkbenchPart, 'id' | 'alternativeId'>>> {
    return this._page.evaluate(() => {
      const workbenchService = (window as unknown as Record<string, unknown>)['__workbenchService'] as WorkbenchService;
      return workbenchService.parts().map(part => ({id: part.id, alternativeId: part.alternativeId}));
    });
  }
}
