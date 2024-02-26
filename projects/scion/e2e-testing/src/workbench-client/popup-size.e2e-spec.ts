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
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

test.describe('Workbench Popup', () => {

  test.describe('Initial Popup Size', () => {

    test('should size the popup as configured in the popup capability', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {test: 'popup'},
        properties: {
          path: 'test-popup',
          size: {
            minWidth: '345px',
            width: '350px',
            maxWidth: '355px',
            minHeight: '445px',
            height: '450px',
            maxHeight: '455px',
          },
        },
      });

      // open the popup
      const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
      await popupOpenerPage.enterQualifier({test: 'popup'});
      await popupOpenerPage.enterCssClass('testee');
      await popupOpenerPage.open();

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getComputedStyle()).toEqual(expect.objectContaining({
        minWidth: '345px',
        width: '350px',
        maxWidth: '355px',
        minHeight: '445px',
        height: '450px',
        maxHeight: '455px',
      } satisfies Partial<CSSStyleDeclaration>));

      await expect.poll(() => popup.getBoundingBox({box: 'content-box'})).toEqual(expect.objectContaining({
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
    test('should size the popup as configured in the popup capability (insideAngularZone)', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'popup',
        qualifier: {test: 'popup'},
        properties: {
          path: 'test-popup',
          cssClass: 'testee',
          pinToStartPage: true,
          size: {
            width: '350px',
            height: '450px',
          },
        },
      });

      // open the popup directly from the start page
      const startPage = await appPO.openNewViewTab();
      await startPage.clickTestCapability('testee', 'app1');

      const popup = appPO.popup({cssClass: 'testee'});

      await expect.poll(() => popup.getBoundingBox({box: 'content-box'})).toEqual(expect.objectContaining({
        width: 350,
        height: 450,
      }));
    });
  });

  test('should adapt its size to the microfrontend', async ({appPO, microfrontendNavigator}) => {
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

    await popupPage.enterComponentSize({
      width: '600px',
      height: '800px',
    });

    await expect.poll(() => popup.getBoundingBox({box: 'content-box'})).toEqual(expect.objectContaining({
      width: 600,
      height: 800,
    }));
    await expect.poll(() => popup.hasVerticalOverflow()).toBe(false);
    await expect.poll(() => popup.hasHorizontalOverflow()).toBe(false);
  });
});
