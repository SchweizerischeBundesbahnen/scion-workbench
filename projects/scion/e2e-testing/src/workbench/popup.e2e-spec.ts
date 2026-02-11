/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {PopupPositionTestPagePO} from './page-object/test-pages/popup-position-test-page.po';
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {expectView} from '../matcher/view-matcher';
import {MAIN_AREA} from '../workbench.model';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {BlankTestPagePO} from './page-object/test-pages/blank-test-page.po';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench Popup', () => {

  test.describe('Legacy Popup API', () => {
    test('should open popup', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        align: 'north',
        cssClass: 'testee',
        legacyAPI: true,
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should size the popup as configured', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {width: '300px', height: '400px'},
        cssClass: 'testee',
        legacyAPI: true,
      });

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 300,
        height: 400,
      }));
    });

    test('should allow passing a value to the popup component', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        cssClass: 'testee',
        legacyAPI: true,
        inputLegacy: 'TEST INPUT',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expect(popupPage.input).toHaveText('TEST INPUT');
    });
  });

  test.describe('Popup Alignment (Element Anchor)', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {width: '100px', height: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        align: 'north',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        align: 'south',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('south', popupOpenerPage.openButton);
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        align: 'east',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('east', popupOpenerPage.openButton);
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        align: 'west',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('west', popupOpenerPage.openButton);
    });
  });

  test.describe('Popup Alignment (Coordinate Anchor)', () => {

    test('should, by default, open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 300, top: 300},
        size: {width: '100px', height: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 300, top: 300});
    });

    test('should open in the north of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 300, top: 300},
        align: 'north',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 300, top: 300});
    });

    test('should open in the south of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 300, top: 300},
        align: 'south',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('south', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 300, top: 300});
    });

    test('should open in the east of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 300, top: 300},
        align: 'east',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('east', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 300, top: 300});
    });

    test('should open in the west of the anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 300, top: 300},
        align: 'west',
        size: {width: '100px', height: '100px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('west', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 300, top: 300});
    });
  });

  test('should stick to popup anchor after re-layout of workbench parts', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'})
      .addView('view.100', {partId: 'part.right'}),
    );

    // Open popup in main area.
    const popupOpenerView = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerView.open('blank-test-page', {
      anchor: 'element',
      closeStrategy: {onFocusLost: false},
      cssClass: 'testee',
    });

    const popupPage = new BlankTestPagePO(appPO.popup({cssClass: 'testee'}));

    // Remove the right part by closing its only view, causing the workbench to re-layout workbench parts.
    await appPO.view({viewId: 'view.100'}).tab.close();
    await expectPopup(popupPage).toBeVisible();

    // Expect the popup to stick to the popup anchor.
    await expectPopup(popupPage).toHavePosition('north', popupOpenerView.openButton);
  });

  test('should allow passing a value to the popup component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('popup-page', {
      anchor: 'element',
      inputs: {input: 'TEST INPUT'},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expect(popupPage.input).toHaveText('TEST INPUT');
  });

  /**
   * Tests that the popup is rendered at the specified position on first rendering, not initially at position 0/0.
   */
  test('should render popup at specified position on first rendering', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open popup.
    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('size-test-page', {
      anchor: {top: 300, left: 400},
      inputs: {captureIfVisibleOnly: true},
      delayAnchorCoordinates: 1000,
      size: {width: '500px', height: '200px'},
      context: null,
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new SizeTestPagePO(popup);
    await expectPopup(popupPage).toBeVisible();
    await expectPopup(popupPage).toHavePosition('north', 'viewport', {top: 300, left: 400});

    // Expect single positioning.
    await expect.poll(() => popupPage.getRecordedSizeChanges()).toHaveLength(1);
  });

  test.describe('Popup Result', () => {
    test('should allow closing the popup and returning a value to the popup opener', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'RETURN VALUE'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should allow closing the popup with an error', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'ERROR', closeWithError: true});
      await expect(popupOpenerPage.error).toHaveText('ERROR');
    });

    test('should allow returning value on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await popupOpenerPage.view.tab.click();
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should return only the latest result value on close', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE 1', {apply: true});

      await popupPage.close({returnValue: 'RETURN VALUE 2'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE 2');
    });

    test('should not return value on escape keystroke', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onEscape: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await page.keyboard.press('Escape');
      await expect(popupOpenerPage.returnValue).not.toBeAttached();
    });
  });

  test('should associate popup with specified CSS class(es) ', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('popup-page', {
      anchor: 'element',
      cssClass: ['testee', 'a', 'b'],
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expect(popup.locator).toContainClass('testee a b');
  });

  test.describe('Moving Popup Anchor', () => {

    test('should stick to the popup anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        align: 'north',
        size: {width: '100px', height: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expand a collapsed panel to move the popup anchor downward.
      await popupOpenerPage.expandPanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Collapse the panel to move the popup anchor upward.
      await popupOpenerPage.collapsePanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 150, top: 150},
        align: 'south',
        size: {width: '100px', height: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      await expectPopup(popupPage).toHavePosition('south', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 150, top: 150});

      // Move the anchor to another position.
      await popupOpenerPage.enterPosition({left: 200, top: 300});
      await expectPopup(popupPage).toHavePosition('south', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 200, top: 300});

      // Move the anchor to another position.
      await popupOpenerPage.enterPosition({left: 300, top: 400});
      await expectPopup(popupPage).toHavePosition('south', appPO.activePart({grid: 'mainArea'}).activeView.locator, {left: 300, top: 400});
    });
  });

  test.describe('Part Context', () => {

    test('should bind popup to contextual part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.testee', ['test-popup-opener'])
        .activatePart('part.testee'),
      );

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {width: '50px', height: '50px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind popup to any part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .activatePart('part.testee'),
      );

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 100, left: 100},
        context: 'part.testee',
        size: {width: '50px', height: '50px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expectPopup(popupPage).toHavePosition('north', appPO.part({partId: 'part.testee'}).slot.locator, {top: 100, left: 100});

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', appPO.part({partId: 'part.testee'}).slot.locator, {top: 100, left: 100});

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should not bind popup to contextual part if context null', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.testee', ['test-popup-opener'])
        .activatePart('part.testee'),
      );

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 300, left: 300},
        context: null,
        size: {height: '100px', width: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', 'viewport', {top: 300, left: 300});

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectPopup(popupPage).toBeVisible();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should open popup in the top left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', activate: true})
        .navigatePart('part.testee', ['test-popup-opener']));

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(part);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', activate: true})
        .navigatePart('part.testee', ['test-popup-opener']));

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(part);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', activate: true})
        .navigatePart('part.testee', ['test-popup-opener']));

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(part);
      await popupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', activate: true})
        .navigatePart('part.testee', ['test-popup-opener']));

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(part);
      await popupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {bottom: 0, right: 0});
    });

    test('should adjust popup position when sashing part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', activate: true})
        .navigatePart('part.testee', ['test-popup-opener']));

      const part = appPO.part({partId: 'part.testee'});

      // Open popup in top left corner.
      const popupOpenerPage = new PopupOpenerPagePO(part);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, left: 0},
        size: {width: '10px', height: '10px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be opened in top left corner.
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, left: 0});

      await test.step('Sash right activity panel 100px to the left', async () => {
        await appPO.activityPanel('right').resize(-100);

        // Expect popup to stick to part bounds.
        await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, left: 0});
      });

      await test.step('Sash right activity panel 100px to the right', async () => {
        await appPO.activityPanel('right').resize(100);

        // Expect popup to stick to part bounds.
        await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, left: 0});
      });
    });

    test('should maintain popup bounds if contextual part is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.testee', ['test-popup-opener'])
        .activatePart('part.testee'),
      );

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open('size-test-page', {
        anchor: 'element',
        size: {width: '500px', height: '200px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual part is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.testee', ['test-popup-opener'])
        .activatePart('part.testee'),
      );

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open('size-test-page', {
        anchor: {left: 0, top: 0},
        size: {width: '500px', height: '200px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new SizeTestPagePO(popup);

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });
  });

  test.describe('View Context', () => {

    test('should bind popup to contextual view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Deactivate view.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Activate view.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind popup to any view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addView('view.right', {partId: 'part.right'})
        .activatePart('part.right'),
      );

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 100, left: 100},
        context: 'view.right',
        size: {width: '50px', height: '50px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expectPopup(popupPage).toHavePosition('north', appPO.view({viewId: 'view.right'}).locator, {top: 100, left: 100});

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', appPO.view({viewId: 'view.right'}).locator, {top: 100, left: 100});

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should not bind popup to contextual view if context null', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 300, left: 300},
        context: null,
        size: {height: '100px', width: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', 'viewport', {top: 300, left: 300});

      // Detach view.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeVisible();

      // Attach view.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Close the view.
      await popupOpenerPage.view.tab.close();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should open popup in the top left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.top', {align: 'top'})
        .addPart('part.bottom', {align: 'bottom'})
        .navigatePart('part.left', ['path/to/part'])
        .navigatePart('part.right', ['path/to/part'])
        .navigatePart('part.top', ['path/to/part'])
        .navigatePart('part.bottom', ['path/to/part']),
      );

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.top', {align: 'top'})
        .addPart('part.bottom', {align: 'bottom'})
        .navigatePart('part.left', ['path/to/part'])
        .navigatePart('part.right', ['path/to/part'])
        .navigatePart('part.top', ['path/to/part'])
        .navigatePart('part.bottom', ['path/to/part']),
      );

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.top', {align: 'top'})
        .addPart('part.bottom', {align: 'bottom'})
        .navigatePart('part.left', ['path/to/part'])
        .navigatePart('part.right', ['path/to/part'])
        .navigatePart('part.top', ['path/to/part'])
        .navigatePart('part.bottom', ['path/to/part']),
      );

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.top', {align: 'top'})
        .addPart('part.bottom', {align: 'bottom'})
        .navigatePart('part.left', ['path/to/part'])
        .navigatePart('part.right', ['path/to/part'])
        .navigatePart('part.top', ['path/to/part'])
        .navigatePart('part.bottom', ['path/to/part']),
      );

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {bottom: 0, right: 0});
    });

    test('should detach popup if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
        .addView('view.100', {partId: 'part.activity-1'})
        .navigateView('view.100', ['test-popup-opener'])
        .activatePart('part.activity-1'),
      );

      // Open view in main area.
      const viewPageInMainArea = await workbenchNavigator.openInNewTab(ViewPagePO);

      // Open popup.
      const popupOpenerView = new PopupOpenerPagePO(appPO.view({viewId: 'view.100'}));
      await popupOpenerView.open('popup-page', {
        anchor: 'element',
        size: {height: '100px', width: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerView.openButton);

      // Maximize the main area.
      await viewPageInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeHidden();

      // Restore the layout.
      await viewPageInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerView.openButton);
    });

    test('should maintain popup bounds if contextual view is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('size-test-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
        size: {minHeight: '100px', minWidth: '500px'},
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new SizeTestPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Open view.
      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await expectPopup(popupPage).toBeHidden();
      await expectView(popupOpenerPage).toBeInactive();
      await expectView(viewPage).toBeActive();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Activate popup opener page.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectView(popupOpenerPage).toBeActive();
      await expectView(viewPage).toBeInactive();

      // Expect popup not to be resized
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual view is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('size-test-page', {
        anchor: {top: 100, left: 100},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
        size: {minHeight: '100px', minWidth: '500px'},
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new SizeTestPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Open view.
      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await expectPopup(popupPage).toBeHidden();
      await expectView(popupOpenerPage).toBeInactive();
      await expectView(viewPage).toBeActive();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Activate popup opener page.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectView(popupOpenerPage).toBeActive();
      await expectView(viewPage).toBeInactive();

      // Expect popup not to be resized (no flickering).
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });
  });

  test.describe('Dialog Context', () => {

    test('should bind popup to contextual dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(dialog);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should not bind popup to contextual dialog if context null', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 300, left: 300},
        context: null,
        size: {height: '100px', width: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', 'viewport', {top: 300, left: 300});

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeVisible();

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should bind popup to any dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.right', ['test-dialog-opener'])
        .activatePart('part.right'),
      );

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.right'}));
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'dialog'});
      const dialog = appPO.dialog({cssClass: 'dialog'});
      await dialog.resizeTop(300); // Shrink dialog to not cover popup opener tile.
      await dialog.moveDialog('bottom-left-corner');

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 100, left: 100},
        context: await dialog.getDialogId(),
        size: {width: '50px', height: '50px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 100, left: 100});

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 100, left: 100});

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open popup in the top left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(dialog);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(dialog);
      await popupOpenerPage.open('popup-page', {
        anchor: {top: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(dialog);
      await popupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(dialog);
      await popupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {bottom: 0, right: 0});
    });

    test('should adjust popup position when moving contextual dialog', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(dialog);
      await popupOpenerPage.open('popup-page', {
        anchor: {left: 0, top: 0},
        size: {width: '10px', height: '10px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to open in top left corner.
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});

      await test.step('Move dialog 100px to the left', async () => {
        await dialog.moveDialog({x: -100, y: 0});

        // Expect popup to stick to dialog bounds.
        await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});
      });

      await test.step('Move dialog 100px to the bottom', async () => {
        await dialog.moveDialog({x: 0, y: 100});

        // Expect popup to stick to dialog bounds.
        await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});
      });

      await test.step('Move dialog 100px to the right', async () => {
        await dialog.moveDialog({x: 100, y: 0});

        // Expect popup to stick to dialog bounds.
        await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});
      });

      await test.step('Move dialog 100px to the top', async () => {
        await dialog.moveDialog({x: 0, y: -100});

        // Expect popup to stick to dialog bounds.
        await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});
      });
    });

    test('should maintain popup bounds if contextual dialog is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open('size-test-page', {
        anchor: 'element',
        size: {width: '500px', height: '200px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual dialog is not active (to not flicker on reactivation; to support for virtual scrolling) [element coordinate]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open dialog.
      const dialogOpenerPage = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
      await dialogOpenerPage.open('popup-opener-page', {cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open('size-test-page', {
        anchor: {top: 0, left: 0},
        size: {width: '500px', height: '200px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });
  });

  test.describe('Popup Context', () => {

    test('should bind popup to contextual popup', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup.
      const popupOpenerPage1 = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage1.open('popup-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-1',
      });

      const popupPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-1'}));

      // Open popup in popup.
      await popupPage1.open('popup-page', {
        anchor: 'element',
        size: {height: '100px', width: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-2',
      });

      const popupPage2 = new PopupPagePO(appPO.popup({cssClass: 'popup-2'}));

      await expectPopup(popupPage2).toBeVisible();
      await expectPopup(popupPage2).toHavePosition('north', popupPage1.openButton);
      const componentInstanceId = await popupPage2.getComponentInstanceId();

      // Detach popup 1.
      await appPO.openNewViewTab();
      await expectPopup(popupPage2).toBeHidden();

      // Attach popup 1.
      await popupOpenerPage1.view.tab.click();
      await expectPopup(popupPage2).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage2.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should not bind popup to contextual popup if context null', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-1',
      });

      // Open popup in popup.
      const popupOpenerPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-1'}));
      await popupOpenerPage1.open('popup-page', {
        anchor: {left: 300, top: 300},
        context: null,
        size: {height: '100px', width: '100px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', 'viewport', {top: 300, left: 300});

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeVisible();

      // Attach contextual popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should bind popup to any popup', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .navigatePart('part.right', ['test-popup-opener'])
        .activatePart('part.right'),
      );

      // Open popup 1.
      const popupOpenerPage1 = new PopupOpenerPagePO(appPO.part({partId: 'part.right'}));
      await popupOpenerPage1.open('popup-page', {
        anchor: 'element',
        size: {width: '50px', height: '50px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-1',
      });
      const popup1 = appPO.popup({cssClass: 'popup-1'});

      // Open popup 2 in popup 1.
      const popupOpenerPage2 = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage2.open('popup-page', {
        anchor: {top: 0, left: 0},
        context: await popup1.getPopupId(),
        size: {width: '50px', height: '50px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-2',
      });

      const popup2 = appPO.popup({cssClass: 'popup-2'});
      const popupPage2 = new PopupPagePO(popup2);

      // Expect popup to be visible.
      await expectPopup(popupPage2).toBeVisible();
      const componentInstanceId = await popupPage2.getComponentInstanceId();
      await expectPopup(popupPage2).toHavePosition('north', popup1.locator, {top: 0, left: 0});

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be hidden.
      await expectPopup(popupPage2).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect popup to be visible.
      await expectPopup(popupPage2).toBeVisible();
      await expectPopup(popupPage2).toHavePosition('north', popup1.locator, {top: 0, left: 0});

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage2.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open popup in the top left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        size: {width: '250px', height: '250px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup in popup.
      const testeePopupOpenerPage = new PopupOpenerPagePO(popup);
      await testeePopupOpenerPage.open('popup-opener-page', {
        anchor: {top: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const testeePopupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(testeePopupPage).toHavePosition('north', popup.locator, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        size: {width: '250px', height: '250px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup in popup.
      const testeePopupOpenerPage = new PopupOpenerPagePO(popup);
      await testeePopupOpenerPage.open('popup-page', {
        anchor: {top: 0, right: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const testeePopupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(testeePopupPage).toHavePosition('north', popup.locator, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        size: {width: '250px', height: '250px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup in popup.
      const testeePopupOpenerPage = new PopupOpenerPagePO(popup);
      await testeePopupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, left: 0},
        size: {width: '10px', height: '10px'},
        cssClass: 'testee',
      });

      const testeePopupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(testeePopupPage).toHavePosition('north', popup.locator, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup opener page in popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        size: {width: '250px', height: '250px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup in popup.
      const testeePopupOpenerPage = new PopupOpenerPagePO(popup);
      await testeePopupOpenerPage.open('popup-page', {
        anchor: {bottom: 0, right: 0},
        size: {width: '10px', height: '10px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const testeePopupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(testeePopupPage).toHavePosition('north', popup.locator, {bottom: 0, right: 0});
    });

    test('should maintain popup bounds if contextual popup is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-1',
      });

      // Open popup in popup.
      const popupOpenerPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-1'}));
      await popupOpenerPage1.open('size-test-page', {
        anchor: 'element',
        size: {width: '500px', height: '200px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-2',
      });

      const popupPage2 = new SizeTestPagePO(appPO.popup({cssClass: 'popup-2'}));

      // Expect popup to be visible.
      await expectPopup(popupPage2).toBeVisible();
      const popupSize = await popupPage2.getBoundingBox();
      const sizeChanges = await popupPage2.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage2).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage2.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage2).toBeVisible();

      // Expect popup not to be resized
      await expect.poll(() => popupPage2.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual popup is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup.
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-opener-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-1',
      });

      // Open popup in popup.
      const popupOpenerPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-1'}));
      await popupOpenerPage1.open('size-test-page', {
        anchor: {top: 0, left: 0},
        size: {width: '500px', height: '200px'},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-2',
      });

      const popupPage2 = new SizeTestPagePO(appPO.popup({cssClass: 'popup-2'}));

      // Expect popup to be visible.
      await expectPopup(popupPage2).toBeVisible();
      const popupSize = await popupPage2.getBoundingBox();
      const sizeChanges = await popupPage2.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage2).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage2.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage2).toBeVisible();

      // Expect popup not to be resized
      await expect.poll(() => popupPage2.getRecordedSizeChanges()).toEqual(sizeChanges);
    });
  });

  test.describe('Popup Closing', () => {

    test('should close the popup on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on focus loss', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onEscape: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        closeStrategy: {onEscape: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).toBeVisible();
    });

    test('should remain focus on the element that caused the popup to lose focus', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open popup page
      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);

      // Open test page
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/input-field-test-page'], {cssClass: 'testee'});
      const inputFieldPage = new InputFieldTestPagePO(appPO.view({cssClass: 'testee'}));

      // Move test page to the right
      const dragHandle = await inputFieldPage.view.tab.startDrag();
      await dragHandle.dragToPart(await inputFieldPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Open popup
      await popupOpenerPage.view.tab.click();
      await popupOpenerPage.open('focus-test-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

      // Expect popup to have focus.
      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await expectPopup(focusTestPage).not.toBeAttached();

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(inputFieldPage.input).toBeFocused();
    });
  });

  test.describe('Focus Trap', () => {

    test('should automatically focus the first field', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('focus-test-page', {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should install a focus trap to cycle focus (pressing tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('focus-test-page', {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(focusTestPage.lastField).toBeFocused();
    });

    test('should install a focus trap to cycle focus (pressing shift-tab)', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('focus-test-page', {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.firstField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.lastField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.middleField).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(focusTestPage.firstField).toBeFocused();
    });

    test('should restore focus after re-activating its contextual view, if any', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('focus-test-page', {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const focusTestPage = new FocusTestPagePO(popup);
      await focusTestPage.clickField('middle-field');
      await expect(focusTestPage.middleField).toBeFocused();
      await expect(focusTestPage.locator).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expect(focusTestPage.locator).toBeAttached();
      await expect(focusTestPage.locator).not.toBeVisible();

      // re-activate the view
      await popupOpenerPage.view.tab.click();
      await expect(focusTestPage.locator).toBeVisible();
      await expect(focusTestPage.middleField).toBeFocused();
    });
  });

  test.describe('Stick Popup to View or Part Bounds', () => {

    test('should stick popup anchor to bottom view bounds when scrolling up', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.bottom', {align: 'bottom'})
        .addView('testee', {partId: 'part.middle'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginTop('2000');

      // Open popup.
      const popup = await testPage.open();

      // Capture view bounds
      const viewBoundingBox = await testPage.view.getBoundingBox();

      while (await testPage.view.getScrollPosition('vertical') > 0) {
        // Move scrollbar up
        await testPage.view.scrollbars.vertical.scroll(-25);

        // Expect popup anchor not to exceed bottom view bounds
        const {y} = await popup.getAnchorPosition();
        expect(y).toBeLessThanOrEqual(viewBoundingBox.bottom + 1);
      }

      // Expect popup anchor to stick to bottom view bounds
      const {y} = await popup.getAnchorPosition();
      expect(y).toBeCloseTo(viewBoundingBox.bottom, 0);
    });

    test('should stick popup anchor to top view bounds when scrolling down', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.bottom', {align: 'bottom'})
        .addView('testee', {partId: 'part.middle'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginBottom('2000');

      // Capture view bounds.
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Open popup.
      const popup = await testPage.open();

      while (await testPage.view.getScrollPosition('vertical') < 1) {
        // Move scrollbar down
        await testPage.view.scrollbars.vertical.scroll(25);

        // Expect popup anchor not to exceed top view bounds.
        const {y} = await popup.getAnchorPosition();
        expect(y).toBeGreaterThanOrEqual(viewBoundingBox.top - 1);
      }

      // Expect popup anchor to stick to top view bounds.
      const {y} = await popup.getAnchorPosition();
      expect(y).toBeCloseTo(viewBoundingBox.top, 0);
    });

    test('should stick popup anchor to right view bounds when scrolling left', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginLeft('2000');

      // Capture view bounds.
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Open popup.
      const popup = await testPage.open();

      while (await testPage.view.getScrollPosition('horizontal') > 0) {
        // Move scrollbar left.
        await testPage.view.scrollbars.horizontal.scroll(-25);

        // Expect popup anchor not to exceed right view bounds.
        const {x} = await popup.getAnchorPosition();
        expect(x).toBeLessThanOrEqual(viewBoundingBox.right + 1);
      }

      // Expect popup anchor to stick to right view bounds.
      const {x} = await popup.getAnchorPosition();
      expect(x).toBeCloseTo(viewBoundingBox.right, 0);
    });

    test('should stick popup anchor to left view bounds when scrolling right', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginRight('2000');

      // Capture view bounds.
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Open popup.
      const popup = await testPage.open();

      while (await testPage.view.getScrollPosition('horizontal') < 1) {
        // Move scrollbar right.
        await testPage.view.scrollbars.horizontal.scroll(25);

        // Expect popup anchor not to exceed left view bounds.
        const {x} = await popup.getAnchorPosition();
        expect(x).toBeGreaterThanOrEqual(viewBoundingBox.left - 1);
      }

      // Expect popup anchor to stick to left view bounds.
      const {x} = await popup.getAnchorPosition();
      expect(x).toBeCloseTo(viewBoundingBox.left, 0);
    });

    test('should stick popup anchor to bottom part bounds when moving bottom sash up', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.part.getBoundingBox()).height > 0) {
        // Move bottom sash up.
        await testPage.view.part.sash.drag('bottom', -50);

        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.part.getBoundingBox();

        // Expect popup anchor not to exceed bottom part bounds.
        expect(y).toBeLessThanOrEqual(partBoundingBox.bottom + 1);

        // Expect popup anchor not to exceed top part bounds.
        expect(y).toBeGreaterThanOrEqual(partBoundingBox.top - 1);
      }

      const {y} = await popup.getAnchorPosition();
      const partBoundingBox = await testPage.view.part.getBoundingBox();

      // Expect popup anchor to stick to top part bounds.
      expect(y).toBeCloseTo(partBoundingBox.top, 0);

      // Expect popup anchor to stick to bottom part bounds.
      expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
    });

    /**
     * This test adds a hidden part (no navigation, no views) to create a layout where one grid-element directly succeeds another grid-element without an intermediate sci-sashbox.
     * If the grid element were not set to overflow `hidden`, the popup would stick below the bottom part bounds.
     */
    test('should stick popup anchor to bottom part bounds when moving bottom sash up (grid-element directly succeeding another grid-element)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3}) // Add hidden part.
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.part.getBoundingBox()).height > 0) {
        // Move bottom sash up.
        await testPage.view.part.sash.drag('bottom', -50);

        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.part.getBoundingBox();

        // Expect popup anchor not to exceed bottom part bounds.
        expect(y).toBeLessThanOrEqual(partBoundingBox.bottom + 1);

        // Expect popup anchor not to exceed top part bounds.
        expect(y).toBeGreaterThanOrEqual(partBoundingBox.top - 1);
      }

      const {y} = await popup.getAnchorPosition();
      const partBoundingBox = await testPage.view.part.getBoundingBox();

      // Expect popup anchor to stick to top part bounds.
      expect(y).toBeCloseTo(partBoundingBox.top, 0);

      // Expect popup anchor to stick to bottom part bounds.
      expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
    });

    test('should stick popup anchor to bottom part bounds when moving top sash down', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.top', {align: 'top', ratio: .1})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('top', {partId: 'part.top'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.part.getBoundingBox()).height > 0) {
        // Drag top sash down
        await testPage.view.part.sash.drag('top', 50);

        const {y} = await popup.getAnchorPosition();

        // Expect popup anchor not to exceed top part bounds.
        const partBoundingBox = await testPage.view.part.getBoundingBox();
        expect(y).toBeGreaterThanOrEqual(partBoundingBox.top - 1);

        // Expect popup anchor not to exceed bottom part bounds.
        expect(y).toBeLessThanOrEqual(partBoundingBox.bottom + 1);
      }

      const {y} = await popup.getAnchorPosition();
      const partBoundingBox = await testPage.view.part.getBoundingBox();

      // Expect popup anchor to stick to top part bounds.
      expect(y).toBeCloseTo(partBoundingBox.top, 0);

      // Expect popup anchor to stick to bottom part bounds.
      expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
    });

    test('should stick popup anchor to right view bounds when moving right sash to the left', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginLeft('400');

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.getBoundingBox()).width > 0) {
        // Move right sash to the left.
        await testPage.view.part.sash.drag('right', -50);

        const {x} = await popup.getAnchorPosition();

        // Expect popup anchor not to exceed right view bounds.
        const viewBoundingBox = await testPage.view.getBoundingBox();
        expect(x).toBeLessThanOrEqual(viewBoundingBox.right + 1);

        // Expect popup anchor not to exceed left view bounds.
        expect(x).toBeGreaterThanOrEqual(viewBoundingBox.left - 1);
      }

      const {x} = await popup.getAnchorPosition();
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Expect popup anchor to stick to right view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.right, 0);

      // Expect popup anchor to stick to left view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.left, 0);
    });

    test('should stick popup anchor to right view bounds when moving left sash to the right', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginLeft('400');

      // Open popup.
      const popup = await testPage.open();

      while ((await testPage.view.getBoundingBox()).width > 0) {
        // Move left sash to the right.
        await testPage.view.part.sash.drag('left', 50);

        const {x} = await popup.getAnchorPosition();
        const viewBoundingBox = await testPage.view.getBoundingBox();

        // Expect popup anchor not to exceed right view bounds.
        expect(x).toBeLessThanOrEqual(viewBoundingBox.right + 1);

        // Expect popup anchor not to exceed left view bounds.
        expect(x).toBeGreaterThanOrEqual(viewBoundingBox.left - 1);
      }

      const {x} = await popup.getAnchorPosition();
      const viewBoundingBox = await testPage.view.getBoundingBox();

      // Expect popup anchor to stick to right view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.right, 0);

      // Expect popup anchor to stick to left view bounds.
      expect(x).toBeCloseTo(viewBoundingBox.left, 0);
    });

    test('should stick popup anchor to right view bounds if anchor scrolled out of viewport and moving right sash to the right', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {align: 'right', ratio: .3})
        .addView('testee', {partId: 'part.middle'})
        .addView('left', {partId: 'part.left'})
        .addView('right', {partId: 'part.right'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginLeft('2000');

      // Open popup.
      const popup = await testPage.open();

      await test.step('move right sash to the left', async () => {
        // Move right sash to the left.
        await testPage.view.part.sash.drag('right', -500);

        // Expect popup anchor to stick to right view bounds.
        const {x} = await popup.getAnchorPosition();
        const viewBoundingBox = await testPage.view.getBoundingBox();
        expect(x).toBeCloseTo(viewBoundingBox.right, 0);
      });

      await test.step('scroll left', async () => {
        const viewBoundingBox = await testPage.view.getBoundingBox();

        while (await testPage.view.getScrollPosition('horizontal') > 0) {
          // Move scrollbar left.
          await testPage.view.scrollbars.horizontal.scroll(-50);

          // Expect popup anchor to stick to right view bounds.
          const {x} = await popup.getAnchorPosition();
          expect(x).toBeCloseTo(viewBoundingBox.right, 0);
        }
      });

      await test.step('move right sash to the right', async () => {
        // Move right sash to the right.
        await testPage.view.part.sash.drag('right', 500);

        // Expect popup anchor to stick to right view bounds.
        const {x} = await popup.getAnchorPosition();
        const viewBoundingBox = await testPage.view.getBoundingBox();
        expect(x).toBeCloseTo(viewBoundingBox.right, 0);
      });
    });

    test('should stick popup anchor to bottom part bounds if anchor scrolled out of viewport and moving bottom sash down', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.middle')
        .addPart('part.left', {relativeTo: 'part.middle', align: 'left', ratio: .3})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right', ratio: .3})
        .addPart('part.bottom', {align: 'bottom', ratio: .1})
        .addView('testee', {partId: 'part.middle'})
        .addView('right', {partId: 'part.right'})
        .addView('bottom', {partId: 'part.bottom'})
        .navigateView('testee', ['test-pages/popup-position-test-page'], {cssClass: 'testee'}),
      );

      const testPage = new PopupPositionTestPagePO(appPO.view({cssClass: 'testee'}));

      await testPage.enterMarginTop('2000');

      // Open popup.
      const popup = await testPage.open();

      await test.step('move bottom sash up', async () => {
        // Move bottom sash up.
        await testPage.view.part.sash.drag('bottom', -500);

        // Expect popup anchor to stick to bottom part bounds.
        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.part.getBoundingBox();
        expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
      });

      await test.step('scroll up', async () => {
        const partBoundingBox = await testPage.view.part.getBoundingBox();

        while (await testPage.view.getScrollPosition('vertical') > 0) {
          // Move scrollbar up.
          await testPage.view.scrollbars.vertical.scroll(-50);

          // Expect popup anchor to stick to bottom part bounds.
          const {y} = await popup.getAnchorPosition();
          expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
        }
      });

      await test.step('move bottom sash down', async () => {
        // Move top sash up.
        await testPage.view.part.sash.drag('bottom', 500);

        // Expect popup anchor to stick to bottom part bounds.
        const {y} = await popup.getAnchorPosition();
        const partBoundingBox = await testPage.view.getBoundingBox();
        expect(y).toBeCloseTo(partBoundingBox.bottom, 0);
      });
    });
  });
});
