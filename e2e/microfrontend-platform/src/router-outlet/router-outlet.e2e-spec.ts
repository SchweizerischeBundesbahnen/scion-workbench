/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { expectMap, seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';
import { TestingAppPO } from '../testing-app.po';
import { browser } from 'protractor';
import { OutletRouterPagePO } from './outlet-router-page.po';
import { ContextPagePO } from '../context/context-page.po';
import { RouterOutletPagePO } from './router-outlet-page.po';
import { BrowserOutletPO } from '../browser-outlet.po';
import { Microfrontend1PagePO } from '../microfrontend-1-page.po';
import { Microfrontend2PagePO } from '../microfrontend-2-page.po';
import { OutletActivationLogEntry } from './router-outlet-panel.po';

describe('RouterOutlet', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should allow navigating within the outlet (self navigation)', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Load the outlet router into the router outlet under test in order to self navigate inside the router outlet
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${OutletRouterPagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Name the router outlet under test
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to another site (microfrontend-1) inside the outlet under test
    const outletRouterRouterPO = new OutletRouterPagePO((): Promise<void> => routerOutletPO.switchToRouterOutletIframe());
    await outletRouterRouterPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`); // do not specify a target outlet
    await outletRouterRouterPO.clickNavigate();

    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(await getPageUrl({port: 4200, path: Microfrontend1PagePO.pageUrl}));
  });

  it('should not reload the app when navigating within the app in the same outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Instrument the router outlet
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the microfrontend-1 page (app-4200)
    const microfrontend_1_app4200_pageUrl = await getPageUrl({port: 4200, path: Microfrontend1PagePO.pageUrl});
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(microfrontend_1_app4200_pageUrl);
    await routerPO.clickNavigate();

    // Capture the app instance id of the loaded microfrontend (app-4200)
    const microfrontendPO = new Microfrontend1PagePO((): Promise<void> => routerOutletPO.switchToRouterOutletIframe());

    const app4200InstanceId = await microfrontendPO.getAppInstanceId();
    const componentInstanceId = await microfrontendPO.getComponentInstanceId();

    // Navigate to the microfrontend-2 page of the same app (app-4200)
    const microfrontend_2_app4200_pageUrl = await getPageUrl({port: 4200, path: Microfrontend2PagePO.pageUrl});
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(microfrontend_2_app4200_pageUrl);
    await routerPO.clickNavigate();

    // Verify that the app instance id has not changed, meaning the app did not reload
    await expect(microfrontendPO.getAppInstanceId()).toEqual(app4200InstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).not.toEqual(componentInstanceId);

    // Navigate back to the microfrontend-1 page of the same app (app-4200)
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(microfrontend_1_app4200_pageUrl);
    await routerPO.clickNavigate();

    // Verify that the app instance id has not changed, meaning the app did not reload
    await expect(microfrontendPO.getAppInstanceId()).toEqual(app4200InstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).not.toEqual(componentInstanceId);
    // Navigate to the microfrontend-1 page of another app (app-4201)
    const microfrontend_1_app4201_pageUrl = await getPageUrl({port: 4201, path: Microfrontend1PagePO.pageUrl});
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(microfrontend_1_app4201_pageUrl);
    await routerPO.clickNavigate();

    // Verify that the app instance id did change because loaded another app
    await expect(microfrontendPO.getAppInstanceId()).not.toEqual(app4200InstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).not.toEqual(componentInstanceId);

    // Navigate back to the microfrontend-1 page of the previous app (app-4200)
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(microfrontend_1_app4200_pageUrl);
    await routerPO.clickNavigate();

    // Verify that the app instance id did change because loaded another app
    await expect(microfrontendPO.getAppInstanceId()).not.toEqual(app4200InstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).not.toEqual(componentInstanceId);
  });

  it('should not reload the app when updating URL params or the URL fragment', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Instrument the router outlet
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the microfrontend-1 page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Capture the instance ids of the loaded microfrontend
    const microfrontendPO = new Microfrontend1PagePO((): Promise<void> => routerOutletPO.switchToRouterOutletIframe());
    const microfrontendComponentInstanceId = await microfrontendPO.getComponentInstanceId();
    const microfrontendAppInstanceId = await microfrontendPO.getAppInstanceId();

    await expect(microfrontendPO.getQueryParams()).toEqual(new Map());
    await expect(microfrontendPO.getMatrixParams()).toEqual(new Map());
    await expect(microfrontendPO.getFragment()).toEqual('');

    // Navigate to the same microfrontend with some query params set
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}?param1=value1&param2=value2`);
    await routerPO.clickNavigate();

    // Verify params and fragment and that the app did not reload
    await expect(microfrontendPO.getAppInstanceId()).toEqual(microfrontendAppInstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).toEqual(microfrontendComponentInstanceId);
    await expect(microfrontendPO.getQueryParams()).toEqual(new Map().set('param1', 'value1').set('param2', 'value2'));
    await expect(microfrontendPO.getMatrixParams()).toEqual(new Map());
    await expect(microfrontendPO.getFragment()).toEqual('');

    // Navigate to the same microfrontend with some matrix params set
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl};param1=value1;param2=value2`);
    await routerPO.clickNavigate();

    // Verify params and fragment and that the app did not reload
    await expect(microfrontendPO.getAppInstanceId()).toEqual(microfrontendAppInstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).toEqual(microfrontendComponentInstanceId);
    await expect(microfrontendPO.getQueryParams()).toEqual(new Map());
    await expect(microfrontendPO.getMatrixParams()).toEqual(new Map().set('param1', 'value1').set('param2', 'value2'));
    await expect(microfrontendPO.getFragment()).toEqual('');

    // Navigate to the same microfrontend with the fragment set
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}#fragment`);
    await routerPO.clickNavigate();

    // Verify params and fragment and that the app did not reload
    await expect(microfrontendPO.getAppInstanceId()).toEqual(microfrontendAppInstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).toEqual(microfrontendComponentInstanceId);
    await expect(microfrontendPO.getQueryParams()).toEqual(new Map());
    await expect(microfrontendPO.getMatrixParams()).toEqual(new Map());
    await expect(microfrontendPO.getFragment()).toEqual('fragment');

    // Navigate to the same microfrontend with params and fragment set
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl};matrixParam1=value1;matrixParam2=value2?queryParam1=value1&queryParam2=value2#fragment`);
    await routerPO.clickNavigate();

    // Verify params and fragment and that the app did not reload
    await expect(microfrontendPO.getAppInstanceId()).toEqual(microfrontendAppInstanceId);
    await expect(microfrontendPO.getComponentInstanceId()).toEqual(microfrontendComponentInstanceId);
    await expect(microfrontendPO.getQueryParams()).toEqual(new Map().set('queryParam1', 'value1').set('queryParam2', 'value2'));
    await expect(microfrontendPO.getMatrixParams()).toEqual(new Map().set('matrixParam1', 'value1').set('matrixParam2', 'value2'));
    await expect(microfrontendPO.getFragment()).toEqual('fragment');
  });

  it('should allow looking up the outlet context in a router outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Navigate to the page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${ContextPagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Instrument the router outlet
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Verify the outlet context to be set
    const contextPO = new ContextPagePO((): Promise<void> => routerOutletPO.switchToRouterOutletIframe());
    await expectMap(contextPO.getContext()).toContain(new Map().set('ɵOUTLET', {name: 'microfrontend-outlet'}));  // OUTLET_CONTEXT constant cannot be accessed in protractor test
  });

  it('should show the requested page when mounting the outlet after navigation has taken place', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: 'about:blank',
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const outletPO = pagePOs.get<BrowserOutletPO>('testee');

    // Navigate to the page (before the outlet is mounted)
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Mount the router outlet
    await outletPO.enterUrl(`../${RouterOutletPagePO.pageUrl}`);
    const routerOutletPO = new RouterOutletPagePO((): Promise<void> => outletPO.switchToOutletIframe());
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
  });

  it('should show the requested page when setting the outlet name after navigation has taken place', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Navigate to the page (before the outlet is mounted)
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Set the outlet name
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
  });

  it('should show the requested page when an outlet name is set for which a previous navigation has taken place', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Navigate to the page (before the outlet is mounted)
    await routerPO.enterOutletName('microfrontend-outlet-1');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();
    await routerPO.enterOutletName('microfrontend-outlet-2');
    await routerPO.enterUrl(`../${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Set the outlet name
    await routerOutletPO.enterOutletName('microfrontend-outlet-1');
    await routerOutletPO.clickApply();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));

    // Change the outlet name to some name for which a previous routing has taken place
    await routerOutletPO.enterOutletName('microfrontend-outlet-2');
    await routerOutletPO.clickApply();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200}));
  });

  it('should show a blank page when an outlet name is set for which no previous navigation has been done yet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');

    // Navigate to the page (before the outlet is mounted)
    await routerPO.enterOutletName('microfrontend-outlet-1');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Set the outlet name
    await routerOutletPO.enterOutletName('microfrontend-outlet-1');
    await routerOutletPO.clickApply();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));

    // Change the outlet name to some name for which a previous routing has taken place
    await routerOutletPO.enterOutletName('microfrontend-outlet-2');
    await routerOutletPO.clickApply();

    // Verify that an empty page is displayed
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual('about:blank');
  });

  it('should show a blank page when clearing the outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();
    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));

    // Navigate to the `null` page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(null);
    await routerPO.clickNavigate();
    // Verify that an empty page is displayed
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual('about:blank');
  });

  it('should show the requested page in the router outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
      otherOutlet: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    const otherRouterOutletPO = pagePOs.get<RouterOutletPagePO>('otherOutlet');
    await otherRouterOutletPO.enterOutletName('other-outlet');
    await otherRouterOutletPO.clickApply();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();
    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
    await expect(otherRouterOutletPO.getRouterOutletUrl()).toEqual('about:blank');

    // Navigate to the 'microfrontend-2' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();
    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200}));
    await expect(otherRouterOutletPO.getRouterOutletUrl()).toEqual('about:blank');
  });

  it('should show the requested page in all outlets having set the specified outlet name', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      outlet1: {
        routerOutlet1: RouterOutletPagePO,
        routerOutlet2: RouterOutletPagePO,
        outlet2: {
          routerOutlet3: RouterOutletPagePO,
        },
      },
      routerOutlet4: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutlet1PO = pagePOs.get<RouterOutletPagePO>('routerOutlet1');
    await routerOutlet1PO.enterOutletName('microfrontend-outlet');
    await routerOutlet1PO.clickApply();

    const routerOutlet2PO = pagePOs.get<RouterOutletPagePO>('routerOutlet2');
    await routerOutlet2PO.enterOutletName('microfrontend-outlet');
    await routerOutlet2PO.clickApply();

    const routerOutlet3PO = pagePOs.get<RouterOutletPagePO>('routerOutlet3');
    await routerOutlet3PO.enterOutletName('microfrontend-outlet');
    await routerOutlet3PO.clickApply();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify that all outlets show 'microfrontend-1' page
    await expect(routerOutlet1PO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
    await expect(routerOutlet2PO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
    await expect(routerOutlet3PO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
  });

  it('should mount a router outlet as primary outlet if not specifying an outlet name', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');

    // Navigate to the 'microfrontend-1' page in the primary outlet
    await routerPO.enterOutletName('primary'); // PRIMARY_OUTLET constant cannot be accessed in protractor test
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify that navigation was successful
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
  });

  it('should show the requested page in the primary outlet if not in the context of an outlet and if no target outlet is specified', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const outletPO = pagePOs.get<BrowserOutletPO>('router:outlet');
    await outletPO.outletContextPO.open();
    await outletPO.outletContextPO.removeContextValue('ɵOUTLET'); // OUTLET_CONTEXT constant cannot be accessed in protractor test
    await outletPO.outletContextPO.close();

    // Navigate to the 'microfrontend-1' page in the primary outlet
    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify that navigation was successful
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
  });

  it('should not create a browser history entry when navigating', async () => {
    // Create a browser history entry for '/#/testing-app/microfrontend-1'
    await browser.get('/#/testing-app/microfrontend-1');
    // Create a browser history entry for '/#/testing-app/microfrontend-2'
    await browser.get('/#/testing-app/microfrontend-2');
    // Create a browser history entry for '/#/testing-app/browser-outlets'
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();
    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));

    // Navigate to the 'microfrontend-2' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();
    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200}));

    // Navigate back in the browser
    await browser.navigate().back();

    // Verify to navigate back to page 'microfrontend-2'
    await expect(browser.getCurrentUrl()).toEqual(getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200}));
  });

  it('should allow relative navigation', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));

    // Navigate to the 'microfrontend-2' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`./../../testing-app/${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`./../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));

    // Navigate to the 'microfrontend-2' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`/testing-app/${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200}));

    // Navigate to the 'microfrontend-2' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl('.');
    await routerPO.clickNavigate();

    // Verify that navigation was successful
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: OutletRouterPagePO.pageUrl, port: 4200}));
  });

  it('should emit outlet activate and deactivate events on navigation', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify the navigation and the emitted activation events
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200}));
    await routerOutletPO.outletPanelPO.open();
    await expect(routerOutletPO.outletPanelPO.getActivationLog()).toEqual([
      jasmine.objectContaining({type: 'deactivate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
    ]);

    await routerOutletPO.outletPanelPO.clearActivationLog();
    await routerOutletPO.outletPanelPO.close();

    // Navigate to the 'microfrontend-2' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Verify the emitted events
    await expect(routerOutletPO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200}));
    await routerOutletPO.outletPanelPO.open();
    await expect(routerOutletPO.outletPanelPO.getActivationLog()).toEqual([
      jasmine.objectContaining({type: 'deactivate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: await getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
    ]);
  });

  it('should emit an activation event when mounting the outlet after navigation has taken place', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    // Navigate to the 'microfrontend-1' page
    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Mount the outlet
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Verify the emitted events
    await routerOutletPO.outletPanelPO.open();
    await expect(routerOutletPO.outletPanelPO.getActivationLog()).toEqual([
      jasmine.objectContaining({type: 'deactivate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
    ]);
  });

  it('should emit an activation event for the page \'about:blank\' when clearing the outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet');
    await routerOutletPO.clickApply();

    // Navigate to the 'microfrontend-1' page
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Clear the outlet
    await routerPO.enterOutletName('microfrontend-outlet');
    await routerPO.enterUrl(null);
    await routerPO.clickNavigate();

    // Verify the emitted events
    await routerOutletPO.outletPanelPO.open();
    await expect(routerOutletPO.outletPanelPO.getActivationLog()).toEqual([
      jasmine.objectContaining({type: 'deactivate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'deactivate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
    ]);
  });

  it('should load the page \'about:blank\' when changing the outlet name before the new target page is displayed', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');

    // Navigate to the 'microfrontend-1' page in the outlet 'microfrontend-outlet-1'
    await routerPO.enterOutletName('microfrontend-outlet-1');
    await routerPO.enterUrl(`../${Microfrontend1PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Navigate to the 'microfrontend-2' page in the outlet 'microfrontend-outlet-2'
    await routerPO.enterOutletName('microfrontend-outlet-2');
    await routerPO.enterUrl(`../${Microfrontend2PagePO.pageUrl}`);
    await routerPO.clickNavigate();

    // Mount the outlet under the name 'microfrontend-outlet-1'
    const routerOutletPO = pagePOs.get<RouterOutletPagePO>('testee');
    await routerOutletPO.enterOutletName('microfrontend-outlet-1');
    await routerOutletPO.clickApply();

    // Verify the emitted events
    await routerOutletPO.outletPanelPO.open();
    await expect(routerOutletPO.outletPanelPO.getActivationLog()).toEqual([
      jasmine.objectContaining({type: 'deactivate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
    ]);
    await routerOutletPO.outletPanelPO.clearActivationLog();
    await routerOutletPO.outletPanelPO.close();

    // Mount the outlet under the name 'microfrontend-outlet-2'
    await routerOutletPO.enterOutletName('microfrontend-outlet-2');
    await routerOutletPO.clickApply();

    // Verify the emitted events
    await routerOutletPO.outletPanelPO.open();
    await expect(routerOutletPO.outletPanelPO.getActivationLog()).toEqual([
      jasmine.objectContaining({type: 'deactivate', url: await getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'deactivate', url: 'about:blank'} as Partial<OutletActivationLogEntry>),
      jasmine.objectContaining({type: 'activate', url: await getPageUrl({path: Microfrontend2PagePO.pageUrl, port: 4200})} as Partial<OutletActivationLogEntry>),
    ]);
  });

  it('should allow nesting outlets', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const testeeOutletPO = pagePOs.get<BrowserOutletPO>('testee:outlet');

    // Load a nested <sci-router-outlet> into the <sci-router-outlet>
    const routerOutletL1PO = new RouterOutletPagePO((): Promise<void> => testeeOutletPO.switchToOutletIframe());
    await routerOutletL1PO.enterOutletName('nested-router-outlet-1');
    await routerOutletL1PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-1');
    await routerPO.enterUrl(await getPageUrl({port: 4201, path: RouterOutletPagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL1PO.getRouterOutletUrl()).toEqual(getPageUrl({path: RouterOutletPagePO.pageUrl, port: 4201}));

    // Load another nested <sci-router-outlet> into the <sci-router-outlet>
    const routerOutletL2PO = new RouterOutletPagePO((): Promise<void> => routerOutletL1PO.switchToRouterOutletIframe());
    await routerOutletL2PO.enterOutletName('nested-router-outlet-2');
    await routerOutletL2PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-2');
    await routerPO.enterUrl(await getPageUrl({port: 4202, path: RouterOutletPagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL2PO.getRouterOutletUrl()).toEqual(getPageUrl({path: RouterOutletPagePO.pageUrl, port: 4202}));

    // Load another nested <sci-router-outlet> into the <sci-router-outlet> but showing another app
    const routerOutletL3PO = new RouterOutletPagePO((): Promise<void> => routerOutletL2PO.switchToRouterOutletIframe());
    await routerOutletL3PO.enterOutletName('nested-router-outlet-3');
    await routerOutletL3PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-3');
    await routerPO.enterUrl(await getPageUrl({port: 4203, path: Microfrontend1PagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL3PO.getRouterOutletUrl()).toEqual(getPageUrl({path: Microfrontend1PagePO.pageUrl, port: 4203}));
  });

  it('should work around Chrome bug when displaying nested outlets of the same app (see method `RouterOutletUrlAssigner#patchUrl` for more detail about the problem)', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      router: OutletRouterPagePO,
      testee: RouterOutletPagePO,
    });

    const routerPO = pagePOs.get<OutletRouterPagePO>('router');
    const testeeOutletPO = pagePOs.get<BrowserOutletPO>('testee:outlet');

    // Load a nested <sci-router-outlet> into the <sci-router-outlet>
    const routerOutletL1PO = new RouterOutletPagePO((): Promise<void> => testeeOutletPO.switchToOutletIframe());
    await routerOutletL1PO.enterOutletName('nested-router-outlet-1');
    await routerOutletL1PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-1');
    await routerPO.enterUrl(await getPageUrl({port: 4200, path: RouterOutletPagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL1PO.getRouterOutletUrl()).toEqual(getPageUrl({path: RouterOutletPagePO.pageUrl, port: 4200}));

    // Load another nested <sci-router-outlet> into the <sci-router-outlet>
    const routerOutletL2PO = new RouterOutletPagePO((): Promise<void> => routerOutletL1PO.switchToRouterOutletIframe());
    await routerOutletL2PO.enterOutletName('nested-router-outlet-2');
    await routerOutletL2PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-2');
    await routerPO.enterUrl(await getPageUrl({port: 4200, path: RouterOutletPagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL2PO.getRouterOutletUrl()).toEqual(getPageUrl({path: RouterOutletPagePO.pageUrl, port: 4200}));

    // Load another nested <sci-router-outlet> into the <sci-router-outlet> but showing another app
    const routerOutletL3PO = new RouterOutletPagePO((): Promise<void> => routerOutletL2PO.switchToRouterOutletIframe());
    await routerOutletL3PO.enterOutletName('nested-router-outlet-3');
    await routerOutletL3PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-3');
    await routerPO.enterUrl(await getPageUrl({port: 4201, path: RouterOutletPagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL3PO.getRouterOutletUrl()).toEqual(getPageUrl({path: RouterOutletPagePO.pageUrl, port: 4201}));

    // Load another nested <sci-router-outlet> into the <sci-router-outlet> but showing another app
    const routerOutletL4PO = new RouterOutletPagePO((): Promise<void> => routerOutletL3PO.switchToRouterOutletIframe());
    await routerOutletL4PO.enterOutletName('nested-router-outlet-4');
    await routerOutletL4PO.clickApply();
    await routerPO.enterOutletName('nested-router-outlet-4');
    await routerPO.enterUrl(await getPageUrl({port: 4200, path: RouterOutletPagePO.pageUrl}));
    await routerPO.clickNavigate();
    // Verify that the nested <sci-router-outlet> is displayed
    await expect(routerOutletL4PO.getRouterOutletUrl()).toEqual(getPageUrl({path: RouterOutletPagePO.pageUrl, port: 4200}));
  });
});

async function getPageUrl(parts: { port: number, path: string }): Promise<string> {
  const origin = new URL(await browser.getCurrentUrl()).origin;
  const url = new URL(`/#/testing-app/${parts.path}`, origin);
  url.port = `${parts.port}`;
  return url.toString();
}

