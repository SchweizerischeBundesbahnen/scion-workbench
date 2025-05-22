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
import {MAIN_AREA} from '../workbench.model';
import {expect} from '@playwright/test';
import {ACTIVITY_PANEL_HEIGHT, ACTIVITY_PANEL_WIDTH, SASHBOX_SPLITTER_SIZE} from './workbench-layout-constants';

test.describe('Activity Panel Alignment', () => {

  test('should align bottom panel (align: left)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-left', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.left'})
      .addPart('part.activity-right', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.right'})
      .addPart('part.activity-bottom', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.bottom'})
      .activatePart('part.activity-bottom'),
    );

    await appPO.header.setPanelAlignment('left');

    const mainGrid = appPO.grid({grid: 'main'});
    const leftPanel = appPO.activityPanel('left');
    const bottomPanel = appPO.activityPanel('bottom');

    // +-----------+
    // |           |
    // |   MAIN    |
    // |           |
    // +-----------+
    // |  BOTTOM   |
    // +-----------+
    await test.step('left panel not visible, right panel not visible', async () => {
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const mainGridBounds = await mainGrid.getBoundingBox();
      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });

    // +--+-----------+
    // |  |           |
    // |  |   MAIN    |
    // |  |           |
    // +--+-----------+
    // |    BOTTOM    |
    // +--------------+
    await test.step('left panel visible, right panel not visible', async () => {
      // Open left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const mainGridBounds = await mainGrid.getBoundingBox();
      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const leftPanelBounds = await leftPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: leftPanelBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: leftPanelBounds.width + SASHBOX_SPLITTER_SIZE + mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
    });

    // +-----------+--+
    // |           |  |
    // |   MAIN    |  |
    // |           |  |
    // +-----------+  |
    // |  BOTTOM   |  |
    // +-----------+--+
    await test.step('left panel not visible, right panel visible', async () => {
      // Open right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const mainGridBounds = await mainGrid.getBoundingBox();
      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
    });

    // +--+-----------+--+
    // |  |           |  |
    // |  |   MAIN    |  |
    // |  |           |  |
    // +--+-----------+  |
    // |   BOTTOM     |  |
    // +--------------+--+
    await test.step('left panel visible, right panel visible', async () => {
      // Open left and right activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const mainGridBounds = await mainGrid.getBoundingBox();
      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const leftPanelBounds = await leftPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: leftPanelBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: leftPanelBounds.width + SASHBOX_SPLITTER_SIZE + mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });
  });

  test('should align bottom panel (align: right)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-left', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.left'})
      .addPart('part.activity-right', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.right'})
      .addPart('part.activity-bottom', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.bottom'})
      .activatePart('part.activity-bottom'),
    );

    await appPO.header.setPanelAlignment('right');

    const mainGrid = appPO.grid({grid: 'main'});
    const rightPanel = appPO.activityPanel('right');
    const bottomPanel = appPO.activityPanel('bottom');

    // +-----------+
    // |           |
    // |   MAIN    |
    // |           |
    // +-----------+
    // |  BOTTOM   |
    // +-----------+
    await test.step('left panel not visible, right panel not visible', async () => {
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });
      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });

    // +--+-----------+
    // |  |           |
    // |  |   MAIN    |
    // |  |           |
    // |  +-----------+
    // |  |  BOTTOM   |
    // +--+-----------+
    await test.step('left panel visible, right panel not visible', async () => {
      // Open left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
    });

    // +-----------+--+
    // |           |  |
    // |   MAIN    |  |
    // |           |  |
    // +-----------+--+
    // |    BOTTOM    |
    // +--------------+
    await test.step('left panel not visible, right panel visible', async () => {
      // Open right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();
      const rightPanelBounds = await rightPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width + SASHBOX_SPLITTER_SIZE + rightPanelBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
    });

    // +--+-----------+--+
    // |  |           |  |
    // |  |   MAIN    |  |
    // |  |           |  |
    // |  +-----------+--+
    // |  |    BOTTOM    |
    // +--+--------------+
    await test.step('left panel visible, right panel visible', async () => {
      // Open left and right activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();
      const rightPanelBounds = await rightPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width + SASHBOX_SPLITTER_SIZE + rightPanelBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });
  });

  test('should align bottom panel (align: center)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-left', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.left'})
      .addPart('part.activity-right', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.right'})
      .addPart('part.activity-bottom', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.bottom'})
      .activatePart('part.activity-bottom'),
    );

    await appPO.header.setPanelAlignment('center');

    const mainGrid = appPO.grid({grid: 'main'});
    const bottomPanel = appPO.activityPanel('bottom');

    // +-----------+
    // |           |
    // |   MAIN    |
    // |           |
    // +-----------+
    // |  BOTTOM   |
    // +-----------+
    await test.step('left panel not visible, right panel not visible', async () => {
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });

    // +--+-----------+
    // |  |           |
    // |  |   MAIN    |
    // |  |           |
    // |  +-----------+
    // |  |  BOTTOM   |
    // +--+-----------+
    await test.step('left panel visible, right panel not visible', async () => {
      // Open left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
    });

    // +-----------+--+
    // |           |  |
    // |   MAIN    |  |
    // |           |  |
    // +-----------+  |
    // |  BOTTOM   |  |
    // +-----------+--+
    await test.step('left panel not visible, right panel visible', async () => {
      // Open right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
    });

    // +--+-----------+--+
    // |  |           |  |
    // |  |   MAIN    |  |
    // |  |           |  |
    // |  +-----------+  |
    // |  |  BOTTOM   |  |
    // +--+-----------+--+
    await test.step('left panel visible, right panel visible', async () => {
      // Open left and right activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });
  });

  test('should align bottom panel (align: justify)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-left', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.left'})
      .addPart('part.activity-right', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.right'})
      .addPart('part.activity-bottom', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.bottom'})
      .activatePart('part.activity-bottom'),
    );

    await appPO.header.setPanelAlignment('justify');

    const mainGrid = appPO.grid({grid: 'main'});
    const leftPanel = appPO.activityPanel('left');
    const rightPanel = appPO.activityPanel('right');
    const bottomPanel = appPO.activityPanel('bottom');

    // +-----------+
    // |           |
    // |   MAIN    |
    // |           |
    // +-----------+
    // |  BOTTOM   |
    // +-----------+
    await test.step('left panel not visible, right panel not visible', async () => {
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });
      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });

    // +--+-----------+
    // |  |           |
    // |  |   MAIN    |
    // |  |           |
    // +--+-----------+
    // |    BOTTOM    |
    // +--------------+
    await test.step('left panel visible, right panel not visible', async () => {
      // Open left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();
      const leftPanelBounds = await leftPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: leftPanelBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: leftPanelBounds.width + SASHBOX_SPLITTER_SIZE + mainGridBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close left activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
    });

    // +-----------+--+
    // |           |  |
    // |   MAIN    |  |
    // |           |  |
    // +-----------+--+
    // |    BOTTOM    |
    // +--------------+
    await test.step('left panel not visible, right panel visible', async () => {
      // Open right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();
      const rightPanelBounds = await rightPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: mainGridBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: mainGridBounds.width + SASHBOX_SPLITTER_SIZE + rightPanelBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });

      // Close right activity panel.
      await appPO.activityItem({activityId: 'activity.right'}).click();
    });

    // +--+-----------+--+
    // |  |           |  |
    // |  |   MAIN    |  |
    // |  |           |  |
    // +--+-----------+--+
    // |     BOTTOM      |
    // +-----------------+
    await test.step('left panel visible, right panel visible', async () => {
      // Open left and right activity panel.
      await appPO.activityItem({activityId: 'activity.left'}).click();
      await appPO.activityItem({activityId: 'activity.right'}).click();
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: {width: ACTIVITY_PANEL_WIDTH},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      const workbenchBounds = (await appPO.workbenchRoot.boundingBox())!;
      const mainGridBounds = await mainGrid.getBoundingBox();
      const leftPanelBounds = await leftPanel.getBoundingBox();
      const rightPanelBounds = await rightPanel.getBoundingBox();

      await expect(bottomPanel.locator).toHaveBoundingBox({
        x: leftPanelBounds.x,
        y: mainGridBounds.bottom + SASHBOX_SPLITTER_SIZE,
        width: leftPanelBounds.width + SASHBOX_SPLITTER_SIZE + mainGridBounds.width + SASHBOX_SPLITTER_SIZE + rightPanelBounds.width,
        height: workbenchBounds.height - mainGridBounds.height - SASHBOX_SPLITTER_SIZE,
      });
    });
  });
});
