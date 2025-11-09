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
import {MessageBoxOpenerPagePO} from '../page-object/message-box-opener-page.po';
import {expectMessageBox} from '../../matcher/message-box-matcher';
import {MessageBoxPagePO} from '../page-object/message-box-page.po';
import {expect} from '@playwright/test';
import {MAIN_AREA} from '../../workbench.model';
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {PopupOpenerPagePO} from '../page-object/popup-opener-page.po';

test.describe('Workbench Message Box Microfrontend', () => {

  test.describe('Part Context', () => {

    test('should open a part-modal message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'message-box-opener'},
        properties: {
          path: 'test-message-box-opener',
          extras: {
            icon: 'folder',
            label: 'Message Box Opener',
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
              id: 'part.message-box-opener',
              qualifier: {part: 'message-box-opener'},
              position: 'left-top',
              active: true,
            },
          ],
        },
      });

      // Open message box.
      const messageBoxOpenerPage = new MessageBoxOpenerPagePO(appPO, {id: 'part.message-box-opener'});
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await messageBoxOpenerPage.part.getBoundingBox('content'), // workbench part
        await messageBoxOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should open application-modal message box if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'message-box-opener'},
        properties: {
          path: 'test-message-box-opener',
          extras: {
            icon: 'folder',
            label: 'Message Box Opener',
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
              id: 'part.message-box-opener',
              qualifier: {part: 'message-box-opener'},
              position: 'left-top',
              active: true,
            },
          ],
        },
      });

      // Open message box.
      const messageBoxOpenerPage = new MessageBoxOpenerPagePO(appPO, {id: 'part.message-box-opener'});
      await messageBoxOpenerPage.open({component: 'testee'}, {modality: 'application', cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await messageBoxOpenerPage.part.getBoundingBox('content'), // workbench part
        await messageBoxOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });
  });

  test.describe('View Context', () => {

    test('should open a view-modal message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await messageBoxOpenerPage.view.getBoundingBox(), // workbench view
        await messageBoxOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should open application-modal message box if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open({component: 'testee'}, {modality: 'application', cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await messageBoxOpenerPage.view.getBoundingBox(), // workbench view
        await messageBoxOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });
  });

  test.describe('Popup Context', () => {

    test('should open a popup-modal message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'message-box-opener'},
        properties: {
          path: 'test-message-box-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'message-box-opener'});
      await popupOpenerPage.enterCssClass('message-box-opener');
      await popupOpenerPage.open();

      // Open message box from popup.
      const messageBoxOpenerPage = new MessageBoxOpenerPagePO(appPO, {cssClass: 'message-box-opener'});
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await messageBoxOpenerPage.popup.getBoundingBox({box: 'content-box'}), // workbench popup
      ]));
    });

    test('should open application-modal message box if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'message-box-opener'},
        properties: {
          path: 'test-message-box-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'message-box-opener'});
      await popupOpenerPage.enterCssClass('message-box-opener');
      await popupOpenerPage.open();

      // Open message box from popup.
      const messageBoxOpenerPage = new MessageBoxOpenerPagePO(appPO, {cssClass: 'message-box-opener'});
      await messageBoxOpenerPage.open({component: 'testee'}, {modality: 'application', cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await messageBoxOpenerPage.popup.getBoundingBox({box: 'content-box'}), // workbench popup
        await popupOpenerPage.outlet.getBoundingBox(), // microfrontend view
        await popupOpenerPage.view.getBoundingBox(), // workbench view
      ]));
    });
  });

  test.describe('Dialog Context', () => {

    test('should open a dialog-modal message box', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'message-box-opener'},
        properties: {
          path: 'test-message-box-opener',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'message-box-opener'}, {cssClass: 'message-box-opener'});

      // Open message box from dialog.
      const messageBoxOpenerPage = new MessageBoxOpenerPagePO(appPO, {cssClass: 'message-box-opener'});
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await messageBoxOpenerPage.dialog.getDialogBoundingBox(), // workbench dialog
      ]));
    });

    test('should open application-modal message box if application-modality selected', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'message-box-opener'},
        properties: {
          path: 'test-message-box-opener',
          size: {height: '475px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'message-box-opener'}, {cssClass: 'message-box-opener'});

      // Open message box from dialog.
      const messageBoxOpenerPage = new MessageBoxOpenerPagePO(appPO, {cssClass: 'message-box-opener'});
      await messageBoxOpenerPage.open({component: 'testee'}, {modality: 'application', cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect message box to display.
      await expectMessageBox(messageBoxPage).toBeVisible();

      // Expect glass pane of the message box.
      await expect.poll(() => messageBox.dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await messageBoxOpenerPage.dialog.getDialogBoundingBox(), // workbench dialog
        await dialogOpenerPage.outlet.getBoundingBox(), // microfrontend view
        await dialogOpenerPage.view.getBoundingBox(), // workbench view
      ]));
    });
  });

  test.describe('Input', () => {

    test('should provide capability and pass it to the provider', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect capability to resolve to the microfrontend message box and to be set in the handle.
      await expect.poll(() => messageBoxPage.getMessageBoxCapability()).toMatchObject({
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });
    });

    test('should pass params to the message box component', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        params: [
          {name: 'id', required: true},
        ],
        properties: {
          path: 'test-message-box',
        },
      });

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee', params: {id: '123'}});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      await expect.poll(() => messageBoxPage.getMessageBoxParams()).toEqual({id: '123'});
    });

    test('should substitute named URL params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        params: [
          {name: 'seg1', required: true},
          {name: 'mp1', required: true},
          {name: 'qp1', required: true},
          {name: 'fragment', required: true},
        ],
        properties: {
          path: 'test-pages/message-box-test-page/:seg1/segment2;mp1=:mp1?qp1=:qp1#:fragment',
        },
      });

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open(
        {component: 'testee'},
        {
          cssClass: 'testee',
          params: {seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'},
        },
      );

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect named params to be substituted.
      await expect.poll(() => messageBoxPage.getMessageBoxParams()).toEqual({seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'});
      await expect.poll(() => messageBoxPage.getRouteParams()).toEqual({segment1: 'SEG1', mp1: 'MP1'});
      await expect.poll(() => messageBoxPage.getRouteQueryParams()).toEqual({qp1: 'QP1'});
      await expect.poll(() => messageBoxPage.getRouteFragment()).toEqual('FRAGMENT');
    });
  });

  test.describe('Size', () => {

    test('should size the message box as configured in the capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
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

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Expect the message box page to display with the defined size.
      await expect.poll(() => messageBoxPage.getBoundingBox()).toEqual(expect.objectContaining({
        height: 500,
        width: 350,
      }));

      await expect.poll(() => messageBoxPage.getComputedStyle()).toEqual(expect.objectContaining({
        height: '500px',
        minHeight: '495px',
        maxHeight: '505px',
        width: '350px',
        minWidth: '345px',
        maxWidth: '355px',
      } satisfies Partial<CSSStyleDeclaration>));
    });

    test('should adapt message box size if content grows or shrinks', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
          size: {height: '300px', width: '300px'},
        },
      });

      // Open the message box.
      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');
      await messageBoxOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const messageBox = appPO.messagebox({cssClass: 'testee'});
      const messageBoxPage = new MessageBoxPagePO(messageBox);

      // Make component larger.
      await messageBoxPage.enterComponentSize({width: '500px', height: '500px'});

      // Expect the message box page to grow.
      await expect.poll(() => messageBoxPage.getBoundingBox()).toEqual(expect.objectContaining({
        height: 500,
        width: 500,
      }));

      await expect.poll(() => messageBoxPage.getComputedStyle()).toEqual(expect.objectContaining({
        height: '500px',
        minHeight: '500px',
        maxHeight: '500px',
        width: '500px',
        minWidth: '500px',
        maxWidth: '500px',
      } satisfies Partial<CSSStyleDeclaration>));

      // Make component smaller.
      await messageBoxPage.enterComponentSize({width: '250px', height: '250px'});

      // Expect the message box page to shrink.
      await expect.poll(() => messageBoxPage.getBoundingBox()).toEqual(expect.objectContaining({
        height: 250,
        width: 250,
      }));

      await expect.poll(() => messageBoxPage.getComputedStyle()).toEqual(expect.objectContaining({
        height: '250px',
        minHeight: '250px',
        maxHeight: '250px',
        width: '250px',
        minWidth: '250px',
        maxWidth: '250px',
      } satisfies Partial<CSSStyleDeclaration>));
    });
  });

  test.describe('Actions', () => {

    test('should close the message box on escape keystroke if cancel action is present', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'messagebox',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-message-box',
        },
      });

      const messageBoxOpenerPage = await microfrontendNavigator.openInNewTab(MessageBoxOpenerPagePO, 'app1');

      await test.step('pressing ESCAPE on message box that has a cancel action', async () => {
        // Open the message box.
        await messageBoxOpenerPage.open({component: 'testee'}, {
          cssClass: 'testee',
          actions: {
            ok: 'OK',
            cancel: 'cancel',
          },
        });
        const messageBox = appPO.messagebox({cssClass: 'testee'});
        const messageBoxPage = new MessageBoxPagePO(messageBox);

        await expectMessageBox(messageBoxPage).toBeVisible();

        await page.keyboard.press('Escape');
        // Expect message box to be closed
        await expectMessageBox(messageBoxPage).not.toBeAttached();
        await expect(messageBoxOpenerPage.closeAction).toHaveText('cancel');
      });

      await test.step('pressing ESCAPE on message box that has no cancel action', async () => {
        // Open the message box.
        await messageBoxOpenerPage.open({component: 'testee'}, {
          cssClass: 'testee',
          actions: {
            ok: 'OK',
            close: 'close',
          },
        });
        const messageBox = appPO.messagebox({cssClass: 'testee'});
        const messageBoxPage = new MessageBoxPagePO(messageBox);

        await expectMessageBox(messageBoxPage).toBeVisible();

        await page.keyboard.press('Escape');
        // Expect message box not to be closed
        await expectMessageBox(messageBoxPage).toBeVisible();
      });
    });
  });
});
