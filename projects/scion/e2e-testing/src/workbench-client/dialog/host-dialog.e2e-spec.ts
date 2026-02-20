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
import {expect} from '@playwright/test';
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {expectDialog} from '../../matcher/dialog-matcher';
import {DialogPagePO} from '../../workbench/page-object/dialog-page.po';
import {FocusTestPagePO} from '../../workbench/page-object/test-pages/focus-test-page.po';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability} from '../../workbench/page-object/layout-page/register-route-page.po';
import {WorkbenchDialogCapability, WorkbenchPartCapability} from '../page-object/register-workbench-capability-page.po';
import {MAIN_AREA} from '../../workbench.model';
import {PopupOpenerPagePO} from '../page-object/popup-opener-page.po';

test.describe('Workbench Host Dialog', () => {

  test('should pass capability to the dialog component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect capability.
    await expect.poll(() => dialogPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {component: 'dialog', app: 'host'},
      properties: {
        path: '',
      },
    });
  });

  test('should pass params to the dialog component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host dialog capability.
    await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
    });

    // Register host dialog route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'testee'}, {params: {param: '123'}, cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect params.
    await expect.poll(() => dialogPage.activatedMicrofrontend.getParams()).toEqual({param: '123'});
  });

  test('should pass referrer to the dialog component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register intention.
    await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'dialog', app: 'host'}});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect referrer.
    await expect.poll(() => dialogPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
  });

  test('should apply dialog defaults', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect host dialog to display.
    await expectDialog(dialogPage).toBeVisible();

    // Expect the close button to be visible.
    await expect(dialog.closeButton).toBeVisible();
    // Expect the dialog to be resizable.
    await expect(dialog.resizeHandles).toHaveCount(8);
    // Expect padding.
    await expect(async () => {
      const dialogBorder = 2 * await dialog.getDialogBorderWidth();
      const pageSize = await dialogPage.getBoundingBox();
      const dialogSize = await dialog.getDialogBoundingBox();
      expect(pageSize.width).toBeLessThan(dialogSize.width - dialogBorder);
    }).toPass();
  });

  test('should apply capability properties', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host dialog capability.
    await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        title: 'Workbench Host Dialog',
        closable: false,
        resizable: false,
        padding: false,
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
          width: '500px',
          minWidth: '495px',
          maxWidth: '505px',
        },
      },
    });

    // Register host dialog route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect title to be set.
    await expect(dialog.title).toHaveText('Workbench Host Dialog');
    // Expect the close button not to be visible.
    await expect(dialog.closeButton).not.toBeVisible();
    // Expect the dialog not to be resizable.
    await expect(dialog.resizeHandles).toHaveCount(0);
    // Expect size to be set.
    await expect.poll(() => dialog.getComputedStyle()).toMatchObject({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
      width: '500px',
      minWidth: '495px',
      maxWidth: '505px',
    } satisfies Partial<CSSStyleDeclaration>);
    // Expect no padding.
    await expect(async () => {
      const dialogBorder = 2 * await dialog.getDialogBorderWidth();
      const pageSize = await dialogPage.getBoundingBox();
      const dialogSize = await dialog.getDialogBoundingBox();
      expect(pageSize.width).toEqual(dialogSize.width - dialogBorder);
    }).toPass();
  });

  test('should focus first focusable element', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host dialog capability.
    await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
      },
    });

    // Register host dialog route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'focus-test-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})],
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const focusTestPage = new FocusTestPagePO(dialog);

    await expect(focusTestPage.firstField).toBeFocused();
  });

  test('should close the dialog with a result', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Close the dialog.
    await dialogPage.close({returnValue: 'SUCCESS'});

    // Expect result to be returned.
    await expect(dialogOpenerPage.returnValue).toHaveText('SUCCESS');
  });

  test('should close the dialog with an error', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
    await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Close the dialog.
    await dialogPage.close({returnValue: 'ERROR', closeWithError: true});

    // Expect error to be returned.
    await expect(dialogOpenerPage.error).toHaveText('ERROR');
  });

  test.describe('View Context', () => {

    test('should open host dialog from host view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.view.getBoundingBox()]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host dialog from non-host view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'dialog', app: 'host'}});

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.view.getBoundingBox(), // workbench view
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Part Context', () => {

    test('should open host dialog from host part', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
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

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-dialog-opener-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee'})],
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
              position: 'left-top',
              active: true,
              cssClass: 'testee',
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}), {host: true});
      await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.part.getBoundingBox('slot')]));

      // Detach dialog.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host dialog from non-host part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention to open host dialog.
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'dialog', app: 'host'}});

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
          path: 'test-dialog-opener',
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
              position: 'left-top',
              active: true,
              cssClass: 'testee',
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await dialogOpenerPage.open({component: 'dialog', app: 'host'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.part.getBoundingBox('slot'), // workbench part
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));

      // Detach dialog.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Popup Context', () => {

    test('should open host dialog from host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'host'},
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'dialog-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-dialog-opener-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'dialog-opener', app: 'host'})],
      });

      // Open host popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'dialog-opener', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'dialog-opener',
      });

      const popup = appPO.popup({cssClass: 'dialog-opener'});
      const dialogOpenerPage = new DialogOpenerPagePO(popup, {host: true});

      // Open host dialog from host popup.
      await dialogOpenerPage.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popup.getBoundingBox('slot')]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await popupOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host dialog from non-host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee', app: 'host'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'host'},
        private: false,
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'dialog-opener', app: 'app1'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open non-host popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'dialog-opener', app: 'app1'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'dialog-opener',
      });

      const popup = appPO.popup({cssClass: 'dialog-opener'});
      const dialogOpenerPage = new DialogOpenerPagePO(popup);

      // Open host dialog from non-host popup.
      await dialogOpenerPage.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popup.getBoundingBox('slot')]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await popupOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Dialog Context', () => {

    test('should open host dialog from host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'host'},
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-dialog-opener-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'dialog-opener', app: 'host'})],
      });

      // Open host dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage1.open({component: 'dialog-opener', app: 'host'}, {cssClass: 'dialog-opener'});

      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}), {host: true});

      // Open host dialog from host dialog.
      await dialogOpenerPage2.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialogPage.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage2.dialog.getDialogBoundingBox()]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage1.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host dialog from non-host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'dialog', qualifier: {component: 'testee', app: 'host'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'host'},
        private: false,
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener', app: 'app1'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage1.open({component: 'dialog-opener', app: 'app1'}, {cssClass: 'dialog-opener'});

      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}));

      // Open host dialog from non-host dialog.
      await dialogOpenerPage2.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const dialogPage = new DialogPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialogPage.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage2.dialog.getDialogBoundingBox()]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage1.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });
});
