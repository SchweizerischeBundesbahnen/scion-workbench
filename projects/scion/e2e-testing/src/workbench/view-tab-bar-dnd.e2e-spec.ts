/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect, Locator} from '@playwright/test';
import {ViewTabPO} from '../view-tab.po';
import {ViewDrageHandlePO} from '../view-drag-handle.po';
import {hasCssClass, waitForCondition, waitUntilStable} from '../helper/testing.util';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {PartActionPO} from '../part-action.po';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {ConsoleLogs} from '../helper/console-logs';

test.describe('View Drag & Drop (Tabbar)', () => {

  test('should not display dragged tab when starting a new drag operation immediately after finishing the previous one', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('right', {align: 'right'})
      .addView('view.101', {partId: 'right', activateView: true})
      .addView('view.102', {partId: 'right'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Perform drag and drop.
    const dragHandle1 = await tab1.startDrag();
    await dragHandle1.dragTo({deltaX: -300, deltaY: 0});
    await dragHandle1.dragTo({deltaX: 300, deltaY: 0});
    await dragHandle1.drop();

    // Start drag immediately after finishing the previous drop.
    const dragHandle2 = await tab1.startDrag();
    await dragHandle2.dragTo({deltaX: 50, deltaY: 0});

    // Expect drag source not to be visible.
    await expect.poll(() => appPO.part({partId: 'right'}).bar.getViewIds({visible: true})).toEqual(['view.102']);
  });

  test('should activate tab when dragging it out of the tabbar and into the tabbar again, retaining position', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main'})
      .addView('view.102', {partId: 'main', activateView: true})
      .navigateView('view.102', ['test-view']),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Drag view out and back into the tab bar, retaining position
    const dragHandle = await tab2.startDrag();
    await dragHandle.dragTo({deltaX: 0, deltaY: 200});
    await dragHandle.dragTo({deltaX: 0, deltaY: -200});
    await dragHandle.drop();

    // Expect the view to be active.
    await expect.poll(() => tab1.isActive()).toBe(false);
    await expect.poll(() => tab2.isActive()).toBe(true);

    // Expect same tab order
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds()).toEqual(['view.101', 'view.102']);

    // Expect view to display correct content.
    await expectView(new ViewPagePO(appPO, {viewId: 'view.102'})).toBeActive();
  });

  test('should swap tabs', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Swap tabs.
    const dragHandle1 = await tab1.startDrag();
    await dragHandle1.dragTo({deltaX: await getWidth(tab1), deltaY: 0});
    await dragHandle1.drop();
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds()).toEqual(['view.102', 'view.101']);

    // Swap tabs.
    const dragHandle2 = await tab1.startDrag();
    await dragHandle2.dragTo({deltaX: -await getWidth(tab2), deltaY: 0});
    await dragHandle2.drop();
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds()).toEqual(['view.101', 'view.102']);
  });

  test('should not display the drag source when dragging it over its tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Drag the drag source over its tabbar.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 300, deltaY: 0});

    // Expect the drag source not to be visible.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds({visible: true})).toEqual(['view.102']);

    // Expect the drag source to be in the DOM.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds()).toEqual(['view.101', 'view.102']);
  });

  test('should not display the drag source when dragging it out of its tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Drag the drag source in its tabbar.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 300, deltaY: 300});

    // Expect the drag source not to be visible.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds({visible: true})).toEqual(['view.102']);

    // Expect the drag source to be in the DOM.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds()).toEqual(['view.101', 'view.102']);
  });

  test('should not display the drag source when dragging it back into its tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Drag the drag source out of the tabbar and back into the tabbar.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 300, deltaY: 300});
    await dragHandle.dragTo({deltaX: 300, deltaY: -300});

    // Expect the drag source not to be visible.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds({visible: true})).toEqual(['view.102']);

    // Expect the drag source to be in the DOM.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds()).toEqual(['view.101', 'view.102']);
  });

  test('should snap the drag image to the tabbar when dragging near it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.setDesignToken('--sci-workbench-tab-height', '35px');

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    const tabbarBounds = await appPO.part({partId: 'main'}).bar.getTabViewportBoundingBox();

    // Start dragging.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 300, deltaY: 0});

    // Drag tab near tabbar.
    await test.step('Dragging tab near tabbar', async () => {
      await dragHandle.dragTo({deltaX: 0, deltaY: 10});
      await expect(dragHandle.locator).toBeVisible();

      // Expect drag image to snap to the tabbar.
      await expect.poll(() => dragHandle.getBoundingBox()).toEqual(expect.objectContaining({
        top: tabbarBounds.top,
        height: tabbarBounds.height,
      }));

      // Expect drag image to look like a tab in the tabbar.
      await expect(async () => {
        const expectedBorderColor = await dragHandle.getCssPropertyValue('--sci-workbench-tab-border-color');

        const borderTop = await dragHandle.getCssPropertyValue('border-top');
        expect(borderTop).toEqual(`1px solid ${expectedBorderColor}`);

        const borderRight = await dragHandle.getCssPropertyValue('border-right');
        expect(borderRight).toEqual(`1px solid ${expectedBorderColor}`);

        const borderBottom = await dragHandle.getCssPropertyValue('border-bottom');
        expect(borderBottom).toEqual(`0px none rgb(0, 0, 0)`);

        const borderLeft = await dragHandle.getCssPropertyValue('border-left');
        expect(borderLeft).toEqual(`1px solid ${expectedBorderColor}`);
      }).toPass();
    });

    // Drag tab out of tabbar.
    await test.step('Dragging tab out of tabbar', async () => {
      await dragHandle.dragTo({deltaX: 0, deltaY: 10});
      await expect(dragHandle.locator).toBeVisible();

      // Expect drag image not to snap to the tabbar.
      await expect.poll(() => dragHandle.getBoundingBox()).toEqual(expect.objectContaining({
        top: tabbarBounds.top + 20,
        height: tabbarBounds.height,
      }));

      // Expect drag image to look like a drag image.
      await expect(async () => {
        const expectedBorderColor = await dragHandle.getCssPropertyValue('--sci-workbench-tab-drag-border-color');
        const border = await dragHandle.getCssPropertyValue('border');
        expect(border).toEqual(`1px solid ${expectedBorderColor}`);
      }).toPass();
    });

    // Drag tab back into tabbar.
    await test.step('Dragging tab back into tabbar', async () => {
      await dragHandle.dragTo({deltaX: 0, deltaY: -10});
      await expect(dragHandle.locator).toBeVisible();

      // Expect drag image to snap to the tabbar.
      await expect.poll(() => dragHandle.getBoundingBox()).toEqual(expect.objectContaining({
        top: tabbarBounds.top,
        height: tabbarBounds.height,
      }));

      // Expect drag image to look like a tab in the tabbar.
      await expect(async () => {
        const expectedBorderColor = await dragHandle.getCssPropertyValue('--sci-workbench-tab-border-color');

        const borderTop = await dragHandle.getCssPropertyValue('border-top');
        expect(borderTop).toEqual(`1px solid ${expectedBorderColor}`);

        const borderRight = await dragHandle.getCssPropertyValue('border-right');
        expect(borderRight).toEqual(`1px solid ${expectedBorderColor}`);

        const borderBottom = await dragHandle.getCssPropertyValue('border-bottom');
        expect(borderBottom).toEqual(`0px none rgb(0, 0, 0)`);

        const borderLeft = await dragHandle.getCssPropertyValue('border-left');
        expect(borderLeft).toEqual(`1px solid ${expectedBorderColor}`);
      }).toPass();
    });
  });

  test('should shift tabs to the side when dragging over a tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('top')
      .addPart('bottom', {align: 'bottom'})
      .addView('view.999', {partId: 'top', activateView: true})
      .addView('view.101', {partId: 'bottom', activateView: true})
      .addView('view.102', {partId: 'bottom'})
      .addView('view.103', {partId: 'bottom'}),
    );
    const tab = appPO.view({viewId: 'view.999'}).tab;
    await tab.setTitle('view.999');
    await tab.setWidth('100px');
    const tabWidth = await getWidth(tab);
    const tabBounds = await tab.getBoundingBox();

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('200px');
    const tab1Bounds = await tab1.getBoundingBox();

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('200px');
    const tab2Bounds = await tab2.getBoundingBox();

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('200px');
    const tab3Bounds = await tab3.getBoundingBox();

    const bottomTabbarBounds = await appPO.part({partId: 'bottom'}).bar.getTabViewportBoundingBox();

    // Start dragging.
    const dragHandle = await tab.startDrag();

    await test.step('Dragging tab to bottom tabbar', async () => {
      await dragHandle.dragTo({x: tabBounds.hcenter, y: bottomTabbarBounds.vcenter});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the right before mid of tab 1', async () => {
      await dragHandle.dragTo({deltaX: await getHCenter(tab1) - await getRight(dragHandle) - 1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the right after mid of tab 1', async () => {
      await dragHandle.dragTo({deltaX: 1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the right before mid of tab 2', async () => {
      await dragHandle.dragTo({deltaX: await getHCenter(tab2) - await getRight(dragHandle) - 1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the right after mid of tab 2', async () => {
      await dragHandle.dragTo({deltaX: 1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the right before mid of tab 3', async () => {
      await dragHandle.dragTo({deltaX: await getHCenter(tab3) - await getRight(dragHandle) - 1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the right after mid of tab 3', async () => {
      await dragHandle.dragTo({deltaX: 1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left);
    });

    await test.step('Dragging tab to the right after tab 3', async () => {
      await dragHandle.dragTo({deltaX: (await getWidth(tab3) / 2), deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left);
    });

    await test.step('Dragging tab to the left after mid of tab 3', async () => {
      await dragHandle.dragTo({deltaX: await getHCenter(tab3) - await getLeft(dragHandle), deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left);
    });

    await test.step('Dragging tab to the left before mid of tab 3', async () => {
      await dragHandle.dragTo({deltaX: -1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the left after mid of tab 2', async () => {
      await dragHandle.dragTo({deltaX: await getHCenter(tab2) - await getLeft(dragHandle), deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the left before mid of tab 2', async () => {
      await dragHandle.dragTo({deltaX: -1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the left after mid of tab 1', async () => {
      await dragHandle.dragTo({deltaX: await getHCenter(tab1) - await getLeft(dragHandle), deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the left before mid of tab 1', async () => {
      await dragHandle.dragTo({deltaX: -1, deltaY: 0});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab to the left', async () => {
      await dragHandle.dragTo({x: tabBounds.hcenter, y: bottomTabbarBounds.vcenter});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left + tabWidth);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left + tabWidth);
    });

    await test.step('Dragging tab out of the tabbar', async () => {
      await dragHandle.dragTo({x: tabBounds.hcenter, y: tabBounds.vcenter});
      await expect.poll(() => getLeft(tab1)).toBe(tab1Bounds.left);
      await expect.poll(() => getLeft(tab2)).toBe(tab2Bounds.left);
      await expect.poll(() => getLeft(tab3)).toBe(tab3Bounds.left);
    });
  });

  test('should disable pointer events for a smoother drag and drop experience', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'}),
    );
    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Start dragging.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 10, deltaY: 0});
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getTabViewportClientCssProperty('pointer-events')).toEqual('none');
  });

  test('should animate shifting tabs when dragging over a tabbar', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'})
      .addView('view.103', {partId: 'main'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('100px');

    // Log change of tab positions.
    await installPositionLogger(tab2.locator, {label: 'view.102'});
    await installPositionLogger(tab3.locator, {label: 'view.103'});

    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 5, deltaY: 0});
    await dragHandle.dragTo({deltaX: -5, deltaY: 0});

    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Drag tab 1 over tab 2.
    await dragHandle.dragTo({deltaX: await getHCenter(tab2) - await getRight(dragHandle), deltaY: 0});

    // Expect multiple position changes of tab 2 because animated.
    await expect.poll(() => consoleLogs.get({message: '[view.102] Position has changed'}).length).toBeGreaterThan(1);
    await expect.poll(() => consoleLogs.get({message: '[view.103] Position has changed'}).length).toBe(0);
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Drag tab 1 over tab 3.
    await dragHandle.dragTo({deltaX: await getHCenter(tab3) - await getRight(dragHandle), deltaY: 0});

    // Expect multiple position changes of tab 3 because animated.
    await expect.poll(() => consoleLogs.get({message: '[view.102] Position has changed'}).length).toBe(0);
    await expect.poll(() => consoleLogs.get({message: '[view.103] Position has changed'}).length).toBeGreaterThan(1);
  });

  test('should not animate when start dragging', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'})
      .addView('view.103', {partId: 'main'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('100px');

    // Log change of tab positions.
    await installPositionLogger(tab2.locator, {label: 'view.102'});
    await installPositionLogger(tab3.locator, {label: 'view.103'});

    // Clear log.
    consoleLogs.clear();

    // Start dragging.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 5, deltaY: 0});
    await dragHandle.dragTo({deltaX: 10, deltaY: 0});
    await dragHandle.dragTo({deltaX: 15, deltaY: 0});

    // Expect tabs not to change position.
    await expect.poll(() => consoleLogs.get({message: '[view.102] Position has changed'}).length).toBe(0);
    await expect.poll(() => consoleLogs.get({message: '[view.103] Position has changed'}).length).toBe(0);
  });

  test('should animate shifting tabs when entering the tabbar', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('top')
      .addPart('bottom', {align: 'bottom'})
      .addView('view.999', {partId: 'top', activateView: true})
      .addView('view.101', {partId: 'bottom', activateView: true})
      .addView('view.102', {partId: 'bottom'})
      .addView('view.103', {partId: 'bottom'}),
    );

    const tab = appPO.view({viewId: 'view.999'}).tab;
    await tab.setTitle('view.999');

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('100px');

    const bottomTabbarBounds = await appPO.part({partId: 'bottom'}).bar.getTabViewportBoundingBox();

    // Log change of tab positions.
    await installPositionLogger(tab1.locator, {label: 'view.101'});
    await installPositionLogger(tab2.locator, {label: 'view.102'});
    await installPositionLogger(tab3.locator, {label: 'view.103'});

    // Start Dragging.
    const dragHandle = await tab.startDrag();

    // Clear log.
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Drag tab into tabbar.
    await dragHandle.dragTo({x: await getHCenter(tab), y: bottomTabbarBounds.vcenter});

    // Expect multiple position changes because animated.
    await expect.poll(() => consoleLogs.get({message: '[view.101] Position has changed'}).length).toBeGreaterThan(1);
    await expect.poll(() => consoleLogs.get({message: '[view.102] Position has changed'}).length).toBeGreaterThan(1);
    await expect.poll(() => consoleLogs.get({message: '[view.103] Position has changed'}).length).toBeGreaterThan(1);
  });

  test('should animate shifting tabs when leaving the tabbar', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'})
      .addView('view.103', {partId: 'main'})
      .addView('view.104', {partId: 'main'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('100px');

    const tab4 = appPO.view({viewId: 'view.104'}).tab;
    await tab4.setTitle('view.104');
    await tab4.setWidth('100px');

    // Log change of tab positions.
    await installPositionLogger(tab1.locator, {label: 'view.101'});
    await installPositionLogger(tab4.locator, {label: 'view.103'});
    await installPositionLogger(tab4.locator, {label: 'view.104'});

    // Start dragging.
    const dragHandle = await tab2.startDrag();

    // Clear log.
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Drag tab out of tabbar.
    await dragHandle.dragTo({deltaX: 0, deltaY: 50});

    // Expect multiple position changes because animated.
    await expect.poll(() => consoleLogs.get({message: '[view.101] Position has changed'}).length).toBe(0);
    await expect.poll(() => consoleLogs.get({message: '[view.103] Position has changed'}).length).toBeGreaterThan(1);
    await expect.poll(() => consoleLogs.get({message: '[view.104] Position has changed'}).length).toBeGreaterThan(1);
  });

  test('should not animate tab movement on drop', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('top')
      .addPart('bottom', {align: 'bottom'})
      .addView('view.101', {partId: 'top', activateView: true})
      .addView('view.102', {partId: 'top'})
      .addView('view.201', {partId: 'bottom', activateView: true})
      .addView('view.202', {partId: 'bottom'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.201'}).tab;
    await tab3.setTitle('view.201');
    await tab3.setWidth('100px');

    const tab4 = appPO.view({viewId: 'view.202'}).tab;
    await tab4.setTitle('view.202');
    await tab4.setWidth('100px');

    const bottomTabbarBounds = await appPO.part({partId: 'bottom'}).bar.getTabViewportBoundingBox();

    // Log change of tab positions.
    await installPositionLogger(tab1.locator, {label: 'view.101'});
    await installPositionLogger(tab2.locator, {label: 'view.102'});
    await installPositionLogger(tab3.locator, {label: 'view.201'});
    await installPositionLogger(tab4.locator, {label: 'view.202'});

    // Start dragging.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({x: await getHCenter(tab1), y: bottomTabbarBounds.vcenter});

    // Clear log.
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Perform drop.
    await dragHandle.drop();

    // Expect single position changes because dropping is not animated.
    await expect.poll(() => consoleLogs.get({message: '[view.101] Position has changed'}).length).toBe(0);
    await expect.poll(() => consoleLogs.get({message: '[view.102] Position has changed'}).length).toBe(0);
    await expect.poll(() => consoleLogs.get({message: '[view.201] Position has changed'}).length).toBe(1);
    await expect.poll(() => consoleLogs.get({message: '[view.202] Position has changed'}).length).toBe(1);
  });

  // TODO [#33853] Enable test when fixed the Playwright issue https://github.com/microsoft/playwright/issues/33853.
  // [Bug]: Canceling a drag operation does not fire dragleave event on drop target #33853
  test.fixme('should not animate tab movement on cancel', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('top')
      .addPart('bottom', {align: 'bottom'})
      .addView('view.101', {partId: 'top', activateView: true})
      .addView('view.102', {partId: 'top'})
      .addView('view.201', {partId: 'bottom', activateView: true})
      .addView('view.202', {partId: 'bottom'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.201'}).tab;
    await tab3.setTitle('view.201');
    await tab3.setWidth('100px');

    const tab4 = appPO.view({viewId: 'view.202'}).tab;
    await tab4.setTitle('view.202');
    await tab4.setWidth('100px');

    const bottomTabbarBounds = await appPO.part({partId: 'bottom'}).bar.getTabViewportBoundingBox();

    // Log change of tab positions.
    await installPositionLogger(tab1.locator, {label: 'view.101'});
    await installPositionLogger(tab2.locator, {label: 'view.102'});
    await installPositionLogger(tab3.locator, {label: 'view.201'});
    await installPositionLogger(tab4.locator, {label: 'view.202'});

    // Start dragging.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({x: await getHCenter(tab1), y: bottomTabbarBounds.vcenter});

    // Clear log.
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Cancel drag operation.
    await dragHandle.cancel();

    // Expect single position changes because canceling is not animated.
    await expect.poll(() => consoleLogs.get({message: '[view.101] Position has changed'}).length).toBe(1);
    await expect.poll(() => consoleLogs.get({message: '[view.102] Position has changed'}).length).toBe(1);
    await expect.poll(() => consoleLogs.get({message: '[view.201] Position has changed'}).length).toBe(1);
    await expect.poll(() => consoleLogs.get({message: '[view.202] Position has changed'}).length).toBe(1);
  });

  test('should not animate part action movement when moving a tab', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'})
      .addView('view.103', {partId: 'main'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('100px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('100px');

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('100px');

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('action', {align: 'start', cssClass: 'testee'});
    await layoutPage.view.tab.close();

    // Log change of part action position.
    await installPositionLogger(appPO.part({partId: 'main'}).bar.action({cssClass: 'testee'}).locator, {label: 'part-action'});

    // Drag tab to the right.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 300, deltaY: 0});
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Drag tab to the right.
    await dragHandle.dragTo({deltaX: 300, deltaY: 0}, {steps: 2});
    await waitUntilStable(() => consoleLogs.get().length);

    // Expect action to be positioned instantly (without animation).
    await expect.poll(() => consoleLogs.get({message: '[part-action] Position has changed'}).length).toBeBetween(1, 2);
  });

  test('should move part action to the right of the drag pointer', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.100', {partId: 'main', activateView: true}),
    );

    const tab = appPO.view({viewId: 'view.100'}).tab;
    await tab.setTitle('view.100');
    await tab.setWidth('100px');

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('action', {align: 'start', cssClass: 'testee'});
    await layoutPage.view.tab.close();

    // Capture position of the part action.
    const partAction = appPO.part({partId: 'main'}).bar.action({cssClass: 'testee'});
    const {left} = await partAction.getBoundingBox();

    // Drag tab to the right.
    const dragHandle = await tab.startDrag();
    await dragHandle.dragTo({deltaX: 300, deltaY: 0});

    // Expect action to be moved by 300px.
    await expect.poll(() => getLeft(partAction)).toBeBetween(left + 300, left + 301);

    // Expect action to be visible.
    await expect(partAction.locator).toBeVisible();
  });

  test('should not change position of part action when start dragging', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main', activateView: true})
      .addView('view.102', {partId: 'main'})
      .addView('view.103', {partId: 'main'}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');
    await tab1.setWidth('200px');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');
    await tab2.setWidth('200px');

    const tab3 = appPO.view({viewId: 'view.103'}).tab;
    await tab3.setTitle('view.103');
    await tab3.setWidth('200px');

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('action', {align: 'start', cssClass: 'testee'});
    await layoutPage.view.tab.close();

    // Wait until positioned the part action.
    await installPositionLogger(appPO.part({partId: 'main'}).bar.action({cssClass: 'testee'}).locator, {label: 'part-action'});
    consoleLogs.clear();

    // Start dragging the tab.
    const dragHandle = await tab1.startDrag();
    await dragHandle.dragTo({deltaX: 50, deltaY: 0});

    // Expect part action not to have changed position.
    await expect.poll(() => consoleLogs.get({message: '[part-action] Position has changed'}).length).toBe(0);
  });

  test('should not animate part action movement on dragenter and dragleave', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('top')
      .addPart('bottom', {align: 'bottom'})
      .addView('view.101', {partId: 'top', activateView: true})
      .addView('view.102', {partId: 'bottom', activateView: true}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('action', {align: 'start', cssClass: 'testee'});
    await layoutPage.view.tab.close();

    // Log change of part action position.
    await installPositionLogger(appPO.part({partId: 'bottom'}).bar.action({cssClass: 'testee'}).locator, {label: 'part-action'});
    const topTabbarBounds = await appPO.part({partId: 'top'}).bar.getTabViewportBoundingBox();
    const bottomTabbarBounds = await appPO.part({partId: 'bottom'}).bar.getTabViewportBoundingBox();

    // Clear log.
    consoleLogs.clear();

    // Start dragging.
    const dragHandle = await tab1.startDrag();

    // Expect action to be positioned instantly (without animation).
    await dragHandle.dragTo({x: 500, y: topTabbarBounds.vcenter});
    await dragHandle.dragTo({x: 500, y: bottomTabbarBounds.vcenter});
    await waitUntilStable(() => consoleLogs.get().length);
    await expect.poll(() => consoleLogs.get({message: '[part-action] Position has changed'}).length).toBe(1);

    // Wait for the CSS class 'on-drag-enter' to be removed.
    const tabbar = appPO.part({partId: 'bottom'}).bar.locator;
    await waitForCondition(async () => !await hasCssClass(tabbar, 'on-drag-enter'));
    consoleLogs.clear();

    // Drag tab out of bottom tabbar.
    await dragHandle.dragTo({x: 500, y: topTabbarBounds.vcenter});
    await waitUntilStable(() => consoleLogs.get().length);

    // Expect action to be positioned instantly (without animation).
    await expect.poll(() => consoleLogs.get({message: '[part-action] Position has changed'}).length).toBe(1);
  });

  test('should not activate adjacent tab when canceling drag operation', async ({appPO, consoleLogs, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main'})
      .addView('view.102', {partId: 'main', activateView: true})
      .navigateView('view.101', ['test-pages/lifecycle-logger-test-page']),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Start dragging.
    const dragHandle = await tab2.startDrag();
    await dragHandle.dragTo({deltaX: 200, deltaY: 0});

    // Clear log.
    await waitUntilStable(() => consoleLogs.get().length);
    consoleLogs.clear();

    // Cancel drag operation.
    const navigationId = await appPO.getCurrentNavigationId();
    await dragHandle.cancel();

    // Expect adjacent tab not to be activated.
    await expect.poll(() => consoleLogs.get({message: '[view.101][LifecycleLoggerTestPageComponent#construct]'}).length).toBe(0);
    await expect.poll(() => appPO.getCurrentNavigationId()).toEqual(navigationId);
  });

  test('should activate adjacent tab when dragging tab out of the window', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main'})
      .addView('view.102', {partId: 'main', activateView: true}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Drag tab out of the window.
    const dragHandle = await tab2.startDrag();
    await dragHandle.dragTo({deltaX: -1000, deltaY: 0});

    // Expect adjacent tab to be activated.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds({visible: true})).toEqual(['view.101']);
    await expect.poll(() => tab1.isActive()).toBe(true);
  });

  test('should activate adjacent tab when dragging tab out of its tabbar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective('testee', layout => layout
      .addPart('main')
      .addView('view.101', {partId: 'main'})
      .addView('view.102', {partId: 'main', activateView: true}),
    );

    const tab1 = appPO.view({viewId: 'view.101'}).tab;
    await tab1.setTitle('view.101');

    const tab2 = appPO.view({viewId: 'view.102'}).tab;
    await tab2.setTitle('view.102');

    // Drag tab out of the window.
    const dragHandle = await tab2.startDrag();
    await dragHandle.dragTo({deltaX: 0, deltaY: 300});

    // Expect adjacent tab to be activated.
    await expect.poll(() => appPO.part({partId: 'main'}).bar.getViewIds({visible: true})).toEqual(['view.101']);
    await expect.poll(() => tab1.isActive()).toBe(true);
  });
});

async function getLeft(tab: ViewTabPO | ViewDrageHandlePO | PartActionPO): Promise<number> {
  return (await tab.getBoundingBox()).left;
}

async function getHCenter(tab: ViewTabPO | ViewDrageHandlePO | PartActionPO): Promise<number> {
  return (await tab.getBoundingBox()).hcenter;
}

async function getRight(tab: ViewTabPO | ViewDrageHandlePO | PartActionPO): Promise<number> {
  return (await tab.getBoundingBox()).right;
}

async function getWidth(tab: ViewTabPO | ViewDrageHandlePO | PartActionPO): Promise<number> {
  return (await tab.getBoundingBox()).width;
}

async function installPositionLogger(locator: Locator, options: {label: string}): Promise<void> {
  const consoleLogs = new ConsoleLogs(locator.page());
  await locator.evaluate((target: HTMLElement, label: string) => {
    let x: number | undefined;
    let y: number | undefined;

    logPosition();

    function logPosition(): void {
      const newPosition = target.getBoundingClientRect();
      if (newPosition.x !== x || newPosition.y !== y) {
        x = newPosition.x;
        y = newPosition.y;
        console.debug(`[${label}] Position has changed: [x=${x}, y=${y}]`);
      }
      requestAnimationFrame(logPosition);
    }
  }, options.label);

  // Wait until installed the logger.
  await expect.poll(() => consoleLogs.get({message: `[${options.label}] Position has changed`}).length).toBe(1);
}
