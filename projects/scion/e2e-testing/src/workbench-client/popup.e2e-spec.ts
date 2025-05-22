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
import {PopupPagePO} from './page-object/popup-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {expectPopup} from '../matcher/popup-matcher';
import {waitUntilBoundingBoxStable} from '../helper/testing.util';
import {InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {InputFieldTestPagePO as WorkbenchInputFieldTestPagePO} from '../workbench/page-object/test-pages/input-field-test-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {expectView} from '../matcher/view-matcher';
import {MAIN_AREA} from '../workbench.model';
import {RouterPagePO} from './page-object/router-page.po';
import {POPUP_DIAMOND_ANCHOR_SIZE} from '../workbench/workbench-layout-constants';

test.describe('Workbench Popup', () => {

  test('should, by default, open in the north', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popup.getAlign()).toEqual('north');
  });

  test('should open in the north', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.selectAlign('north');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popup.getAlign()).toEqual('north');
  });

  test('should open in the south', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.selectAlign('south');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popup.getAlign()).toEqual('south');
  });

  test('should open in the east', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.selectAlign('east');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popup.getAlign()).toEqual('east');
  });

  test('should open in the west', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.selectAlign('west');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expect.poll(() => popup.getAlign()).toEqual('west');
  });

  test.describe('popup result', () => {
    test('should allow closing the popup with a return value', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'RETURN VALUE'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should allow closing the popup with an error', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.close({returnValue: 'ERROR', closeWithError: true});
      await expect(popupOpenerPage.error).toHaveText('ERROR');
    });

    test('should allow returning value on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await popupOpenerPage.view.tab.click();
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE');
    });

    test('should return only the latest result value on close', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE 1', {apply: true});

      await popupPage.close({returnValue: 'RETURN VALUE 2'});
      await expect(popupOpenerPage.returnValue).toHaveText('RETURN VALUE 2');
    });

    test('should not return value on escape keystroke', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      await popupPage.enterReturnValue('RETURN VALUE', {apply: true});

      await page.keyboard.press('Escape');
      await expect(popupOpenerPage.returnValue).not.toBeAttached();
    });
  });

  test('should stick to the popup anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.selectAlign('north');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});

    // Wait until popup is positioned and sized.
    await waitUntilBoundingBoxStable(popup.locator);

    // capture current popup and anchor location
    const anchorBoxInitial = await popupOpenerPage.getAnchorElementBoundingBox();
    const popupBoundsInitial = await popup.getBoundingBox();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPage.expandAnchorPanel();
    await expect(async () => {
      const anchorBox = await popupOpenerPage.getAnchorElementBoundingBox();
      const popupBounds = await popup.getBoundingBox();
      const xDelta = anchorBox.left - anchorBoxInitial.left;
      const yDelta = anchorBox.top - anchorBoxInitial.top;

      // assert the anchor to moved downward
      expect(anchorBox.top).toBeGreaterThan(anchorBoxInitial.top);
      expect(anchorBox.left).toEqual(anchorBoxInitial.left);

      // assert the popup location
      expect(popupBounds.top).toEqual(popupBoundsInitial.top + yDelta);
      expect(popupBounds.left).toEqual(popupBoundsInitial.left + xDelta);
    }).toPass();

    // collapse the panel to move the popup anchor upward
    await popupOpenerPage.collapseAnchorPanel();
    await expect(async () => {
      const popupBounds = await popup.getBoundingBox();

      // assert the popup location
      expect(popupBounds.top).toEqual(popupBoundsInitial.top);
      expect(popupBounds.left).toEqual(popupBoundsInitial.left);
    }).toPass();
  });

  test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({component: 'testee'});
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.enterPosition({top: 150, left: 150});
    await popupOpenerPage.selectAlign('south');
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: 'testee'});

    const viewBounds = await appPO.activePart({grid: 'mainArea'}).activeView.getBoundingBox();
    await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toEqual(viewBounds.left + 150);
    await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toEqual(viewBounds.top + 150);

    // move the anchor to another position
    await popupOpenerPage.enterPosition({left: 200, top: 300});
    await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toEqual(viewBounds.left + 200);
    await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toEqual(viewBounds.top + 300);

    // move the anchor to another position
    await popupOpenerPage.enterPosition({left: 300, top: 400});
    await expect.poll(() => popup.getBoundingBox().then(box => box.hcenter)).toEqual(viewBounds.left + 300);
    await expect.poll(() => popup.getBoundingBox().then(box => box.top - POPUP_DIAMOND_ANCHOR_SIZE)).toEqual(viewBounds.top + 400);
  });

  test.describe('view context', () => {

    test('should detach popup if contextual view is not active', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);
      const componentInstanceId = await popupPage.getComponentInstanceId();

      await expectPopup(popupPage).toBeVisible();

      // activate another view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // re-activate the view
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // expect the component not to be constructed anew
      await expect.poll(() => popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should maintain popup bounds if view is not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open view 1 with popup.
      const popupPage = await SizeTestPagePO.openInPopup(appPO);
      const viewPage1 = new PopupOpenerPagePO(appPO, {viewId: await appPO.activePart({grid: 'mainArea'}).activeView.getViewId()});

      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Open view 2.
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await expectPopup(popupPage).toBeHidden();
      await expectView(viewPage1).toBeInactive();
      await expectView(viewPage2).toBeActive();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Activate view 1.
      await viewPage1.view.tab.click();
      await expectPopup(popupPage).toBeVisible();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeInactive();

      // Expect popup not to be resized (no flickering).
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // deactivate the view
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // activate the view again
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // close the view
      await popupOpenerPage.view.tab.close();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should detach popup if contextual view is opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
        .activatePart('part.activity-1'),
      );

      // Open view in main area.
      const viewInMainArea = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Open popup opener page in peripheral area.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'popup', app: 'app1'}, {partId: 'part.activity-1', target: 'view.100'});

      // Open popup.
      const popupOpenerView = new PopupOpenerPagePO(appPO, {viewId: 'view.100'});
      await popupOpenerView.enterCssClass('testee');
      await popupOpenerView.enterQualifier({component: 'testee'});
      await popupOpenerView.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerView.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();

      // Maximize the main area.
      await viewInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeHidden();

      // Restore the layout.
      await viewInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeVisible();
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.waitForFocusIn();
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).not.toBeAttached();
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.waitForFocusIn();
      await popupOpenerPage.view.tab.click();
      await popupPage.waitForFocusOut();
      await expectPopup(popupPage).toBeVisible();
    });

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.waitForFocusIn();

      // Retry pressing Escape keystroke since the installation of the escape keystroke may take some time.
      await expect(async () => {
        await page.keyboard.press('Escape');
        await expectPopup(popupPage).not.toBeAttached();
      }).toPass();

      // open the popup
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      await popupPage.waitForFocusIn();
      await popupPage.enterReturnValue('explicitly request the focus');

      // Retry pressing Escape keystroke since the installation of the escape keystroke may take some time.
      await expect(async () => {
        await page.keyboard.press('Escape');
        await expectPopup(popupPage).not.toBeAttached();
      }).toPass();
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.waitForFocusIn();

      // Retry pressing Escape keystroke since the installation of the escape keystroke may take some time.
      consoleLogs.clear();
      while (!consoleLogs.contains({severity: 'debug', message: '[AppComponent][synth-event][event=keydown][key=Escape]'})) {
        await page.keyboard.press('Escape');
      }
      await expectPopup(popupPage).toBeVisible();
    });

    test('should remain focus on the element that caused the popup to lose focus when focusing element on a microfrontend view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open popup opener page
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      // Open test view
      const inputFieldPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
      // Move test page to the right
      const dragHandle = await inputFieldPage.view.tab.startDrag();
      await dragHandle.dragToPart(await inputFieldPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Open popup
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to have focus.
      await popupPage.waitForFocusIn();

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await expectPopup(popupPage).not.toBeAttached();

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(inputFieldPage.input).toBeFocused();
    });

    test('should remain focus on the element that caused the popup to lose focus when focusing element on a non-microfrontend view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open popup opener page
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      // Open test view
      const inputFieldPage = await WorkbenchInputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
      // Move test page to the right
      const dragHandle = await inputFieldPage.view.tab.startDrag();
      await dragHandle.dragToPart(await inputFieldPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Open popup
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to have focus.
      await popupPage.waitForFocusIn();

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await expectPopup(popupPage).not.toBeAttached();

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(inputFieldPage.input).toBeFocused();
    });
  });
});
