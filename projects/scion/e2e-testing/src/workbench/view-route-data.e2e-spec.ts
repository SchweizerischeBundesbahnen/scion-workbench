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
      await routerPage.navigate([`${basePath}/feature-a`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Features Title');
      await expect(view.tab.heading).toHaveText('Features Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-b"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-b`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Feature B Title');
      await expect(view.tab.heading).toHaveText('Feature B Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-feature-b');
      await expect.poll(() => view.tab.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-c"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-c`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Features Title');
      await expect(view.tab.heading).toHaveText('Features Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-d"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-d`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Feature D Title');
      await expect(view.tab.heading).toHaveText('Feature D Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-feature-d');
      await expect.poll(() => view.tab.getCssClasses()).not.toContain('e2e-features');
    });
  });

  test.describe('test-pages/view-route-data-test-page/features/lazy', () => {

    const basePath = 'test-pages/view-route-data-test-page/features/lazy';

    test('should resolve view properties from route data of route "feature-a"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-a`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Features Lazy Title');
      await expect(view.tab.heading).toHaveText('Features Lazy Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-features-lazy');
    });

    test('should resolve view properties from route data of route "feature-b"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-b`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Feature B Title');
      await expect(view.tab.heading).toHaveText('Feature B Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-feature-b');
      await expect.poll(() => view.tab.getCssClasses()).not.toContain('e2e-features');
    });

    test('should resolve view properties from route data of route "feature-c"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-c`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Features Lazy Title');
      await expect(view.tab.heading).toHaveText('Features Lazy Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-features-lazy');
    });

    test('should resolve view properties from route data of route "feature-d"', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate([`${basePath}/feature-d`], {
        target: 'blank',
        cssClass: 'testee',
      });

      const view = appPO.view({cssClass: 'testee'});
      await expect(view.tab.title).toHaveText('Feature D Title');
      await expect(view.tab.heading).toHaveText('Feature D Heading');
      await expect.poll(() => view.tab.getCssClasses()).toContain('e2e-feature-d');
      await expect.poll(() => view.tab.getCssClasses()).not.toContain('e2e-features');
    });
  });
});
