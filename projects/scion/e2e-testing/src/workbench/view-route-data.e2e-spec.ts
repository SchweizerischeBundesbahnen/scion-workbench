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

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-a`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Features Title');
      await expect(await viewTabPO.getHeading()).toEqual('Features Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-b"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-b`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Feature B Title');
      await expect(await viewTabPO.getHeading()).toEqual('Feature B Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-feature-b');
      await expect(await viewTabPO.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-c"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-c`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Features Title');
      await expect(await viewTabPO.getHeading()).toEqual('Features Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-d"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-d`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Feature D Title');
      await expect(await viewTabPO.getHeading()).toEqual('Feature D Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-feature-d');
      await expect(await viewTabPO.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-part/part-1"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-1`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART'/);
    });

    test('should resolve view properties from route data of route "feature-part/part-2"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-2`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART_2'/);
    });

    test('should resolve view properties from route data of route "feature-part/part-3"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-3`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART'/);
    });

    test('should resolve view properties from route data of route "feature-part/part-4"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-4`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART_4'/);
    });
  });

  test.describe('test-pages/view-route-data-test-page/features/lazy', () => {

    const basePath = 'test-pages/view-route-data-test-page/features/lazy';

    test('should resolve view properties from route data of route "feature-a"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-a`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Features Lazy Title');
      await expect(await viewTabPO.getHeading()).toEqual('Features Lazy Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-features-lazy');
    });

    test('should resolve view properties from route data of route "feature-b"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-b`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Feature B Title');
      await expect(await viewTabPO.getHeading()).toEqual('Feature B Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-feature-b');
      await expect(await viewTabPO.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-c"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-c`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Features Lazy Title');
      await expect(await viewTabPO.getHeading()).toEqual('Features Lazy Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-features-lazy');
    });

    test('should resolve view properties from route data of route "feature-d"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-d`);
      await routerPagePO.selectTarget('blank');
      await routerPagePO.enterCssClass('testee');
      await routerPagePO.clickNavigate();

      const viewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
      await expect(await viewTabPO.getTitle()).toEqual('Feature D Title');
      await expect(await viewTabPO.getHeading()).toEqual('Feature D Heading');
      await expect(await viewTabPO.getCssClasses()).toContain('e2e-feature-d');
      await expect(await viewTabPO.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-part/part-1"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-1`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART'/);
    });

    test('should resolve view properties from route data of route "feature-part/part-2"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-2`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART_2'/);
    });

    test('should resolve view properties from route data of route "feature-part/part-3"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-3`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART'/);
    });

    test('should resolve view properties from route data of route "feature-part/part-4"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPagePO.enterPath(`${basePath}/feature-part/part-4`);
      await routerPagePO.selectTarget('blank');
      await expect(routerPagePO.clickNavigate()).rejects.toThrowError(/\[ViewPreferredPartError] Cannot find the view's preferred part 'PREFERRED_PART_4'/);
    });
  });
});
