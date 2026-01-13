/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchMessageBoxCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability} from '../../workbench/page-object/layout-page/register-route-page.po';
import {WorkbenchMessageBoxCapability, WorkbenchPartCapability} from '../page-object/register-workbench-capability-page.po';
import {MAIN_AREA} from '../../workbench.model';
import {PopupOpenerPagePO} from '../page-object/popup-opener-page.po';
import {MessageBoxOpenerPagePO} from '../page-object/message-box-opener-page.po';
import {expectMessageBox} from '../../matcher/message-box-matcher';
import {MessageBoxPagePO} from '../../workbench/page-object/message-box-page.po';

test.describe('Workbench Host Message Box', () => {

  test('should pass capability to the messagebox component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the messagebox.
    const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

    const messagebox = appPO.messagebox({cssClass: 'testee'});
    const messageboxPage = new MessageBoxPagePO(messagebox);

    // Expect capability.
    await expect.poll(() => messageboxPage.activatedMicrofrontend.getCapability()).toMatchObject({
      qualifier: {component: 'messagebox', app: 'host'},
      properties: {
        path: '',
      },
    });
  });

  test('should pass params to the messagebox component', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host messagebox capability.
    await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param', required: true},
      ],
      properties: {
        path: '',
      },
    });

    // Register host messagebox route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})],
    });

    // Open the messagebox.
    const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageboxOpenerPage.open({component: 'testee'}, {params: {param: '123'}, cssClass: 'testee'});

    const messagebox = appPO.messagebox({cssClass: 'testee'});
    const messageboxPage = new MessageBoxPagePO(messagebox);

    // Expect params.
    await expect.poll(() => messageboxPage.activatedMicrofrontend.getParams()).toEqual({param: '123'});
  });

  test('should pass referrer to the messagebox component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register intention.
    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

    // Open the messagebox.
    const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
    await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

    const messagebox = appPO.messagebox({cssClass: 'testee'});
    const messageboxPage = new MessageBoxPagePO(messagebox);

    // Expect referrer.
    await expect.poll(() => messageboxPage.activatedMicrofrontend.getReferrer()).toEqual('workbench-client-testing-app1');
  });

  test('should apply capability properties', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register host messagebox capability.
    await microfrontendNavigator.registerCapability<WorkbenchMessageBoxCapability>('host', {
      type: 'messagebox',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
          width: '350px',
          minWidth: '345px',
          maxWidth: '355px',
        },
      },
    });

    // Register host messagebox route.
    await workbenchNavigator.registerRoute({
      path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})],
    });

    // Open the messagebox.
    const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageboxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const messagebox = appPO.messagebox({cssClass: 'testee'});

    // Expect size to be set.
    await expect.poll(() => messagebox.dialog.getComputedStyle()).toMatchObject({
      height: '500px',
      minHeight: '495px',
      maxHeight: '505px',
      width: '350px',
      minWidth: expect.anything() as unknown as string, // overwritten with minimal buttons witdth (footer)
      maxWidth: '355px',
    } satisfies Partial<CSSStyleDeclaration>);
  });

  test('should close the messagebox with an action', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open the messagebox.
    const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
    await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {
      actions: {'action': 'Action'}, cssClass: 'testee',
    });

    const messagebox = appPO.messagebox({cssClass: 'testee'});

    // Close the messagebox.
    await messagebox.clickActionButton('action');

    // Expect action to be returned.
    await expect(messageboxOpenerPage.closeAction).toHaveText('action');
  });

  test.describe('View Context', () => {

    test('should open host messagebox from host view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open messagebox.
      const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
      await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

      const messagebox = appPO.messagebox({cssClass: 'testee'});
      const messageboxPage = new MessageBoxPagePO(messagebox);

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messagebox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await messageboxOpenerPage.view.getBoundingBox()]));

      // Detach messagebox.
      await appPO.openNewViewTab();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach messagebox.
      await messageboxOpenerPage.view.tab.click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host messagebox from non-host view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

      // Open messagebox.
      const messageboxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

      const messagebox = appPO.messagebox({cssClass: 'testee'});
      const messageboxPage = new MessageBoxPagePO(messagebox);

      // Expect dialog to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the dialog.
      await expect.poll(() => messagebox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await messageboxOpenerPage.view.getBoundingBox(), // workbench view
        await messageboxOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));

      // Detach messagebox.
      await appPO.openNewViewTab();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach messagebox.
      await messageboxOpenerPage.view.tab.click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Part Context', () => {

    test('should open host messagebox from host part', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
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
        path: '', component: 'microfrontend-messagebox-opener-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee'})],
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

      // Open messagebox.
      const messageboxOpenerPage = new MessageBoxOpenerPagePO(appPO.part({partId: 'part.testee'}), {host: true});
      await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

      const messagebox = appPO.messagebox({cssClass: 'testee'});
      const messageboxPage = new MessageBoxPagePO(messagebox);

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messagebox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await messageboxOpenerPage.part.getBoundingBox('content')]));

      // Detach messagebox.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach messagebox.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host messagebox from non-host part', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention to open host messagebox.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'messagebox', app: 'host'}});

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
          path: 'test-message-box-opener',
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

      // Open messagebox.
      const messageboxOpenerPage = new MessageBoxOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await messageboxOpenerPage.open({component: 'messagebox', app: 'host'}, {cssClass: 'testee'});

      const messagebox = appPO.messagebox({cssClass: 'testee'});
      const messageboxPage = new MessageBoxPagePO(messagebox);

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messagebox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await messageboxOpenerPage.part.getBoundingBox('content'), // workbench part
        await messageboxOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));

      // Detach messagebox.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach messagebox.
      await appPO.activityItem({cssClass: 'testee'}).click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Popup Context', () => {

    test('should open host messagebox from host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'messagebox',
        qualifier: {component: 'testee', app: 'host'},
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host messagebox route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'messagebox-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-messagebox-opener-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'messagebox-opener', app: 'host'})],
      });

      // Open host popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'messagebox-opener', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'messagebox-opener',
      });

      const popup = appPO.popup({cssClass: 'messagebox-opener'});
      const messageboxOpenerPage = new MessageBoxOpenerPagePO(popup, {host: true});

      // Open host messagebox from host popup.
      await messageboxOpenerPage.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const messagebox = appPO.messagebox({cssClass: 'testee'});
      const messageboxPage = new MessageBoxPagePO(messagebox);

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messagebox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popup.getBoundingBox({box: 'content-box'})]));

      // Detach messagebox.
      await appPO.openNewViewTab();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach messagebox.
      await popupOpenerPage.view.tab.click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect messagebox not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host messagebox from non-host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'testee', app: 'host'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'messagebox',
        qualifier: {component: 'testee', app: 'host'},
        private: false,
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host messagebox route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'messagebox-opener', app: 'app1'},
        properties: {
          path: 'test-message-box-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open non-host popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'messagebox-opener', app: 'app1'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'messagebox-opener',
      });

      const popup = appPO.popup({cssClass: 'messagebox-opener'});
      const messageboxOpenerPage = new MessageBoxOpenerPagePO(popup);

      // Open host messagebox from non-host popup.
      await messageboxOpenerPage.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const messagebox = appPO.messagebox({cssClass: 'testee'});
      const messageboxPage = new MessageBoxPagePO(messagebox);

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messagebox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await popup.getBoundingBox({box: 'content-box'})]));

      // Detach messagebox.
      await appPO.openNewViewTab();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach messagebox.
      await popupOpenerPage.view.tab.click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect messagebox not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Dialog Context', () => {

    test('should open host messagebox from host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('host', {
        type: 'messagebox',
        qualifier: {component: 'testee', app: 'host'},
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'messagebox-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-messagebox-opener-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'messagebox-opener', app: 'host'})],
      });

      // Open host dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage.open({component: 'messagebox-opener', app: 'host'}, {cssClass: 'messagebox-opener'});

      const messageboxOpenerPage = new MessageBoxOpenerPagePO(appPO.dialog({cssClass: 'messagebox-opener'}), {host: true});

      // Open host messagebox from host dialog.
      await messageboxOpenerPage.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const messageboxPage = new MessageBoxPagePO(appPO.messagebox({cssClass: 'testee'}));

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messageboxPage.messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await messageboxOpenerPage.dialog.getDialogBoundingBox()]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect dialog not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should open host messagebox from non-host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('app1', {type: 'messagebox', qualifier: {component: 'testee', app: 'host'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'messagebox',
        qualifier: {component: 'testee', app: 'host'},
        private: false,
        properties: {
          path: '',
          size: {height: '100px', width: '100px'},
        },
      });

      // Register host messagebox route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'messagebox-opener', app: 'app1'},
        properties: {
          path: 'test-message-box-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open non-host dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'messagebox-opener', app: 'app1'}, {cssClass: 'messagebox-opener'});

      const messageboxOpenerPage = new MessageBoxOpenerPagePO(appPO.dialog({cssClass: 'messagebox-opener'}));

      // Open host messagebox from non-host dialog.
      await messageboxOpenerPage.open({component: 'testee', app: 'host'}, {cssClass: 'testee'});

      const messageboxPage = new MessageBoxPagePO(appPO.messagebox({cssClass: 'testee'}));

      // Expect messagebox to display.
      await expectMessageBox(messageboxPage).toBeVisible();
      const componentInstanceId = await messageboxPage.getComponentInstanceId();

      // Expect glass pane of the messagebox.
      await expect.poll(() => messageboxPage.messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await messageboxOpenerPage.dialog.getDialogBoundingBox()]));

      // Detach dialog.
      await appPO.openNewViewTab();
      await expectMessageBox(messageboxPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage.view.tab.click();
      await expectMessageBox(messageboxPage).toBeVisible();

      // Expect dialog not to be constructed anew.
      await expect.poll(() => messageboxPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });
});
