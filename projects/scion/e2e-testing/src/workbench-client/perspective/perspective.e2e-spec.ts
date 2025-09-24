/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {MAIN_AREA} from '../../workbench.model';
import {expectView} from '../../matcher/view-matcher';
import {ViewPagePO} from '../page-object/view-page.po';
import {expect} from '@playwright/test';
import {MPart, MTreeNode} from '../../matcher/to-equal-workbench-layout.matcher';
import {MessagingPagePO} from '../page-object/messaging-page.po';
import {ViewInfo} from '../../workbench/page-object/view-info-dialog.po';
import {Manifest} from '@scion/microfrontend-platform';
import {RouterPagePO} from '../page-object/router-page.po';

// TODO [activity] Migrate tests to new perspective capability model
test.describe.fixme('Workbench Perspective', () => {

  test('should contribute perspective with main area', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee-1'},
      properties: {
        path: 'test-view;capability=testee-1',
        title: 'Test View 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee-2'},
      properties: {
        path: 'test-view;capability=testee-2',
        title: 'Test View 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'testee-1'}, cssClass: 'testee-1'},
          {qualifier: {view: 'testee-2'}, cssClass: 'testee-2'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'right'},
      properties: {
        views: [
          {qualifier: {view: 'testee-2'}, cssClass: 'testee-3'},
          {qualifier: {view: 'testee-1'}, cssClass: 'testee-4'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'testee'},
      properties: {
        path: 'test-part',
        extras: {
          icon: 'folder',
          label: 'testee',
        },
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {id: 'left'},
            position: {
              relativeTo: MAIN_AREA,
              align: 'left',
              ratio: .25,
            },
          },
          {
            id: 'part.right',
            qualifier: {id: 'right'},
            position: {
              relativeTo: MAIN_AREA,
              align: 'right',
              ratio: .2,
            },
          },
          {
            id: 'part.testee-1',
            qualifier: {id: 'testee'},
            position: 'left-top',
            active: true,
            ɵactivityId: 'activity.1',
          },
          {
            id: 'part.testee-2',
            qualifier: {id: 'testee'},
            position: 'right-top',
            active: false,
            ɵactivityId: 'activity.2',
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const viewPage3 = new ViewPagePO(appPO, {cssClass: 'testee-3'});
    const viewPage4 = new ViewPagePO(appPO, {cssClass: 'testee-4'});

    // Expect layout of the perspective.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await viewPage1.view.tab.getViewId()},
                {id: await viewPage2.view.tab.getViewId()},
              ],
              activeViewId: await viewPage1.view.tab.getViewId(),
            }),
            child2: new MTreeNode({
              direction: 'row',
              ratio: .8,
              child1: new MPart({
                id: MAIN_AREA,
              }),
              child2: new MPart({
                id: 'part.right',
                views: [
                  {id: await viewPage3.view.tab.getViewId()},
                  {id: await viewPage4.view.tab.getViewId()},
                ],
                activeViewId: await viewPage3.view.tab.getViewId(),
              }),
            }),
          }),
        },
        'activity.1': {
          root: new MPart({
            id: 'part.testee-1',
          }),
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
          rightTop: {
            activities: [{id: 'activity.2'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Assert views of the left part.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive({loaded: false});

    // Assert views of the right part.
    await expectView(viewPage3).toBeActive();
    await expectView(viewPage4).toBeInactive({loaded: false});

    // Assert correct capability to be resolved.
    await viewPage1.view.tab.click();
    await expect.poll(() => viewPage1.getRouteParams()).toMatchObject({capability: 'testee-1'});

    await viewPage2.view.tab.click();
    await expect.poll(() => viewPage2.getRouteParams()).toMatchObject({capability: 'testee-2'});

    await viewPage3.view.tab.click();
    await expect.poll(() => viewPage3.getRouteParams()).toMatchObject({capability: 'testee-2'});

    await viewPage4.view.tab.click();
    await expect.poll(() => viewPage4.getRouteParams()).toMatchObject({capability: 'testee-1'});
  });

  test('should contribute perspective without main area', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee-1'},
      properties: {
        path: 'test-view;capability=testee-1',
        title: 'Test View 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee-2'},
      properties: {
        path: 'test-view;capability=testee-2',
        title: 'Test View 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee-3'},
      properties: {
        path: 'test-view;capability=testee-3',
        title: 'Test View 3',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'testee-1'}, cssClass: 'testee-1'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'right-top'},
      properties: {
        views: [
          {qualifier: {view: 'testee-2'}, cssClass: 'testee-2'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'right-bottom'},
      properties: {
        views: [
          {qualifier: {view: 'testee-3'}, cssClass: 'testee-3'},
        ],
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.left',
            qualifier: {id: 'left'},
          },
          {
            id: 'part.right-top',
            qualifier: {id: 'right-top'},
            position: {
              align: 'right',
              ratio: .2,
            },
          },
          {
            id: 'part.right-bottom',
            qualifier: {id: 'right-bottom'},
            position: {
              relativeTo: 'part.right-top',
              align: 'bottom',
              ratio: .5,
            },
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const viewPage3 = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // Expect layout of the perspective.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await viewPage1.view.tab.getViewId()},
              ],
              activeViewId: await viewPage1.view.tab.getViewId(),
            }),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'part.right-top',
                views: [
                  {id: await viewPage2.view.tab.getViewId()},
                ],
                activeViewId: await viewPage2.view.tab.getViewId(),
              }),
              child2: new MPart({
                id: 'part.right-bottom',
                views: [
                  {id: await viewPage3.view.tab.getViewId()},
                ],
                activeViewId: await viewPage3.view.tab.getViewId(),
              }),
            }),
          }),
        },
      },
    });

    // Assert views.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();
    await expectView(viewPage3).toBeActive();

    // Assert correct capability to be resolved.
    await viewPage1.view.tab.click();
    await expect.poll(() => viewPage1.getRouteParams()).toMatchObject({capability: 'testee-1'});

    await viewPage2.view.tab.click();
    await expect.poll(() => viewPage2.getRouteParams()).toMatchObject({capability: 'testee-2'});

    await viewPage3.view.tab.click();
    await expect.poll(() => viewPage3.getRouteParams()).toMatchObject({capability: 'testee-3'});
  });

  test('should activate first view if not specified', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee'},
      properties: {
        path: 'test-view',
        title: 'Test View',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'part'},
      properties: {
        id: 'part.part',
        views: [
          {qualifier: {view: 'testee'}, cssClass: 'testee-1'},
          {qualifier: {view: 'testee'}, cssClass: 'testee-2'},
          {qualifier: {view: 'testee'}, cssClass: 'testee-3'},
        ],
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.part',
            qualifier: {id: 'part'},
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const viewPage3 = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // Expect first view to be active.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive({loaded: false});
    await expectView(viewPage3).toBeInactive({loaded: false});
  });

  test('should activate specified view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee'},
      properties: {
        path: 'test-view',
        title: 'Test View',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'part'},
      properties: {
        views: [
          {qualifier: {view: 'testee'}, cssClass: 'testee-1'},
          {qualifier: {view: 'testee'}, cssClass: 'testee-2', active: true},
          {qualifier: {view: 'testee'}, cssClass: 'testee-3'},
        ],
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.part',
            qualifier: {id: 'part'},
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const viewPage3 = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // Expect view 2 to be active.
    await expectView(viewPage1).toBeInactive({loaded: false});
    await expectView(viewPage2).toBeActive();
    await expectView(viewPage3).toBeInactive({loaded: false});
  });

  test('should switch perspective', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: '1'},
      properties: {
        path: 'test-view',
        title: 'Test View 1',
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {view: '2'},
      properties: {
        path: 'test-view',
        title: 'Test View 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'left'},
      properties: {
        views: [
          {qualifier: {view: '1'}, cssClass: 'testee-1'},
        ],
      },
    });

    // Register perspective 1.
    const perspective1 = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: '1'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {id: 'left'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {id: 'main-area'},
      properties: {
        id: MAIN_AREA,
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {id: 'right'},
      properties: {
        views: [
          {qualifier: {view: '2'}, cssClass: 'testee-2'},
        ],
      },
    });

    // Register perspective 2.
    const perspective2 = await microfrontendNavigator.registerCapability('app2', {
      type: 'perspective',
      qualifier: {perspective: '2'},
      private: false,
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.right',
            qualifier: {id: 'right'},
            position: {
              align: 'right',
            },
          },
        ],
      },
    });

    // Register intention to perspective 2.
    await microfrontendNavigator.registerIntention('app1', {
      type: 'perspective',
      qualifier: {perspective: '2'},
    });

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // Switch to perspective 1.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: '1'}});

    // Expect perspective 1 to be active.
    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual(perspective1.metadata!.id);
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await viewPage1.view.tab.getViewId()},
              ],
              activeViewId: await viewPage1.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });
    await expectView(viewPage1).toBeActive();

    // Switch to perspective 2.
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: '2'}});

    // Expect perspective 2 to be active.
    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual(perspective2.metadata!.id);
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: MAIN_AREA,
            }),
            child2: new MPart({
              id: 'part.right',
              views: [
                {id: await viewPage2.view.tab.getViewId()},
              ],
              activeViewId: await viewPage2.view.tab.getViewId(),
            }),
          }),
        },
      },
    });
    await expectView(viewPage2).toBeActive();
  });

  test('should display view after adding missing intention and reloading the application', async ({appPO, microfrontendNavigator, page, consoleLogs, browser}) => {
    // Declare manifest of app 1.
    let manifestApp1: Manifest = {
      name: 'Workbench Client Testing App 1',
      baseUrl: '#',
      capabilities: [
        {
          type: 'perspective',
          qualifier: {perspective: 'testee'},
          properties: {
            parts: [
              {
                id: MAIN_AREA,
                qualifier: {id: 'main-area'},
              },
              {
                id: 'part.left',
                qualifier: {id: 'left'},
                position: {
                  align: 'left',
                },
              },
            ],
          },
        },
        {
          type: 'view',
          qualifier: {view: 'app-1'},
          properties: {
            path: 'test-view',
            title: 'Test View App 1',
          },
        },
        {
          type: 'part',
          qualifier: {id: 'main-area'},
        },
        {
          type: 'part',
          qualifier: {id: 'left'},
          properties: {
            views: [
              {qualifier: {view: 'app-1'}, cssClass: 'testee-1'},
              {qualifier: {view: 'app-2'}, cssClass: 'testee-2'},
            ],
          },
        },
        {
          type: 'activator',
          private: false,
          properties: {
            path: 'activator',
            readinessTopics: 'activator-ready',
          },
        },
      ],
    };

    // Declare manifest of app 2.
    const manifestApp2: Manifest = {
      name: 'Workbench Client Testing App 2',
      baseUrl: '#',
      capabilities: [
        {
          type: 'view',
          qualifier: {view: 'app-2'},
          private: false,
          properties: {
            path: 'test-view',
            title: 'Test View App 2',
          },
        },
      ],
    };

    // Provide manifests.
    await page.route('**/manifest-app1.json', async route => route.fulfill({json: manifestApp1}));
    await page.route('**/manifest-app2.json', async route => route.fulfill({json: manifestApp2}));

    // Open application.
    await appPO.navigateTo({microfrontendSupport: true});

    // Switch perspective.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: 'testee'}});

    const testViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // Expect the perspective.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await testViewPage1.view.tab.getViewId()},
              ],
              activeViewId: await testViewPage1.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    // Expect view 1.
    await expectView(testViewPage1).toBeActive();

    // Expect warning to be logged.
    // TODO [activity] fixme
    // await expect.poll(() => consoleLogs.get({severity: 'warning', message: /NotQualifiedError/})).not.toEqual([]);

    // Add missing intention to the manifest of app 1.
    manifestApp1 = {
      ...manifestApp1,
      intentions: [
        {type: 'view', qualifier: {view: 'app-2'}},
      ],
    };

    // Reload the application.
    await appPO.reload();

    // Expect the perspective.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await testViewPage1.view.tab.getViewId()},
                {id: await testViewPage2.view.tab.getViewId()},
              ],
              activeViewId: await testViewPage1.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    await expectView(testViewPage1).toBeActive();
    await expectView(testViewPage2).toBeInactive({loaded: false});
  });

  test('should display view after correcting qualifier and reloading the application', async ({appPO, microfrontendNavigator, page, consoleLogs, browser}) => {
    // Provide manifest.
    await page.route('**/manifest-app1.json', async route => route.fulfill({
      json: {
        name: 'Workbench Client Testing App 1',
        baseUrl: '#',
        capabilities: [
          {
            type: 'perspective',
            qualifier: {perspective: 'testee'},
            properties: {
              parts: [
                {
                  id: MAIN_AREA,
                  qualifier: {id: 'main-area'},
                },
                {
                  id: 'part.left',
                  qualifier: {id: 'left'},
                  position: {
                    align: 'left',
                  },
                },
              ],
            },
          },
          {
            type: 'part',
            qualifier: {id: 'main-area'},
          },
          {
            type: 'part',
            qualifier: {id: 'left'},
            properties: {
              views: [
                {qualifier: {view: 'testee-1'}, cssClass: 'testee-1'},
                {qualifier: {view: 'testee-2'}, cssClass: 'testee-2'},
              ],
            },
          },
          {
            type: 'view',
            qualifier: {view: 'testee-1'},
            properties: {
              path: 'test-view',
              title: 'Test View',
            },
          },
          {
            type: 'activator',
            private: false,
            properties: {
              path: 'activator',
              readinessTopics: 'activator-ready',
            },
          },
        ],
      } satisfies Manifest,
    }));

    // Open application.
    await appPO.navigateTo({microfrontendSupport: true});

    // Switch perspective.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: 'testee'}});

    const testViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // Expect the perspective.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await testViewPage1.view.tab.getViewId()},
              ],
              activeViewId: await testViewPage1.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    // Expect view 2 not to be attached.
    await expectView(testViewPage2).not.toBeAttached();

    // Expect warning to be logged.
    // TODO [activity] fixme
    // await expect.poll(() => consoleLogs.get({severity: 'warning', message: /NullCapabilityError/})).not.toEqual([]);

    // Correct manifest.
    await page.route('**/manifest-app1.json', async route => route.fulfill({
      json: {
        name: 'Workbench Client Testing App 1',
        baseUrl: '#',
        capabilities: [
          {
            type: 'perspective',
            qualifier: {perspective: 'testee'},
            properties: {
              parts: [
                {
                  id: MAIN_AREA,
                  qualifier: {id: 'main-area'},
                },
                {
                  id: 'part.left',
                  qualifier: {id: 'left'},
                  position: {
                    align: 'left',
                  },
                },
              ],
            },
          },
          {
            type: 'part',
            qualifier: {id: 'main-area'},
          },
          {
            type: 'part',
            qualifier: {id: 'left'},
            properties: {
              views: [
                {qualifier: {view: 'testee-1'}, cssClass: 'testee-1'},
                {qualifier: {view: 'testee-2'}, cssClass: 'testee-2'},
              ],
            },
          },
          {
            type: 'view',
            qualifier: {view: 'testee-1'},
            properties: {
              path: 'test-view',
              title: 'Test View',
            },
          },
          {
            type: 'view',
            qualifier: {view: 'testee-2'},
            properties: {
              path: 'test-view',
              title: 'Test View',
            },
          },
          {
            type: 'activator',
            private: false,
            properties: {
              path: 'activator',
              readinessTopics: 'activator-ready',
            },
          },
        ],
      } satisfies Manifest,
    }));

    // Reload the application.
    await appPO.reload();

    // Expect the perspective.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await testViewPage1.view.tab.getViewId()},
                {id: await testViewPage2.view.tab.getViewId()},
              ],
              activeViewId: await testViewPage1.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    // Expect views.
    await expectView(testViewPage1).toBeActive();
    await expectView(testViewPage2).toBeInactive({loaded: false});
  });

  test('should not display view if capability is not found', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view in "app 1".
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'app-1'},
      properties: {
        path: 'test-view',
        title: 'Test View App 1',
      },
    });

    // Register view in "app 2".
    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {view: 'app-2'},
      properties: {
        path: 'test-view',
        title: 'Test View App 21',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'main-area'},
      properties: {
        id: MAIN_AREA,
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'app-1'}, cssClass: 'testee-1'},
          {qualifier: {view: 'app-2'}, cssClass: 'testee-2'}, // missing intention
          {qualifier: {view: 'not-exist'}, cssClass: 'testee-3'},
        ],
      },
    });

    // Register perspective in "app 1".
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {id: 'left'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    const testViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect perspective to be active.
    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual(perspective.metadata!.id);

    // Expect warning to be logged.
    // TODO [activity] fixme
    // await expect.poll(() => consoleLogs.get({severity: 'warning', message: /NullCapabilityError/})).not.toEqual([]);

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await testViewPage1.view.tab.getViewId()},
              ],
              activeViewId: await testViewPage1.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    await expectView(testViewPage1).toBeActive();
  });

  test('should not display views of other apps if the perspective has no intention', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view in "app 1".
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'app-1'},
      properties: {
        path: 'test-view',
        title: 'Test View App 1',
      },
    });

    // Register view in "app 2".
    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {view: 'app-2'},
      properties: {
        path: 'test-view',
        title: 'Test View App 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'main-area'},
      properties: {
        id: MAIN_AREA,
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'app-1'}, cssClass: 'testee-1'},
          {qualifier: {view: 'app-2'}, cssClass: 'testee-2'},
        ],
      },
    });

    // Register perspective.
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {id: 'left'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    const testViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect perspective to be active.
    await expect.poll(() => appPO.getActivePerspectiveId()).toEqual(perspective.metadata!.id);

    // Expect warning to be logged.
    // TODO [activity] fixme
    // await expect.poll(() => consoleLogs.get({severity: 'warning', message: /NotQualifiedError/})).not.toEqual([]);

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [
                {id: await testViewPage.view.tab.getViewId()},
              ],
              activeViewId: await testViewPage.view.tab.getViewId(),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    await expectView(testViewPage).toBeActive();
  });

  /**
   * In this test, we have two perspectives, each with views "view.101" and "view.102", where perspective 1 displays non-microfrontends
   * and perspective 2 displays microfrontends. Both perspectives have the "view.101" active.
   *
   * This test verifies that when switching from perspective 1 to perspective 2, the inactive view "view.102" is loaded, i.e., has the view title set.
   */
  test('should change detect inactive views of same view id when switching perspective (1/2)', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 1',
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-2'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 2',
      },
    });

    // Register perspective 1.
    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.left'})
      .navigateView('view.101', ['test-router'])
      .navigateView('view.102', ['test-view']),
    );

    // Register perspective 2.
    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.left'}),
    );

    // Replace views with microfrontend views.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({view: 'view-1'}, {target: 'view.101'});
    await routerPage.navigate({view: 'view-2'}, {target: 'view.102'});
    await routerPage.view.tab.close();

    // Switch to perspective 1.
    await appPO.switchPerspective(perspective1);
    // Switch to perspective 2.
    await appPO.switchPerspective(perspective2);

    // Expect microfrontends to be loaded.
    const view1 = appPO.view({viewId: 'view.101'});
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        title: 'Microfrontend View 1',
      } satisfies Partial<ViewInfo>,
    );

    const view2 = appPO.view({viewId: 'view.102'});
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        viewId: 'view.102',
        title: 'Microfrontend View 2',
      } satisfies Partial<ViewInfo>,
    );
  });

  /**
   * In this test, we have two perspectives, each with views "view.101" and "view.102", where perspective 1 displays non-microfrontends
   * and perspective 2 displays microfrontends. Perspective 1 has view "view.101" active and perspective 2 has view "view.102" active.
   *
   * This test verifies that when switching from perspective 1 to perspective 2, the inactive view "view.101" is loaded, i.e., has the view title set.
   */
  test('should change detect inactive views of same view id when switching perspective (2/2)', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 1',
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-2'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 2',
      },
    });

    // Register perspective 1.
    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .addView('view.101', {partId: 'part.left', activateView: true})
      .addView('view.102', {partId: 'part.left'})
      .navigateView('view.101', ['test-router'])
      .navigateView('view.102', ['test-view']),
    );

    // Register perspective 2.
    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .addView('view.101', {partId: 'part.right'})
      .addView('view.102', {partId: 'part.right', activateView: true}),
    );

    // Replace views with microfrontend views.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({view: 'view-1'}, {target: 'view.101'});
    await routerPage.navigate({view: 'view-2'}, {target: 'view.102'});
    await routerPage.view.tab.close();

    // Switch to perspective 1.
    await appPO.switchPerspective(perspective1);
    // Switch to perspective 2.
    await appPO.switchPerspective(perspective2);

    // Expect microfrontends to be loaded.
    const view1 = appPO.view({viewId: 'view.101'});
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        title: 'Microfrontend View 1',
      } satisfies Partial<ViewInfo>,
    );

    const view2 = appPO.view({viewId: 'view.102'});
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        viewId: 'view.102',
        title: 'Microfrontend View 2',
      } satisfies Partial<ViewInfo>,
    );
  });

  /**
   * In this test, we have two perspectives: perspective 1 has a part on the left, and perspective 2 has a part on the right.
   * The left and right parts are the same size and contain the view "view.1."
   *
   * This test verifies that when switching from perspective 1 to perspective 2 the microfrontend is correctly aligned with the left or right part.
   */
  test('should align microfrontend to view bounds when switching perspective', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'app-1'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View App 1',
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {view: 'app-2'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View App 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'main-area'},
      properties: {
        id: MAIN_AREA,
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {id: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'app-1'}, cssClass: 'app-1'},
        ],
      },
    });

    // Register perspective 1.
    const perspective1 = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'app-1'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {id: 'left'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {id: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {id: 'right'},
      properties: {
        views: [
          {qualifier: {view: 'app-2'}, cssClass: 'app-2'},
        ],
      },
    });

    // Register perspective 2.
    const perspective2 = await microfrontendNavigator.registerCapability('app2', {
      type: 'perspective',
      qualifier: {perspective: 'app-2'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {id: 'main-area'},
          },
          {
            id: 'part.right',
            qualifier: {id: 'right'},
            position: {
              align: 'right',
            },
          },
        ],
      },
    });

    const viewPageApp1 = new ViewPagePO(appPO, {cssClass: 'app-1'});
    const viewPageApp2 = new ViewPagePO(appPO, {cssClass: 'app-2'});

    await test.step('Switching to perspective 1', async () => {
      await appPO.switchPerspective(perspective1.metadata!.id);

      // Expect microfrontend to display.
      await expect.poll(() => viewPageApp1.view.getInfo()).toMatchObject({title: 'Microfrontend View App 1'} satisfies Partial<ViewInfo>);
      // Expect the microfrontend to be aligned to the view bounds.
      await expect(async () => {
        const outletBounds = await viewPageApp1.outlet.getBoundingBox();
        const viewBounds = await viewPageApp1.view.getBoundingBox();
        expect(outletBounds).toEqual(viewBounds);
      }).toPass();
    });

    await test.step('Switching to perspective 2', async () => {
      await appPO.switchPerspective(perspective2.metadata!.id);

      // Expect microfrontend to display.
      await expect.poll(() => viewPageApp2.view.getInfo()).toMatchObject({title: 'Microfrontend View App 2'} satisfies Partial<ViewInfo>);
      // Expect the microfrontend to be aligned to the view bounds.
      await expect(async () => {
        const outletBounds = await viewPageApp2.outlet.getBoundingBox();
        const viewBounds = await viewPageApp2.view.getBoundingBox();
        expect(outletBounds).toEqual(viewBounds);
      }).toPass();
    });

    await test.step('Switching to perspective 1', async () => {
      await appPO.switchPerspective(perspective1.metadata!.id);

      // Expect microfrontend to display.
      await expect.poll(() => viewPageApp1.view.getInfo()).toMatchObject({title: 'Microfrontend View App 1'} satisfies Partial<ViewInfo>);
      // Expect the microfrontend to be aligned to the view bounds.
      await expect(async () => {
        const outletBounds = await viewPageApp1.outlet.getBoundingBox();
        const viewBounds = await viewPageApp1.view.getBoundingBox();
        expect(outletBounds).toEqual(viewBounds);
      }).toPass();
    });

    await test.step('Switching to perspective 2', async () => {
      await appPO.switchPerspective(perspective2.metadata!.id);

      // Expect microfrontend to display.
      await expect.poll(() => viewPageApp2.view.getInfo()).toMatchObject({title: 'Microfrontend View App 2'} satisfies Partial<ViewInfo>);
      // Expect the microfrontend to be aligned to the view bounds.
      await expect(async () => {
        const outletBounds = await viewPageApp2.outlet.getBoundingBox();
        const viewBounds = await viewPageApp2.view.getBoundingBox();
        expect(outletBounds).toEqual(viewBounds);
      }).toPass();
    });
  });
});
