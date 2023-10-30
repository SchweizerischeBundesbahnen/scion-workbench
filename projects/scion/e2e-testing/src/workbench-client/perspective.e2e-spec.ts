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
import {RegisterWorkbenchCapabilityPagePO, WorkbenchPerspectiveCapability} from './page-object/register-workbench-capability-page.po';
import {expect} from '@playwright/test';
import {BinaryMTreeNode, MPart, UnaryMTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {waitUntilStable} from '../helper/testing.util';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';

test.describe('Workbench Perspective', () => {

  test('should create and extend perspective by same application', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability view-1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const view1Id = (await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-1'},
      properties: {
        path: 'test-view',
      },
    })).metadata!.id;

    // Register view capability view-2
    const view2Id = (await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-2'},
      properties: {
        path: 'test-view',
      },
    })).metadata!.id;

    // Register perspective capability
    const perspectiveId = (await registerCapabilityPagePO.registerCapability({
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            ratio: 0.3,
          },
          {
            id: 'bottom',
            align: 'bottom',
            ratio: 0.25,
          },
        ],
        data: {
          label: 'testee',
        },
      },
    })).metadata!.id;

    // Add views to perspective
    await registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              name: 'view-1',
            },
            partId: 'left',
            active: true,
          },
          {
            qualifier: {
              name: 'view-2',
            },
            partId: 'bottom',
            active: true,
          },
        ],
      },
    });

    // Switch to testee perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'column',
          ratio: 0.75,
          child1: new BinaryMTreeNode({
            direction: 'row',
            ratio: 0.3,
            child1: new MPart({
              id: 'left',
              views: [{id: view1Id}],
              activeViewId: view1Id,
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
          child2: new MPart({
            id: 'bottom',
            views: [{id: view2Id}],
            activeViewId: view2Id,
          }),
        }),
      },
    });
  });

  test('should extend perspective by another application', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register perspective capability for app1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const perspectiveCapability: WorkbenchPerspectiveCapability = {
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            ratio: .5,
          },
        ],
        data: {
          label: 'testee',
        },
      },
      private: false,
    };
    const perspectiveId = (await registerCapabilityPagePO.registerCapability(perspectiveCapability)).metadata!.id;

    // Register view capability for app2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    const view1Id = (await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-1'},
      properties: {
        path: 'test-view',
      },
    })).metadata!.id;

    // Register intention to extend perspective of app1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app2');
    await registerIntentionPagePO.registerIntention({
      type: 'perspective',
      qualifier: {name: 'testee'},
    });

    // Add views to perspective from app2
    const registerCapabilityPage3PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage3PO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              name: 'view-1',
            },
            partId: 'left',
            active: true,
          },
        ],
      },
    });

    await expect(await consoleLogs.get({severity: 'error', filter: /NotQualifiedError/, consume: true})).toHaveLength(0);

    // Switch to perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    // Except view to be added
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: 'left',
            views: [{id: view1Id}],
            activeViewId: view1Id,
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });
  });

  test('should not extend perspective of another application if not qualified', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register perspective capability for app1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const perspectiveCapability: WorkbenchPerspectiveCapability = {
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
          },
        ],
        data: {
          label: 'testee',
        },
      },
    };
    const perspectiveId = (await registerCapabilityPagePO.registerCapability(perspectiveCapability)).metadata!.id;

    // Register view capability for app2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-1'},
      properties: {
        path: 'test-view',
      },
    });

    // Add views to perspective from app2 (not allowed since app2 is not qualified)
    const perspectiveExtensionCapability = await registerCapabilityPage2PO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              name: 'view-1',
            },
            partId: 'left',
            active: true,
          },
        ],
      },
    });

    await expect(await consoleLogs.get({severity: 'error', filter: /NotQualifiedError/, consume: true})).toEqualIgnoreOrder([
      `[workbench:microfrontend] [NotQualifiedError] Application ${perspectiveExtensionCapability.metadata!.appSymbolicName} is not qualified to extend perspective [perspective=${JSON.stringify(perspectiveCapability.qualifier)}, perspectiveExtension=${JSON.stringify(perspectiveExtensionCapability)}`,
    ]);

    // Switch to perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    // Except view not to be added
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new UnaryMTreeNode({
          child: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });
  });

  test('should extend perspective with a view of another application', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register perspective capability for app1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const perspectiveId = (await registerCapabilityPagePO.registerCapability({
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            ratio: .5,
          },
        ],
        data: {
          label: 'testee',
        },
      },
    })).metadata!.id;

    // Register view capability for app2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    const view1Id = (await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-1'},
      properties: {
        path: 'test-view',
      },
      private: false,
    })).metadata!.id;

    // Register intention for view of app2
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({
      type: 'view',
      qualifier: {name: 'view-1'},
    });

    // Add views from app2 to perspective
    const registerCapabilityPage3PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage3PO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              name: 'view-1',
            },
            partId: 'left',
            active: true,
          },
        ],
      },
    });

    await expect(await consoleLogs.get({severity: 'error', filter: /NotQualifiedError/, consume: true})).toHaveLength(0);

    // Switch to perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    // Except view to be added
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: 'left',
            views: [{id: view1Id}],
            activeViewId: view1Id,
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });
  });

  // TODO error is thrown: part not found by {viewId: viewCapabilityId}
  test.fixme('should not extend perspective with a view of another application if not qualified', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register perspective capability for app1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const perspectiveId = (await registerCapabilityPagePO.registerCapability({
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            ratio: .5,
          },
        ],
        data: {
          label: 'testee',
        },
      },
    })).metadata!.id;

    // Register view capability for app2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    const view1Capability = await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-1'},
      properties: {
        path: 'test-view',
      },
      private: false,
    });

    // Add views from app2 to perspective
    const registerCapabilityPage3PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const perspectiveExtensionCapability = await registerCapabilityPage3PO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              name: 'view-1',
            },
            partId: 'left',
            active: true,
          },
        ],
      },
    });

    // Switch to perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await expect(await consoleLogs.get({severity: 'error', filter: /NotQualifiedError/, consume: true})).toEqualIgnoreOrder([
      `[NotQualifiedError] Application ${perspectiveExtensionCapability.metadata!.appSymbolicName} is not qualified to reference view in perspective extension [view=${JSON.stringify(view1Capability.qualifier)}, perspectiveExtension=${JSON.stringify(perspectiveExtensionCapability)}`,
    ]);

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    // Except view not to be added
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new UnaryMTreeNode({
          child: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });
  });

  // TODO perspective exists in storage, merge happens, layout is incorrect
  test.fixme('should have correct layout after creating perspective, reloading and creating perspective again', async ({page, appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability view-1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const view1Id = (await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {name: 'view-1'},
      properties: {
        path: 'test-view',
      },
    })).metadata!.id;

    // Register perspective capability
    const perspectiveId = (await registerCapabilityPagePO.registerCapability({
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            relativeTo: MAIN_AREA,
            ratio: 0.3,
          },
        ],
        data: {
          label: 'testee',
        },
      },
    })).metadata!.id;

    // Add views to perspective
    await registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              name: 'view-1',
            },
            partId: 'left',
            active: true,
          },
        ],
      },
    });

    // Switch to testee perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: 0.3,
          child1: new MPart({
            id: 'left',
            views: [{id: view1Id}],
            activeViewId: view1Id,
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });

    await test.step('register perspective again', async () => {
      await page.reload();

      await appPO.navigateTo({microfrontendSupport: true});

      // Register view capability view-1
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      const view1Id = (await registerCapabilityPagePO.registerCapability({
        type: 'view',
        qualifier: {name: 'view-1'},
        properties: {
          path: 'test-view',
        },
      })).metadata!.id;

      // Register perspective capability with same qualifier
      const perspectiveId = (await registerCapabilityPagePO.registerCapability({
        type: 'perspective',
        qualifier: {name: 'testee'},
        properties: {
          parts: [
            {
              id: MAIN_AREA,
            },
            {
              id: 'right',
              align: 'right',
              relativeTo: MAIN_AREA,
              ratio: 0.3,
            },
          ],
          data: {
            label: 'testee',
          },
        },
      })).metadata!.id;

      // Add views to perspective
      await registerCapabilityPagePO.registerCapability({
        type: 'perspective-extension',
        qualifier: {},
        properties: {
          perspective: {name: 'testee'},
          views: [
            {
              qualifier: {
                name: 'view-1',
              },
              partId: 'right',
              active: true,
            },
          ],
        },
      });

      // Switch to testee perspective
      const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
      await perspectiveToggleButtonPO.click();

      await waitUntilStable(() => appPO.getCurrentNavigationId());

      await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
        workbenchGrid: {
          root: new BinaryMTreeNode({
            direction: 'row',
            ratio: 0.7,
            child1: new MPart({
              id: 'right',
              views: [{id: view1Id}],
              activeViewId: view1Id,
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      });
    });
  });

  test('should extend active perspective', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability view-1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const view1Id = (await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view',
        title: 'view-1',
      },
    })).metadata!.id;

    // Register perspective capability
    const perspectiveId = (await registerCapabilityPagePO.registerCapability({
      type: 'perspective',
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            ratio: 0.3,
          },
        ],
        data: {
          label: 'testee',
        },
      },
    })).metadata!.id;

    // Switch to testee perspective
    const perspectiveToggleButtonPO = await appPO.header.perspectiveToggleButton({perspectiveId});
    await perspectiveToggleButtonPO.click();

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new UnaryMTreeNode({
          child: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });

    // Add view to perspective
    await registerCapabilityPagePO.registerCapability({
      type: 'perspective-extension',
      qualifier: {},
      properties: {
        perspective: {name: 'testee'},
        views: [
          {
            qualifier: {
              view: 'view-1',
            },
            partId: 'left',
            active: true,
          },
        ],
      },
    });

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    // Expect perspective to have correct layout
    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: 0.3,
          child1: new MPart({
            id: 'left',
            views: [{id: view1Id}],
            activeViewId: view1Id,
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
    });
  });
});
