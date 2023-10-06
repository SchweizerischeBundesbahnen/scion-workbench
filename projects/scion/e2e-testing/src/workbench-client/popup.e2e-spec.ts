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
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(await popup.isVisible()).toBe(true);
    await expect(await popup.getAlign()).toEqual('north');
  });

  test('should open in the north of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(await popup.isVisible()).toBe(true);
    await expect(await popup.getAlign()).toEqual('north');
  });

  test('should open in the south of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(await popup.isVisible()).toBe(true);
    await expect(await popup.getAlign()).toEqual('south');
  });

  test('should open in the east of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(await popup.isVisible()).toBe(true);
    await expect(await popup.getAlign()).toEqual('east');
  });

  test('should open in the west of the anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});
    await expect(await popup.isVisible()).toBe(true);
    await expect(await popup.getAlign()).toEqual('west');
  });

  test('should allow closing the popup and returning a value to the popup opener', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await popupPage.clickClose({returnValue: 'RETURN VALUE'});
    await expect(await popupOpenerPage.getPopupCloseAction()).toEqual({type: 'closed-with-value', value: 'RETURN VALUE'});
  });

  test('should allow closing the popup with an error', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await popupPage.clickClose({returnValue: 'ERROR', closeWithError: true});

    await expect(await popupOpenerPage.getPopupCloseAction()).toEqual({type: 'closed-with-error', value: 'ERROR'});
  });

  test('should stick the popup to the HTMLElement anchor when moving the anchor element', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});

    // capture current popup and anchor location
    const anchorClientRect1 = await popupOpenerPage.getAnchorElementClientRect();
    const popupClientRect1 = await popup.getBoundingBox();

    // expand a collapsed panel to move the popup anchor downward
    await popupOpenerPage.expandAnchorPanel();

    const anchorClientRect2 = await popupOpenerPage.getAnchorElementClientRect();
    const popupClientRect2 = await popup.getBoundingBox();
    const xDelta = anchorClientRect2.left - anchorClientRect1.left;
    const yDelta = anchorClientRect2.top - anchorClientRect1.top;

    // assert the anchor to moved downward
    await expect(anchorClientRect2.top).toBeGreaterThan(anchorClientRect1.top);
    await expect(anchorClientRect2.left).toEqual(anchorClientRect1.left);

    // assert the popup location
    await expect(popupClientRect2.top).toEqual(popupClientRect1.top + yDelta);
    await expect(popupClientRect2.left).toEqual(popupClientRect1.left + xDelta);

    // collapse the panel to move the popup anchor upward
    await popupOpenerPage.collapseAnchorPanel();
    const popupClientRect3 = await popup.getBoundingBox();

    // assert the popup location
    await expect(popupClientRect3.top).toEqual(popupClientRect1.top);
    await expect(popupClientRect3.left).toEqual(popupClientRect1.left);
  });

  test('should allow repositioning the popup if using a coordinate anchor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    const popup = appPO.popup({cssClass: 'testee'});

    // capture current popup and anchor location
    const popupClientRectInitial = await popup.getBoundingBox();

    // move the anachor
    await popupOpenerPage.enterPosition({top: 300, left: 200});

    // assert the popup location
    await expect(await popup.getBoundingBox()).toEqual(expect.objectContaining({
      left: popupClientRectInitial.left + 50,
      top: popupClientRectInitial.top + 150,
    }));

    // move the anchor to its initial position
    await popupOpenerPage.enterPosition({top: 150, left: 150});

    // assert the popup location
    await expect(await popup.getBoundingBox()).toEqual(popupClientRectInitial);
  });

  test('should provide the popup\'s capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee popup
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await popupOpenerPage.clickOpen();

    // expect the popup of this app to display
    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getPopupCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee'},
      type: 'popup',
      properties: expect.objectContaining({
        path: 'test-popup',
      }),
    }));
  });

  test.describe('view context', () => {

    test('should hide the popup when its contextual view (if any) is deactivated, and then display the popup again when activating it', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPage.view.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);
    });

    test('should not destroy the popup when its contextual view (if any) is deactivated', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      const componentInstanceId = await popupPage.getComponentInstanceId();
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);

      // activate another view
      await appPO.openNewViewTab();
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(false);

      // re-activate the view
      await popupOpenerPage.view.viewTab.click();
      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);

      // expect the component not to be constructed anew
      await expect(await popupPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should bind the popup to the current view, if opened in the context of a view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popup = appPO.popup({cssClass: 'testee'});
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // deactivate the view
      await appPO.openNewViewTab();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(false);

      // activate the view again
      await popupOpenerPage.view.viewTab.click();
      await expect(await popup.isPresent()).toBe(true);
      await expect(await popup.isVisible()).toBe(true);

      // close the view
      await popupOpenerPage.view.viewTab.close();

      // popup should be closed when view is closed
      await popup.waitUntilClosed();

      await expect(await popup.isPresent()).toBe(false);
      await expect(await popup.isVisible()).toBe(false);
    });
  });

  test.describe('popup closing', () => {

    test('should close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.waitForFocus();

      await popupOpenerPage.view.viewTab.click();

      // popup should be closed on focus loss
      await popupPage.popup.waitUntilClosed();

      await expect(await popupPage.popup.isPresent()).toBe(false);
      await expect(await popupPage.popup.isVisible()).toBe(false);
    });

    test('should not close the popup on focus loss', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.waitForFocus();

      await popupOpenerPage.view.viewTab.click();

      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);
    });

    test('should close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popupPage1 = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage1.waitForFocus();

      // Pause execution since the installation of the escape keystroke may take some time.
      // TODO [#207]: Wait until keystrokes are installed: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/207
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');

      // popup should be closed on escape keystroke
      await popupPage1.popup.waitUntilClosed();

      await expect(await popupPage1.popup.isPresent()).toBe(false);
      await expect(await popupPage1.popup.isVisible()).toBe(false);

      // open the popup
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnEscape: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage2 = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage2.waitForFocus();

      await popupPage2.enterReturnValue('explicitly request the focus');
      await page.keyboard.press('Escape');

      // popup should be closed on escape keystroke
      await popupPage1.popup.waitUntilClosed();

      await expect(await popupPage2.popup.isPresent()).toBe(false);
      await expect(await popupPage2.popup.isVisible()).toBe(false);
    });

    test('should not close the popup on escape keystroke', async ({page, appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.waitForFocus();

      // Pause execution since the installation of the escape keystroke may take some time.
      // TODO [#207]: Wait until keystrokes are installed: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/207
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');

      await expect(await popupPage.popup.isPresent()).toBe(true);
      await expect(await popupPage.popup.isVisible()).toBe(true);
    });

    test('should remain focus on the element that caused the popup to lose focus when focusing element on a microfrontend view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await inputFieldPage.view.viewTab.dragTo({partId: await inputFieldPage.view.part.getPartId(), region: 'east'});

      // Open popup
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      // Expect popup to have focus.
      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.waitForFocus();

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await popupPage.popup.waitUntilClosed();
      await expect(await popupPage.popup.isVisible()).toBe(false);

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(await inputFieldPage.isInputFieldActiveElement()).toBe(true);
    });

    test('should remain focus on the element that caused the popup to lose focus when focusing element on a non-microfrontend view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
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
      await inputFieldPage.view.viewTab.dragTo({partId: await inputFieldPage.view.part.getPartId(), region: 'east'});

      // Open popup
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: true});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      // Expect popup to have focus.
      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.waitForFocus();

      // Click the input field to make popup lose focus
      await inputFieldPage.clickInputField();

      // Expect popup to be closed
      await popupPage.popup.waitUntilClosed();
      await expect(await popupPage.popup.isVisible()).toBe(false);

      // Expect focus to remain in the input field that caused focus loss of the popup.
      await expect(await inputFieldPage.isInputFieldActiveElement()).toBe(true);
    });
  });
});
