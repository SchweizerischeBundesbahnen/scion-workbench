/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {expectPart} from '../matcher/part-matcher';
import {PartPagePO} from './page-object/part-page.po';
import {MAIN_AREA} from '../workbench.model';
import {RouterPagePO} from './page-object/router-page.po';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {canMatchWorkbenchPart} from './page-object/layout-page/register-route-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {WorkbenchHandleBoundsTestPagePO} from './page-object/test-pages/workbench-handle-bounds-test-page.po';

test.describe('Workbench Part', () => {

  test('should close view list menu when view gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-pages/input-field-test-page'], {cssClass: 'testee'});

    const testPage = new InputFieldTestPagePO(appPO.view({cssClass: 'testee'}));

    // Open view list menu.
    const viewListMenu = await testPage.view.part.bar.openViewListMenu();
    await expect(viewListMenu.locator).toBeAttached();

    // When focusing the view.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(viewListMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should close view list menu when popup gains focus', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open test view.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Open test popup.
    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('input-field-test-page', {
      anchor: 'element',
      closeStrategy: {onFocusLost: false},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const testPage = new InputFieldTestPagePO(popup);

    // Open view list menu.
    const viewListMenu = await viewPage.view.part.bar.openViewListMenu();
    await expect(viewListMenu.locator).toBeAttached();

    // When focusing the popup.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(viewListMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should navigate parts', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-part']),
    );

    // Expect left part to display the part page.
    const leftPart = appPO.part({partId: 'part.left'});
    await expectPart(leftPart).toDisplayComponent(PartPagePO.selector);

    // Expect right part to display the part page.
    const rightPart = appPO.part({partId: 'part.right'});
    await expectPart(rightPart).toDisplayComponent(PartPagePO.selector);
  });

  test('should navigate the main area part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout.navigatePart(MAIN_AREA, ['test-part']));

    // Expect main area part to display the part page.
    const mainAreaPart = appPO.part({partId: MAIN_AREA});
    await expectPart(mainAreaPart).toDisplayComponent(PartPagePO.selector);

    // Open view in main area.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.100', {partId: 'part.initial'}),
    );

    // Expect view to display.
    await expect(appPO.view({viewId: 'view.100'}).locator).toBeVisible();
    await expectPart(mainAreaPart).not.toDisplayComponent();

    // Close the view.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect main area part to display the part page.
    await expectPart(mainAreaPart).toDisplayComponent(PartPagePO.selector);
  });

  test('should not remove "navigated" part when removing last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.101', {partId: 'part.left'})
      .addView('view.102', {partId: 'part.right'})
      .navigatePart('part.right', ['test-part']),
    );

    const part = appPO.part({partId: 'part.right'});
    await expectPart(part).not.toDisplayComponent();

    // Close the last view of right part.
    await appPO.view({viewId: 'view.102'}).tab.close();

    // Expect part to display the part page.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);
  });

  /**
   * This test verifies the main area grid not to be removed from the URL if no views are opened in the main area.
   */
  test('should support main area to have a single "navigated" part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.modifyLayout(layout => layout
      .navigatePart('part.initial', ['test-part'])
      .addView('view.100', {partId: 'part.initial'}),
    );

    // Close the last view of the main area.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect part to display the part page.
    const part = appPO.part({partId: 'part.initial'});
    await expectPart(part).toDisplayComponent(PartPagePO.selector);
  });

  test('should navigate from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Register test routes.
    await workbenchNavigator.registerRoute({
      path: 'test-part',
      component: 'part-page',
      data: {path: 'test-part', navigationHint: ''},
    });

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', ['test-part']), // Open part page as path-based route.
    );

    // Navigate to path-based route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', ['test-part', {some: 'param'}]));

    const testeePartPage = new PartPagePO(appPO.part({partId: 'part.testee'}));

    // Expect part to display path-based route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {
        path: 'test-part',
        navigationHint: '',
      },
    );
    await expect.poll(() => testeePartPage.getParams()).toMatchObject({some: 'param'});
  });

  test('should navigate from path-based route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Register test routes.
    await workbenchNavigator.registerRoute({
      path: '',
      component: 'part-page',
      canMatch: [canMatchWorkbenchPart('test-part')],
      data: {path: '', navigationHint: 'test-part'},
    });

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', ['test-part']), // Open part page as path-based route.
    );

    // Navigate to empty-path route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', [], {hint: 'test-part'}));

    const testeePartPage = new PartPagePO(appPO.part({partId: 'part.testee'}));

    // Expect part to display empty-path route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {path: '', navigationHint: 'test-part'},
    );
  });

  test('should navigate from empty-path route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Register test routes.
    await workbenchNavigator.registerRoute({
      path: '',
      component: 'part-page',
      canMatch: [canMatchWorkbenchPart('test-part')],
      data: {path: '', navigationHint: 'test-part'},
    });

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', [], {hint: 'test-part'}), // Open part page as empty-path route.
    );

    // Navigate to empty-path route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', [], {hint: 'test-part', data: {some: 'data'}}));

    const testeePartPage = new PartPagePO(appPO.part({partId: 'part.testee'}));

    // Expect part to display empty-path route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {path: '', navigationHint: 'test-part'},
    );
    await expect.poll(() => testeePartPage.getNavigationData()).toMatchObject({some: 'data'});
  });

  test('should navigate from empty-path route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Register test routes.
    await workbenchNavigator.registerRoute({
      path: '',
      component: 'part-page',
      canMatch: [canMatchWorkbenchPart('test-part')],
      data: {path: '', navigationHint: 'test-part'},
    });

    await workbenchNavigator.registerRoute({
      path: 'test-part',
      component: 'part-page',
      data: {path: 'test-part', navigationHint: ''},
    });

    await workbenchNavigator.createPerspective(layout => layout
      .addPart(MAIN_AREA)
      .addPart('part.testee', {align: 'right'})
      .navigatePart('part.testee', [], {hint: 'test-part'}), // Open part page as empty-path route.
    );

    // Navigate to path-based route.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.testee', ['test-part']));

    const testeePartPage = new PartPagePO(appPO.part({partId: 'part.testee'}));

    // Expect part to display path-based route.
    await expectPart(testeePartPage.part).toDisplayComponent(PartPagePO.selector);
    await expect.poll(() => testeePartPage.getRouteData()).toMatchObject(
      {path: 'test-part', navigationHint: ''},
    );
  });

  test('should locate part by css class', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    await workbenchNavigator.createPerspective(layout => layout
      .addPart('part.left', {cssClass: 'testee-1'})
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'}, {cssClass: 'testee-2'})
      .navigatePart('part.left', ['test-part'])
      .navigatePart('part.right', ['test-router']),
    );

    // Locate part by css class
    await expectPart(appPO.part({cssClass: 'testee-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({cssClass: 'testee-2'})).toDisplayComponent(RouterPagePO.selector);
  });

  test.describe('Title', () => {

    test('should display part title (set via layout)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left', {title: 'testee-1'})
        .addPart('part.right', {align: 'right'}, {title: 'testee-2'})
        .navigatePart('part.left', ['test-part'])
        .navigatePart('part.right', ['test-part']),
      );

      // Expect part title to display.
      await expect(appPO.part({partId: 'part.left'}).bar.title).toHaveText('testee-1');
      await expect(appPO.part({partId: 'part.right'}).bar.title).toHaveText('testee-2');
    });

    test('should display part title (set via part handle)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .navigatePart('part.left', ['test-part'])
        .navigatePart('part.right', ['test-part']),
      );

      const leftPartPage = new PartPagePO(appPO.part({partId: 'part.left'}));
      const rightPartPage = new PartPagePO(appPO.part({partId: 'part.right'}));

      // Enter part title.
      await leftPartPage.enterTitle('testee-1');
      await rightPartPage.enterTitle('testee-2');

      // Expect part title to display.
      await expect(leftPartPage.part.bar.title).toHaveText('testee-1');
      await expect(rightPartPage.part.bar.title).toHaveText('testee-2');
    });

    test('should display part title when part contains views', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left', {title: 'testee-1'})
        .addPart('part.right', {align: 'right'}, {title: 'testee-2'})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.right'}),
      );

      // Expect part title to display.
      await expect(appPO.part({partId: 'part.left'}).bar.title).toHaveText('testee-1');
      await expect(appPO.part({partId: 'part.right'}).bar.title).toHaveText('testee-2');
    });
  });

  test.describe('Part Background Color', () => {

    test('should apply "--sci-workbench-part-peripheral-background-color" to docked parts (docked part, no main area)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
        .navigatePart('part.main', ['test-part'])
        .navigatePart('part.activity', ['test-part'])
        .activatePart('part.activity'),
      );

      // Set part background color design tokens.
      const partBackgroundColor = 'rgb(0, 255, 0)';
      await appPO.setDesignToken('--sci-workbench-part-background-color', partBackgroundColor);
      const peripheralPartBackgroundColor = 'rgb(0, 0, 255)';
      await appPO.setDesignToken('--sci-workbench-part-peripheral-background-color', peripheralPartBackgroundColor);

      // Expect part background colors.
      await expect(appPO.part({partId: 'part.main'}).locator).toHaveCSS('background-color', partBackgroundColor);
      await expect(appPO.part({partId: 'part.activity'}).locator).toHaveCSS('background-color', peripheralPartBackgroundColor);
    });

    test('should apply "--sci-workbench-part-peripheral-background-color" to docked parts (docked part, main area)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
        .navigatePart('part.activity', ['test-part'])
        .activatePart('part.activity'),
      );

      // Navigate part in main area.
      await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.initial', ['test-part']));

      // Set part background color design tokens.
      const partBackgroundColor = 'rgb(0, 255, 0)';
      await appPO.setDesignToken('--sci-workbench-part-background-color', partBackgroundColor);
      const peripheralPartBackgroundColor = 'rgb(0, 0, 255)';
      await appPO.setDesignToken('--sci-workbench-part-peripheral-background-color', peripheralPartBackgroundColor);

      // Expect part background colors.
      await expect(appPO.part({partId: 'part.initial'}).locator).toHaveCSS('background-color', partBackgroundColor);
      await expect(appPO.part({partId: 'part.activity'}).locator).toHaveCSS('background-color', peripheralPartBackgroundColor);
    });

    test('should apply "--sci-workbench-part-peripheral-background-color" to docked parts (docked part, main area, part relative to main area)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
        .navigatePart('part.activity', ['test-part'])
        .navigatePart('part.bottom', ['test-part'])
        .activatePart('part.activity'),
      );

      // Navigate part in main area.
      await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.initial', ['test-part']));

      // Set part background color design tokens.
      const partBackgroundColor = 'rgb(0, 255, 0)';
      await appPO.setDesignToken('--sci-workbench-part-background-color', partBackgroundColor);
      const peripheralPartBackgroundColor = 'rgb(0, 0, 255)';
      await appPO.setDesignToken('--sci-workbench-part-peripheral-background-color', peripheralPartBackgroundColor);

      // Expect part background colors.
      await expect(appPO.part({partId: 'part.initial'}).locator).toHaveCSS('background-color', partBackgroundColor);
      await expect(appPO.part({partId: 'part.bottom'}).locator).toHaveCSS('background-color', partBackgroundColor);
      await expect(appPO.part({partId: 'part.activity'}).locator).toHaveCSS('background-color', peripheralPartBackgroundColor);
    });

    test('should apply "--sci-workbench-part-peripheral-background-color" to parts outside the main area (no docked part, main area, part relative to main area)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.bottom', {relativeTo: MAIN_AREA, align: 'bottom'})
        .navigatePart('part.bottom', ['test-part']),
      );

      // Navigate part in main area.
      await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.initial', ['test-part']));

      // Set part background color design tokens.
      const partBackgroundColor = 'rgb(0, 255, 0)';
      await appPO.setDesignToken('--sci-workbench-part-background-color', partBackgroundColor);
      const peripheralPartBackgroundColor = 'rgb(0, 0, 255)';
      await appPO.setDesignToken('--sci-workbench-part-peripheral-background-color', peripheralPartBackgroundColor);

      // Expect part background colors.
      await expect(appPO.part({partId: 'part.initial'}).locator).toHaveCSS('background-color', partBackgroundColor);
      await expect(appPO.part({partId: 'part.bottom'}).locator).toHaveCSS('background-color', peripheralPartBackgroundColor);
    });

    test('should apply "--sci-workbench-part-background-color" to all parts in the main grid (no docked part, no main area)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.top')
        .addPart('part.bottom', {relativeTo: 'part.top', align: 'bottom'})
        .navigatePart('part.top', ['test-part'])
        .navigatePart('part.bottom', ['test-part']),
      );

      // Set part background color design tokens.
      const partBackgroundColor = 'rgb(0, 255, 0)';
      await appPO.setDesignToken('--sci-workbench-part-background-color', partBackgroundColor);
      const peripheralPartBackgroundColor = 'rgb(0, 0, 255)';
      await appPO.setDesignToken('--sci-workbench-part-peripheral-background-color', peripheralPartBackgroundColor);

      // Expect part background colors.
      await expect(appPO.part({partId: 'part.top'}).locator).toHaveCSS('background-color', partBackgroundColor);
      await expect(appPO.part({partId: 'part.bottom'}).locator).toHaveCSS('background-color', partBackgroundColor);
    });
  });

  test('should preserve title after history back and forward', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create part on the right.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}, {title: 'Part Title'}),
    );

    // Navigate part.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.modifyLayout(layout => layout.navigatePart('part.right', ['test-part']));

    const part = appPO.part({partId: 'part.right'});
    const partPage = new PartPagePO(appPO.part({partId: 'part.right'}));

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);
    await expect(part.bar.title).toHaveText('Part Title');

    // Enter title.
    await partPage.enterTitle('A');
    await expect(part.bar.title).toHaveText('A');

    // Perform navigation back, undoing the part navigation.
    await appPO.navigateBack();

    // Expect part not to be present (detached, still in the layout).
    await expectPart(part).not.toBeAttached();

    // Perform navigation forward.
    await appPO.navigateForward();

    // Expect part to be present and the title to be restored.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);
    await expect(part.bar.title).toHaveText('A');

    // Change title.
    await partPage.enterTitle('B');

    // Expect title to be set on the "new" part handle.
    await expect(part.bar.title).toHaveText('B');
  });

  test('should detach part of activity if closed', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create layout with an activity.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', cssClass: 'activity'})
      .navigatePart('part.activity', ['test-part']),
    );

    // Open activity.
    const activityItem = appPO.activityItem({cssClass: 'activity'});
    await activityItem.click();

    const part = appPO.part({partId: 'part.activity'});
    const partPage = new PartPagePO(appPO.part({partId: 'part.activity'}));

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const componentInstanceId = await partPage.getComponentInstanceId();

    // Close activity.
    await activityItem.click();

    // Expect part not to be attached.
    await expectPart(part).not.toBeAttached();

    // Open activity.
    await activityItem.click();

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Expect component not to be constructed anew.
    await expect.poll(() => partPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should detach parts of activity if closed', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create layout with an activity.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', cssClass: 'activity'})
      .addPart('part.activity-bottom', {relativeTo: 'part.activity-top', align: 'bottom'})
      .navigatePart('part.activity-top', ['test-part'])
      .navigatePart('part.activity-bottom', ['test-part']),
    );

    // Open activity.
    const activityItem = appPO.activityItem({cssClass: 'activity'});
    await activityItem.click();

    const topPart = appPO.part({partId: 'part.activity-top'});
    const topPartPage = new PartPagePO(appPO.part({partId: 'part.activity-top'}));

    const bottomPart = appPO.part({partId: 'part.activity-bottom'});
    const bottomPartPage = new PartPagePO(appPO.part({partId: 'part.activity-bottom'}));

    // Expect parts to display.
    await expectPart(topPart).toDisplayComponent(PartPagePO.selector);
    await expectPart(bottomPart).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const topPartComponentInstanceId = await topPartPage.getComponentInstanceId();
    const bottomPartComponentInstanceId = await bottomPartPage.getComponentInstanceId();
    expect(topPartComponentInstanceId).not.toEqual(bottomPartComponentInstanceId);

    // Close activity.
    await activityItem.click();

    // Expect parts not to be attached.
    await expectPart(topPart).not.toBeAttached();
    await expectPart(bottomPart).not.toBeAttached();

    // Open activity.
    await activityItem.click();

    // Expect part to display.
    await expectPart(topPart).toDisplayComponent(PartPagePO.selector);
    await expectPart(bottomPart).toDisplayComponent(PartPagePO.selector);

    // Expect components not to be constructed anew.
    await expect.poll(() => topPartPage.getComponentInstanceId()).toEqual(topPartComponentInstanceId);
    await expect.poll(() => bottomPartPage.getComponentInstanceId()).toEqual(bottomPartComponentInstanceId);
  });

  test('should detach parts when switching activities in same activity stack', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create layout with two activities.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', cssClass: 'activity-1'})
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', cssClass: 'activity-2'})
      .navigatePart('part.activity-1', ['test-part'])
      .navigatePart('part.activity-2', ['test-part']),
    );

    const activityPage1 = new PartPagePO(appPO.part({partId: 'part.activity-1'}));
    const activityPage2 = new PartPagePO(appPO.part({partId: 'part.activity-2'}));

    // Open activity 1.
    const activityItem1 = appPO.activityItem({cssClass: 'activity-1'});
    await activityItem1.click();

    // Expect activity 1 to display.
    await expectPart(activityPage1.part).toDisplayComponent(PartPagePO.selector);
    await expectPart(activityPage2.part).not.toBeAttached();

    // Capture component instance id.
    const componentInstanceId1 = await activityPage1.getComponentInstanceId();

    // Open activity 2.
    const activityItem2 = appPO.activityItem({cssClass: 'activity-2'});
    await activityItem2.click();

    // Expect activity 2 to display.
    await expectPart(activityPage1.part).not.toBeAttached();
    await expectPart(activityPage2.part).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const componentInstanceId2 = await activityPage2.getComponentInstanceId();

    // Open activity 1.
    await activityItem1.click();

    // Expect activity 1 to display.
    await expectPart(activityPage1.part).toDisplayComponent(PartPagePO.selector);
    await expectPart(activityPage2.part).not.toBeAttached();

    // Expect component not to be constructed anew.
    await expect.poll(() => activityPage1.getComponentInstanceId()).toEqual(componentInstanceId1);

    // Open activity 2.
    await activityItem2.click();

    // Expect activity 2 to display.
    await expectPart(activityPage1.part).not.toBeAttached();
    await expectPart(activityPage2.part).toDisplayComponent(PartPagePO.selector);

    // Expect component not to be constructed anew.
    await expect.poll(() => activityPage2.getComponentInstanceId()).toEqual(componentInstanceId2);
  });

  test('should detach part on layout change', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create part on the right.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['test-part']),
    );

    const part = appPO.part({partId: 'part.right'});
    const partPage = new PartPagePO(appPO.part({partId: 'part.right'}));

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const componentInstanceId = await partPage.getComponentInstanceId();

    // Add part to the left, forcing detaching the right part during re-layout.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left'})
      .navigatePart('part.left', ['test-part']),
    );

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Expect the component not to be constructed anew.
    await expect.poll(() => partPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should detach navigated main area part on layout change', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create layout with a main area.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigatePart(MAIN_AREA, ['test-part']),
    );

    const part = appPO.part({partId: MAIN_AREA});
    const partPage = new PartPagePO(appPO.part({partId: MAIN_AREA}));

    // Expect main area part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const componentInstanceId = await partPage.getComponentInstanceId();

    // Add part to the left, forcing detaching the main area part during re-layout.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left'})
      .navigatePart('part.left', ['test-part']),
    );

    // Expect main area part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Expect the component not to be constructed anew.
    await expect.poll(() => partPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should detach navigated main area part if not displayed', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Create layout with a main area.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigatePart(MAIN_AREA, ['test-part']),
    );

    const part = appPO.part({partId: MAIN_AREA});
    const partPage = new PartPagePO(appPO.part({partId: MAIN_AREA}));

    // Expect main area part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const componentInstanceId = await partPage.getComponentInstanceId();

    // Open view in main area.
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .navigateView('view.1', ['path/to/view']),
    );

    // Expect main area content not to display.
    await expectPart(part).not.toDisplayComponent();

    // Close the view.
    await appPO.view({viewId: 'view.1'}).tab.close();

    // Expect main area content to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Expect the component not to be constructed anew.
    await expect.poll(() => partPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should detach part in activity if the main area is maximized', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create layout a main area and an activity.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .navigatePart('part.activity', ['test-part'])
      .activatePart('part.activity'),
    );

    const part = appPO.part({partId: 'part.activity'});
    const partPage = new PartPagePO(appPO.part({partId: 'part.activity'}));

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Capture component instance id.
    const componentInstanceId = await partPage.getComponentInstanceId();

    // Open view in main area.
    const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);

    // Maximize the main area.
    await viewPage.view.tab.dblclick();

    // Expect part to be detached.
    await expectPart(part).not.toBeAttached();

    // Restore the layout.
    await viewPage.view.tab.dblclick();

    // Expect part to display.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Expect the component not to be constructed anew.
    await expect.poll(() => partPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should provide part bounds', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create layout with an activity and two aligned parts.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .navigatePart('part.activity', ['test-pages/workbench-handle-bounds-test-page'])
      .navigatePart('part.left', ['test-pages/workbench-handle-bounds-test-page'])
      .navigatePart('part.right', ['test-pages/workbench-handle-bounds-test-page'])
      .activatePart('part.activity'),
    );

    await test.step('Assert part bounds of activity', async () => {
      const part = appPO.part({partId: 'part.activity'});
      const testPage = new WorkbenchHandleBoundsTestPagePO(part);

      await expect(async () => {
        const expectedBounds = await part.getBoundingBox('content');
        const handleBounds = await testPage.getBounds();
        expect(handleBounds).toEqual(expectedBounds);
      }).toPass();
    });

    await test.step('Assert part bounds of left part', async () => {
      const part = appPO.part({partId: 'part.left'});
      const testPage = new WorkbenchHandleBoundsTestPagePO(part);

      await expect(async () => {
        const expectedBounds = await part.getBoundingBox('content');
        const handleBounds = await testPage.getBounds();
        expect(handleBounds).toEqual(expectedBounds);
      }).toPass();
    });

    await test.step('Assert part bounds of right part', async () => {
      const part = appPO.part({partId: 'part.right'});
      const testPage = new WorkbenchHandleBoundsTestPagePO(part);

      await expect(async () => {
        const expectedBounds = await part.getBoundingBox('content');
        const handleBounds = await testPage.getBounds();
        expect(handleBounds).toEqual(expectedBounds);
      }).toPass();
    });
  });
});
