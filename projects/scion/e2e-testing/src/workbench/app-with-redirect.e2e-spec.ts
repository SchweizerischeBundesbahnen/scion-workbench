/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expectView} from '../matcher/view-matcher';
import {PageNotFoundPagePO} from './page-object/page-not-found-page.po';
import {NullContentPagePO} from './page-object/null-content-page.po';
import {expect} from '@playwright/test';
import {RedirectPagePO} from '../redirect-page.po';
import {expectPart} from '../matcher/part-matcher';

test.describe('App With Redirect', () => {

  test('should redirect [providers=workbench-before-router;routes=flat]', async ({appPO}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', url: '#/does-not-exist', waitUntilWorkbenchStarted: false, microfrontendSupport: false});

    // Expect to display the redirect page.
    const redirectPage = new RedirectPagePO(appPO);
    await expect(redirectPage.locator).toBeVisible();
  });

  test('should redirect [providers=workbench-before-router;routes=nested]', async ({appPO}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', url: '#/does-not-exist', waitUntilWorkbenchStarted: false, microfrontendSupport: false});

    // Expect to display the redirect page.
    const redirectPage = new RedirectPagePO(appPO);
    await expect(redirectPage.locator).toBeVisible();
  });

  test('should redirect [providers=workbench-after-router;routes=flat]', async ({appPO}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', url: '#/does-not-exist', waitUntilWorkbenchStarted: false, microfrontendSupport: false});

    // Expect to display the redirect page.
    const redirectPage = new RedirectPagePO(appPO);
    await expect(redirectPage.locator).toBeVisible();
  });

  test('should redirect [providers=workbench-after-router;routes=nested]', async ({appPO}) => {
    await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', url: '#/does-not-exist', waitUntilWorkbenchStarted: false, microfrontendSupport: false});

    // Expect to display the redirect page.
    const redirectPage = new RedirectPagePO(appPO);
    await expect(redirectPage.locator).toBeVisible();
  });

  test.describe('Not Found Page', () => {

    test.describe('Workbench View', () => {
      test('should not redirect but display "Not Found" page [providers=workbench-before-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'})
          .navigateView('view.100', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
        await expectView(notFoundPage).toBeActive();
      });

      test('should not redirect but display "Not Found" page [providers=workbench-before-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'})
          .navigateView('view.100', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
        await expectView(notFoundPage).toBeActive();
      });

      test('should not redirect but display "Not Found" page [providers=workbench-after-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'})
          .navigateView('view.100', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
        await expectView(notFoundPage).toBeActive();
      });

      test('should not redirect but display "Not Found" page [providers=workbench-after-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'})
          .navigateView('view.100', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
        await expectView(notFoundPage).toBeActive();
      });
    });

    test.describe('Workbench Part', () => {
      test('should not redirect but display "Not Found" page [providers=workbench-before-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .navigatePart('part.main', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
      });

      test('should not redirect but display "Not Found" page [providers=workbench-before-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .navigatePart('part.main', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
      });

      test('should not redirect but display "Not Found" page [providers=workbench-after-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .navigatePart('part.main', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
      });

      test('should not redirect but display "Not Found" page [providers=workbench-after-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .navigatePart('part.main', ['does/not/exist']),
        );

        // Expect "Not Found" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
      });
    });
  });

  test.describe('Nothing to Show Page', () => {

    test.describe('Workbench View', () => {
      test('should not redirect but display "Nothing to Show" page [providers=workbench-before-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'}),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const nullContentPage = new NullContentPagePO(appPO, {viewId: 'view.100'});
        await expectView(nullContentPage).toBeActive();
      });

      test('should not redirect but display "Nothing to Show" page [providers=workbench-before-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'}),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const nullContentPage = new NullContentPagePO(appPO, {viewId: 'view.100'});
        await expectView(nullContentPage).toBeActive();
      });

      test('should not redirect but display "Nothing to Show" page [providers=workbench-after-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'}),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const nullContentPage = new NullContentPagePO(appPO, {viewId: 'view.100'});
        await expectView(nullContentPage).toBeActive();
      });

      test('should not redirect but display "Nothing to Show" page [providers=workbench-after-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'}),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const nullContentPage = new NullContentPagePO(appPO, {viewId: 'view.100'});
        await expectView(nullContentPage).toBeActive();
      });
    });

    test.describe.fixme('Workbench Part', () => { // TODO [#663] Remove FIXME when fixed issue https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/663
      test('should not redirect but display "Nothing to Show" page [providers=workbench-before-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main'),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(NullContentPagePO.selector);
      });

      test('should not redirect but display "Nothing to Show" page [providers=workbench-before-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-before-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main'),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(NullContentPagePO.selector);
      });

      test('should not redirect but display "Nothing to Show" page [providers=workbench-after-router;routes=flat]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=flat', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main'),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(NullContentPagePO.selector);
      });

      test('should not redirect but display "Nothing to Show" page [providers=workbench-after-router;routes=nested]', async ({appPO, workbenchNavigator}) => {
        await appPO.navigateTo({appConfig: 'app-with-redirect;providers=workbench-after-router;routes=nested', microfrontendSupport: false});

        await workbenchNavigator.createPerspective(factory => factory
          .addPart('part.main')
          .addView('view.100', {partId: 'part.main'}),
        );

        // Expect "Nothing to Show" page to display, not the "Redirect" page.
        const part = appPO.part({partId: 'part.main'});
        await expectPart(part).toDisplayComponent(NullContentPagePO.selector);
      });
    });
  });
});
