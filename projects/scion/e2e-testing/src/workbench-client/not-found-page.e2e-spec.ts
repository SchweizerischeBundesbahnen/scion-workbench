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
import {PageNotFoundPagePO} from '../workbench/page-object/page-not-found-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {expectDialog} from '../matcher/dialog-matcher';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';
import {WorkbenchDialogCapability, WorkbenchPartCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {expectView} from '../matcher/view-matcher';
import {expectPart} from '../matcher/part-matcher';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchMessageBoxCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability, canMatchWorkbenchViewCapability} from '../workbench/page-object/layout-page/register-route-page.po';
import {ViewPagePO} from '../workbench/page-object/view-page.po';
import {PartPagePO} from '../workbench/page-object/part-page.po';
import {DialogPagePO} from '../workbench/page-object/dialog-page.po';
import {MessageBoxPagePO} from '../workbench/page-object/message-box-page.po';
import {PopupPagePO} from '../workbench/page-object/popup-page.po';

test.describe('Workbench Page Not Found', () => {

  test.describe('Host View', () => {

    test('should display "Not Found" page in host view (no route registered)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host view capability.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

      // Navigate to host view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(notFoundPage).toBeActive();
    });

    test('should display "Not Found" page in host view (wrong canMatch guard)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host view capability.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register routes matching all capabilities except view.
      await workbenchNavigator.registerRoute({path: '', component: 'view-page', canMatch: [canMatchWorkbenchPartCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'view-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'view-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'view-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee'})]});

      // Open host view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.1'}));
      await expectView(notFoundPage).toBeActive();

      // Register route for host view capability.
      await workbenchNavigator.registerRoute({path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})]});

      // Open host view.
      await routerPage.view.tab.click();
      await routerPage.navigate({component: 'testee'}, {target: 'view.2'});

      // Expect host view to display.
      await expectView(new ViewPagePO(appPO.view({viewId: 'view.2'}))).toBeActive();
    });

    test('should display "Not Found" page in host view when unregistering capability', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host view capability.
      const viewCapability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register host view route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'view-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})],
      });

      // Navigate to host view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'host');
      await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});

      const view = appPO.view({cssClass: 'testee'});

      // Expect view to display.
      await expectView(new ViewPagePO(view)).toBeActive();

      // Unregister view capability.
      await microfrontendNavigator.unregisterCapability('host', viewCapability.metadata!.id);

      // Expect "Not Found" page to display.
      await expectView(new PageNotFoundPagePO(view)).toBeActive();
    });
  });

  test.describe('Host Part', () => {

    test('should display "Not Found" page in host part (no route registered)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

      // Create perspective with host part.
      await microfrontendNavigator.createPerspective('host', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.testee',
              qualifier: {component: 'testee'},
            },
          ],
        },
      });

      // Expect "Not Found" page to display.
      await expectPart(appPO.part({partId: 'part.testee'})).toDisplayComponent(PageNotFoundPagePO.selector);
    });

    test('should display "Not Found" page in host part (wrong canMatch guard)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host part capability.
      await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {part: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register routes matching all capabilities except part.
      await workbenchNavigator.registerRoute({path: '', component: 'part-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'part-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'part-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'part-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee'})]});

      // Create perspective.
      await microfrontendNavigator.createPerspective('host', {
        type: 'perspective',
        qualifier: {perspective: 'testee-1'},
        properties: {
          parts: [
            {
              id: 'part.testee-1',
              qualifier: {part: 'testee'},
            },
          ],
        },
      });

      // Expect "Not Found" page to display.
      await expectPart(appPO.part({partId: 'part.testee-1'})).toDisplayComponent(PageNotFoundPagePO.selector);

      // Register route for host part capability.
      await workbenchNavigator.registerRoute({path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({part: 'testee'})]});

      // Create another perspective.
      await microfrontendNavigator.createPerspective('host', {
        type: 'perspective',
        qualifier: {perspective: 'testee-2'},
        properties: {
          parts: [
            {
              id: 'part.testee-2',
              qualifier: {part: 'testee'},
            },
          ],
        },
      });

      // Expect host part to display.
      await expectPart(appPO.part({partId: 'part.testee-2'})).toDisplayComponent(PartPagePO.selector);
    });

    test('should display "Not Found" page in host part when unregistering capability', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host part capability.
      const partCapability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('host', {
        type: 'part',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register host part route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'part-page', canMatch: [canMatchWorkbenchPartCapability({component: 'testee'})],
      });

      // Create perspective with host part.
      await microfrontendNavigator.createPerspective('host', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.testee',
              qualifier: {component: 'testee'},
            },
          ],
        },
      });

      const part = appPO.part({partId: 'part.testee'});

      // Expect part to display.
      await expectPart(part).toDisplayComponent(PartPagePO.selector);

      // Unregister part capability.
      await microfrontendNavigator.unregisterCapability('host', partCapability.metadata!.id);

      // Expect "Not Found" page to display.
      await expectPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
    });
  });

  test.describe('Host Popup', () => {

    test('should display "Not Found" page in host popup (no route registered)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host popup capability.
      await microfrontendNavigator.registerCapability<WorkbenchPopupCapability>('host', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(notFoundPage).toBeVisible();
    });

    test('should display "Not Found" page in host popup (wrong canMatch guard)', async ({appPO, microfrontendNavigator, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host popup capability.
      await microfrontendNavigator.registerCapability<WorkbenchPopupCapability>('host', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register routes matching all capabilities except popup.
      await workbenchNavigator.registerRoute({path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPartCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'popup-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'popup-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'popup-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})]});

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(popup);
      await expectPopup(notFoundPage).toBeVisible();

      //  Close the popup.
      await page.keyboard.press('Escape');

      // Register route for host dialog capability.
      await workbenchNavigator.registerRoute({path: '', component: 'popup-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee'})]});

      // Open the popup.
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        cssClass: 'testee',
      });

      // Expect the popup to display.
      await expectPopup(new PopupPagePO(popup)).toBeVisible();
    });
  });

  test.describe('Host Dialog', () => {

    test('should display "Not Found" page in host dialog (no route registered)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host dialog capability.
      await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpener.open({component: 'testee'}, {cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.dialog({cssClass: 'testee'}));
      await expectDialog(notFoundPage).toBeVisible();
    });

    test('should display "Not Found" page in host dialog (wrong canMatch guard)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host dialog capability.
      await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register routes matching all capabilities except dialog.
      await workbenchNavigator.registerRoute({path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchPartCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee'})]});

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(dialog);
      await expectDialog(notFoundPage).toBeVisible();
      await dialog.close();

      // Register route for host dialog capability.
      await workbenchNavigator.registerRoute({path: '', component: 'dialog-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})]});

      // Open the dialog.
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      // Expect host dialog to display.
      await expectDialog(new DialogPagePO(dialog)).toBeVisible();
    });
  });

  test.describe('Host Message Box', () => {

    test('should display "Not Found" page in host messagebox (no route registered)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host messagebox capability.
      await microfrontendNavigator.registerCapability('host', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // DO NOT REGISTER ROUTE TO SIMULATE "NOT FOUND" ROUTE.

      const messageboxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
      await messageboxOpener.open({component: 'testee'}, {cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(appPO.messagebox({cssClass: 'testee'}));
      await expectMessageBox(notFoundPage).toBeVisible();
    });

    test('should display "Not Found" page in host messagebox (wrong canMatch guard)', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register host messagebox capability.
      await microfrontendNavigator.registerCapability('host', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });

      // Register routes matching all capabilities except messagebox.
      await workbenchNavigator.registerRoute({path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchPartCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchViewCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'testee'})]});
      await workbenchNavigator.registerRoute({path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'testee'})]});

      // Open the messagebox.
      const messageboxOpener = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'host');
      await messageboxOpener.open({component: 'testee'}, {cssClass: 'testee', actions: {ok: 'OK'}});

      const messagebox = appPO.messagebox({cssClass: 'testee'});

      // Expect "Not Found" page to display.
      const notFoundPage = new PageNotFoundPagePO(messagebox);
      await expectMessageBox(notFoundPage).toBeVisible();
      await messagebox.clickActionButton('ok');

      // Register route for host messagebox capability.
      await workbenchNavigator.registerRoute({path: '', component: 'messagebox-page', canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'testee'})]});

      // Open the messagebox.
      await messageboxOpener.open({component: 'testee'}, {cssClass: 'testee'});

      // Expect host messagebox to display.
      await expectMessageBox(new MessageBoxPagePO(messagebox)).toBeVisible();
    });
  });
});
