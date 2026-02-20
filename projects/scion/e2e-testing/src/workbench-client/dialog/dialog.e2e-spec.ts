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
import {DialogPagePO} from '../page-object/dialog-page.po';
import {expectDialog} from '../../matcher/dialog-matcher';
import {ViewPagePO} from '../page-object/view-page.po';
import {SizeTestPagePO} from '../page-object/test-pages/size-test-page.po';
import {MAIN_AREA} from '../../workbench.model';
import {RouterPagePO} from '../page-object/router-page.po';
import {PartPagePO} from '../page-object/part-page.po';
import {InputFieldTestPagePO} from '../page-object/test-pages/input-field-test-page.po';
import {FocusTestPagePO} from '../page-object/test-pages/focus-test-page.po';
import {PopupOpenerPagePO} from '../page-object/popup-opener-page.po';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability} from '../../workbench/page-object/layout-page/register-route-page.po';
import {NotificationOpenerPagePO} from '../page-object/notification-opener-page.po';

test.describe('Workbench Dialog', () => {

  test.describe('Part Context', () => {

    test('should open a part-modal dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener'},
              position: 'left-top',
              active: true,
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.part.getBoundingBox('slot'), // workbench part
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should open a part-modal dialog from host part', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'dialog', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'dialog-opener', app: 'host'},
        properties: {
          path: '',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
          },
        },
      });

      // Register host part route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-dialog-opener-page', canMatch: [canMatchWorkbenchPartCapability({part: 'dialog-opener', app: 'host'})],
      });

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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener', app: 'host'},
              position: 'left-top',
              active: true,
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}), {host: true});
      await dialogOpenerPage.open({component: 'testee', app: 'app1'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.part.getBoundingBox('slot')]));
    });

    test('should detach dialog if contextual part is not active', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.dialog-opener',
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.dialog-opener'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.dialog-opener'}).click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if contextual part is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          title: 'Dialog Size',
          size: {
            width: '500px',
            height: '300px',
          },
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.dialog-opener',
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialogPage = new SizeTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.dialog-opener'}).click();
      await expectDialog(dialogPage).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Open activity.
      await appPO.activityItem({activityId: 'activity.dialog-opener'}).click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be resized.
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should open dialog in any part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
          },
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'other'},
        properties: {
          path: 'test-part',
          extras: {
            icon: 'folder',
            label: 'Other Part',
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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener'},
              position: 'left-top',
              active: true,
            },
            {
              id: 'part.other',
              qualifier: {part: 'other'},
              position: 'left-top',
              ɵactivityId: 'activity.other',
            },
          ],
        },
      });

      // Open the dialog in other part.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', context: 'part.other'});

      const otherPartPage = new PartPagePO(appPO.part({partId: 'part.other'}));

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Open other part.
      await appPO.activityItem({activityId: 'activity.other'}).click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await otherPartPage.part.getBoundingBox('slot'), // workbench part
        await otherPartPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should open application-modal dialog if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.dialog-opener',
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await dialogOpenerPage.part.getBoundingBox('slot'), // workbench part
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should block interaction with contextual part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'focus-test-page'},
        properties: {
          path: 'test-pages/focus-test-page',
          size: {height: '500px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'input-field-test-page'},
        properties: {
          path: 'test-pages/input-field-test-page',
          extras: {
            icon: 'folder',
            label: 'Input Field Test Page',
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
              id: 'part.input-field-test-page',
              qualifier: {part: 'input-field-test-page'},
              position: 'left-top',
              active: true,
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'focus-test-page'}, {cssClass: 'testee', context: 'part.input-field-test-page'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Focus input field.
      const dialogPage = new FocusTestPagePO(appPO.dialog({dialogId: await dialog.getDialogId()}));
      await dialogPage.firstField.focus();

      const inputFieldTestPage = new InputFieldTestPagePO(appPO.part({partId: 'part.input-field-test-page'}));

      // Expect interaction with contextual part to be blocked.
      await expect(inputFieldTestPage.clickInputField({timeout: 1000})).rejects.toThrowError();
      await expect(dialogPage.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog.getDialogId());

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await inputFieldTestPage.part.getBoundingBox('slot'), // workbench part
        await inputFieldTestPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });
  });

  test.describe('View Context', () => {

    test('should open a view-modal dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.view.getBoundingBox(), // workbench view
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should open a view-modal dialog from host view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'dialog', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage.open({component: 'testee', app: 'app1'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await dialogOpenerPage.view.getBoundingBox()]));
    });

    test('should detach dialog if contextual view is not active', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Open and activate another view.
      await appPO.openNewViewTab();

      // Expect outlet and iframe of the microfrontend dialog to be hidden but attached to the DOM.
      await expectDialog(dialogPage).toBeHidden();

      // Activate view of the dialog.
      await dialogOpenerPage.view.tab.click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if contextual view is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialogPage = new SizeTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to be visible.
      await expectDialog(dialogPage).toBeVisible();
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Detach contextual dialog.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Attach contextual dialog.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be resized.
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should open dialog in any view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', context: await viewPage.view.getViewId()});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog not to be displayed yet.
      await expectDialog(dialogPage).toBeHidden();

      // Activate view.
      await viewPage.view.tab.click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await viewPage.view.getBoundingBox(), // workbench view
        await viewPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should open application-modal dialog if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await dialogOpenerPage.view.getBoundingBox(), // workbench view
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should block interaction with contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'input-field'},
        properties: {
          path: 'test-pages/input-field-test-page',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'focus-test-page'},
        properties: {
          path: 'test-pages/focus-test-page',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'input-field'}, {cssClass: 'input-field'});
      const inputFieldTestPage = new InputFieldTestPagePO(appPO.view({cssClass: 'input-field'}));

      // Open dialog from view.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'focus-test-page'}, {cssClass: 'testee', context: await inputFieldTestPage.view.getViewId()});
      await dialogOpenerPage.view.tab.close();

      const dialog = appPO.dialog({cssClass: 'testee'});
      await dialog.moveDialog('bottom-right-corner');

      // Focus input field.
      const dialogPage = new FocusTestPagePO(appPO.dialog({dialogId: await dialog.getDialogId()}));
      await dialogPage.firstField.focus();

      // Expect interaction with contextual view to be blocked.
      await expect(inputFieldTestPage.clickInputField({timeout: 1000})).rejects.toThrowError();
      await expect(dialogPage.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog.getDialogId());

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await inputFieldTestPage.view.getBoundingBox(), // workbench view
        await inputFieldTestPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });
  });

  test.describe('Popup Context', () => {

    test('should open a popup-modal dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'dialog-opener'}, {
        anchor: 'element',
        cssClass: 'dialog-opener',
      });

      // Open dialog from popup.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.popup.getBoundingBox('slot'), // workbench popup
      ]));
    });

    test('should open a popup-modal dialog from host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'dialog', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'dialog-opener', app: 'host'},
        properties: {
          path: '',
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-dialog-opener-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'dialog-opener', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'dialog-opener', app: 'host'}, {
        anchor: 'element',
        cssClass: 'dialog-opener',
      });

      // Open dialog from popup.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'dialog-opener'}), {host: true});
      await dialogOpenerPage.open({component: 'testee', app: 'app1'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.popup.getBoundingBox('slot'), // workbench popup
      ]));
    });

    test('should detach dialog if contextual popup is not active', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'dialog-opener'}, {
        anchor: 'element',
        cssClass: 'dialog-opener',
      });

      // Open dialog from popup.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Detach dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await popupOpenerPage.view.tab.click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if contextual popup is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'dialog-opener'}, {
        anchor: 'element',
        cssClass: 'dialog-opener',
      });

      // Open dialog from popup.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});
      const dialogPage = new SizeTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Detach dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Attach dialog.
      await popupOpenerPage.view.tab.click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be resized.
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should open dialog in any popup', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          extras: {
            icon: 'folder',
            label: 'Popup Opener',
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
              id: 'part.popup-opener',
              qualifier: {part: 'popup-opener'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'popup'}, {
        anchor: 'element',
        align: 'east',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popup = appPO.popup({cssClass: 'popup'});

      // Open dialog from popup.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'testee'}, {cssClass: 'testee', context: await popup.getPopupId()});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await popup.getBoundingBox('slot'), // workbench popup
      ]));
    });

    test('should open application-modal dialog if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'dialog-opener'}, {
        anchor: 'element',
        cssClass: 'dialog-opener',
      });

      // Open dialog from popup.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.popup({cssClass: 'dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'application'});
      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await dialogOpenerPage.popup.getBoundingBox('slot'), // workbench popup
        await popupOpenerPage.outlet.getBoundingBox(), // microfrontend view
        await popupOpenerPage.view.getBoundingBox(), // workbench view
      ]));
    });

    test('should block interaction with contextual popup', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/focus-test-page',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup'},
        properties: {
          path: 'test-pages/input-field-test-page',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          extras: {
            icon: 'folder',
            label: 'Popup Opener',
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
              id: 'part.popup-opener',
              qualifier: {part: 'popup-opener'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'popup'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup',
      });
      const popup = appPO.popup({cssClass: 'popup'});
      const inputFieldTestPage = new InputFieldTestPagePO(appPO.popup({cssClass: 'popup'}));

      // Open dialog from popup.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'testee'}, {cssClass: 'testee', context: await popup.getPopupId()});

      const dialog = appPO.dialog({cssClass: 'testee'});
      await dialog.moveDialog('bottom-right-corner');

      // Focus input field.
      const dialogPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
      await dialogPage.firstField.focus();

      // Expect interaction with contextual popup to be blocked.
      await expect(inputFieldTestPage.clickInputField({timeout: 1000})).rejects.toThrowError();
      await expect(dialogPage.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog.getDialogId());

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await inputFieldTestPage.popup.getBoundingBox('slot'), // workbench popup
      ]));
    });
  });

  test.describe('Dialog Context', () => {

    test('should open a dialog-modal dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '100px', width: '100px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage1.open({component: 'dialog-opener'}, {cssClass: 'dialog-opener'});

      // Open dialog from dialog.
      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}));
      await dialogOpenerPage2.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage2.dialog.getDialogBoundingBox(), // workbench dialog
      ]));
    });

    test('should open a dialog-modal dialog from host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'dialog', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '475px', width: '300px'},
        },
      });

      // Register host dialog route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-dialog-opener-page', canMatch: [canMatchWorkbenchDialogCapability({component: 'dialog-opener', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-dialog',
          size: {height: '100px', width: '100px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'host');
      await dialogOpenerPage1.open({component: 'dialog-opener', app: 'host'}, {cssClass: 'dialog-opener'});

      // Open dialog from dialog.
      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}), {host: true});
      await dialogOpenerPage2.open({component: 'testee', app: 'app1'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage2.dialog.getDialogBoundingBox(), // workbench dialog
      ]));
    });

    test('should detach dialog if contextual dialog is not active', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '100px', width: '100px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage1.open({component: 'dialog-opener'}, {cssClass: 'dialog-opener'});

      // Open dialog from dialog.
      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}));
      await dialogOpenerPage2.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Detach dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Attach dialog.
      await dialogOpenerPage1.view.tab.click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if contextual dialog is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage1.open({component: 'dialog-opener'}, {cssClass: 'dialog-opener'});

      // Open dialog from dialog.
      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}));
      await dialogOpenerPage2.open({component: 'testee'}, {cssClass: 'testee'});
      const dialogPage = new SizeTestPagePO(appPO.dialog({cssClass: 'testee'}));

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Detach dialog.
      await appPO.openNewViewTab();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage).toBeHidden();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Attach dialog.
      await dialogOpenerPage1.view.tab.click();

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect dialog not to be resized.
      await expect.poll(() => dialogPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should open dialog in any dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          extras: {
            icon: 'folder',
            label: 'Dialog Opener',
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
              id: 'part.dialog-opener',
              qualifier: {part: 'dialog-opener'},
              position: 'left-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage1.open({component: 'dialog'}, {cssClass: 'dialog'});
      const dialog1 = appPO.dialog({cssClass: 'dialog'});

      // Open dialog from dialog.
      const dialogOpener2 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener2.open({component: 'testee'}, {cssClass: 'testee', context: await dialog1.getDialogId()});

      const dialog2 = appPO.dialog({cssClass: 'testee'});
      const dialogPage2 = new DialogPagePO(dialog2);

      // Expect dialog to display.
      await expectDialog(dialogPage2).toBeVisible();

      // Close activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Expect dialog to be hidden.
      await expectDialog(dialogPage2).toBeHidden();

      // Open activity.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectDialog(dialogPage2).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog2.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialog1.getDialogBoundingBox(), // workbench dialog
      ]));
    });

    test('should open application-modal dialog if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '100px', width: '100px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage1 = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage1.open({component: 'dialog-opener'}, {cssClass: 'dialog-opener'});

      // Open dialog from dialog.
      const dialogOpenerPage2 = new DialogOpenerPagePO(appPO.dialog({cssClass: 'dialog-opener'}));
      await dialogOpenerPage2.open({component: 'testee'}, {cssClass: 'testee', modality: 'application'});

      const dialog2 = appPO.dialog({cssClass: 'testee'});
      const dialogPage2 = new DialogPagePO(dialog2);

      // Expect dialog to display.
      await expectDialog(dialogPage2).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog2.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await dialogOpenerPage2.dialog.getDialogBoundingBox(), // workbench dialog
        await dialogOpenerPage1.outlet.getBoundingBox(), // microfrontend view
        await dialogOpenerPage1.view.getBoundingBox(), // workbench view
      ]));
    });
  });

  test.describe('Notification Context', () => {

    test('should open a notification-modal dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {component: 'dialog-opener'},
        properties: {
          path: 'test-dialog-opener',
          size: {height: '500px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'dialog-opener'}, {
        cssClass: 'dialog-opener',
      });

      // Open dialog from notification.
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.notification({cssClass: 'dialog-opener'}));
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog to display.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane of the dialog.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.notification.getBoundingBox('notification-inset'), // workbench notification
      ]));
    });

    test('should block interaction with contextual notification', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/focus-test-page',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {component: 'notification'},
        properties: {
          path: 'test-pages/input-field-test-page',
          size: {height: '100px', width: '100px'},
        },
      });

      // Add part to the right for notifications to not cover the dialog opener page.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {align: 'right'})
        .navigatePart('part.right', ['path/to/part']),
      );

      // Open notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'notification'}, {
        cssClass: 'notification',
      });
      const notification = appPO.notification({cssClass: 'notification'});
      const inputFieldTestPage = new InputFieldTestPagePO(appPO.notification({cssClass: 'notification'}));

      // Open dialog from notification.
      const dialogOpener = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpener.open({component: 'testee'}, {cssClass: 'testee', context: await notification.getNotificationId()});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Focus input field.
      const dialogPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
      await dialogPage.firstField.focus();

      // Expect interaction with contextual notification to be blocked.
      await expect(inputFieldTestPage.clickInputField({timeout: 1000})).rejects.toThrowError();
      await expect(dialogPage.firstField).toBeFocused();
      await expect.poll(() => appPO.focusOwner()).toEqual(await dialog.getDialogId());
    });
  });

  test.describe('Non-Blocking Dialog', () => {

    test('should not block contextual element', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'none'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());
    });

    test('should not block workbench', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'none', context: null});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());
    });

    test('should bind non-blocking dialog to context', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'none'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());

      // Activate another view.
      await appPO.openNewViewTab();
      await expectDialog(dialogPage).toBeHidden();

      // Re-activate the view.
      await dialogOpenerPage.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();
      await expect.poll(() => appPO.isViewBlocked(dialogOpenerPage.view.getViewId())).toBe(false);
      await expect.poll(() => appPO.isWorkbenchBlocked()).toBe(false);
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set());
    });
  });

  test.describe('Title', () => {

    test('should set title from capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          title: 'TITLE',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect title to be set.
      await expect(dialog.title).toHaveText('TITLE');
    });

    test('should update title', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          title: 'TITLE',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect title to be set.
      await expect(dialog.title).toHaveText('TITLE');

      // Update title from handle.
      await dialogPage.enterTitle('TITLE 2');

      // Expect title to be updated.
      await expect(dialog.title).toHaveText('TITLE 2');
    });
  });

  test.describe('Params', () => {

    test('should pass params to the dialog component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        params: [
          {name: 'id', required: true},
        ],
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect.poll(() => dialogPage.getDialogParams()).toEqual({id: '123'});
    });

    test('should substitute named URL params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        params: [
          {name: 'segmentParam', required: true},
          {name: 'matrixParam', required: true},
          {name: 'queryParam', required: true},
          {name: 'fragment', required: true},
        ],
        properties: {
          path: 'test-pages/dialog-test-page/:segmentParam;matrixParam=:matrixParam?queryParam=:queryParam#:fragment',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {
        params: {segmentParam: 'SEGMENT', matrixParam: 'MATRIX_PARAM', queryParam: 'QUERY_PARAM', fragment: 'FRAGMENT'},
        cssClass: 'testee',
      });

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect named params to be substituted.
      await expect.poll(() => dialogPage.getDialogParams()).toEqual({segmentParam: 'SEGMENT', matrixParam: 'MATRIX_PARAM', queryParam: 'QUERY_PARAM', fragment: 'FRAGMENT'});
      await expect.poll(() => dialogPage.getRouteParams()).toEqual({segment: 'SEGMENT', matrixParam: 'MATRIX_PARAM'});
      await expect.poll(() => dialogPage.getRouteQueryParams()).toEqual({queryParam: 'QUERY_PARAM'});
      await expect.poll(() => dialogPage.getRouteFragment()).toEqual('FRAGMENT');
    });
  });

  test.describe('Closing', () => {

    test('should by default open closable dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect the close button to be visible.
      await expect(dialog.closeButton).toBeVisible();
    });

    test('should not display close button if `closable` is `false`', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
          closable: false,
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect the close button not to be visible.
      await expect(dialog.closeButton).not.toBeVisible();
    });

    test('should close the dialog on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await dialogPage.waitForFocusIn();

      // Retry pressing Escape keystroke since the installation of the escape keystroke may take some time.
      await expect(async () => {
        await page.keyboard.press('Escape');
        await expectDialog(dialogPage).not.toBeAttached();
      }).toPass();
    });

    test('should close the dialog with a result', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Close the dialog.
      await dialogPage.close({returnValue: 'SUCCESS'});

      // Expect result to be returned.
      await expect(dialogOpenerPage.returnValue).toHaveText('SUCCESS');
    });

    test('should close the dialog with an error', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Close the dialog.
      await dialogPage.close({returnValue: 'ERROR', closeWithError: true});

      // Expect error to be returned.
      await expect(dialogOpenerPage.error).toHaveText('ERROR');
    });
  });

  test.describe('Size', () => {

    test('should size the dialog as configured in the dialog capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
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

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      await expect.poll(() => dialog.getComputedStyle()).toMatchObject({
        height: '500px',
        minHeight: '495px',
        maxHeight: '505px',
        width: '500px',
        minWidth: '495px',
        maxWidth: '505px',
      } satisfies Partial<CSSStyleDeclaration>);

      // Expect the dialog to display in the defined size.
      await expect.poll(() => dialog.getDialogBoundingBox()).toMatchObject({
        height: 500,
        width: 500,
      });
    });

    test('should not change dialog size when embedded content overflows', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      const dialogBoundingBox = await dialog.getDialogBoundingBox();

      // Expect dialog size not to change.
      await dialogPage.enterComponentSize({height: '800px', width: '600px'});
      await expect.poll(() => dialog.getDialogBoundingBox()).toEqual(dialogBoundingBox);
    });

    test('should be resizable by default', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect the dialog to be resizable.
      await expect(dialog.resizeHandles).toHaveCount(8);
    });

    test('should be non-resizable if configured in the capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          resizable: false,
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect the dialog not to be resizable.
      await expect(dialog.resizeHandles).toHaveCount(0);
    });
  });

  test.describe('Padding', () => {

    test('should not have padding by default', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect(async () => {
        const dialogBorder = 2 * await dialog.getDialogBorderWidth();
        const pageSize = await dialogPage.getBoundingBox();
        const dialogSize = await dialog.getDialogBoundingBox();
        expect(pageSize.width).toEqual(dialogSize.width - dialogBorder);
      }).toPass();
    });

    test('should have padding if set', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
          padding: true,
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect(async () => {
        const dialogBorder = 2 * await dialog.getDialogBorderWidth();
        const pageSize = await dialogPage.getBoundingBox();
        const dialogSize = await dialog.getDialogBoundingBox();
        expect(pageSize.width).toBeLessThan(dialogSize.width - dialogBorder);
      }).toPass();
    });
  });
});
