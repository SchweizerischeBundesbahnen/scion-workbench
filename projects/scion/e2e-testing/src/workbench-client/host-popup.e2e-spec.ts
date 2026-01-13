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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {PopupPagePO} from '../workbench/page-object/popup-page.po';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability} from '../workbench/page-object/layout-page/register-route-page.po';
import {WorkbenchPartCapability, WorkbenchPopupCapability} from './page-object/register-workbench-capability-page.po';
import {MAIN_AREA} from '../workbench.model';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {SizeTestPagePO} from '../workbench/page-object/test-pages/size-test-page.po';

test.describe('Workbench Host Popup', () => {

  test('should pass capability to the popup component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'popup', app: 'host'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect capability to be available via `ActivatedMicrofrontend`.
    await expect.poll(() => popupPage.activatedMicrofrontend.getCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'popup', app: 'host'},
      type: 'popup',
      properties: expect.objectContaining({
        path: '',
      }),
    }));
  });

  test('should pass params to the popup component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host popup capability.
    await microfrontendNavigator.registerCapability<WorkbenchPopupCapability>('host', {
      type: 'popup',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
    });

    // Register host popup route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee'})],
    });

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      params: {param: '123'},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect params.
    await expect.poll(() => popupPage.activatedMicrofrontend.getParams()).toEqual(expect.objectContaining({param: '123'}));
  });

  test('should pass referrer to the popup component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register intention.
    await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'popup', app: 'host'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    // Expect referrer.
    await expect.poll(() => popupPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
  });

  test('should stick to the popup anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'popup', app: 'host'}, {
      anchor: 'element',
      align: 'north',
      closeStrategy: {onFocusLost: false},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);
    await popupPage.enterPopupSize({height: '100px', width: '100px'});
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

    // Expand a collapsed panel to move the popup anchor downward.
    await popupOpenerPage.expandPanel();
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

    // Collapse the panel to move the popup anchor upward.
    await popupOpenerPage.collapsePanel();
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
  });

  test('should reposition popup if changing anchor coordinates', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'popup', app: 'host'}, {
      anchor: {top: 150, left: 150},
      align: 'south',
      closeStrategy: {onFocusLost: false},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);
    await popupPage.enterPopupSize({height: '100px', width: '100px'});

    const view = popupOpenerPage.view.locator;
    await expectPopup(popupPage).toHavePosition('south', view, {top: 150, left: 150});

    // Move the anchor to another position.
    await popupOpenerPage.enterPosition({left: 200, top: 300});
    await expectPopup(popupPage).toHavePosition('south', view, {left: 200, top: 300});

    // Move the anchor to another position.
    await popupOpenerPage.enterPosition({left: 300, top: 400});
    await expectPopup(popupPage).toHavePosition('south', view, {left: 300, top: 400});
  });

  test('should maintain popup bounds if context is not visible (to not flicker on reactivation)', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host popup capability.
    await microfrontendNavigator.registerCapability<WorkbenchPopupCapability>('host', {
      type: 'popup',
      qualifier: {component: 'testee', app: 'host'},
      properties: {
        path: '',
        size: {minHeight: '100px', minWidth: '500px'},
      },
    });

    // Register host popup route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'size-test-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee', app: 'host'})],
    });

    // Open popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
    await popupOpenerPage.open({component: 'testee', app: 'host'}, {
      anchor: 'element',
      align: 'south',
      closeStrategy: {onFocusLost: false},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new SizeTestPagePO(popup);

    // Expect popup to display.
    await expectPopup(popupPage).toBeVisible();
    const sizeChanges = await popupPage.getRecordedSizeChanges();

    // Detach popup.
    await appPO.openNewViewTab();
    await expectPopup(popupPage).toBeHidden();

    // Attach popup.
    await popupOpenerPage.view.tab.click();
    await expectPopup(popupPage).toBeVisible();

    // Expect popup not to be resized (no flickering).
    await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
  });

  test.describe('View Context', () => {

    test('should open host popup from host view (element anchor)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from non-host view (element anchor)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset view.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Register intention to open host popup.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from host view (coordinates anchor)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: {top: 150, left: 150},
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});
      const view = popupOpenerPage.view.locator;

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', view, {top: 150, left: 150});
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', view, {top: 150, left: 150});

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from non-host view (coordinates anchor)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Register intention to open host popup.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: {top: 150, left: 150},
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});
      const view = popupOpenerPage.view.locator;

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', view, {top: 150, left: 150});
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', view, {top: 150, left: 150});

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Part Context', () => {

    test('should open host popup from host part (element anchor)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register main area part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      // Register part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: '',
          extras: {
            icon: 'folder',
            label: 'testee',
          },
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee'})],
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
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'right-top',
              active: true,
              cssClass: 'testee',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}), {host: true});
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from non-host part (element anchor)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      // Register main area part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      // Register part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-popup-opener',
          extras: {
            icon: 'folder',
            label: 'testee',
          },
        },
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
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'right-top',
              active: true,
              cssClass: 'testee',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from host part (coordinates anchor)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register main area part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      // Register part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: '',
          extras: {
            icon: 'folder',
            label: 'testee',
          },
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee'})],
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
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'right-top',
              active: true,
              cssClass: 'testee',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}), {host: true});
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: {top: 150, left: 150},
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});
      const part = popupOpenerPage.part.slot.locator;

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', part, {top: 150, left: 150});
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', part, {top: 150, left: 150});

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from non-host part (coordinates anchor)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'popup', app: 'host'}});

      // Register main area part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      // Register part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: 'test-popup-opener',
          extras: {
            icon: 'folder',
            label: 'testee',
          },
        },
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
              id: 'part.testee',
              qualifier: {part: 'testee'},
              position: 'right-top',
              active: true,
              cssClass: 'testee',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: {top: 150, left: 150},
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterPopupSize({height: '100px', width: '100px'});
      const part = popupOpenerPage.part.slot.locator;

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', part, {top: 150, left: 150});
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', part, {top: 150, left: 150});

      // Expect the component not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Popup Context', () => {

    test('should open host popup from host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'host'},
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'popup-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'popup-opener', app: 'host'})],
      });

      // Open host popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage1.open({component: 'popup-opener', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}), {host: true});

      // Open host popup from host popup.
      await popupOpenerPage2.open({component: 'testee', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage1.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from non-host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'testee', app: 'host'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'host'},
        private: false,
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener', app: 'app1'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open non-host popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener', app: 'app1'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));

      // Open host popup from non-host popup.
      await popupOpenerPage2.open({component: 'testee', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await popupOpenerPage1.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Dialog Context', () => {

    test('should open host popup from host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'host'},
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'popup-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'popup-opener', app: 'host'})],
      });

      // Open host dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage.open({component: 'popup-opener', app: 'host'}, {cssClass: 'popup-opener'});

      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}), {host: true});

      // Open host popup from host dialog.
      await popupOpenerPage.open({component: 'testee', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host popup from non-host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'popup', qualifier: {component: 'testee', app: 'host'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'host'},
        private: false,
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener', app: 'app1'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open non-host dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener', app: 'app1'}, {cssClass: 'popup-opener'});

      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));

      // Open host popup from non-host dialog.
      await popupOpenerPage.open({component: 'testee', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to display.
      await expectPopup(popupPage).toBeVisible();
      const componentInstanceId = await popupPage.getComponentInstanceId();

      // Detach popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Attach popup.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be constructed anew.
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Popup Result', () => {
    test('should close popup with a return value', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'RETURN VALUE'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should close popup with an error', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'ERROR', closeWithError: true});
      await expect(popupOpenerPage.error).toHaveText('ERROR');
    });

    test('should return value on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await popupOpenerPage.view.tab.click();
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should return only the latest result value on close', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE 1', {apply: true});

      await popupPage.close({returnValue: 'RETURN VALUE 2'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE 2');
    });

    test('should not return value on escape keystroke', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await page.keyboard.press('Escape');
      await expect(popupOpenerPage.returnValue).not.toBeAttached();
    });
  });

  test.describe('Popup Closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
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

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onEscape: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      await page.keyboard.press('Escape');
      await expectPopup(popupPage).not.toBeAttached();

      // Open the popup.
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onEscape: true},
        cssClass: 'testee',
      });

      await expectPopup(popupPage).toBeVisible();

      await popupPage.enterReturnValue('explicitly request the focus');
      await page.keyboard.press('Escape');
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'popup', app: 'host'}, {
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
  });
});
