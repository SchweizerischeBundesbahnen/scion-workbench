/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {WorkenchStartupQueryParams} from '../app.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench Layout Migration', () => {

  /**
   * +--------------------------------------------+--------------------------------------------+
   * | Part: 38f91541-7fdc-4c71-bec2-1d5ad7523bee | Part: fed38011-66b7-46cd-bb42-30ce6f0f8071 |
   * | Views: [view.1]                            | Views: [view.2, view.3]                    |
   * | Active View: view.1                        | Active View: view.3                        |
   * +--------------------------------------------+--------------------------------------------+
   */
  test('should migrate workbench layout v1 to the latest version', async ({page, appPO}) => {
    await page.goto(`/?${WorkenchStartupQueryParams.STANDALONE}=true/#/(view.3:test-view//view.2:test-view//view.1:test-view)?parts=eyJyb290Ijp7Im5vZGVJZCI6IjhkMWQ4MzA1LTgxYzItNDllOC05NWE3LWFlYjNlODM1ODFhMSIsImNoaWxkMSI6eyJ2aWV3SWRzIjpbInZpZXcuMSJdLCJwYXJ0SWQiOiIzOGY5MTU0MS03ZmRjLTRjNzEtYmVjMi0xZDVhZDc1MjNiZWUiLCJhY3RpdmVWaWV3SWQiOiJ2aWV3LjEifSwiY2hpbGQyIjp7InZpZXdJZHMiOlsidmlldy4yIiwidmlldy4zIl0sInBhcnRJZCI6ImZlZDM4MDExLTY2YjctNDZjZC1iYjQyLTMwY2U2ZjBmODA3MSIsImFjdGl2ZVZpZXdJZCI6InZpZXcuMyJ9LCJkaXJlY3Rpb24iOiJyb3ciLCJyYXRpbyI6MC41fSwiYWN0aXZlUGFydElkIjoiMzhmOTE1NDEtN2ZkYy00YzcxLWJlYzItMWQ1YWQ3NTIzYmVlIiwidXVpZCI6IjFlMjIzN2U1LWE3MzAtNDk1NC1iYWJmLWNkMzRjMjM3OWI1ZSJ9`);
    await appPO.waitUntilWorkbenchStarted();

    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: MAIN_AREA,
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: '38f91541-7fdc-4c71-bec2-1d5ad7523bee',
            views: [{id: 'view.1'}],
            activeViewId: 'view.1',
          }),
          child2: new MPart({
            id: 'fed38011-66b7-46cd-bb42-30ce6f0f8071',
            views: [
              {id: 'view.2'},
              {id: 'view.3'},
            ],
            activeViewId: 'view.3',
          }),
        }),
        activePartId: '38f91541-7fdc-4c71-bec2-1d5ad7523bee',
      },
    });
  });
});
