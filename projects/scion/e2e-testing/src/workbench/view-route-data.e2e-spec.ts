/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {expect} from '@playwright/test';

/**
 * See `view-route-data-test-page.module.ts` for a visual route overview.
 */
test.describe('View Route Data', () => {

  test.describe('test-pages/view-route-data-test-page/features/eager', () => {

    const basePath = 'test-pages/view-route-data-test-page/features/eager';

    test('should resolve view properties from route data of route "feature-a"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-a`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Features Title');
      await expect(await viewTab.getHeading()).toEqual('Features Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-b"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-b`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Feature B Title');
      await expect(await viewTab.getHeading()).toEqual('Feature B Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-feature-b');
      await expect(await viewTab.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-c"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-c`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Features Title');
      await expect(await viewTab.getHeading()).toEqual('Features Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-d"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-d`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Feature D Title');
      await expect(await viewTab.getHeading()).toEqual('Feature D Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-feature-d');
      await expect(await viewTab.getCssClasses()).not.toContain('e2e-features');
    });
  });

  test.describe('test-pages/view-route-data-test-page/features/lazy', () => {

    const basePath = 'test-pages/view-route-data-test-page/features/lazy';

    test('should resolve view properties from route data of route "feature-a"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-a`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Features Lazy Title');
      await expect(await viewTab.getHeading()).toEqual('Features Lazy Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-features-lazy');
    });

    test('should resolve view properties from route data of route "feature-b"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-b`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Feature B Title');
      await expect(await viewTab.getHeading()).toEqual('Feature B Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-feature-b');
      await expect(await viewTab.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-c"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-c`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Features Lazy Title');
      await expect(await viewTab.getHeading()).toEqual('Features Lazy Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-features-lazy');
    });

    test('should resolve view properties from route data of route "feature-d"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.enterPath(`${basePath}/feature-d`);
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee');
      await routerPage.clickNavigate();

      const viewTab = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTab.getTitle()).toEqual('Feature D Title');
      await expect(await viewTab.getHeading()).toEqual('Feature D Heading');
      await expect(await viewTab.getCssClasses()).toContain('e2e-feature-d');
      await expect(await viewTab.getCssClasses()).not.toContain('e2e-features');
    });
  });
});
