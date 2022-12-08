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
import {PopupPagePO} from './page-object/popup-page.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {InputFieldTestPagePO as WorkbenchInputFieldTestPagePO} from '../workbench/page-object/test-pages/input-field-test-page.po';

test.describe('Workbench Popup', () => {

  test('should, by default, open in the north of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});
    await expect(await popupPO.isVisible()).toBe(true);
    await expect(await popupPO.getAlign()).toEqual('north');
  });

  test('should open in the north of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.selectAlign('north');
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});
    await expect(await popupPO.isVisible()).toBe(true);
    await expect(await popupPO.getAlign()).toEqual('north');
  });

  test('should open in the south of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.selectAlign('south');
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});
    await expect(await popupPO.isVisible()).toBe(true);
    await expect(await popupPO.getAlign()).toEqual('south');
  });

  test('should open in the east of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.selectAlign('east');
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});
    await expect(await popupPO.isVisible()).toBe(true);
    await expect(await popupPO.getAlign()).toEqual('east');
  });

  test('should open in the west of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.selectAlign('west');
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});
    await expect(await popupPO.isVisible()).toBe(true);
    await expect(await popupPO.getAlign()).toEqual('west');
  });

  test('should allow closing the popup and returning a value to the popup opener', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await popupPagePO.clickClose({returnValue: 'RETURN VALUE'});
    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  test('should allow closing the popup with an error', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await popupPagePO.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPagePO.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  test('should stick the popup to the HTMLElement anchor when moving the anchor element', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.selectAlign('north');
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});

    // capture current popup and anchor location
    const anchorClientRect1 = await popupOpenerPagePO.getAnchorElementClientRect();
    const popupClientRect1 = await popupPO.getBoundingBox();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPagePO.expandAnchorPanel();

    const anchorClientRect2 = await popupOpenerPagePO.getAnchorElementClientRect();
    const popupClientRect2 = await popupPO.getBoundingBox();
    const xDelta = anchorClientRect2.left - anchorClientRect1.left;
    const yDelta = anchorClientRect2.top - anchorClientRect1.top;

    // assert the anchor to moved downward
    await expect(anchorClientRect2.top).toBeGreaterThan(anchorClientRect1.top);
    await expect(anchorClientRect2.left).toEqual(anchorClientRect1.left);

    // assert the popup location
    await expect(popupClientRect2.top).toEqual(popupClientRect1.top + yDelta);
    await expect(popupClientRect2.left).toEqual(popupClientRect1.left + xDelta);

    // collapse the panel to move the popup anchor upward
    await popupOpenerPagePO.collapseAnchorPanel();
    const popupClientRect3 = await popupPO.getBoundingBox();

    // assert the popup location
    await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
    await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
  });

  test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
        size: {width: '100px', height: '100px'},
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPagePO.enterPosition({top: 150, left: 150});
    await popupOpenerPagePO.selectAlign('south');
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    const popupPO = appPO.popup({cssClass: 'testee'});

    // capture current popup and anchor location
    const popupClientRectInitial = await popupPO.getBoundingBox();

    // move the anachor
    await popupOpenerPagePO.enterPosition({top: 300, left: 200});

    // assert the popup location
    await expect(await popupPO.getBoundingBox()).toEqual(expect.objectContaining({
      left: popupClientRectInitial.left + 50,
      top: popupClientRectInitial.top + 150,
    }));

    // move the anchor to its initial position
    await popupOpenerPagePO.enterPosition({top: 150, left: 150});

    // assert the popup location
    await expect(await popupPO.getBoundingBox()).toEqual(popupClientRectInitial);
  });

  test('should provide the popup\'s capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'popup',
      qualifier: {component: 'testee'},
      properties: {
        path: 'popup',
      },
    });

    // open the popup
    const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPagePO.enterQualifier({component: 'testee'});
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.clickOpen();

    // expect the popup of this app to display
    const popupPagePO = new PopupPagePO(appPO, 'testee');
    await expect(await popupPagePO.getPopupCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee'},
      type: 'popup',
      properties: expect.objectContaining({
        path: 'popup',
      }),
    }));
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      const componentInstanceId = await popupPagePO.getComponentInstanceId();
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await popupPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPO = appPO.popup({cssClass: 'testee'});
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(false);

      // activate the view again
      await popupOpenerPagePO.view.viewTab.click();
      await expect(await popupPO.isPresent()).toBe(true);
      await expect(await popupPO.isVisible()).toBe(true);

      // close the view
      await popupOpenerPagePO.view.viewTab.close();

      // popup should be closed when view is closed
      await popupPO.waitUntilClosed();

      await expect(await popupPO.isPresent()).toBe(false);
      await expect(await popupPO.isVisible()).toBe(false);
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await popupPagePO.waitForFocus();

      await popupOpenerPagePO.view.viewTab.click();

      // popup should be closed on focus loss
      await popupPagePO.popupPO.waitUntilClosed();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(false);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(false);
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await popupPagePO.waitForFocus();

      await popupOpenerPagePO.view.viewTab.click();

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
    });

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPage1PO = new PopupPagePO(appPO, 'testee');
      await popupPage1PO.waitForFocus();

      // Pause execution since the installation of the escape keystroke may take some time.
      // TODO [#207]: Wait until keystrokes are installed: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/207
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');

      // popup should be closed on escape keystroke
      await popupPage1PO.popupPO.waitUntilClosed();

      await expect(await popupPage1PO.popupPO.isPresent()).toBe(false);
      await expect(await popupPage1PO.popupPO.isVisible()).toBe(false);

      // open the popup
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPage2PO = new PopupPagePO(appPO, 'testee');
      await popupPage2PO.waitForFocus();

      await popupPage2PO.enterReturnValue('explicitly request the focus');
      await page.keyboard.press('Escape');

      // popup should be closed on escape keystroke
      await popupPage1PO.popupPO.waitUntilClosed();

      await expect(await popupPage2PO.popupPO.isPresent()).toBe(false);
      await expect(await popupPage2PO.popupPO.isVisible()).toBe(false);
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // open the popup
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnEscape: false});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await popupPagePO.waitForFocus();

      // Pause execution since the installation of the escape keystroke may take some time.
      // TODO [#207]: Wait until keystrokes are installed: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/207
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');

      await expect(await popupPagePO.popupPO.isPresent()).toBe(true);
      await expect(await popupPagePO.popupPO.isVisible()).toBe(true);
    });

    test('should remain focus on the element that caused the popup to lose focus when focusing element on a microfrontend view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // Open popup opener page
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      // Open test view
      const inputFieldPagePO = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
      // Move test page to the right
      await inputFieldPagePO.view.viewTab.dragToPart({region: 'east'});

      // Open popup
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      // Expect popup to have focus.
      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await popupPagePO.waitForFocus();

      // Click the input field to make popup lose focus
      await inputFieldPagePO.clickInputField();

      // Expect popup to be closed
      await popupPagePO.popupPO.waitUntilClosed();
      await expect(await popupPagePO.popupPO.isVisible()).toBe(false);

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(await inputFieldPagePO.isActiveElement()).toBe(true);
    });

    test('should remain focus on the element that caused the popup to lose focus when focusing element on a non-microfrontend view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'popup',
        },
      });

      // Open popup opener page
      const popupOpenerPagePO = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      // Open test view
      const inputFieldPagePO = await WorkbenchInputFieldTestPagePO.openInNewTab(appPO, workbenchNavigator);
      // Move test page to the right
      await inputFieldPagePO.view.viewTab.dragToPart({region: 'east'});

      // Open popup
      await popupOpenerPagePO.enterQualifier({component: 'testee'});
      await popupOpenerPagePO.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.clickOpen();

      // Expect popup to have focus.
      const popupPagePO = new PopupPagePO(appPO, 'testee');
      await popupPagePO.waitForFocus();

      // Click the input field to make popup lose focus
      await inputFieldPagePO.clickInputField();

      // Expect popup to be closed
      await popupPagePO.popupPO.waitUntilClosed();
      await expect(await popupPagePO.popupPO.isVisible()).toBe(false);

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(await inputFieldPagePO.isActiveElement()).toBe(true);
    });
  });
});
