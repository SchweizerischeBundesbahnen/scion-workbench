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
import {WorkbenchHandleBoundsTestPagePO} from './page-object/test-pages/workbench-handle-bounds-test-page.po';

test.describe('Workbench Popup', () => {

  test('should size the popup as configured', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('popup-page', {
      anchor: 'element',
      size: {width: '300px', height: '400px'},
      cssClass: 'testee',
    });

    const popup = appPO.popup({cssClass: 'testee'});
    const popupPage = new PopupPagePO(popup);

    await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
      width: 300,
      height: 400,
    }));

    // Change size.
    await popupPage.enterPopupSize({width: '500px', height: '600px'});
    await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
      width: 500,
      height: 600,
    }));
  });

  test('should provide popup bounds', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open popup.
    const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    await popupOpenerPage.open('workbench-handle-bounds-test-page', {cssClass: 'testee', anchor: 'element'});

    const popup = appPO.popup({cssClass: 'testee'});
    const testPage = new WorkbenchHandleBoundsTestPagePO(popup);

    await expect(async () => {
      const expectedBounds = await popup.getBoundingBox('content');
      const handleBounds = await testPage.getBounds();
      expect(handleBounds).toEqual(expectedBounds);
    }).toPass();
  });

  test.describe('popup size constraint', () => {
    test('should have the configured height (content > popup)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {height: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.enterComponentSize({
        width: '600px',
        height: '800px',
      });

      // Expect the popup to have the configured height.
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 600,
        height: 400,
      }));

      // Expect the popup content to overflow vertically.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(true);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should have the configured width (content > popup)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {width: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.enterComponentSize({
        width: '600px',
        height: '800px',
      });

      // Expect the popup to have the configured width.
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 400,
        height: 800,
      }));

      // Expect the popup content to overflow horizontally.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(true);
    });

    test('should have the configured height (content < popup)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {height: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.enterComponentSize({
        width: '200px',
        height: '250px',
      });

      // Expect the popup to have the configured height.
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 200,
        height: 400,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should have the configured width (content < popup)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {width: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      await popupPage.enterComponentSize({
        width: '200px',
        height: '250px',
      });

      // Expect the popup to have the configured width.
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 400,
        height: 250,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
    });
  });

  test.describe('popup max size constraint', () => {
    test('should not grow past max-height', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {maxHeight: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Set the component height to 300px (maximum height is 400px).
      await popupPage.enterComponentSize({height: '300px'});

      // Expect the popup to have a height of 300px (maximum height is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        height: 300,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);

      // Set the component height to 500px (maximum height is 400px).
      await popupPage.enterComponentSize({height: '500px'});

      // Expect the popup to have a height of 400px (maximum height is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        height: 400,
      }));

      // Expect the popup content to overflow vertically.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(true);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should not grow past max-width', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {maxWidth: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Set the component width to 300px (maximum width is 400px).
      await popupPage.enterComponentSize({width: '300px'});

      // Expect the popup to have a width of 300px (maximum width is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 300,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);

      // Set the component width to 500px (maximum width is 400px).
      await popupPage.enterComponentSize({width: '500px'});

      // Expect the popup to have a width of 400px (maximum width is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 400,
      }));

      // Expect the popup content to overflow horizontally.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(true);
    });
  });

  test.describe('popup min size constraint', () => {
    test('should not shrink past min-height', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {minHeight: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Set the component height to 300px (minimum height is 400px).
      await popupPage.enterComponentSize({height: '300px'});

      // Expect the popup to have a height of 400px (minimum height is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        height: 400,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);

      // Set the component height to 500px (minimum height is 400px).
      await popupPage.enterComponentSize({height: '500px'});

      // Expect the popup to have a height of 500px (minimum height is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        height: 500,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
    });

    test('should not shrink past min-width', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPage = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
      await popupOpenerPage.open('popup-page', {
        anchor: 'element',
        size: {minWidth: '400px'},
        cssClass: 'testee',
      });

      const popup = appPO.popup({cssClass: 'testee'});
      const popupPage = new PopupPagePO(popup);

      // Set the component width to 300px (minimum width is 400px).
      await popupPage.enterComponentSize({width: '300px'});

      // Expect the popup to have a width of 400px (minimum width is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 400,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);

      // Set the component width to 500px (minimum width is 400px).
      await popupPage.enterComponentSize({width: '500px'});

      // Expect the popup to have a width of 500px (minimum width is 400px).
      await expect.poll(() => popup.getBoundingBox('content')).toEqual(expect.objectContaining({
        width: 500,
      }));

      // Expect the popup content not to overflow.
      await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
      await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
    });
  });
});
