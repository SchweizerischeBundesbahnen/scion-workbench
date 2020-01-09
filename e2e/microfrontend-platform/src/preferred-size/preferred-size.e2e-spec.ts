/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { OutletPageObjectMap, TestingAppPO } from '../testing-app.po';
import { browserErrors, seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';
import { OutletRouterPagePO } from '../router-outlet/outlet-router-page.po';
import { RouterOutletPagePO } from '../router-outlet/router-outlet-page.po';
import { PreferredSizePagePO } from './preferred-size-page.po';
import { browser } from 'protractor';
import objectContaining = jasmine.objectContaining;

describe('RouterOutlet', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should be a noop when setting the preferred size outside of an outlet context (e.g. when running as standalone application)', async () => {
    await browser.get(`/#/testing-app/${PreferredSizePagePO.pageUrl}`);
    const preferredSizePO = new PreferredSizePagePO((): Promise<void> => browser.switchTo().defaultContent() as Promise<void>);
    const originalWidth = (await preferredSizePO.getSize()).width;
    const originalHeight = (await preferredSizePO.getSize()).height;

    await preferredSizePO.checkUseElementSize(false);
    await preferredSizePO.enterPreferredWidth('555px');
    await preferredSizePO.enterPreferredHeight('444px');
    await expect(preferredSizePO.getSize()).toEqual(objectContaining({width: originalWidth, height: originalHeight}));
    await expect(browserErrors()).toEqual([]);
  });

  it('should allow resetting the preferred size on the outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    const preferredSizePO = await navigateToPreferredPage(pagePOs);
    const originalWidth = (await routerOutletPO.getRouterOutletSize()).width;
    const originalHeight = (await routerOutletPO.getRouterOutletSize()).height;

    await preferredSizePO.checkUseElementSize(false);
    await preferredSizePO.enterPreferredWidth('555px');
    await preferredSizePO.enterPreferredHeight('444px');
    await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: 444}));

    // Reset the preferred size
    await routerOutletPO.outletSettingsPO.open();
    await routerOutletPO.outletSettingsPO.clickPreferredSizeReset();
    await routerOutletPO.outletSettingsPO.close();
    await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: originalWidth, height: originalHeight}));
  });

  describe('Set the preferred outlet size programmatically', () => {

    it('should adjust the outlet to the preferred size', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);

      await preferredSizePO.checkUseElementSize(false);
      await preferredSizePO.enterPreferredWidth('555px');
      await preferredSizePO.enterPreferredHeight('444px');
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: 444}));
    });

    it('should return to the original layout when the preferred size is reset', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);
      const originalWidth = (await routerOutletPO.getRouterOutletSize()).width;
      const originalHeight = (await routerOutletPO.getRouterOutletSize()).height;

      await preferredSizePO.checkUseElementSize(false);
      await preferredSizePO.enterPreferredWidth('555px');
      await preferredSizePO.enterPreferredHeight('444px');
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: 444}));

      // Reset the preferred size
      await preferredSizePO.clickReset();
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: originalWidth, height: originalHeight}));
    });

    it('should return to the original layout width when unsetting the preferred width', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);
      const originalWidth = (await routerOutletPO.getRouterOutletSize()).width;

      await preferredSizePO.checkUseElementSize(false);
      await preferredSizePO.enterPreferredWidth('555px');
      await preferredSizePO.enterPreferredHeight('444px');
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: 444}));

      // Unset the preferred width
      await preferredSizePO.enterPreferredWidth(null);
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: originalWidth, height: 444}));
    });

    it('should return to the original layout height when unsetting the preferred height', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);
      const originalHeight = (await routerOutletPO.getRouterOutletSize()).height;

      await preferredSizePO.checkUseElementSize(false);
      await preferredSizePO.enterPreferredWidth('555px');
      await preferredSizePO.enterPreferredHeight('444px');
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: 444}));

      // Unset the preferred height
      await preferredSizePO.enterPreferredHeight(null);
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: originalHeight}));
    });
  });

  describe('Use the element\'s size as the preferred outlet size', () => {

    it('should adjust the outlet to the observing element size', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);
      const originalWidth = (await routerOutletPO.getRouterOutletSize()).width;
      const originalHeight = (await routerOutletPO.getRouterOutletSize()).height;

      // Use the content size as the preferred outlet size
      await preferredSizePO.checkUseElementSize(true);
      await preferredSizePO.clickBindElementObservable();
      await expect(routerOutletPO.getRouterOutletSize()).not.toEqual(objectContaining({width: originalWidth, height: originalHeight}));

      // Set the content size as CSS variables
      await preferredSizePO.enterCssWidth('555px');
      await preferredSizePO.enterCssHeight('444px');
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 555, height: 444}));

      // Set the content size as CSS variables
      await preferredSizePO.enterCssWidth('666px');
      await preferredSizePO.enterCssHeight('555px');
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: 666, height: 555}));
    });

    it('should return to the original layout when the observing element is unbound as element size observable', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);
      const originalWidth = (await routerOutletPO.getRouterOutletSize()).width;
      const originalHeight = (await routerOutletPO.getRouterOutletSize()).height;

      // Use the content size as the preferred outlet size
      await preferredSizePO.checkUseElementSize(true);
      await preferredSizePO.clickBindElementObservable();
      await expect(routerOutletPO.getRouterOutletSize()).not.toEqual(objectContaining({width: originalWidth, height: originalHeight}));

      await preferredSizePO.clickUnbindElementObservable();
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: originalWidth, height: originalHeight}));
    });

    it('should return to the original layout when the observing element is unmounted from the DOM', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        router: OutletRouterPagePO,
        testee: RouterOutletPagePO,
      });
      const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
      const preferredSizePO = await navigateToPreferredPage(pagePOs);
      const originalWidth = (await routerOutletPO.getRouterOutletSize()).width;
      const originalHeight = (await routerOutletPO.getRouterOutletSize()).height;

      // Use the content size as the preferred outlet size
      await preferredSizePO.checkUseElementSize(true);
      await preferredSizePO.clickBindElementObservable();
      await expect(routerOutletPO.getRouterOutletSize()).not.toEqual(objectContaining({width: originalWidth, height: originalHeight}));

      await preferredSizePO.clickUnmount();
      await expect(routerOutletPO.getRouterOutletSize()).toEqual(objectContaining({width: originalWidth, height: originalHeight}));
    });
  });

  async function navigateToPreferredPage(pagePOs: OutletPageObjectMap): Promise<PreferredSizePagePO> {
    // Navigate to the 'preferred-size' page
    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${PreferredSizePagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Mount the outlet to show the 'preferred-size' page
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    return new PreferredSizePagePO((): Promise<void> => routerOutletPO.switchToRouterOutletIframe());
  }
});

