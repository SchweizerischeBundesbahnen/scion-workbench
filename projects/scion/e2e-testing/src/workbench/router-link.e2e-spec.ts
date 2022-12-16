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
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench RouterLink', () => {

  test('should open the view in the current view tab (by default)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab (target="auto")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab (target="blank")', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  test('should open the view in a new view tab without activating it when pressing the CTRL modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink(['Control']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab without activating it when pressing the META modifier key', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigateViaRouterLink(['Meta']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
  });

  test('should open the view in a new view tab and activate it when pressing the CTRL modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.checkActivate(true);
    await routerPagePO.clickNavigateViaRouterLink(['Control']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });

  /**
   * The Meta key is the Windows logo key, or the Command or ⌘ key on Mac keyboards.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   */
  test('should open the view in a new view tab and activate it when pressing the META modifier key and activate flag is `true`', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.checkActivate(true);
    await routerPagePO.clickNavigateViaRouterLink(['Meta']);

    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee'}).viewTab.isActive()).toBe(true);
  });
});
