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
import {DialogPagePO} from '../page-object/dialog-page.po';
import {expectDialog} from '../../matcher/dialog-matcher';
import {ViewPagePO} from '../page-object/view-page.po';
import {DialogPropertiesTestPagePO} from '../page-object/test-pages/dialog-properties-test-page.po';
import {SizeTestPagePO} from '../page-object/test-pages/size-test-page.po';
import {expectView} from '../../matcher/view-matcher';

test.describe('Workbench Dialog', () => {

  test.describe('Contextual View', () => {

    test('should, by default and if in the context of a view, open a view-modal dialog', async ({appPO, microfrontendNavigator}) => {
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
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect microfrontend content to be displayed.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane for the current view.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await dialogOpenerPage.view.getBoundingBox(), // workbench view
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
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

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);
      const componentInstanceId = await dialogPage.getComponentInstanceId();

      // Expect microfrontend content to be displayed.
      await expectDialog(dialogPage).toBeVisible();

      // Open and activate another view.
      await appPO.openNewViewTab();

      // Expect outlet and iframe of the microfrontend dialog to be hidden but attached to the DOM.
      await expectDialog(dialogPage).toBeHidden();

      // Activate view of the dialog.
      await dialogOpenerPage.view.tab.click();

      // Expect microfrontend content to be displayed.
      await expectDialog(dialogPage).toBeVisible();
      // Expect the component not to be constructed anew.
      await expect.poll(() => dialogPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain dialog bounds if view is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open view 1 with dialog.
      const dialogPage = await SizeTestPagePO.openInDialog(appPO);
      const viewPage1 = new DialogOpenerPagePO(appPO, {viewId: await appPO.activePart({inMainArea: true}).activeView.getViewId()});

      await expectDialog(dialogPage).toBeVisible();
      const dialogSize = await dialogPage.getBoundingBox();
      const sizeChanges = await dialogPage.getRecordedSizeChanges();

      // Open view 2.
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await expectDialog(dialogPage).toBeHidden();
      await expectView(viewPage1).toBeInactive();
      await expectView(viewPage2).toBeActive();

      // Expect dialog bounding box not to have changed.
      await expect.poll(() => dialogPage.getBoundingBox()).toEqual(dialogSize);

      // Activate view 1.
      await viewPage1.view.tab.click();
      await expectDialog(dialogPage).toBeVisible();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive();

      // Expect dialog not to be resized (no flickering).
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

      const view1 = (await appPO.openNewViewTab()).view;

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'view', context: {viewId: await view1.getViewId()}});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect dialog not to be displayed yet.
      await expectDialog(dialogPage).toBeHidden();

      // Activate view 1.
      await view1.tab.click();

      // Expect microfrontend content to be displayed.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass pane for view 1.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([await view1.getBoundingBox()]));
    });

    test('should open an application-modal dialog if in the context of a view and application-modality selected', async ({appPO, microfrontendNavigator}) => {
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
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', modality: 'application'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      // Expect microfrontend content to be displayed.
      await expectDialog(dialogPage).toBeVisible();

      // Expect glass panes.
      await expect.poll(() => dialog.getGlassPaneBoundingBoxes()).toEqual(new Set([
        await appPO.workbenchBoundingBox(), // workbench
        await dialogOpenerPage.view.getBoundingBox(), // workbench view
        await dialogOpenerPage.outlet.locator.boundingBox(), // router outlet
      ]));
    });

    test('should detach dialog if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-dialog',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open view in main area.
      const viewInMainArea = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Open dialog opener view.
      const dialogOpenerView = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');

      // Drag dialog opener view into peripheral area.
      await dialogOpenerView.view.tab.dragTo({grid: 'workbench', region: 'east'});

      // Open the dialog.
      await dialogOpenerView.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expectDialog(dialogPage).toBeVisible();

      // Maximize the main area.
      await viewInMainArea.view.tab.dblclick();
      await expectDialog(dialogPage).toBeHidden();

      // Restore the layout.
      await viewInMainArea.view.tab.dblclick();
      await expectDialog(dialogPage).toBeVisible();
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

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect title to be set.
      await expect(dialog.title).toHaveText('TITLE');
    });

    test('should substitute parameter in title from capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        params: [
          {name: 'id', required: true},
        ],
        properties: {
          path: 'test-dialog',
          title: 'TITLE :id',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee', params: {id: '123'}});

      const dialog = appPO.dialog({cssClass: 'testee'});

      // Expect title to be set and placeholder to be substituted.
      await expect(dialog.title).toHaveText('TITLE 123');
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

      // Open the dialog.
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

    test('should unsubscribe from previous observable when setting observable', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/dialog-properties-test-page',
          size: {height: '475px', width: '300px'},
        },
      });

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPropertiesTestPagePO(dialog);

      // Install Observable 1.
      await dialogPage.installTitleObservable1();

      // Emit title from Observable 1.
      await dialogPage.emitTitle1('A1');
      await expect(dialog.title).toHaveText('A1');

      // Emit title from Observable 1.
      await dialogPage.emitTitle1('A2');
      await expect(dialog.title).toHaveText('A2');

      // Install Observable 2.
      await dialogPage.installTitleObservable2();

      // Emit title from Observable 2.
      await dialogPage.emitTitle2('B1');
      await expect(dialog.title).toHaveText('B1');

      // Emit title from Observable 2.
      await dialogPage.emitTitle2('B2');
      await expect(dialog.title).toHaveText('B2');

      // Emit title from Observable 1.
      await dialogPage.emitTitle1('A3');

      // Wait 500ms
      await page.waitForTimeout(500);

      // Expect title not to be updated from Observable 1.
      await expect(dialog.title).toHaveText('B2');

      // Emit title from Observable 2.
      await dialogPage.emitTitle2('B3');
      await expect(dialog.title).toHaveText('B3');
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

      // Open the dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});

      const dialog = appPO.dialog({cssClass: 'testee'});
      const dialogPage = new DialogPagePO(dialog);

      await expect.poll(() => dialogPage.getDialogParams()).toEqual({id: '123'});
    });

    test('should substitute named URL params with values of the params', async ({appPO, microfrontendNavigator}) => {
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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

      // Open the dialog.
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
