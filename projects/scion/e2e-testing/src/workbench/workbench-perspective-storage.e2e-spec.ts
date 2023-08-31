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
import {LayoutPagePO} from './page-object/layout-page.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench Perspective Storage', () => {

  test('should restore workbench grid from storage', async ({page, appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective-1']});

    // Switch to perspective-1
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId: 'perspective-1'});
    await perspectiveToggleButtonPO.click();

    // Add part and view to the workbench grid
    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});
    await layoutPagePO.addView('view-1', {partId: 'left', activateView: true});
    await layoutPagePO.addView('view-2', {partId: 'left', activateView: true});

    const view1PO = appPO.view({viewId: 'view-1'});
    const view2PO = appPO.view({viewId: 'view-2'});

    // Reopen the page
    await page.goto('about:blank');
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective-1']});

    // Expect perspective-1 to be restored from the storage
    await expect(await perspectiveToggleButtonPO.isActive()).toBe(true);
    await expect(await view1PO.viewTab.isActive()).toBe(false);
    await expect(await view2PO.viewTab.isActive()).toBe(true);

    // Close view
    await view2PO.viewTab.close();

    // Reopen the page
    await page.goto('about:blank');
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective-1']});

    // Expect perspective-1 to be restored from the storage
    await expect(await view1PO.viewTab.isActive()).toBe(true);
    await expect(await view2PO.isPresent()).toBe(false);
  });
});
