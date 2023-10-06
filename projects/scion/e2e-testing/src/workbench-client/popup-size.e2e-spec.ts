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

test.describe('Workbench Popup', () => {

  test.describe('Initial Popup Size', () => {

    test('should size the overlay as configured in the popup capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {test: 'popup'},
        properties: {
          path: 'test-pages/microfrontend-test-page',
          size: {
            width: '350px',
            height: '450px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({test: 'popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 350,
        height: 450,
      }));
    });

    /**
     * In this test, we do not open the popup from within a microfrontend because opening the popup from within a microfrontend causes that
     * microfrontend to lose focus, which would trigger a change detection cycle in the host, causing the popup to be displayed at the correct size.
     *
     * This test verifies that the popup is displayed at the correct size even without an "additional" change detection cycle, i.e., is opened
     * inside the Angular zone.
     */
    test('should size the overlay as configured in the popup capability (insideAngularZone)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {test: 'popup'},
        properties: {
          path: 'test-pages/microfrontend-test-page',
          cssClass: 'e2e-test-popup-size',
          pinToStartPage: true,
          size: {
            width: '350px',
            height: '450px',
          },
        },
      });

      // open the popup directly from the start page
      const startPage = await appPO.openNewViewTab();
      await startPage.clickTestCapability('e2e-test-popup-size', 'app1');

      const popupPage = new PopupPagePO(appPO, {cssClass: 'e2e-test-popup-size'});
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 350,
        height: 450,
      }));
    });
  });

  test.describe('overlay size constraint', () => {
    test('should not grow beyond the preferred overlay height', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            height: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.enterComponentSize({
        width: '600px',
        height: '800px',
      });

      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 600,
        height: 400,
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 600,
        height: 800,
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(true);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should not grow beyond the preferred overlay width', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            width: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.enterComponentSize({
        width: '600px',
        height: '800px',
      });

      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 400,
        height: 800,
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 600,
        height: 800,
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(true);
    });

    test('should not shrink below the preferred overlay height', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            height: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.enterComponentSize({
        width: '200px',
        height: '250px',
      });

      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 200,
        height: 400,
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 200,
        height: 250,
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should not shrink below the preferred overlay width', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            width: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
      await popupPage.enterComponentSize({
        width: '200px',
        height: '250px',
      });

      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 400,
        height: 250,
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 200,
        height: 250,
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);
    });
  });

  test.describe('overlay maximal size constraint', () => {
    test('should grow to the maximum height of the overlay', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            maxHeight: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

      // Set the component height to 300px (max overlay height is 400px)
      await popupPage.enterComponentSize({
        height: '300px',
      });
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        height: 300,
        width: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        height: 300,
        width: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);

      // Set the component height to 500px (max overlay height is 400px)
      await popupPage.enterComponentSize({
        height: '500px',
      });
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        height: 400,
        width: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        height: 500,
        width: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(true);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should grow to the maximum width of the overlay', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            maxWidth: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

      // Set the component width to 300px (max overlay width is 400px)
      await popupPage.enterComponentSize({
        width: '300px',
      });

      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 300,
        height: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 300,
        height: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);

      // Set the component width to 500px (max overlay width is 400px)
      await popupPage.enterComponentSize({
        width: '500px',
      });
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 400,
        height: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 500,
        height: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(true);
    });
  });

  test.describe('overlay minimal size constraint', () => {
    test('should not shrink below the minimum height of the overlay', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            minHeight: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

      // Set the component height to 300px (min overlay height is 400px)
      await popupPage.enterComponentSize({
        height: '300px',
      });
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        height: 400,
        width: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        height: 300,
        width: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);

      // Set the component height to 500px (min overlay height is 400px)
      await popupPage.enterComponentSize({
        height: '500px',
      });
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        height: 500,
        width: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        height: 500,
        width: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should not shrink below the minimum width of the overlay', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee popup
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'popup',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-popup',
          size: {
            minWidth: '400px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({component: 'testee'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.clickOpen();

      const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});

      // Set the component width to 300px (min overlay width is 400px)
      await popupPage.enterComponentSize({
        width: '300px',
      });

      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 400,
        height: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 300,
        height: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);

      // Set the component width to 500px (min overlay width is 400px)
      await popupPage.enterComponentSize({
        width: '500px',
      });
      await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
        width: 500,
        height: expect.any(Number),
      }));
      await expect(await popupPage.getSize()).toEqual({
        width: 500,
        height: expect.any(Number),
      });
      await expect(await popupPage.popup.hasVerticalOverflow()).toBe(false);
      await expect(await popupPage.popup.hasHorizontalOverflow()).toBe(false);
    });
  });
});

