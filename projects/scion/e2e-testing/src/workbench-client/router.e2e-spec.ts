/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {RouterPagePO} from './page-object/router-page.po';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {ViewPagePO as WorbenchViewPagePO} from '../workbench/page-object/view-page.po';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {expectPromise} from '../helper/expect-promise-matcher';
import {assertPageToDisplay, consumeBrowserLog} from '../helper/testing.util';
import {$, browser, logging} from 'protractor';
import {WebdriverExecutionContexts} from '../helper/webdriver-execution-context';
import {UnregisterWorkbenchCapabilityPagePO} from './page-object/unregister-workbench-capability-page.po';
import Level = logging.Level;

export declare type HTMLElement = any;

describe('Workbench Router', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should navigate to own public views', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
  });

  it('should navigate to own private views', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
  });

  it('should not navigate to private views of other apps', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as private view in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await expectPromise(routerPagePO.clickNavigate()).toReject(/NullProviderError/);

    // expect testee view not to be opened
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPO = appPO.findView({cssClass: 'testee'});
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });

  it('should navigate to public views of other apps', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view not to be opened
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(4);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
  });

  it('should not navigate to public views of other apps if missing the intention', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view in app 1
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await expectPromise(routerPagePO.clickNavigate()).toReject(/NotQualifiedError/);

    // expect testee view not to be opened
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPO = appPO.findView({cssClass: 'testee'});
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });

  it('should open a view in a new view tab [target=blank]', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
  });

  it('should open a view in the current view tab [target=self]', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate({evalNavigateResponse: false});

    // expect testee view to be opened in the current tab
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
    await expect(await routerPagePO.isDisplayed()).toBe(false);
    await expect(testeeViewPagePO.viewId).toEqual(routerPagePO.viewId);
  });

  it('should, by default, navigate in the current view tab if no target is specified', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.clickNavigate({evalNavigateResponse: false});

    // expect testee view to be opened in the current tab
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
    await expect(await routerPagePO.isDisplayed()).toBe(false);
    await expect(testeeViewPagePO.viewId).toEqual(routerPagePO.viewId);
  });

  it('should open all views if multiple views match the qualifier', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app-1
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 2',
        cssClass: 'testee-1',
      },
    });

    // register testee view in app-2
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 1',
        cssClass: 'testee-2',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab1PO = appPO.findViewTab({cssClass: 'testee-1'});
    const testeeViewTab2PO = appPO.findViewTab({cssClass: 'testee-2'});
    const testeeViewPage1PO = new ViewPagePO(await testeeViewTab1PO.getViewId());
    const testeeViewPage2PO = new ViewPagePO(await testeeViewTab2PO.getViewId());
    await expect(await appPO.getViewTabCount()).toEqual(6);
    await expect(await testeeViewTab1PO.isPresent()).toBe(true);
    await expect(await testeeViewTab2PO.isPresent()).toBe(true);
    await expect(await testeeViewTab1PO.isActive() || await testeeViewTab2PO.isActive()).toBe(true);
    await expect(await testeeViewPage1PO.viewPO.isPresent() || await testeeViewPage2PO.viewPO.isPresent()).toBe(true);
    await expect(await testeeViewPage1PO.viewPO.isPresent()).not.toEqual(await testeeViewPage2PO.viewPO.isPresent());
    await expect(await testeeViewPage1PO.isDisplayed() || await testeeViewPage2PO.isDisplayed()).toBe(true);
    await expect(await testeeViewPage1PO.isDisplayed()).not.toEqual(await testeeViewPage2PO.isDisplayed());
  });

  it('should reuse the same app instance when navigating between views of an app in the same view tab', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view/view1',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee-1'});
    const testeeViewId = await testeeViewTabPO.getViewId();

    const componentInstanceIds = new Set<string>();

    // capture the app instance id
    const testeeViewPagePO = new ViewPagePO(testeeViewId);
    const appInstanceId = await testeeViewPagePO.getAppInstanceId();
    await componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId());

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();
    await testeeViewPagePO.viewTabPO.activate();

    // expect the correct view to display
    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({component: 'testee-2'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId()).size).toEqual(2);

    // navigate to the testee-1 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();
    await testeeViewPagePO.viewTabPO.activate();

    // expect the correct view to display
    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({component: 'testee-1'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId()).size).toEqual(3);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();
    await testeeViewPagePO.viewTabPO.activate();

    // expect the correct view to display
    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({component: 'testee-2'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId()).size).toEqual(4);
  });

  it('should not open views that have no microfrontend path declared', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', path: 'undefined'},
      properties: {
        path: '<undefined>',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', path: 'null'},
      properties: {
        path: '<null>',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '<empty>',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view with `undefined` as path
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee', path: 'undefined'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    // expect the view not to open
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect((await consumeBrowserLog(Level.SEVERE, /ViewProviderError/))).not.toEqual([]);

    // navigate to the view with `null` as path
    await routerPagePO.enterQualifier({component: 'testee', path: 'null'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect((await consumeBrowserLog(Level.SEVERE, /ViewProviderError/))).not.toEqual([]);

    // navigate to the view with `empty` as path
    await routerPagePO.enterQualifier({component: 'testee', path: 'empty'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(true);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(3);
    const testeeViewId = await testeeViewTabPO.getViewId();
    await expect((await consumeBrowserLog(Level.SEVERE, /ViewError/))).toEqual([]);

    await WebdriverExecutionContexts.switchToIframe(testeeViewId);
    await assertPageToDisplay($('app-root'));
  });

  it('should not open views if missing the view provider', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(3);

    // reload the app; after the reload, the view is not registered anymore, as registered dynamically at runtime
    await appPO.reload();

    // expect the view not to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect((await consumeBrowserLog(Level.WARNING, /NullViewError/))).not.toEqual([]);
  });

  it('should open views as contained in the URL on initial navigation', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open 2 views
    const viewPage1PO = await ViewPagePO.openInNewTab('app1');
    const viewPage2PO = await ViewPagePO.openInNewTab('app2');

    // reload the app
    await appPO.reload();

    // expect the views to be present
    await expect(await appPO.getViewTabCount()).toEqual(2);

    await expect(await viewPage1PO.viewTabPO.isActive()).toBe(false);
    await expect(await viewPage1PO.isPresent()).toBe(true);
    await expect(await viewPage1PO.isDisplayed()).toBe(false);
    await expect(await viewPage2PO.viewTabPO.isActive()).toBe(true);
    await expect(await viewPage2PO.isDisplayed()).toBe(true);
  });

  it('should load microfrontends of inactive views on initial navigation', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to the view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterParams({initialTitle: 'INITIAL TITLE 1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const viewPage1PO = new ViewPagePO(await appPO.findActiveViewTab().getViewId());

    // navigate to the view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterParams({initialTitle: 'INITIAL TITLE 2'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const viewPage2PO = new ViewPagePO(await appPO.findActiveViewTab().getViewId());

    // reload the app
    await appPO.reload();

    // expect views to be present
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await viewPage1PO.viewTabPO.isActive()).toBe(false);
    await expect(await viewPage1PO.isPresent()).toBe(true);
    await expect(await viewPage1PO.isDisplayed()).toBe(false);
    await expect(await viewPage2PO.viewTabPO.isActive()).toBe(true);
    await expect(await viewPage2PO.isDisplayed()).toBe(true);

    // expect view microfrontends to have set their initial title
    await expect(await viewPage1PO.viewTabPO.getTitle()).toEqual('INITIAL TITLE 1');
    await expect(await viewPage2PO.viewTabPO.getTitle()).toEqual('INITIAL TITLE 2');
  });

  it('should set view properties upon initial view tab navigation', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE',
        heading: 'VIEW HEADING',
        cssClass: ['testee', 'class-1', 'class-2'],
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect view properties to be set
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(jasmine.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  it('should set view properties upon initial view tab navigation when replacing an existing workbench view', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE',
        heading: 'VIEW HEADING',
        cssClass: ['testee', 'class-1', 'class-2'],
      },
    });

    // open workbench view
    const viewPagePO = await WorbenchViewPagePO.openInNewTab();
    await viewPagePO.enterTitle('WORKBENCH VIEW TITLE');
    await expect(await viewPagePO.viewTabPO.getTitle()).toEqual('WORKBENCH VIEW TITLE');

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(viewPagePO.viewId);
    await routerPagePO.clickNavigate();

    // expect view properties to be set
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(jasmine.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  it('should set view properties when navigating in the current view tab', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE 1',
        heading: 'VIEW HEADING 1',
        closable: true,
        cssClass: ['testee-1', 'class-1'],
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE 2',
        heading: 'VIEW HEADING 2',
        closable: false,
        cssClass: ['testee-2', 'class-2'],
      },
    });

    // navigate to the testee-1 view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.findViewTab({cssClass: 'testee-1'}).getViewId();
    const testeeViewTabPO = appPO.findViewTab({viewId: testeeViewId});

    // expect view properties to be set
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE 1');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING 1');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(jasmine.arrayContaining(['testee-1', 'class-1']));
    await expect(await testeeViewTabPO.isClosable()).toBe(true);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect view properties to be set
    await testeeViewTabPO.activate();
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE 2');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING 2');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(jasmine.arrayContaining(['testee-2', 'class-2']));
    await expect(await testeeViewTabPO.isClosable()).toBe(false);
  });

  it('should not set view properties when performing self navigation, e.g., when updating view params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      optionalParams: ['param1'],
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE',
        heading: 'VIEW HEADING',
        cssClass: ['testee', 'class-1'],
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.findViewTab({cssClass: 'testee'}).getViewId();
    const testeeViewTabPO = appPO.findViewTab({viewId: testeeViewId});
    const viewPagePO = new ViewPagePO(testeeViewId);

    // expect view properties to be set
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(jasmine.arrayContaining(['testee', 'class-1']));

    // update view properties
    await viewPagePO.enterTitle('UPDATED VIEW TITLE');
    await viewPagePO.enterHeading('UPDATED VIEW HEADING');

    // perform self navigation by setting view params
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.enterParams({param1: 'PARAM 1'});
    await routerPagePO.clickNavigate();

    // expect view properties not be updated
    await testeeViewTabPO.activate();
    await expect(await testeeViewTabPO.getTitle()).toEqual('UPDATED VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('UPDATED VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(jasmine.arrayContaining(['testee', 'class-1']));
    await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({param1: 'PARAM 1'}));
  });

  it('should not unset the dirty state when performing self navigation, e.g., when updating view params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      optionalParams: ['param1'],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.findViewTab({cssClass: 'testee'}).getViewId();
    const testeeViewTabPO = appPO.findViewTab({viewId: testeeViewId});
    const viewPagePO = new ViewPagePO(testeeViewId);

    // mark the view dirty
    await viewPagePO.markDirty();

    // perform self navigation by setting view params
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.enterParams({param1: 'PARAM 1'});
    await routerPagePO.clickNavigate();

    // expect the view to still be dirty
    await testeeViewTabPO.activate();
    await expect(await testeeViewTabPO.isDirty()).toBe(true);
  });

  it('should make the view pristine when navigating to another view in the current view tab', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'testee-1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'testee-2',
        cssClass: 'testee-2',
      },
    });

    // navigate to the testee-1 view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.findViewTab({cssClass: 'testee-1'}).getViewId();
    const testeeViewTabPO = appPO.findViewTab({viewId: testeeViewId});
    const viewPagePO = new ViewPagePO(testeeViewId);

    // mark the view dirty
    await viewPagePO.markDirty();
    await expect(await testeeViewTabPO.isDirty()).toBe(true);

    // navigate to another view in the testee view tab
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect the view to be pristine
    await testeeViewTabPO.activate();
    await expect(await testeeViewTabPO.isDirty()).toBe(false);
  });

  it('should close the view when removing the capability', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    const capabilityId = await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.isDisplayed()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // unregister the capability
    const unregisterCapabilityPagePO = await UnregisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await unregisterCapabilityPagePO.unregisterCapability(capabilityId);
    await unregisterCapabilityPagePO.viewTabPO.close();

    // expect the view not to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect((await consumeBrowserLog(Level.WARNING, /NullViewError/))).not.toEqual([]);
  });

  it('should allow closing a single view', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.getViewTabCount()).toEqual(2);

    // close the view via router
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.getViewTabCount()).toEqual(1);
  });

  it('should allow closing all views of the same qualifier', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // navigate to the view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.getViewTabCount()).toEqual(3);

    // close the view via router
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.getViewTabCount()).toEqual(1);
  });

  /**
   * When having loaded microfrontend 1 of an app, and when then navigating to microfrontend 2 of that app, and when then self-navigating
   * in microfrontend-2 upon its construction, the router should not navigate back to microfrontend 1.
   */
  it('should not navigate back to the previous microfrontend when self-navigating upon microfrontend construction', async () => {
    await appPO.navigateTo({microfrontendSupport: true, simulateSlowCapabilityLookup: true});

    // register microfrontend-1 view
    const registerCapabilityApp1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-1'},
      properties: {
        path: 'test-view/view1',
        title: 'Microfrontend 1',
        cssClass: 'microfrontend-1',
      },
    });

    // register microfrontend-2 view
    await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Microfrontend 2',
        cssClass: 'microfrontend-2',
      },
    });

    // navigate to microfrontend-1 view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'microfrontend-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // Construct the PO to interact with the opened view
    const viewId = await appPO.findActiveViewTab().getViewId();
    const viewTabPO = appPO.findViewTab({viewId});
    const viewPagePO = new ViewPagePO(viewId);

    // Assert the correct capability to be loaded
    await expect(await viewPagePO.getPath()).toEqual('/test-view/view1');

    // navigate to microfrontend-2 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'microfrontend-2'});
    await routerPagePO.enterSelfViewId(viewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();

    // self-navigate in microfrontend-2 view
    await viewTabPO.activate();
    await viewPagePO.navigateSelf({param: 'PARAM'});
    await browser.sleep(2000);
    await expect(await viewPagePO.getPath()).toEqual('/test-view/view2');
  }, 30000 /* simulateSlowCapabilityLookup */);

  it('should propagate navigation error back to caller if navigation fails', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId('view.99'); // view does not exist
    await expectPromise(routerPagePO.clickNavigate()).toReject(/\[WorkbenchRouterError] Target view outlet not found: view\.99\./);

    // expect testee view not to be opened
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPO = appPO.findView({cssClass: 'testee'});
    await expect(await appPO.getViewTabCount()).toEqual(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });
});
