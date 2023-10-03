/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {waitUntilStable} from '../helper/testing.util';

test.describe('Workbench Part', () => {

  test('should activate part when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view "left".
    const leftTestPagePO = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    // Open test view "right".
    const rightTestPagePO = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    // Move test view to the right
    await rightTestPagePO.view.viewTab.dragTo({partId: await appPO.activePart({inMainArea: true}).getPartId(), region: 'east'});

    // Capture part and view identities.
    const leftPartId = await leftTestPagePO.view.part.getPartId();
    const rightPartId = await rightTestPagePO.view.part.getPartId();
    const leftViewId = await leftTestPagePO.view.getViewId();
    const rightViewId = await rightTestPagePO.view.getViewId();

    // Expect right part to be activated.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: leftPartId,
            views: [{id: leftViewId}],
            activeViewId: leftViewId,
          }),
          child2: new MPart({
            id: rightPartId,
            views: [{id: rightViewId}],
            activeViewId: rightViewId,
          }),
        }),
        activePartId: rightPartId,
      },
    });

    // When clicking left test view.
    await leftTestPagePO.clickInputField();
    await waitUntilStable(() => appPO.activePart({inMainArea: true}).getPartId());

    // Expect left part to be activated.
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: leftPartId,
            views: [{id: leftViewId}],
            activeViewId: leftViewId,
          }),
          child2: new MPart({
            id: rightPartId,
            views: [{id: rightViewId}],
            activeViewId: rightViewId,
          }),
        }),
        activePartId: leftPartId,
      },
    });
  });
});
