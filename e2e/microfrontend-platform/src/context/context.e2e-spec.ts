/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { TestingAppPO } from '../testing-app.po';
import { ContextPagePO } from './context-page.po';
import { BrowserOutletPO } from '../browser-outlet/browser-outlet.po';
import { browserErrors, expectMap, seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';
import { browser } from 'protractor';

describe('Context', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should be a noop when looking up a context value outside of an outlet context', async () => {
    await browser.get(`/#/testing-app/${ContextPagePO.pageUrl}`);
    const contextPagePO = new ContextPagePO((): Promise<void> => browser.switchTo().defaultContent() as Promise<void>);
    await expect(contextPagePO.getContext()).toEqual(new Map());
    await expect(browserErrors()).toEqual([]);
  });

  it('should allow setting a context value', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      context: ContextPagePO,
    });

    const outlet = pagePOs.get<BrowserOutletPO>('context:outlet');
    await outlet.outletContextPO.open();
    await outlet.outletContextPO.addContextValue('key', 'value');
    await outlet.outletContextPO.close();

    const contextPagePO = pagePOs.get<ContextPagePO>('context');
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value'));
  });

  it('should allow removing a context value', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      context: ContextPagePO,
    });

    const outlet = pagePOs.get<BrowserOutletPO>('context:outlet');
    await outlet.outletContextPO.open();
    await outlet.outletContextPO.addContextValue('key', 'value');
    await outlet.outletContextPO.close();

    const contextPagePO = pagePOs.get<ContextPagePO>('context');
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value'));

    await outlet.outletContextPO.open();
    await outlet.outletContextPO.removeContextValue('key');
    await outlet.outletContextPO.close();

    await expectMap(contextPagePO.getContext()).not.toContain(new Map().set('key', 'value'));
  });

  it('should allow updating a context value', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      context: ContextPagePO,
    });

    const outlet = pagePOs.get<BrowserOutletPO>('context:outlet');
    await outlet.outletContextPO.open();
    await outlet.outletContextPO.addContextValue('key', 'value-1');
    await outlet.outletContextPO.close();

    const contextPagePO = pagePOs.get<ContextPagePO>('context');
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-1'));

    await outlet.outletContextPO.open();
    await outlet.outletContextPO.addContextValue('key', 'value-2');
    await outlet.outletContextPO.close();

    await expectMap(contextPagePO.getContext()).not.toContain(new Map().set('key', 'value-1'));
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-2'));
  });

  it('should allow setting multiple values to the context of an outlet', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      context: ContextPagePO,
    });

    const outlet = pagePOs.get<BrowserOutletPO>('context:outlet');
    await outlet.outletContextPO.open();
    await outlet.outletContextPO.addContextValue('key1', 'value1');
    await outlet.outletContextPO.addContextValue('key2', 'value2');
    await outlet.outletContextPO.close();

    const contextPagePO = pagePOs.get<ContextPagePO>('context');
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key1', 'value1').set('key2', 'value2'));
  });

  it('should inherit context values from parent contexts', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      root: {
        child1: {
          subChild1: ContextPagePO,
        },
        child2: ContextPagePO,
      },
    });

    const rootOutlet = pagePOs.get<BrowserOutletPO>('root');
    await rootOutlet.outletContextPO.open();
    await rootOutlet.outletContextPO.addContextValue('key', 'root-value');
    await rootOutlet.outletContextPO.close();

    const contextPageSubChild1PO = pagePOs.get<ContextPagePO>('subChild1');
    await expectMap(contextPageSubChild1PO.getContext()).toContain(new Map().set('key', 'root-value'));

    const contextPageChild2PO = pagePOs.get<ContextPagePO>('child2');
    await expectMap(contextPageChild2PO.getContext()).toContain(new Map().set('key', 'root-value'));
  });

  it('should allow overriding context values', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet1: {
        outlet2: {
          context: ContextPagePO,
        },
      },
    });

    const contextPagePO = pagePOs.get<ContextPagePO>('context');

    const outlet1 = pagePOs.get<BrowserOutletPO>('outlet1');
    await outlet1.outletContextPO.open();
    await outlet1.outletContextPO.addContextValue('key', 'value-1');
    await outlet1.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-1'));

    const outlet2 = pagePOs.get<BrowserOutletPO>('outlet2');
    await outlet2.outletContextPO.open();
    await outlet2.outletContextPO.addContextValue('key', 'value-2');
    await outlet2.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-2'));

    const outlet3 = pagePOs.get<BrowserOutletPO>('context:outlet');
    await outlet3.outletContextPO.open();
    await outlet3.outletContextPO.addContextValue('key', 'value-3');
    await outlet3.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-3'));
  });

  it('should reflect the deletion of inherited context values', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet1: {
        outlet2: {
          context: ContextPagePO,
        },
      },
    });

    const contextPagePO = pagePOs.get<ContextPagePO>('context');

    const outlet1 = pagePOs.get<BrowserOutletPO>('outlet1');
    await outlet1.outletContextPO.open();
    await outlet1.outletContextPO.addContextValue('key', 'value-1');
    await outlet1.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-1'));

    const outlet2 = pagePOs.get<BrowserOutletPO>('outlet2');
    await outlet2.outletContextPO.open();
    await outlet2.outletContextPO.addContextValue('key', 'value-2');
    await outlet2.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-2'));

    const outlet3 = pagePOs.get<BrowserOutletPO>('context:outlet');
    await outlet3.outletContextPO.open();
    await outlet3.outletContextPO.addContextValue('key', 'value-3');
    await outlet3.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-3'));

    await outlet3.outletContextPO.open();
    await outlet3.outletContextPO.removeContextValue('key');
    await outlet3.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-2'));

    await outlet2.outletContextPO.open();
    await outlet2.outletContextPO.removeContextValue('key');
    await outlet2.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).toContain(new Map().set('key', 'value-1'));

    await outlet1.outletContextPO.open();
    await outlet1.outletContextPO.removeContextValue('key');
    await outlet1.outletContextPO.close();
    await expectMap(contextPagePO.getContext()).not.toContain(new Map().set('key', 'value-1'));
  });

  it('should not leak context values to sibling contexts', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet1: ContextPagePO,
      outlet2: ContextPagePO,
    });

    const outlet1 = pagePOs.get<BrowserOutletPO>('outlet1:outlet');
    await outlet1.outletContextPO.open();
    await outlet1.outletContextPO.addContextValue('key1', 'value1');
    await outlet1.outletContextPO.close();

    const outlet2 = pagePOs.get<BrowserOutletPO>('outlet2:outlet');
    await outlet2.outletContextPO.open();
    await outlet2.outletContextPO.addContextValue('key2', 'value2');
    await outlet2.outletContextPO.close();

    const contextPage1PO = pagePOs.get<ContextPagePO>('outlet1');
    await expectMap(contextPage1PO.getContext()).toContain(new Map().set('key1', 'value1'));

    const contextPage2PO = pagePOs.get<ContextPagePO>('outlet2');
    await expectMap(contextPage2PO.getContext()).toContain(new Map().set('key2', 'value2'));
  });
});

