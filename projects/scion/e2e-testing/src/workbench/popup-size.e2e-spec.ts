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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';

test.describe('Workbench Popup', () => {

  test('should pass the preferred overlay size to the popup component', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.enterPreferredOverlaySize({
      width: '300px',
      height: '301px',
      minWidth: '302px',
      maxWidth: '303px',
      minHeight: '304px',
      maxHeight: '305px',
    });
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.getPreferredOverlaySize()).toEqual({
      width: '300px',
      height: '301px',
      minWidth: '302px',
      maxWidth: '303px',
      minHeight: '304px',
      maxHeight: '305px',
    });
  });

  test('should size the overlay according to the passed preferred size', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.enterCssClass('testee');
    await popupOpenerPage.enterPreferredOverlaySize({
      width: '300px',
      height: '400px',
    });
    await popupOpenerPage.clickOpen();

    const popupPage = new PopupPagePO(appPO, {cssClass: 'testee'});
    await expect(await popupPage.popup.getBoundingBox()).toEqual(expect.objectContaining({
      width: 300,
      height: 400,
    }));
  });

  test.describe('overlay size constraint', () => {
    test('should not grow beyond the preferred overlay height', async ({page, appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        height: '400px',
      });
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

    test('should not grow beyond the preferred overlay width', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        width: '400px',
      });
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

    test('should not shrink below the preferred overlay height', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        height: '400px',
      });
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

    test('should not shrink below the preferred overlay width', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        width: '400px',
      });
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
    test('should grow to the maximum height of the overlay', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        maxHeight: '400px',
      });
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

    test('should grow to the maximum width of the overlay', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        maxWidth: '400px',
      });
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
    test('should not shrink below the minimum height of the overlay', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        minHeight: '400px',
      });
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

    test('should not shrink below the minimum width of the overlay', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.enterPreferredOverlaySize({
        minWidth: '400px',
      });
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

