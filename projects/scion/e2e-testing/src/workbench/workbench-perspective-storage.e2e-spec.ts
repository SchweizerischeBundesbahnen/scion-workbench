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
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {MAIN_AREA} from '../workbench.model';
import {ViewPagePO} from './page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';

test.describe('Workbench Perspective Storage', () => {

  test('should restore workbench grid from storage', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, perspectives: ['perspective-1']});

    // Switch to perspective-1
    await appPO.switchPerspective('perspective-1');

    // Add part and view to the workbench grid
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25});
    await layoutPage.addView('outline', {partId: 'left', activateView: true});
    await layoutPage.addView('console', {partId: 'left', activateView: true});
    await layoutPage.navigateView('outline', [], {outlet: 'outline'});
    await layoutPage.navigateView('console', [], {outlet: 'console'});

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: await appPO.resolveViewId('outline')});
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: await appPO.resolveViewId('console')});

    // Reopen the page
    await appPO.reload();

    // Expect perspective-1 to be restored from the storage
    await expect.poll(() => appPO.header.perspectiveToggleButton({perspectiveId: 'perspective-1'}).isActive()).toBe(true);
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // Close view
    await testee2ViewPage.view.tab.close();

    // Reopen the page
    await appPO.reload();

    // Expect perspective-1 to be restored from the storage
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();
  });
});
