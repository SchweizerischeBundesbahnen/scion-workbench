/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from '../workbench/page-object/view-page.po';

test.describe('Workbench Host View', () => {

  test('should display host view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        cssClass: 'testee',
      },
    });

    // Open testee view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
    await routerPage.navigate({component: 'testee'});

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect host view to be active.
    await expectView(viewPage).toBeActive();
  });
});
