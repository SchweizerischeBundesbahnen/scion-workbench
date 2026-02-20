/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
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
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {InputFieldTestPagePO as WorkbenchInputFieldTestPagePO} from '../workbench/page-object/test-pages/input-field-test-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {MAIN_AREA} from '../workbench.model';
import {RouterPagePO} from './page-object/router-page.po';
import {RouterPagePO as WorkbenchRouterPagePO} from '../workbench/page-object/router-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchNotificationCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability} from '../workbench/page-object/layout-page/register-route-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';

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

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
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

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      align: 'north',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
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

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      align: 'south',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expectPopup(popupPage).toHavePosition('south', popupOpenerPage.openButton);
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

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      align: 'east',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expectPopup(popupPage).toHavePosition('east', popupOpenerPage.openButton);
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

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: 'element',
      align: 'west',
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expectPopup(popupPage).toBeVisible();
    await expectPopup(popupPage).toHavePosition('west', popupOpenerPage.openButton);
  });

  test('should reposition popup if changing anchor coordinates', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // Open the popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.open({component: 'testee'}, {
      anchor: {top: 150, left: 150},
      align: 'south',
      closeStrategy: {onFocusLost: false},
      cssClass: 'testee',
    });

    const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
    const view = popupOpenerPage.view.locator;
    await expectPopup(popupPage).toHavePosition('south', view, {top: 150, left: 150});

    // Move the anchor to another position.
    await popupOpenerPage.enterPosition({left: 200, top: 300});
    await expectPopup(popupPage).toHavePosition('south', view, {left: 200, top: 300});

    // Move the anchor to another position.
    await popupOpenerPage.enterPosition({left: 300, top: 400});
    await expectPopup(popupPage).toHavePosition('south', view, {left: 300, top: 400});
  });

  test.describe('Popup Result', () => {
    test('should close popup with a return value', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
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

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
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

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
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

    test('should return only the latest result value on close', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
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

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
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

  test.describe('Part Context', () => {

    test('should bind popup to contextual part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
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

    test('should bind popup to contextual host part', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'popup', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'main-area'},
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'part',
        qualifier: {part: 'popup-opener', app: 'host'},
        properties: {
          path: '',
          extras: {
            icon: 'folder',
            label: 'Popup Opener',
          },
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchPartCapability({part: 'popup-opener', app: 'host'})],
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener', app: 'host'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}), {host: true});
      await popupOpenerPage.open({component: 'testee', app: 'app1'}, {
        anchor: 'element',
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

    test('should bind popup to any part', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.testee', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .activatePart('part.testee'),
      );

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, left: 100},
        context: 'part.testee',
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

    test('should not bind popup to contextual part if context null', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '100px', height: '100px'},
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 300, left: 300},
        context: null,
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

    test('should open popup in the top left corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
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
              id: 'part.testee',
              qualifier: {part: 'popup-opener'},
              position: 'right-top',
              active: true,
              ɵactivityId: 'activity.1',
            },
          ],
        },
      });

      const part = appPO.part({partId: 'part.testee'});

      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.testee'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', part.slot.locator, {bottom: 0, right: 0});
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

      const perspective = await microfrontendNavigator.registerCapability('app1', {
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
            },
          ],
        },
      });

      // Switch perspective.
      await appPO.switchPerspective(perspective.metadata!.id);

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expand a collapsed panel to move the popup anchor downward.
      await popupOpenerPage.expandPanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Collapse the panel to move the popup anchor upward.
      await popupOpenerPage.collapsePanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Sash activity panel 100px to the right.
      await appPO.activityPanel('left').resize(100);
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should adjust popup position when sashing part', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
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

      const perspective = await microfrontendNavigator.registerCapability('app1', {
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
            },
          ],
        },
      });

      // Switch perspective.
      await appPO.switchPerspective(perspective.metadata!.id);

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {right: 0, top: 0},
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be opened in top right corner.
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.part.slot.locator, {right: 0, top: 0});

      await test.step('Sash left activity panel 100px to the right', async () => {
        await appPO.activityPanel('left').resize(100);

        // Expect popup to stick to part bounds.
        await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.part.slot.locator, {right: 0, top: 0});
      });

      await test.step('Sash left activity panel 100px to the left', async () => {
        await appPO.activityPanel('left').resize(-100);

        // Expect popup to stick to part bounds.
        await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.part.slot.locator, {right: 0, top: 0});
      });
    });

    test('should maintain popup bounds if contextual part is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
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

      const perspective = await microfrontendNavigator.registerCapability('app1', {
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

      // Switch perspective.
      await appPO.switchPerspective(perspective.metadata!.id);

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual part is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
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

      const perspective = await microfrontendNavigator.registerCapability('app1', {
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

      // Switch perspective.
      await appPO.switchPerspective(perspective.metadata!.id);

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should detach popup if contextual part is opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
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

      const perspective = await microfrontendNavigator.registerCapability('app1', {
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
            },
          ],
        },
      });

      // Switch perspective.
      await appPO.switchPerspective(perspective.metadata!.id);

      // Open view in main area.
      const viewInMainArea = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect microfrontend content to be displayed.
      await expectPopup(popupPage).toBeVisible();

      // Maximize the main area.
      await viewInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeHidden();

      // Restore the layout.
      await viewInMainArea.view.tab.dblclick();
      await expectPopup(popupPage).toBeVisible();
    });
  });

  test.describe('View Context', () => {

    test('should bind popup to contextual view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '100px', height: '100px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
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

    test('should bind popup to contextual host view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'popup', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-popup',
          size: {width: '100px', height: '100px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage.open({component: 'testee', app: 'app1'}, {
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

    test('should bind popup to any view', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '50px', height: '50px'},
        },
      });

      await workbenchNavigator.createPerspective('testee', factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.right', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addView('view.right', {partId: 'part.right'})
        .activatePart('part.right'),
      );

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, left: 100},
        context: 'view.right',
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

    test('should not bind popup to contextual view if context null', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '100px', height: '100px'},
        },
      });

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 300, left: 300},
        context: null,
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

    test('should open popup in the top left corner', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

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

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

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

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

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

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

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

      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.view.locator, {bottom: 0, right: 0});
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

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expand a collapsed panel to move the popup anchor downward.
      await popupOpenerPage.expandPanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Collapse the panel to move the popup anchor upward.
      await popupOpenerPage.collapsePanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should maintain popup bounds if contextual view is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual view is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await popupOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
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
      const popupOpenerView = new PopupOpenerPagePO(appPO.view({viewId: 'view.100'}));
      await popupOpenerView.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

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

  test.describe('Dialog Context', () => {

    test('should bind popup to contextual dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener'}, {cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
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

    test('should bind popup to contextual host dialog', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'popup', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
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

      // Open popup in host dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}), {host: true});
      await popupOpenerPage.open({component: 'testee', app: 'app1'}, {
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

    test('should not bind popup to contextual dialog if context null', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener'}, {cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 300, left: 300},
        context: null,
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

    test('should bind popup to any dialog', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog'},
        properties: {
          path: 'test-dialog',
          size: {height: '500px', width: '300px'},
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
      const dialogOpenerPage = new DialogOpenerPagePO(appPO.part({partId: 'part.dialog-opener'}));
      await dialogOpenerPage.open({component: 'dialog'}, {cssClass: 'dialog'});
      const dialog = appPO.dialog({cssClass: 'dialog'});
      await dialog.moveDialog('bottom-right-corner');

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 100, left: 100},
        context: await dialog.getDialogId(),
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

    test('should open popup in the top left corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '10px', width: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open popup opener page in dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'dialog'}, {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '10px', width: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open popup opener page in dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'dialog'}, {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '10px', width: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open popup opener page in dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'dialog'}, {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '10px', width: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'dialog'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      // Open popup opener page in dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'dialog'}, {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {bottom: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', dialog.slot, {bottom: 0, right: 0});
    });

    test('should stick to the popup anchor', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '1000px', width: '300px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener'}, {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to open the north of the anchor.
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expand a collapsed panel to move the popup anchor downward.
      await popupOpenerPage.expandPanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Collapse the panel to move the popup anchor upward.
      await popupOpenerPage.collapsePanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Move dialog 100px to the left.
      await dialog.moveDialog({x: -100, y: 0});
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should stick to the popup anchor with dialog padding', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '1000px', width: '300px'},
          padding: true,
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener'}, {cssClass: 'popup-opener'});
      const dialog = appPO.dialog({cssClass: 'popup-opener'});

      // Open popup in dialog.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to open the north of the anchor.
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expand a collapsed panel to move the popup anchor downward.
      await popupOpenerPage.expandPanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Collapse the panel to move the popup anchor upward.
      await popupOpenerPage.collapsePanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Move dialog 100px to the left.
      await dialog.moveDialog({x: -100, y: 0});
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should maintain popup bounds if contextual dialog is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener'}, {cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual dialog is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'dialog',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '500px', width: '300px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open dialog.
      const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
      await dialogOpenerPage.open({component: 'popup-opener'}, {cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.dialog({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to be visible.
      await expectPopup(popupPage).toBeVisible();
      const popupSize = await popupPage.getBoundingBox();
      const sizeChanges = await popupPage.getRecordedSizeChanges();

      // Detach contextual popup.
      await appPO.openNewViewTab();
      await expectPopup(popupPage).toBeHidden();

      // Expect popup bounding box not to have changed.
      await expect.poll(() => popupPage.getBoundingBox()).toEqual(popupSize);

      // Attach contextual popup.
      await dialogOpenerPage.view.tab.click();
      await expectPopup(popupPage).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage.getRecordedSizeChanges()).toEqual(sizeChanges);
    });
  });

  test.describe('Popup Context', () => {

    test('should bind popup to contextual popup', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popupPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));

      // Open popup in popup.
      await popupPage1.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage2 = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

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

    test('should bind popup to contextual host popup', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'popup', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('host', {
        type: 'popup',
        qualifier: {component: 'popup-opener', app: 'host'},
        properties: {
          path: '',
        },
      });

      // Register host popup route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchPopupCapability({component: 'popup-opener', app: 'host'})],
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'app1'},
        private: false,
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open host popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'host');
      await popupOpenerPage1.open({component: 'popup-opener', app: 'host'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      const popupPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}), {host: true});

      // Open non-host popup in host popup.
      await popupPage1.open({component: 'testee', app: 'app1'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage2 = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

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

    test('should not bind popup to contextual popup if context null', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      // Open popup in popup.
      const popupOpenerPage1 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage1.open({component: 'testee'}, {
        anchor: {left: 300, top: 300},
        context: null,
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

    test('should bind popup to any popup', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
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

      // Open popup 1.
      const popupOpenerPage1 = new PopupOpenerPagePO(appPO.part({partId: 'part.popup-opener'}));
      await popupOpenerPage1.open({component: 'testee'}, {
        anchor: {top: 100, left: 100},
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-1',
      });

      const popup1 = appPO.popup({cssClass: 'popup-1'});

      // Open popup 2 in popup 1.
      const popupOpenerPage2 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        context: await popup1.getPopupId(),
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

    test('should open popup in the top left corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open popup opener page in popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });
      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popup.locator, {top: 0, left: 0});
    });

    test('should open popup in the top right corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open popup opener page in popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });
      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: {top: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popup.locator, {top: 0, right: 0});
    });

    test('should open popup in the bottom left corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open popup opener page in popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });
      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: {bottom: 0, left: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popup.locator, {bottom: 0, left: 0});
    });

    test('should open popup in the bottom right corner', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '50px', width: '50px'},
        },
      });

      // Open popup opener page in popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });
      const popup = appPO.popup({cssClass: 'popup-opener'});

      // Open popup.
      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: {bottom: 0, right: 0},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));
      await expectPopup(popupPage).toHavePosition('north', popup.locator, {bottom: 0, right: 0});
    });

    test('should maintain popup bounds if contextual popup is not active (to not flicker on reactivation; to support for virtual scrolling) [element anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open popup opener page in popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      // Open popup.
      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage2 = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

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
      await popupOpenerPage1.view.tab.click();
      await expectPopup(popupPage2).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage2.getRecordedSizeChanges()).toEqual(sizeChanges);
    });

    test('should maintain popup bounds if contextual popup is not active (to not flicker on reactivation; to support for virtual scrolling) [coordinate anchor]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/size-test-page',
          size: {height: '200px', width: '500px'},
        },
      });

      // Open popup opener page in popup.
      const popupOpenerPage1 = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage1.open({component: 'popup-opener'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'popup-opener',
      });

      // Open popup.
      const popupOpenerPage2 = new PopupOpenerPagePO(appPO.popup({cssClass: 'popup-opener'}));
      await popupOpenerPage2.open({component: 'testee'}, {
        anchor: {top: 0, left: 0},
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage2 = new SizeTestPagePO(appPO.popup({cssClass: 'testee'}));

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
      await popupOpenerPage1.view.tab.click();
      await expectPopup(popupPage2).toBeVisible();

      // Expect popup not to be resized.
      await expect.poll(() => popupPage2.getRecordedSizeChanges()).toEqual(sizeChanges);
    });
  });

  test.describe('Notification Context', () => {

    test('should bind popup to contextual notification', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '600px'},
        },
      });

      // Open notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'popup-opener'}, {cssClass: 'popup-opener'});

      // Open popup in notification.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.notification({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should bind popup to contextual host notification', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Add activity to offset main area.
      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.left', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', activate: true}),
      );

      // Register intention.
      await microfrontendNavigator.registerIntention('host', {type: 'popup', qualifier: {component: 'testee', app: 'app1'}});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee', app: 'app1'},
        properties: {
          path: 'test-popup',
          size: {height: '100px', width: '100px'},
        },
      });

      await microfrontendNavigator.registerCapability('host', {
        type: 'notification',
        qualifier: {component: 'popup-opener', app: 'host'},
        properties: {
          path: '',
          size: {height: '500px', width: '300px'},
        },
      });

      // Register host notification route.
      await workbenchNavigator.registerRoute({
        path: '', component: 'microfrontend-popup-opener-page', canMatch: [canMatchWorkbenchNotificationCapability({component: 'popup-opener', app: 'host'})],
      });

      // Open host notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'host');
      await notificationOpenerPage.show({component: 'popup-opener', app: 'host'}, {cssClass: 'popup-opener'});

      // Open popup in host notification.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.notification({cssClass: 'popup-opener'}), {host: true});
      await popupOpenerPage.open({component: 'testee', app: 'app1'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await expectPopup(popupPage).toBeVisible();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });

    test('should stick to the popup anchor', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {width: '10px', height: '10px'},
        },
      });

      await microfrontendNavigator.registerCapability('app1', {
        type: 'notification',
        qualifier: {component: 'popup-opener'},
        properties: {
          path: 'test-popup-opener',
          size: {height: '1000px'},
        },
      });

      // Open notification.
      const notificationOpenerPage = await microfrontendNavigator.openInNewTab(NotificationOpenerPagePO, 'app1');
      await notificationOpenerPage.show({component: 'popup-opener'}, {cssClass: 'popup-opener'});

      // Open popup in notification.
      const popupOpenerPage = new PopupOpenerPagePO(appPO.notification({cssClass: 'popup-opener'}));
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        align: 'north',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

      const popupPage = new PopupPagePO(appPO.popup({cssClass: 'testee'}));

      // Expect popup to open the north of the anchor.
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Expand a collapsed panel to move the popup anchor downward.
      await popupOpenerPage.expandPanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);

      // Collapse the panel to move the popup anchor upward.
      await popupOpenerPage.collapsePanel();
      await expectPopup(popupPage).toHavePosition('north', popupOpenerPage.openButton);
    });
  });

  test.describe('Popup Closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
        },
      });

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

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

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: false},
        cssClass: 'testee',
      });

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

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onEscape: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.waitForFocusIn();

      // Retry pressing Escape keystroke since the installation of the escape keystroke may take some time.
      await expect(async () => {
        await page.keyboard.press('Escape');
        await expectPopup(popupPage).not.toBeAttached();
      }).toPass();

      // Open the popup.
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onEscape: true},
        cssClass: 'testee',
      });

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

      // Open the popup.
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onEscape: false},
        cssClass: 'testee',
      });

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

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'input-field'},
        properties: {
          path: 'test-pages/input-field-test-page',
        },
      });

      // Open test view
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'input-field'}, {cssClass: 'input-field'});
      const inputFieldPage = new InputFieldTestPagePO(appPO.view({cssClass: 'input-field'}));

      // Open popup opener page
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');

      // Move test page to the right
      const dragHandle = await inputFieldPage.view.tab.startDrag();
      await dragHandle.dragToPart(await inputFieldPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Open popup
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to have focus.
      await popupPage.waitForFocusIn();

      // Click the input field to make popup lose focus.
      await inputFieldPage.clickInputField();

      // Expect popup to be closed.
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
      const routerPage = await workbenchNavigator.openInNewTab(WorkbenchRouterPagePO);
      await routerPage.navigate(['test-pages/input-field-test-page'], {cssClass: 'testee'});
      await routerPage.view.tab.close();
      const inputFieldPage = new WorkbenchInputFieldTestPagePO(appPO.view({cssClass: 'testee'}));

      // Move test page to the right
      const dragHandle = await inputFieldPage.view.tab.startDrag();
      await dragHandle.dragToPart(await inputFieldPage.view.part.getPartId(), {region: 'east'});
      await dragHandle.drop();

      // Open popup
      await popupOpenerPage.open({component: 'testee'}, {
        anchor: 'element',
        closeStrategy: {onFocusLost: true},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Expect popup to have focus.
      await popupPage.waitForFocusIn();

      // Click the input field to make popup lose focus.
      await inputFieldPage.clickInputField();

      // Expect popup to be closed.
      await expectPopup(popupPage).not.toBeAttached();

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(inputFieldPage.input).toBeFocused();
    });
  });
});
