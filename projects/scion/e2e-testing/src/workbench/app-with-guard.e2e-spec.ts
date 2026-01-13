/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {ForbiddenPagePO} from '../forbidden-page.po';
import {StartPagePO} from '../start-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';
import {PartPagePO} from './page-object/part-page.po';
import {expectPart} from '../matcher/part-matcher';
import {PageNotFoundPagePO} from './page-object/page-not-found-page.po';
import {NullContentPagePO} from './page-object/null-content-page.po';

/**
 * Tests workbench navigation in an application with a protected empty-path top-level route.
 *
 * ```ts
 * {
 *   path: '',
 *   canActivate: [authorizedGuard()],
 *   children: [
 *     // Default route
 *     {
 *       path: '',
 *       canMatch: [canMatchWorkbenchOutlet(false)],
 *       component: WorkbenchComponent,
 *     },
 *     // Workbench view and part routes
 *     {
 *       path: '',
 *       canMatch: [canMatchWorkbenchOutlet(true)],
 *       children: [
 *         ...
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
test.describe('App With Guard', () => {

  test('should redirect to forbidden page it forbidden', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=true', waitUntilWorkbenchStarted: false, microfrontendSupport: false});

    // Expect forbidden page to display.
    const forbiddenPage = new ForbiddenPagePO(appPO);
    await expect(forbiddenPage.locator).toBeVisible();

    // Expect no error to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'error', message: /\[AuthorizedGuardError] Infinite loop!/})).toHaveLength(0);
  });

  test('should display application if allowed', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

    // Expect start page to display.
    const startPage = new StartPagePO(appPO);
    await expect(startPage.locator).toBeVisible();

    // Expect no error to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'error', message: /\[AuthorizedGuardError] Infinite loop!/})).toHaveLength(0);
  });

  test('should redirect to application\'s default route', async ({appPO, consoleLogs}) => {
    await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', url: '#/does-not-exist', microfrontendSupport: false});

    // Expect start page to display.
    const startPage = new StartPagePO(appPO);
    await expect(startPage.locator).toBeVisible();

    // Expect no error to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test.describe('Path-Based Navigation', () => {

    test('should display view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.100', {partId: 'part.main'})
        .navigateView('view.100', ['test-view']),
      );

      // Expect view to display.
      const viewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(viewPage).toBeActive();
    });

    test('should display part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .navigatePart('part.main', ['test-part']),
      );

      // Expect part to display.
      await expectPart(appPO.part({partId: 'part.main'})).toDisplayComponent(PartPagePO.selector);
    });
  });

  test.describe('Empty-Path Navigation', () => {

    test('should display view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.100', {partId: 'part.main'})
        .navigateView('view.100', [], {hint: 'test-view'}),
      );

      // Expect view to display.
      const viewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(viewPage).toBeActive();
    });

    test('should display part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .navigatePart('part.main', [], {hint: 'test-part'}),
      );

      // Expect part to display.
      await expectPart(appPO.part({partId: 'part.main'})).toDisplayComponent(PartPagePO.selector);
    });
  });

  test.describe('Not Found Page', () => {

    test('should display "Not Found" page in view (path-based navigation)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.100', {partId: 'part.main'})
        .navigateView('view.100', ['does/not/exist']),
      );

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(notFoundPage).toBeActive();
    });

    test('should display "Not Found" page in part (path-based navigation)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .navigatePart('part.main', ['does/not/exist']),
      );

      // Expect "Not Found" page to display.
      const part = appPO.part({partId: 'part.main'});
      await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
    });

    test('should display "Not Found" page in view (empty-path navigation)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.100', {partId: 'part.main'})
        .navigateView('view.100', [], {hint: 'does-not-exist'}),
      );

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(notFoundPage).toBeActive();
    });

    test('should display "Not Found" page in part (empty-path navigation)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .navigatePart('part.main', [], {hint: 'does-not-exist'}),
      );

      // Expect "Not Found" page to display.
      const part = appPO.part({partId: 'part.main'});
      await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
    });

    test('should display "Not Found" page in view when clearing outlets in URL', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.100', {partId: 'part.main'})
        .navigateView('view.100', ['test-view']),
      );

      // Expect view to display.
      const viewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(viewPage).toBeActive();

      // Clear outlets in the URL, simulate navigation from a browser bookmark.
      await appPO.clearOutlets();

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(notFoundPage).toBeActive();
    });

    test('should display "Not Found" page in part when clearing outlets in URL', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .navigatePart('part.main', ['test-part']),
      );

      // Expect part to display.
      await expectPart(appPO.part({partId: 'part.main'})).toDisplayComponent(PartPagePO.selector);

      // Clear outlets in the URL, simulate navigation from a browser bookmark.
      await appPO.clearOutlets();

      // Expect "Not Found" page to display.
      const part = appPO.part({partId: 'part.main'});
      await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
    });
  });

  test.describe('"Nothing to Show" Page', () => {

    test('should display "Nothing to Show" page if not navigated the view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.100', {partId: 'part.main'}),
      );

      // Expect "Null Content" page to display.
      const nullContentPage = new NullContentPagePO(appPO.view({viewId: 'view.100'}));
      await expectView(nullContentPage).toBeActive();
    });

    test('should display "Nothing to Show" page if not navigated the activity part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({appConfig: 'app-with-guard;forbidden=false', microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
        .activatePart('part.activity'),
      );

      // Expect "Null Content" page to display.
      await expectPart(appPO.part({partId: 'part.activity'})).toDisplayComponent(NullContentPagePO.selector);
    });
  });
});
