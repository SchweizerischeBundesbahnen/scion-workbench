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
import {ViewPagePO} from './page-object/view-page.po';

test.describe('View Drag', () => {

  test('should deactivate view when moving it quickly to the center', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open view 2
    const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag view 2 to the center quickly
    const partId = await appPO.activePart.getPartId();
    await view2PO.viewTabPO.dragToPart({region: 'center'}, {steps: 1, performDrop: false});

    // Expect view 1 to be activated
    expect(await view1PO.viewPO.isActive()).toBe(true);
    expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

    // Expect view 2 to be deactivated
    expect(await view2PO.viewPO.isActive()).toBe(false);
    expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
  });

  test('should deactivate view when moving it quickly to the north', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open view 2
    const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag view 2 to the center quickly
    const partId = await appPO.activePart.getPartId();
    await view2PO.viewTabPO.dragToPart({region: 'north'}, {steps: 1, performDrop: false});

    // Expect view 1 to be activated
    expect(await view1PO.viewPO.isActive()).toBe(true);
    expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

    // Expect view 2 to be deactivated
    expect(await view2PO.viewPO.isActive()).toBe(false);
    expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
  });

  test('should deactivate view when moving it quickly to the east', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open view 2
    const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag view 2 to the center quickly
    const partId = await appPO.activePart.getPartId();
    await view2PO.viewTabPO.dragToPart({region: 'east'}, {steps: 1, performDrop: false});

    // Expect view 1 to be activated
    expect(await view1PO.viewPO.isActive()).toBe(true);
    expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

    // Expect view 2 to be deactivated
    expect(await view2PO.viewPO.isActive()).toBe(false);
    expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
  });

  test('should deactivate view when moving it quickly to the south', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open view 2
    const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag view 2 to the center quickly
    const partId = await appPO.activePart.getPartId();
    await view2PO.viewTabPO.dragToPart({region: 'south'}, {steps: 1, performDrop: false});

    // Expect view 1 to be activated
    expect(await view1PO.viewPO.isActive()).toBe(true);
    expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

    // Expect view 2 to be deactivated
    expect(await view2PO.viewPO.isActive()).toBe(false);
    expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
  });

  test('should deactivate view when moving it quickly to the west', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open view 1
    const view1PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open view 2
    const view2PO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Drag view 2 to the center quickly
    const partId = await appPO.activePart.getPartId();
    await view2PO.viewTabPO.dragToPart({region: 'west'}, {steps: 1, performDrop: false});

    // Expect view 1 to be activated
    expect(await view1PO.viewPO.isActive()).toBe(true);
    expect(await view1PO.viewPO.part.getPartId()).toEqual(partId);

    // Expect view 2 to be deactivated
    expect(await view2PO.viewPO.isActive()).toBe(false);
    expect(await view2PO.viewPO.part.getPartId()).toEqual(partId);
  });
});
