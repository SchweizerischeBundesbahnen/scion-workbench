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
import {ViewPagePO as WorkbenchViewPagePO} from '../../workbench/page-object/view-page.po';
import {expect} from '@playwright/test';
import {MPart, MTreeNode} from '../../matcher/to-equal-workbench-layout.matcher';
import {MessagingPagePO} from '../page-object/messaging-page.po';
import {ViewInfo} from '../../workbench/page-object/view-info-dialog.po';
import {Manifest} from '@scion/microfrontend-platform';
import {RouterPagePO} from '../page-object/router-page.po';
import {PartPagePO} from '../page-object/part-page.po';
import {PartPagePO as WorkbenchPartPagePO} from '../../workbench/page-object/part-page.po';
import {expectPart} from '../matcher/part-matcher';
import {expectPart as expectWorkbenchPart} from '../../matcher/part-matcher';
import {expectDesktop} from '../../matcher/desktop-matcher';
import {DesktopPagePO} from '../../workbench/page-object/desktop-page.po';
import {ActivatorCapability, WorkbenchPartCapability, WorkbenchPerspectiveCapability, WorkbenchViewCapability} from '../page-object/register-workbench-capability-page.po';
import {canMatchWorkbenchPartCapability, canMatchWorkbenchViewCapability} from '../../workbench/page-object/layout-page/register-route-page.po';

test.describe('Workbench Perspective', () => {

  /**
   * App 1 defines a perspectives with part microfrontends of the host app, app1 and app2.
   */
  test('should display part microfrontend in perspective provided by a app1', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register main area part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    // Register part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app1'},
      properties: {
        path: 'test-part',
      },
    });

    // Register part capability in app2.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app2', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app2'},
      private: false,
      properties: {
        path: 'test-part',
      },
    });

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      private: false,
      properties: {
        path: '',
      },
    });

    // Register route for host part capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee', app: 'host'})],
    });

    // Register part intention for app1 to access parts of other apps.
    await microfrontendNavigator.registerIntention('app1', {
      type: 'part',
      qualifier: {part: 'testee', app: '*'},
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.testee.app1',
            qualifier: {part: 'testee', app: 'app1'},
            position: {align: 'left'},
          },
          {
            id: 'part.testee.app2',
            qualifier: {part: 'testee', app: 'app2'},
            position: {align: 'right'},
          },
          {
            id: 'part.testee.host',
            qualifier: {part: 'testee', app: 'host'},
            position: {align: 'bottom'},
          },
        ],
      },
    });

    // Expect left part microfrontend of app1 to display.
    await expectPart(appPO.part({partId: 'part.testee.app1'})).toDisplayComponent(PartPagePO.selector);

    // Expect right part microfrontend of app2 to display.
    await expectPart(appPO.part({partId: 'part.testee.app2'})).toDisplayComponent(PartPagePO.selector);

    // Expect bottom part microfrontend of the host to display.
    await expectWorkbenchPart(appPO.part({partId: 'part.testee.host'})).toDisplayComponent(WorkbenchPartPagePO.selector);
  });

  /**
   * Host app defines a perspectives with part microfrontends of the host app, app1 and app2.
   */
  test('should display part microfrontend in perspective provided by the host app', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register main area part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      properties: {
        path: '',
      },
    });

    // Register part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app1'},
      private: false,
      properties: {
        path: 'test-part',
      },
    });

    // Register part capability in app2.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app2', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app2'},
      private: false,
      properties: {
        path: 'test-part',
      },
    });

    // Register route for host part capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee', app: 'host'})],
    });

    // Register part intention for the host app to access parts of other apps.
    await microfrontendNavigator.registerIntention('host', {
      type: 'part',
      qualifier: {part: 'testee', app: '*'},
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('host', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.testee.app1',
            qualifier: {part: 'testee', app: 'app1'},
            position: {align: 'left'},
          },
          {
            id: 'part.testee.app2',
            qualifier: {part: 'testee', app: 'app2'},
            position: {align: 'right'},
          },
          {
            id: 'part.testee.host',
            qualifier: {part: 'testee', app: 'host'},
            position: {align: 'bottom'},
          },
        ],
      },
    });

    // Expect left part microfrontend of app1 to display.
    await expectPart(appPO.part({partId: 'part.testee.app1'})).toDisplayComponent(PartPagePO.selector);

    // Expect right part microfrontend of app2 to display.
    await expectPart(appPO.part({partId: 'part.testee.app2'})).toDisplayComponent(PartPagePO.selector);

    // Expect bottom part microfrontend of the host to display.
    await expectWorkbenchPart(appPO.part({partId: 'part.testee.host'})).toDisplayComponent(WorkbenchPartPagePO.selector);
  });

  /**
   * App 1 defines a perspectives with view microfrontends of the host app, app1 and app2.
   */
  test('should display view microfrontend in perspective provided by app1', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {view: 'testee', app: 'app1'},
      private: false,
      properties: {
        path: 'test-view',
      },
    });

    // Register view capability in app2.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app2', {
      type: 'view',
      qualifier: {view: 'testee', app: 'app2'},
      private: false,
      properties: {
        path: 'test-view',
      },
    });

    // Register view capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {view: 'testee', app: 'host'},
      private: false,
      properties: {
        path: '',
      },
    });

    // Register main area part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    // Register part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app1'},
      properties: {
        views: [
          {qualifier: {view: 'testee', app: 'app1'}, cssClass: ['view-1a', 'app1', 'part-app1']},
          {qualifier: {view: 'testee', app: 'app2'}, cssClass: ['view-1b', 'app2', 'part-app1']},
          {qualifier: {view: 'testee', app: 'host'}, cssClass: ['view-1c', 'host', 'part-app1']},
        ],
      },
    });

    // Register part capability in app2.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app2', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app2'},
      private: false,
      properties: {
        views: [
          {qualifier: {view: 'testee', app: 'app1'}, cssClass: ['view-2a', 'app1', 'part-app2']},
          {qualifier: {view: 'testee', app: 'app2'}, cssClass: ['view-2b', 'app2', 'part-app2']},
          {qualifier: {view: 'testee', app: 'host'}, cssClass: ['view-2c', 'host', 'part-app2']},
        ],
      },
    });

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      private: false,
      properties: {
        views: [
          {qualifier: {view: 'testee', app: 'app1'}, cssClass: ['view-3a', 'app1', 'part-host']},
          {qualifier: {view: 'testee', app: 'app2'}, cssClass: ['view-3b', 'app2', 'part-host']},
          {qualifier: {view: 'testee', app: 'host'}, cssClass: ['view-3c', 'host', 'part-host']},
        ],
      },
    });

    // Register route for host view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({view: 'testee', app: 'host'})],
    });

    // Register part intention for app 1 to access parts of other apps.
    await microfrontendNavigator.registerIntention('app1', {
      type: 'part',
      qualifier: {part: 'testee', app: '*'},
    });

    // Register view intention for app 1 to access views of other apps.
    await microfrontendNavigator.registerIntention('app1', {
      type: 'view',
      qualifier: {view: 'testee', app: '*'},
    });

    // Register view intention for app 2 to access views of other apps.
    await microfrontendNavigator.registerIntention('app2', {
      type: 'view',
      qualifier: {view: 'testee', app: '*'},
    });

    // Register view intention for host app to access views of other apps.
    await microfrontendNavigator.registerIntention('host', {
      type: 'view',
      qualifier: {view: 'testee', app: '*'},
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.testee.app1',
            qualifier: {part: 'testee', app: 'app1'},
            position: {align: 'left'},
          },
          {
            id: 'part.testee.app2',
            qualifier: {part: 'testee', app: 'app2'},
            position: {align: 'right'},
          },
          {
            id: 'part.testee.host',
            qualifier: {part: 'testee', app: 'host'},
            position: {align: 'bottom'},
          },
        ],
      },
    });

    // Activate and assert views of app 1.
    await appPO.view({cssClass: ['view-1a', 'app1', 'part-app1']}).tab.click();
    await appPO.view({cssClass: ['view-2a', 'app1', 'part-app2']}).tab.click();
    await appPO.view({cssClass: ['view-3a', 'app1', 'part-host']}).tab.click();

    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-1a', 'app1', 'part-app1']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-2a', 'app1', 'part-app2']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-3a', 'app1', 'part-host']}))).toBeActive();

    // Activate and assert views of app 2.
    await appPO.view({cssClass: ['view-1b', 'app2', 'part-app1']}).tab.click();
    await appPO.view({cssClass: ['view-2b', 'app2', 'part-app2']}).tab.click();
    await appPO.view({cssClass: ['view-3b', 'app2', 'part-host']}).tab.click();

    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-1b', 'app2', 'part-app1']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-2b', 'app2', 'part-app2']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-3b', 'app2', 'part-host']}))).toBeActive();

    // Activate and assert views of the host app.
    await appPO.view({cssClass: ['view-1c', 'host', 'part-app1']}).tab.click();
    await appPO.view({cssClass: ['view-2c', 'host', 'part-app2']}).tab.click();
    await appPO.view({cssClass: ['view-3c', 'host', 'part-host']}).tab.click();

    await expectView(new WorkbenchViewPagePO(appPO.view({cssClass: ['view-1c', 'host', 'part-app1']}))).toBeActive();
    await expectView(new WorkbenchViewPagePO(appPO.view({cssClass: ['view-2c', 'host', 'part-app2']}))).toBeActive();
    await expectView(new WorkbenchViewPagePO(appPO.view({cssClass: ['view-3c', 'host', 'part-host']}))).toBeActive();
  });

  /**
   * Host app defines a perspectives with view microfrontends of the host app, app1 and app2.
   */
  test('should display view microfrontend in perspective provided by the host app', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {view: 'testee', app: 'app1'},
      private: false,
      properties: {
        path: 'test-view',
      },
    });

    // Register view capability in app2.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app2', {
      type: 'view',
      qualifier: {view: 'testee', app: 'app2'},
      private: false,
      properties: {
        path: 'test-view',
      },
    });

    // Register view capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {view: 'testee', app: 'host'},
      private: false,
      properties: {
        path: '',
      },
    });

    // Register main area part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    // Register part capability in app1.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app1'},
      properties: {
        views: [
          {qualifier: {view: 'testee', app: 'app1'}, cssClass: ['view-1a', 'app1', 'part-app1']},
          {qualifier: {view: 'testee', app: 'app2'}, cssClass: ['view-1b', 'app2', 'part-app1']},
          {qualifier: {view: 'testee', app: 'host'}, cssClass: ['view-1c', 'host', 'part-app1']},
        ],
      },
    });

    // Register part capability in app2.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app2', {
      type: 'part',
      qualifier: {part: 'testee', app: 'app2'},
      private: false,
      properties: {
        extras: {
          icon: 'folder',
          label: 'testee',
        },
        views: [
          {qualifier: {view: 'testee', app: 'app1'}, cssClass: ['view-2a', 'app1', 'part-app2']},
          {qualifier: {view: 'testee', app: 'app2'}, cssClass: ['view-2b', 'app2', 'part-app2']},
          {qualifier: {view: 'testee', app: 'host'}, cssClass: ['view-2c', 'host', 'part-app2']},
        ],
      },
    });

    // Register part capability in host app.
    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
      type: 'part',
      qualifier: {part: 'testee', app: 'host'},
      private: false,
      properties: {
        views: [
          {qualifier: {view: 'testee', app: 'app1'}, cssClass: ['view-3a', 'app1', 'part-host']},
          {qualifier: {view: 'testee', app: 'app2'}, cssClass: ['view-3b', 'app2', 'part-host']},
          {qualifier: {view: 'testee', app: 'host'}, cssClass: ['view-3c', 'host', 'part-host']},
        ],
      },
    });

    // Register route for host view capability.
    await workbenchNavigator.registerRoute({
      path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({view: 'testee', app: 'host'})],
    });

    // Register part intention for host app to access parts of other apps.
    await microfrontendNavigator.registerIntention('host', {
      type: 'part',
      qualifier: {part: 'testee', app: '*'},
    });

    // Register view intention for app 1 to access views of other apps.
    await microfrontendNavigator.registerIntention('app1', {
      type: 'view',
      qualifier: {view: 'testee', app: '*'},
    });

    // Register view intention for app 2 to access views of other apps.
    await microfrontendNavigator.registerIntention('app2', {
      type: 'view',
      qualifier: {view: 'testee', app: '*'},
    });

    // Register view intention for host app to access views of other apps.
    await microfrontendNavigator.registerIntention('host', {
      type: 'view',
      qualifier: {view: 'testee', app: '*'},
    });

    // Create perspective.
    await microfrontendNavigator.createPerspective('host', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.testee.app1',
            qualifier: {part: 'testee', app: 'app1'},
            position: {align: 'left'},
          },
          {
            id: 'part.testee.app2',
            qualifier: {part: 'testee', app: 'app2'},
            position: {align: 'right'},
          },
          {
            id: 'part.testee.host',
            qualifier: {part: 'testee', app: 'host'},
            position: {align: 'bottom'},
          },
        ],
      },
    });

    // Activate and assert views of app 1.
    await appPO.view({cssClass: ['view-1a', 'app1', 'part-app1']}).tab.click();
    await appPO.view({cssClass: ['view-2a', 'app1', 'part-app2']}).tab.click();
    await appPO.view({cssClass: ['view-3a', 'app1', 'part-host']}).tab.click();

    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-1a', 'app1', 'part-app1']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-2a', 'app1', 'part-app2']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-3a', 'app1', 'part-host']}))).toBeActive();

    // Activate and assert views of app 2.
    await appPO.view({cssClass: ['view-1b', 'app2', 'part-app1']}).tab.click();
    await appPO.view({cssClass: ['view-2b', 'app2', 'part-app2']}).tab.click();
    await appPO.view({cssClass: ['view-3b', 'app2', 'part-host']}).tab.click();

    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-1b', 'app2', 'part-app1']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-2b', 'app2', 'part-app2']}))).toBeActive();
    await expectView(new ViewPagePO(appPO.view({cssClass: ['view-3b', 'app2', 'part-host']}))).toBeActive();

    // Activate and assert views of the host app.
    await appPO.view({cssClass: ['view-1c', 'host', 'part-app1']}).tab.click();
    await appPO.view({cssClass: ['view-2c', 'host', 'part-app2']}).tab.click();
    await appPO.view({cssClass: ['view-3c', 'host', 'part-host']}).tab.click();

    await expectView(new WorkbenchViewPagePO(appPO.view({cssClass: ['view-1c', 'host', 'part-app1']}))).toBeActive();
    await expectView(new WorkbenchViewPagePO(appPO.view({cssClass: ['view-2c', 'host', 'part-app2']}))).toBeActive();
    await expectView(new WorkbenchViewPagePO(appPO.view({cssClass: ['view-3c', 'host', 'part-host']}))).toBeActive();
  });

  test('should contribute perspective with main area', async ({appPO, microfrontendNavigator}) => {
    test.slow();
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view;capability=view-1',
        title: 'Test View 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-2'},
      properties: {
        path: 'test-view;capability=view-2',
        title: 'Test View 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-3'},
      properties: {
        path: 'test-view;capability=view-3',
        title: 'Test View 3',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
          {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'right'},
      properties: {
        views: [
          {qualifier: {view: 'view-2'}, cssClass: 'view-3'},
          {qualifier: {view: 'view-1'}, cssClass: 'view-4'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity-1'},
      properties: {
        path: 'test-part;capability=activity-1',
        extras: {
          icon: 'folder',
          label: 'Activity 1',
        },
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity-2'},
      properties: {
        path: 'test-part;capability=activity-2',
        views: [
          {qualifier: {view: 'view-3'}, cssClass: 'view-5'},
        ],
        extras: {
          icon: 'folder',
          label: 'Activity 2',
        },
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity-3'},
      properties: {
        path: 'test-part;capability=activity-3',
        extras: {
          icon: 'folder',
          label: 'Activity 3',
        },
      },
    });

    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {part: 'left'},
            position: {
              relativeTo: MAIN_AREA,
              align: 'left',
              ratio: .25,
            },
          },
          {
            id: 'part.right',
            qualifier: {part: 'right'},
            position: {
              relativeTo: MAIN_AREA,
              align: 'right',
              ratio: .2,
            },
          },
          {
            id: 'part.activity-1',
            qualifier: {part: 'activity-1'},
            position: 'left-top',
            active: true,
            ɵactivityId: 'activity.1',
          },
          {
            id: 'part.activity-2',
            qualifier: {part: 'activity-2'},
            position: 'right-top',
            active: true,
            ɵactivityId: 'activity.2',
          },
          {
            id: 'part.activity-3',
            qualifier: {part: 'activity-3'},
            position: 'bottom-left',
            active: false,
            ɵactivityId: 'activity.3',
          },
        ],
      },
    });

    const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
    const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));
    const viewPage3 = new ViewPagePO(appPO.view({cssClass: 'view-3'}));
    const viewPage4 = new ViewPagePO(appPO.view({cssClass: 'view-4'}));
    const viewPage5 = new ViewPagePO(appPO.view({cssClass: 'view-5'}));

    const partPage1 = new PartPagePO(appPO.part({partId: 'part.activity-1'}));
    const partPage2 = new PartPagePO(appPO.part({partId: 'part.activity-2'}));
    const partPage3 = new PartPagePO(appPO.part({partId: 'part.activity-3'}));

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
            id: 'part.activity-1',
          }),
        },
        'activity.2': {
          root: new MPart({
            id: 'part.activity-2',
            views: [
              {id: await viewPage5.view.tab.getViewId()},
            ],
            activeViewId: await viewPage5.view.tab.getViewId(),
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
            activeActivityId: 'activity.2',
          },
          bottomLeft: {
            activities: [{id: 'activity.3'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Assert part docked to left-top.
    await expectPart(partPage1.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => partPage1.getRouteParams()).toMatchObject({capability: 'activity-1'});

    // Assert part docked to right-top.
    await expectPart(partPage2.part).not.toDisplayComponent();
    await expectView(viewPage5).toBeActive();

    // Assert part docked to bottom-left.
    await expectPart(partPage3.part).not.toBeAttached();

    // Assert views of the left part.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive({loaded: false});

    // Assert views of the right part.
    await expectView(viewPage3).toBeActive();
    await expectView(viewPage4).toBeInactive({loaded: false});

    // Assert correct capability to be resolved.
    await viewPage1.view.tab.click();
    await expect.poll(() => viewPage1.getRouteParams()).toMatchObject({capability: 'view-1'});

    await viewPage2.view.tab.click();
    await expect.poll(() => viewPage2.getRouteParams()).toMatchObject({capability: 'view-2'});

    await viewPage3.view.tab.click();
    await expect.poll(() => viewPage3.getRouteParams()).toMatchObject({capability: 'view-2'});

    await viewPage4.view.tab.click();
    await expect.poll(() => viewPage4.getRouteParams()).toMatchObject({capability: 'view-1'});

    await viewPage5.view.tab.click();
    await expect.poll(() => viewPage5.getRouteParams()).toMatchObject({capability: 'view-3'});
  });

  test('should contribute perspective without main area', async ({appPO, microfrontendNavigator}) => {
    test.slow();
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view;capability=view-1',
        title: 'Test View 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-2'},
      properties: {
        path: 'test-view;capability=view-2',
        title: 'Test View 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-3'},
      properties: {
        path: 'test-view;capability=view-3',
        title: 'Test View 3',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-4'},
      properties: {
        path: 'test-view;capability=view-4',
        title: 'Test View 4',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'right-top'},
      properties: {
        views: [
          {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'right-bottom'},
      properties: {
        views: [
          {qualifier: {view: 'view-3'}, cssClass: 'view-3'},
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity-1'},
      properties: {
        path: 'test-part;capability=activity-1',
        extras: {
          icon: 'folder',
          label: 'Activity 1',
        },
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity-2'},
      properties: {
        path: 'test-part;capability=activity-2',
        views: [{qualifier: {view: 'view-4'}, cssClass: 'view-4'}],
        extras: {
          icon: 'folder',
          label: 'Activity 2',
        },
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity-3'},
      properties: {
        path: 'test-part;capability=activity-3',
        extras: {
          icon: 'folder',
          label: 'Activity 3',
        },
      },
    });

    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.left',
            qualifier: {part: 'left'},
          },
          {
            id: 'part.right-top',
            qualifier: {part: 'right-top'},
            position: {
              align: 'right',
              ratio: .2,
            },
          },
          {
            id: 'part.right-bottom',
            qualifier: {part: 'right-bottom'},
            position: {
              relativeTo: 'part.right-top',
              align: 'bottom',
              ratio: .5,
            },
          },
          {
            id: 'part.activity-1',
            qualifier: {part: 'activity-1'},
            position: 'left-top',
            active: true,
            ɵactivityId: 'activity.1',
          },
          {
            id: 'part.activity-2',
            qualifier: {part: 'activity-2'},
            position: 'right-top',
            active: true,
            ɵactivityId: 'activity.2',
          },
          {
            id: 'part.activity-3',
            qualifier: {part: 'activity-3'},
            position: 'bottom-left',
            active: false,
            ɵactivityId: 'activity.3',
          },
        ],
      },
    });

    const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
    const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));
    const viewPage3 = new ViewPagePO(appPO.view({cssClass: 'view-3'}));
    const viewPage4 = new ViewPagePO(appPO.view({cssClass: 'view-4'}));

    const partPage1 = new PartPagePO(appPO.part({partId: 'part.activity-1'}));
    const partPage2 = new PartPagePO(appPO.part({partId: 'part.activity-2'}));
    const partPage3 = new PartPagePO(appPO.part({partId: 'part.activity-3'}));

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
        'activity.1': {
          root: new MPart({
            id: 'part.activity-1',
          }),
        },
        'activity.2': {
          root: new MPart({
            id: 'part.activity-2',
            views: [{id: await viewPage4.view.getViewId()}],
            activeViewId: await viewPage4.view.getViewId(),
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
            activeActivityId: 'activity.2',
          },
          bottomLeft: {
            activities: [{id: 'activity.3'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Assert part docked to left-top.
    await expectPart(partPage1.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => partPage1.getRouteParams()).toMatchObject({capability: 'activity-1'});

    // Assert part docked to right-top.
    await expectPart(partPage2.part).not.toDisplayComponent();
    await expectView(viewPage4).toBeActive();

    // Assert part docked to bottom-left.
    await expectPart(partPage3.part).not.toBeAttached();

    // Assert views.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();
    await expectView(viewPage3).toBeActive();

    // Assert correct capability to be resolved.
    await viewPage1.view.tab.click();
    await expect.poll(() => viewPage1.getRouteParams()).toMatchObject({capability: 'view-1'});

    await viewPage2.view.tab.click();
    await expect.poll(() => viewPage2.getRouteParams()).toMatchObject({capability: 'view-2'});

    await viewPage3.view.tab.click();
    await expect.poll(() => viewPage3.getRouteParams()).toMatchObject({capability: 'view-3'});

    await viewPage4.view.tab.click();
    await expect.poll(() => viewPage4.getRouteParams()).toMatchObject({capability: 'view-4'});
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
      qualifier: {part: 'part'},
      properties: {
        views: [
          {qualifier: {view: 'testee'}, cssClass: 'testee-1'},
          {qualifier: {view: 'testee'}, cssClass: 'testee-2'},
          {qualifier: {view: 'testee'}, cssClass: 'testee-3'},
        ],
      },
    });

    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.part',
            qualifier: {part: 'part'},
          },
        ],
      },
    });

    const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'testee-1'}));
    const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'testee-2'}));
    const viewPage3 = new ViewPagePO(appPO.view({cssClass: 'testee-3'}));

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
      qualifier: {part: 'part'},
      properties: {
        views: [
          {qualifier: {view: 'testee'}, cssClass: 'testee-1'},
          {qualifier: {view: 'testee'}, cssClass: 'testee-2', active: true},
          {qualifier: {view: 'testee'}, cssClass: 'testee-3'},
        ],
      },
    });

    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.part',
            qualifier: {part: 'part'},
          },
        ],
      },
    });

    const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'testee-1'}));
    const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'testee-2'}));
    const viewPage3 = new ViewPagePO(appPO.view({cssClass: 'testee-3'}));

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
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'left'},
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
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {part: 'left'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {part: 'main-area'},
      properties: {
        id: MAIN_AREA,
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {part: 'right'},
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
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.right',
            qualifier: {part: 'right'},
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

    const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'testee-1'}));
    const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'testee-2'}));

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

  test('should display view after adding missing intention and reloading the application', async ({appPO, microfrontendNavigator, page, consoleLogs}) => {
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
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.left',
                qualifier: {part: 'left'},
                position: {
                  align: 'left',
                },
              },
            ],
          },
        } satisfies WorkbenchPerspectiveCapability,
        {
          type: 'view',
          qualifier: {view: 'app-1'},
          properties: {
            path: 'test-view',
            title: 'Test View App 1',
          },
        } satisfies WorkbenchViewCapability,
        {
          type: 'part',
          qualifier: {part: 'main-area'},
        } satisfies WorkbenchPartCapability,
        {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {view: 'app-1'}, cssClass: 'testee-1'},
              {qualifier: {view: 'app-2'}, cssClass: 'testee-2'},
            ],
          },
        } satisfies WorkbenchPartCapability,
        {
          type: 'activator',
          private: false,
          properties: {
            path: 'activator',
            readinessTopics: 'activator-ready',
          },
        } satisfies ActivatorCapability,
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

    const testViewPage1 = new ViewPagePO(appPO.view({cssClass: 'testee-1'}));
    const testViewPage2 = new ViewPagePO(appPO.view({cssClass: 'testee-2'}));

    // Expect layout.
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

    // Expect view 1 to be active.
    await expectView(testViewPage1).toBeActive();

    // Expect view 2 not to be attached.
    await expectView(testViewPage2).not.toBeAttached();

    // Expect error to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
      expect.stringContaining('[PerspectiveDefinitionError] Application \'workbench-client-testing-app1\' is not qualified to use view capability \'view=app-2\' in part \'part=left\'. Ensure to have declared an intention and the capability is not private.'),
    );

    // Add missing intention to the manifest of app 1.
    manifestApp1 = {
      ...manifestApp1,
      intentions: [
        {type: 'view', qualifier: {view: 'app-2'}},
      ],
    };

    // Reload the application.
    await appPO.reload();

    // Expect layout.
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

  test('should display view after adding missing capability and reloading the application', async ({appPO, microfrontendNavigator, page, consoleLogs}) => {
    // Provide manifest.
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
                qualifier: {part: 'main-area'},
              },
              {
                id: 'part.left',
                qualifier: {part: 'left'},
                position: {
                  align: 'left',
                },
              },
            ],
          },
        } satisfies WorkbenchPerspectiveCapability,
        {
          type: 'part',
          qualifier: {part: 'main-area'},
        } satisfies WorkbenchPartCapability,
        {
          type: 'part',
          qualifier: {part: 'left'},
          properties: {
            views: [
              {qualifier: {view: 'testee-1'}, cssClass: 'testee-1'},
              {qualifier: {view: 'testee-2'}, cssClass: 'testee-2'}, // missing capability
            ],
          },
        } satisfies WorkbenchPartCapability,
        {
          type: 'view',
          qualifier: {view: 'testee-1'},
          properties: {
            path: 'test-view',
            title: 'Test View',
          },
        } satisfies WorkbenchViewCapability,
        {
          type: 'activator',
          private: false,
          properties: {
            path: 'activator',
            readinessTopics: 'activator-ready',
          },
        } satisfies ActivatorCapability,
      ],
    };
    await page.route('**/manifest-app1.json', async route => route.fulfill({json: manifestApp1}));

    // Open application.
    await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

    // Switch perspective.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: 'testee'}});

    const testViewPage1 = new ViewPagePO(appPO.view({cssClass: 'testee-1'}));
    const testViewPage2 = new ViewPagePO(appPO.view({cssClass: 'testee-2'}));

    // Expect layout.
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

    // Expect view 1 to be active.
    await expectView(testViewPage1).toBeActive();

    // Expect view 2 not to be attached.
    await expectView(testViewPage2).not.toBeAttached();

    // Expect no warning or error to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual([]);
    await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual([]);

    // Expect debug message to be logged.
    await expect.poll(() => consoleLogs.get({severity: 'debug'})).toContainEqual(
      expect.stringContaining('[PerspectiveDefinitionInfo] No view capability found for qualifier \'view=testee-2\' in part \'part=left\' of app \'workbench-client-testing-app1\'. The qualifier may be incorrect, the capability not registered, or the providing application not available.'),
    );

    // Add missing capability to the manifest.
    manifestApp1 = {
      ...manifestApp1,
      capabilities: [
        ...manifestApp1.capabilities!,
        {
          type: 'view',
          qualifier: {view: 'testee-2'},
          properties: {
            path: 'test-view',
            title: 'Test View',
          },
        },
      ],
    };

    // Reload the application.
    await appPO.reload();

    // Expect layout.
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
      qualifier: {part: 'main-area'},
      properties: {
        id: MAIN_AREA,
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'left'},
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
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {part: 'left'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'part',
      qualifier: {part: 'right'},
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
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.right',
            qualifier: {part: 'right'},
            position: {
              align: 'right',
            },
          },
        ],
      },
    });

    const viewPageApp1 = new ViewPagePO(appPO.view({cssClass: 'app-1'}));
    const viewPageApp2 = new ViewPagePO(appPO.view({cssClass: 'app-2'}));

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

  test.describe('Initial Part', () => {

    test('should default to first part if multiple initial parts are found', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
        },
      });

      // Register part with same qualifier in other app.
      await microfrontendNavigator.registerCapability('app2', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
        },
        private: false,
      });

      await microfrontendNavigator.registerIntention('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
            },
          ],
        },
      });

      const partPage = new PartPagePO(appPO.part({partId: 'part.testee'}));

      // Expect part to display.
      await expectPart(partPage.part).toDisplayComponent(PartPagePO.selector);
      await expect.poll(() => partPage.getPartCapability()).toEqual(expect.objectContaining({
        type: 'part',
        qualifier: {part: 'testee'},
        properties: expect.objectContaining({
          path: 'test-part',
        }),
        metadata: expect.objectContaining({
          appSymbolicName: 'workbench-client-testing-app1',
        }),
      }));

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Multiple part capabilities found for qualifier \'part=testee\' in perspective \'perspective=testee\' of app \'workbench-client-testing-app1\'. Defaulting to first. Ensure part capabilities to have a unique qualifier.'),
      );
    });

    test('should add empty part if initial part is not found', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'does-not-exist'}, // Add part that does not exist.
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      // Expect layout.
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
              }),
            }),
          },
        },
      });

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] No part capability found for qualifier \'part=does-not-exist\' in perspective \'perspective=testee\' of app \'workbench-client-testing-app1\'. The qualifier may be incorrect, the capability not registered, or the providing application not available.'),
      );
    });

    test('should add empty part if not qualified', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app2', {
        type: 'part',
        qualifier: {part: 'not-qualified'},
        path: 'test-part',
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'not-qualified'}, // Not qualified for capability.
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
                relativeTo: MAIN_AREA,
              },
            },
          ],
        },
      });

      // Expect layout.
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
              }),
            }),
          },
        },
      });

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Application \'workbench-client-testing-app1\' is not qualified to use part capability \'part=not-qualified\' in perspective \'perspective=testee\'. Ensure to have declared an intention and the capability is not private.'),
      );

      // Assert microfrontend not to display.
      const partPage = new PartPagePO(appPO.part({partId: MAIN_AREA}));
      await expect(partPage.locator).not.toBeAttached();
    });

    test('should add empty part if main area has views', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'right'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'testee'},
        properties: {
          path: 'test-view',
        },
      });

      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
        properties: {
          views: [
            {qualifier: {'view': 'testee'}},
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.right',
              qualifier: {part: 'right'},
              position: {
                align: 'right',
                relativeTo: MAIN_AREA,
              },
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: MAIN_AREA,
                views: [],
              }),
              child2: new MPart({
                id: 'part.right',
              }),
            }),
          },
        },
      });

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Part \'part=main-area\' of app \'workbench-client-testing-app1\' is used as main area part in perspective \'perspective=testee\' and defines views. Views cannot be added to the main area of a perspective. Ignoring part.'),
      );

      // Assert microfrontend not to display.
      const partPage = new PartPagePO(appPO.part({partId: MAIN_AREA}));
      await expect(partPage.locator).not.toBeAttached();
    });

    test('should add initial part with a path', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: 'part.testee',
            }),
          },
        },
      });

      // Expect part to display component.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should add initial part without a path (desktop)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true, desktop: 'desktop-page'});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
            },
          ],
        },
      });

      // Expect desktop to display.
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);
    });

    test('should add views to initial part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-1'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-2'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          views: [
            {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
            {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
            },
          ],
        },
      });

      const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
      const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: 'part.testee',
              views: [
                {id: await viewPage1.view.getViewId()},
                {id: await viewPage2.view.getViewId()},
              ],
              activeViewId: await viewPage1.view.getViewId(),
            }),
          },
        },
      });
    });
  });

  test.describe('Other Parts', () => {

    test('should default to first part if multiple capabilities found', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part;part=testee-1',
          title: 'testee-1',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part;part=testee-2',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: {
                align: 'left',
              },
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      const partPage = new PartPagePO(appPO.part({partId: 'part.testee'}));

      // Expect part to display.
      await expectPart(partPage.part).toDisplayComponent(PartPagePO.selector);
      await expect.poll(() => partPage.getRouteParams()).toMatchObject({part: 'testee-2'});

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Multiple part capabilities found for qualifier \'part=testee\' in perspective \'perspective=testee\' of app \'workbench-client-testing-app1\'. Defaulting to first. Ensure part capabilities to have a unique qualifier.'),
      );
    });

    test('should display part after adding missing intention and reloading the application', async ({appPO, microfrontendNavigator, page, consoleLogs}) => {
      // Declare manifest of app 1 (missing part intention).
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
                  qualifier: {part: 'main-area'},
                },
                {
                  id: 'part.testee',
                  qualifier: {part: 'testee'},
                  position: {
                    align: 'left',
                  },
                },
              ],
            },
          } satisfies WorkbenchPerspectiveCapability,
          {
            type: 'part',
            qualifier: {part: 'main-area'},
          } satisfies WorkbenchPartCapability,
          {
            type: 'activator',
            private: false,
            properties: {
              path: 'activator',
              readinessTopics: 'activator-ready',
            },
          } satisfies ActivatorCapability,
        ],
      };

      // Declare manifest of app 2.
      const manifestApp2: Manifest = {
        name: 'Workbench Client Testing App 2',
        baseUrl: '#',
        capabilities: [
          {
            type: 'part',
            qualifier: {part: 'testee'},
            private: false,
            properties: {
              path: 'test-part',
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

      // Expect part not to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Application \'workbench-client-testing-app1\' is not qualified to use part capability \'part=testee\' in perspective \'perspective=testee\'. Ensure to have declared an intention and the capability is not private.'),
      );

      // Add missing intention to the manifest of app 1.
      manifestApp1 = {
        ...manifestApp1,
        intentions: [
          {type: 'part', qualifier: {part: 'testee'}},
        ],
      };

      // Reload the application.
      await appPO.reload();

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      // Expect part to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should display part after adding missing capability and reloading the application', async ({appPO, microfrontendNavigator, page, consoleLogs}) => {
      let manifest: Manifest = {
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
                  qualifier: {part: 'main-area'},
                },
                {
                  id: 'part.testee',
                  qualifier: {part: 'testee'}, // missing capability
                  position: {
                    align: 'left',
                  },
                },
              ],
            },
          } satisfies WorkbenchPerspectiveCapability,
          {
            type: 'part',
            qualifier: {part: 'main-area'},
          } satisfies WorkbenchPartCapability,
          {
            type: 'activator',
            private: false,
            properties: {
              path: 'activator',
              readinessTopics: 'activator-ready',
            },
          } satisfies ActivatorCapability,
        ],
      };

      await page.route('**/manifest-app1.json', async route => route.fulfill({json: manifest}));

      // Open application.
      await appPO.navigateTo({microfrontendSupport: true});

      // Switch perspective.
      const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
      await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: 'testee'}});

      // Expect part not to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect no error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual([]);

      // Add missing capability to the manifest.
      manifest = {
        ...manifest,
        capabilities: [
          ...manifest.capabilities!,
          // Add missing part capability.
          {
            type: 'part',
            qualifier: {part: 'testee'},
            properties: {
              path: 'test-part',
            },
          },
        ],
      };

      // Reload the application.
      await appPO.reload();

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      // Expect part.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should throw error if main area has views', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-1'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
        properties: {
          views: [
            {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
            },
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
              position: {
                align: 'right',
              },
            },
          ],
        },
      });

      const viewPage = new ViewPagePO(appPO.view({cssClass: 'view-1'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: 'part.initial',
            }),
          },
        },
      });

      // Expect view not to be attached.
      await expectView(viewPage).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Part \'part=main-area\' of app \'workbench-client-testing-app1\' is used as main area part in perspective \'perspective=testee\' and defines views. Views cannot be added to the main area of a perspective. Ignoring part.'),
      );
    });

    test('should ignore part if capability not found (docked part)', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'does-not-exist'}, // Capability does not exist.
              position: 'left-top',
              active: true,
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Expect part not to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect no warning or error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual([]);

      // Expect debug message to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'debug'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionInfo] No part capability found for qualifier \'part=does-not-exist\' in perspective \'perspective=testee\' of app \'workbench-client-testing-app1\'. The qualifier may be incorrect, the capability not registered, or the providing application not available.'),
      );
    });

    test('should ignore part if aligning part relative to non-existent docked part', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.docked',
              qualifier: {part: 'does-not-exist'}, // Capability does not exist.
              position: 'left-top',
              active: true,
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: {
                align: 'bottom',
                relativeTo: 'part.docked', // Align relative to part that does not exist.
              },
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Expect parts not to be attached.
      await expectPart(appPO.part({partId: 'part.docked'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect no warning or error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual([]);

      // Expect debug message to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'debug'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionInfo] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' aligns part \'part.testee\' relative to missing part \'part.docked\'. The reference part may not be available. Ignoring part.'),
      );
    });

    test('should add empty part if capability does not exist (non-docked part only)', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'other-part'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'does-not-exist'}, // Capability does not exist.
              position: {
                align: 'left',
              },
            },
            {
              id: 'part.other-part',
              qualifier: {part: 'other-part'},
              position: {
                align: 'bottom',
                relativeTo: 'part.testee', // Align part relative to non-existent part.
              },
            },
          ],
        },
      });

      // Expect part not to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect other part to be attached.
      await expectPart(appPO.part({partId: 'part.other-part'})).toDisplayComponent(PartPagePO.selector);

      // Expect no warning or error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual([]);

      // Expect debug message to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'debug'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionInfo] No part capability found for qualifier \'part=does-not-exist\' in perspective \'perspective=testee\' of app \'workbench-client-testing-app1\'. The qualifier may be incorrect, the capability not registered, or the providing application not available.'),
      );
    });

    test('should add empty part if not qualified (non-docked part only)', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app2', {
        type: 'part',
        qualifier: {part: 'not-qualified'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'other-part'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'not-qualified'}, // Not qualified for capability.
              position: {
                align: 'left',
              },
            },
            {
              id: 'part.other-part',
              qualifier: {part: 'other-part'},
              position: {
                align: 'bottom',
                relativeTo: 'part.testee', // Align part relative to part not qualified for.
              },
            },
          ],
        },
      });

      // Expect part not to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect other part to be attached.
      await expectPart(appPO.part({partId: 'part.other-part'})).toDisplayComponent(PartPagePO.selector);

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Application \'workbench-client-testing-app1\' is not qualified to use part capability \'part=not-qualified\' in perspective \'perspective=testee\'. Ensure to have declared an intention and the capability is not private.'),
      );
    });

    test('should not throw error when aligning part relative to missing docked part', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.does-not-exist',
              qualifier: {part: 'does-not-exist'}, // Capability does not exist.
              position: 'left-top',
              active: true,
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: {
                align: 'bottom',
                relativeTo: 'part.does-not-exist', // Align part relative to non-existent docked part.
              },
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Expect parts not to be attached.
      await expectPart(appPO.part({partId: 'part.does-not-exist'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect no warning or error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual([]);

      // Expect debug message to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'debug'})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PerspectiveDefinitionInfo] No part capability found for qualifier \'part=does-not-exist\' in perspective \'perspective=testee\' of app \'workbench-client-testing-app1\'. The qualifier may be incorrect, the capability not registered, or the providing application not available.'),
        expect.stringContaining('[PerspectiveDefinitionInfo] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' aligns part \'part.testee\' relative to missing part \'part.does-not-exist\'. The reference part may not be available. Ignoring part.'),
      ]));
    });

    test('should error if not defining extras on docked part', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          // missing extras
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'left-top',
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Expect part not to be attached.
      await expectPart(appPO.part({partId: 'part.testee'})).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error'})).toContainEqual(
        expect.stringContaining('[PerspectiveDefinitionError] Part \'part=testee\' of app \'workbench-client-testing-app1\' is used as a docked part in perspective \'perspective=testee\' but does not define an icon and label. A docked part must define both an icon and a label: { properties: { extras: { icon: \'<icon-name>\', label: \'<text>\' } } }. Ignoring part.'),
      );
    });

    test('should add part with path', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: {
                align: 'left',
              },
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
                views: [],
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      // Expect part.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should add docked part with path', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
          extras: {icon: 'folder', label: 'Activity'},
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          'activity.1': {
            root: new MPart({
              id: 'part.testee',
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}],
              activeActivityId: 'activity.1',
            },
          },
        },
      });

      // Expect part.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should add views to part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-1'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-2'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          views: [
            {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
            {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: {
                align: 'left',
              },
            },
          ],
        },
      });

      const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
      const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
                views: [
                  {id: await viewPage1.view.getViewId()},
                  {id: await viewPage2.view.getViewId()},
                ],
                activeViewId: await viewPage1.view.getViewId(),
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      // Expect views.
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive({loaded: false});
    });

    test('should add views to docked part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-1'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-2'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          views: [
            {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
            {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
          ],
          extras: {
            label: 'testee',
            icon: 'folder',
          },
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
      const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          'activity.1': {
            root: new MPart({
              id: 'part.testee',
              views: [
                {id: await viewPage1.view.getViewId()},
                {id: await viewPage2.view.getViewId()},
              ],
              activeViewId: await viewPage1.view.getViewId(),
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}],
              activeActivityId: 'activity.1',
            },
          },
        },
      });

      // Expect views.
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive({loaded: false});
    });

    test('should add part with path and views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-1'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-2'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
          views: [
            {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
            {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: {
                align: 'left',
              },
            },
          ],
        },
      });

      const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
      const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
                views: [
                  {id: await viewPage1.view.getViewId()},
                  {id: await viewPage2.view.getViewId()},
                ],
                activeViewId: await viewPage1.view.getViewId(),
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      // Expect views.
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive({loaded: false});

      // Close view views.
      await viewPage1.view.tab.close();
      await viewPage2.view.tab.close();

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee',
                views: [],
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
          },
        },
      });

      // Expect part.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should add docked part with path and views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-1'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'view-2'},
        properties: {
          path: 'test-view',
          title: 'Test View',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-part',
          views: [
            {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
            {qualifier: {view: 'view-2'}, cssClass: 'view-2'},
          ],
          extras: {
            icon: 'folder',
            label: 'Activity',
          },
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
              qualifier: {part: 'main-area'},
            },
            {
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      const viewPage1 = new ViewPagePO(appPO.view({cssClass: 'view-1'}));
      const viewPage2 = new ViewPagePO(appPO.view({cssClass: 'view-2'}));

      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          'activity.1': {
            root: new MPart({
              id: 'part.testee',
              views: [
                {id: await viewPage1.view.getViewId()},
                {id: await viewPage2.view.getViewId()},
              ],
              activeViewId: await viewPage1.view.getViewId(),
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}],
              activeActivityId: 'activity.1',
            },
          },
        },
      });

      // Expect views.
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive({loaded: false});

      // Close view views.
      await viewPage1.view.tab.close();
      await viewPage2.view.tab.close();

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: MAIN_AREA,
            }),
          },
          'activity.1': {
            root: new MPart({
              id: 'part.testee',
              views: [],
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}],
              activeActivityId: 'activity.1',
            },
          },
        },
      });

      // Expect part.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PartPagePO.selector);
    });
  });

  test.describe('Part Params', () => {

    test('should add part with params', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'aligned'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'docked'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: 'test-part',
          extras: {
            icon: 'folder',
            label: 'Activity',
          },
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
            },
            {
              id: 'part.aligned',
              qualifier: {part: 'aligned'},
              position: {align: 'left'},
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
            },
            {
              id: 'part.docked',
              qualifier: {part: 'docked'},
              position: 'left-top',
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
              ɵactivityId: 'activity.1',
              active: true,
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.aligned',
              }),
              child2: new MPart({
                id: 'part.initial',
              }),
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}],
              activeActivityId: 'activity.1',
            },
          },
        },
      });

      const initialPartPage = new PartPagePO(appPO.part({partId: 'part.initial'}));
      const alignedPartPage = new PartPagePO(appPO.part({partId: 'part.aligned'}));
      const dockedPartPage = new PartPagePO(appPO.part({partId: 'part.docked'}));

      // Expect parts.
      await expectPart(initialPartPage.part).toDisplayComponent(PartPagePO.selector);
      await expectPart(alignedPartPage.part).toDisplayComponent(PartPagePO.selector);
      await expectPart(dockedPartPage.part).toDisplayComponent(PartPagePO.selector);

      // Expect passed params.
      await expect.poll(() => initialPartPage.getPartParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });
      await expect.poll(() => alignedPartPage.getPartParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });
      await expect.poll(() => dockedPartPage.getPartParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });

      // Expect deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PerspectiveDefinitionWarning] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' passes the deprecated parameter \'param3\' to part \'part.initial\'. Migrate deprecated parameters as specified in the capability documentation of part \'part=initial\'. Pass parameter \'param4\' instead. Message'),
        expect.stringContaining('[PerspectiveDefinitionWarning] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' passes the deprecated parameter \'param3\' to part \'part.docked\'. Migrate deprecated parameters as specified in the capability documentation of part \'part=docked\'. Pass parameter \'param4\' instead. Message'),
        expect.stringContaining('[PerspectiveDefinitionWarning] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' passes the deprecated parameter \'param3\' to part \'part.aligned\'. Migrate deprecated parameters as specified in the capability documentation of part \'part=aligned\'. Pass parameter \'param4\' instead. Message'),
      ]));
    });

    test('should add host part with params', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'initial'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: '',
        },
      });
      await workbenchNavigator.registerRoute({
        path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'initial'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'aligned'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: '',
        },
      });
      await workbenchNavigator.registerRoute({
        path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'aligned'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'docked'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: '',
          extras: {
            icon: 'folder',
            label: 'Activity',
          },
        },
      });
      await workbenchNavigator.registerRoute({
        path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'docked'})],
      });

      await microfrontendNavigator.createPerspective('host', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
            },
            {
              id: 'part.aligned',
              qualifier: {part: 'aligned'},
              position: {align: 'left'},
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
            },
            {
              id: 'part.docked',
              qualifier: {part: 'docked'},
              position: 'left-top',
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
              ɵactivityId: 'activity.1',
              active: true,
            },
          ],
        },
      });

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.aligned',
              }),
              child2: new MPart({
                id: 'part.initial',
              }),
            }),
          },
        },
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}],
              activeActivityId: 'activity.1',
            },
          },
        },
      });

      const initialPartPage = new WorkbenchPartPagePO(appPO.part({partId: 'part.initial'}));
      const alignedPartPage = new WorkbenchPartPagePO(appPO.part({partId: 'part.aligned'}));
      const dockedPartPage = new WorkbenchPartPagePO(appPO.part({partId: 'part.docked'}));

      // Expect parts.
      await expectWorkbenchPart(initialPartPage.part).toDisplayComponent(WorkbenchPartPagePO.selector);
      await expectWorkbenchPart(alignedPartPage.part).toDisplayComponent(WorkbenchPartPagePO.selector);
      await expectWorkbenchPart(dockedPartPage.part).toDisplayComponent(WorkbenchPartPagePO.selector);

      // Expect passed params.
      await expect.poll(() => initialPartPage.activatedMicrofrontend.getParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });
      await expect.poll(() => alignedPartPage.activatedMicrofrontend.getParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });
      await expect.poll(() => dockedPartPage.activatedMicrofrontend.getParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });

      // Expect deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PerspectiveDefinitionWarning/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PerspectiveDefinitionWarning] Perspective \'perspective=testee\' of app \'workbench-host-app\' passes the deprecated parameter \'param3\' to part \'part.initial\'. Migrate deprecated parameters as specified in the capability documentation of part \'part=initial\'. Pass parameter \'param4\' instead. Message'),
        expect.stringContaining('[PerspectiveDefinitionWarning] Perspective \'perspective=testee\' of app \'workbench-host-app\' passes the deprecated parameter \'param3\' to part \'part.docked\'. Migrate deprecated parameters as specified in the capability documentation of part \'part=docked\'. Pass parameter \'param4\' instead. Message'),
        expect.stringContaining('[PerspectiveDefinitionWarning] Perspective \'perspective=testee\' of app \'workbench-host-app\' passes the deprecated parameter \'param3\' to part \'part.aligned\'. Migrate deprecated parameters as specified in the capability documentation of part \'part=aligned\'. Pass parameter \'param4\' instead. Message'),
      ]));
    });

    test('should error if not passing required parameter', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        params: [
          {name: 'param', required: true},
        ],
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'aligned'},
        params: [
          {name: 'param', required: true},
        ],
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'docked'},
        params: [
          {name: 'param', required: true},
        ],
        properties: {
          path: 'test-part',
          extras: {
            icon: 'folder',
            label: 'Activity',
          },
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
            },
            {
              id: 'part.aligned',
              qualifier: {part: 'aligned'},
              position: {align: 'left'},
            },
            {
              id: 'part.docked',
              qualifier: {part: 'docked'},
              position: 'left-top',
              ɵactivityId: 'activity.1',
              active: true,
            },
          ],
        },
      });

      // Expect parts.
      await expectPart(appPO.part({partId: 'part.initial'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.aligned'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.docked'})).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PerspectiveDefinitionError] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' does not pass the required parameter \'param\' to part \'part.initial\'. Pass required parameters as specified in the capability documentation of part \'part=initial\'. Ignoring part.'),
        expect.stringContaining('[PerspectiveDefinitionError] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' does not pass the required parameter \'param\' to part \'part.docked\'. Pass required parameters as specified in the capability documentation of part \'part=docked\'. Ignoring part.'),
        expect.stringContaining('[PerspectiveDefinitionError] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' does not pass the required parameter \'param\' to part \'part.aligned\'. Pass required parameters as specified in the capability documentation of part \'part=aligned\'. Ignoring part.'),
      ]));
    });

    test('should error if passing unexpected parameter', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'aligned'},
        properties: {
          path: 'test-part',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'docked'},
        properties: {
          path: 'test-part',
          extras: {
            icon: 'folder',
            label: 'Activity',
          },
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
              params: {
                param: 'value',
              },
            },
            {
              id: 'part.aligned',
              qualifier: {part: 'aligned'},
              position: {align: 'left'},
              params: {
                param: 'value',
              },
            },
            {
              id: 'part.docked',
              qualifier: {part: 'docked'},
              position: 'left-top',
              ɵactivityId: 'activity.1',
              active: true,
              params: {
                param: 'value',
              },
            },
          ],
        },
      });

      // Expect parts.
      await expectPart(appPO.part({partId: 'part.initial'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.aligned'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.docked'})).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PerspectiveDefinitionError/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PerspectiveDefinitionError] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' passes the unexpected parameter \'param\' to part \'part.initial\'. Pass parameters as specified in the capability documentation of part \'part=initial\'. Ignoring part.'),
        expect.stringContaining('[PerspectiveDefinitionError] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' passes the unexpected parameter \'param\' to part \'part.docked\'. Pass parameters as specified in the capability documentation of part \'part=docked\'. Ignoring part.'),
        expect.stringContaining('[PerspectiveDefinitionError] Perspective \'perspective=testee\' of app \'workbench-client-testing-app1\' passes the unexpected parameter \'param\' to part \'part.aligned\'. Pass parameters as specified in the capability documentation of part \'part=aligned\'. Ignoring part.'),
      ]));
    });
  });

  test.describe('View Params', () => {

    test('should add view with params', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'testee'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: 'test-view',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        properties: {
          views: [
            {
              qualifier: {view: 'testee'},
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
              cssClass: 'testee',
            },
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
            },
          ],
        },
      });

      const viewPage = new ViewPagePO(appPO.view({cssClass: 'testee'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: await viewPage.view.getViewId()}],
              activeViewId: await viewPage.view.getViewId(),
            }),
          },
        },
      });

      // Expect view.
      await expectView(viewPage).toBeActive();

      // Expect passed params.
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });

      // Expect deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PartDefinitionWarning/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PartDefinitionWarning] Part \'part=initial\' of app \'workbench-client-testing-app1\' passes the deprecated parameter \'param3\' to view \'view=testee\'. Migrate deprecated parameters as specified in the capability documentation. Pass parameter \'param4\' instead. Message'),
      ]));
    });

    test('should add host view with params', async ({appPO, microfrontendNavigator, workbenchNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'view',
        qualifier: {view: 'testee'},
        params: [
          {name: 'param1', required: true},
          {name: 'param2', required: false},
          {name: 'param3', required: false, deprecated: {message: 'Message', useInstead: 'param4'}},
          {name: 'param4', required: false},
          {name: 'param5', required: false},
        ],
        properties: {
          path: '',
        },
      });
      await workbenchNavigator.registerRoute({
        path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({view: 'testee'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'initial'},
        properties: {
          views: [
            {
              qualifier: {view: 'testee'},
              params: {
                param1: 'value1',
                param2: 'value2',
                param3: 'value3',
              },
              cssClass: 'testee',
            },
          ],
        },
      });

      await microfrontendNavigator.createPerspective('host', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
            },
          ],
        },
      });

      const viewPage = new WorkbenchViewPagePO(appPO.view({cssClass: 'testee'}));

      // Expect layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({
              id: 'part.initial',
              views: [{id: await viewPage.view.getViewId()}],
              activeViewId: await viewPage.view.getViewId(),
            }),
          },
        },
      });

      // Expect view.
      await expectView(viewPage).toBeActive();

      // Expect passed params.
      await expect.poll(() => viewPage.activatedMicrofrontend.getParams()).toMatchObject({
        param1: 'value1',
        param2: 'value2',
        param4: 'value3',
      });

      // Expect deprecation warning to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'warning', message: /PartDefinitionWarning/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PartDefinitionWarning] Part \'part=initial\' of app \'workbench-host-app\' passes the deprecated parameter \'param3\' to view \'view=testee\'. Migrate deprecated parameters as specified in the capability documentation. Pass parameter \'param4\' instead. Message'),
      ]));
    });

    test('should error if not passing required parameter', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'testee'},
        params: [
          {name: 'param', required: true},
        ],
        properties: {
          path: 'test-view',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        properties: {
          views: [
            {
              qualifier: {view: 'testee'},
              cssClass: 'testee',
            },
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
            },
          ],
        },
      });

      const viewPage = new ViewPagePO(appPO.view({cssClass: 'testee'}));

      // Expect view.
      await expectView(viewPage).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PartDefinitionError/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PartDefinitionError] Part \'part=initial\' of app \'workbench-client-testing-app1\' does not pass the required parameter \'param\' to view \'view=testee\'. Pass required parameters as specified in the capability documentation. Ignoring view.'),
      ]));
    });

    test('should error if passing unexpected parameter', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {view: 'testee'},
        properties: {
          path: 'test-view',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'initial'},
        properties: {
          views: [
            {
              qualifier: {view: 'testee'},
              cssClass: 'testee',
              params: {
                param: 'value',
              },
            },
          ],
        },
      });

      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.initial',
              qualifier: {part: 'initial'},
            },
          ],
        },
      });

      const viewPage = new ViewPagePO(appPO.view({cssClass: 'testee'}));

      // Expect view.
      await expectView(viewPage).not.toBeAttached();

      // Expect error to be logged.
      await expect.poll(() => consoleLogs.get({severity: 'error', message: /PartDefinitionError/})).toEqual(expect.arrayContaining([
        expect.stringContaining('[PartDefinitionError] Part \'part=initial\' of app \'workbench-client-testing-app1\' passes the unexpected parameter \'param\' to view \'view=testee\'. Pass parameters as specified in the capability documentation. Ignoring view.'),
      ]));
    });
  });
});
