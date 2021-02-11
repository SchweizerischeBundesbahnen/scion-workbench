/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from '../app.po';
import { RouterPagePO } from './page-object/router-page.po';
import { installSeleniumWebDriverClickFix } from '../helper/selenium-webdriver-click-fix';
import { RegisterWorkbenchCapabilityPagePO } from './page-object/register-workbench-capability-page.po';
import { ViewPagePO } from './page-object/view-page.po';
import { Key, logging } from 'protractor';
import { RegisterWorkbenchIntentionPagePO } from './page-object/register-workbench-intention-page.po';
import { confirmAlert, consumeBrowserLog, dismissAlert } from '../helper/testing.util';
import Level = logging.Level;

export declare type HTMLElement = any;

describe('Workbench View', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should complete view Observables on navigation', async () => {
    // Observable completion expectations:
    // - should complete params$, capability$, active$ observables only when navigating to a view capability of a different app
    // - should complete title$, heading$, dirty$ and closable$ observables when navigating to a different view capability
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view in app1
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

    // register testee-2 view in app1
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view in app2
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // allow app1 to open testee-3 view
    const registerIntentionPage2PO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPage2PO.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.findViewTab({cssClass: 'testee-1'}).getViewId();
    const testeeViewTabPO = appPO.findViewTab({viewId: testeeViewId});
    const testeeViewPagePO = new ViewPagePO(testeeViewId);

    // expect testee-1 to show
    await expect(await testeeViewTabPO.getTitle()).toEqual('Testee 1');
    const testee1ComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

    // navigate to testee-2 view (app1)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect testee-2 to show
    await expect(await testeeViewTabPO.getTitle()).toEqual('Testee 2');
    await testeeViewTabPO.activate();
    const testee2ComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

    // expect following Observables to complete
    await expect(await consumeBrowserLog(Level.DEBUG, /ObservableComplete/)).toEqual(jasmine.arrayWithExactContents([
      `[TitleObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));

    // update params (no microfrontend change)
    await testeeViewPagePO.navigateSelf({param1: 'param-1'});

    // expect following Observables to complete
    await expect(await consumeBrowserLog(Level.DEBUG, /ObservableComplete/)).toEqual([]);

    // navigate to testee-3 view (app3)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect testee-3 to show
    await expect(await testeeViewTabPO.getTitle()).toEqual('Testee 3');
    await testeeViewTabPO.activate();
    const testee3ComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

    // expect following Observables to complete
    await expect(await consumeBrowserLog(Level.DEBUG, /ObservableComplete/)).toEqual(jasmine.arrayWithExactContents([
      `[ParamsObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,

      `[ParamsObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,

      `[TitleObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]));

    // expect the component instances to be different
    expect(new Set([testee1ComponentInstanceId, testee2ComponentInstanceId, testee3ComponentInstanceId]).size).toEqual(3);

    // navigate to testee-1 view (app1)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect following Observables to complete
    await expect(await consumeBrowserLog(Level.DEBUG, /ObservableComplete/)).toEqual(jasmine.arrayWithExactContents([
      `[ParamsObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,

      `[TitleObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]));
  });

  it('should allow updating the viewtab title', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await ViewPagePO.openInNewTab('app1');
    const viewTabPO = viewPagePO.viewTabPO;

    await viewPagePO.enterTitle('UPDATED TITLE');
    await expect(await viewTabPO.getTitle()).toEqual('UPDATED TITLE');

    await viewPagePO.enterTitle('updated title');
    await expect(await viewTabPO.getTitle()).toEqual('updated title');
  });

  it('should allow updating the viewtab heading', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await ViewPagePO.openInNewTab('app1');
    const viewTabPO = viewPagePO.viewTabPO;

    await viewPagePO.enterHeading('UPDATED HEADING');
    await expect(await viewTabPO.getHeading()).toEqual('UPDATED HEADING');

    await viewPagePO.enterHeading('updated heading');
    await expect(await viewTabPO.getHeading()).toEqual('updated heading');
  });

  it('should allow updating the viewtab dirty state', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await ViewPagePO.openInNewTab('app1');
    const viewTabPO = viewPagePO.viewTabPO;

    await viewPagePO.markDirty(true);
    await expect(await viewTabPO.isDirty()).toBe(true);

    await viewPagePO.markDirty(false);
    await expect(await viewTabPO.isDirty()).toBe(false);

    await viewPagePO.markDirty(); // noarg
    await expect(await viewTabPO.isDirty()).toBe(true);
  });

  it('should allow updating the viewtab closable flag', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await ViewPagePO.openInNewTab('app1');
    const viewTabPO = viewPagePO.viewTabPO;

    await viewPagePO.checkClosable(true);
    await expect(await viewTabPO.isClosable()).toBe(true);

    await viewPagePO.checkClosable(false);
    await expect(await viewTabPO.isClosable()).toBe(false);
  });

  it('should allow closing the view', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await ViewPagePO.openInNewTab('app1');
    const viewTabPO = viewPagePO.viewTabPO;

    await expect(await viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.isPresent()).toBe(true);

    // close the view
    await viewPagePO.clickClose();

    await expect(await appPO.getViewTabCount()).toEqual(0);
    await expect(await viewTabPO.isPresent()).toBe(false);
    await expect(await viewPagePO.isPresent()).toBe(false);
  });

  it('should allow prevent the view from closing', async () => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await ViewPagePO.openInNewTab('app1');
    const viewTabPO = viewPagePO.viewTabPO;

    // prevent the view from closing
    await viewPagePO.checkConfirmClosing(true);

    // try closing the view
    await viewTabPO.close();
    await dismissAlert();

    // expect the view not to be closed
    await expect(await viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.isPresent()).toBe(true);

    // try closing the view
    await viewPagePO.clickClose();
    await dismissAlert();

    // expect the view not to be closed
    await expect(await viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.isPresent()).toBe(true);

    // try closing the view
    await viewTabPO.close();
    await confirmAlert();

    // expect the view to be closed
    await expect(await viewTabPO.isPresent()).toBe(false);
    await expect(await viewPagePO.isPresent()).toBe(false);
  });

  it('should emit when activating or deactivating a viewtab', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const testee1ViewTabPO = appPO.findViewTab({cssClass: 'testee-1'});
    const testee1ViewPagePO = new ViewPagePO(await testee1ViewTabPO.getViewId());
    const testee1ComponentInstanceId = await testee1ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));

    // navigate to testee-2 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const testee2ViewTabPO = appPO.findViewTab({cssClass: 'testee-2'});
    const testee2ViewPagePO = new ViewPagePO(await testee2ViewTabPO.getViewId());
    const testee2ComponentInstanceId = await testee2ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]));

    // activate testee-1 view
    await testee1ViewTabPO.activate();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));

    // activate testee-2 view
    await testee2ViewTabPO.activate();
    await testee2ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]));

    // register testee-3 view
    await registerCapabilityPagePO.viewTabPO.activate();
    await registerCapabilityPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]));

    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // navigate to testee-3 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const testee3ViewTabPO = appPO.findViewTab({cssClass: 'testee-3'});
    const testee3ViewPagePO = new ViewPagePO(await testee3ViewTabPO.getViewId());
    const testee3ComponentInstanceId = await testee3ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]));

    // activate testee-1 view
    await testee1ViewTabPO.activate();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consumeBrowserLog(Level.DEBUG, /ViewActivate|ViewDeactivate/)).toEqual(jasmine.arrayWithExactContents([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]));
  });

  it('should provide the view\'s capability', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view in app1
    const registerCapabilityPage1PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view in app1
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view in app2
    const registerCapabilityPage2PO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // allow app1 to open testee-3 view
    const registerIntentionPage2PO = await RegisterWorkbenchIntentionPagePO.openInNewTab('app1');
    await registerIntentionPage2PO.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.findViewTab({cssClass: 'testee-1'}).getViewId();
    const testeeViewPagePO = new ViewPagePO(testeeViewId);

    await expect(await testeeViewPagePO.getViewCapability()).toEqual(jasmine.objectContaining({
      qualifier: {component: 'testee-1'},
      type: 'view',
      properties: jasmine.objectContaining({
        path: 'test-view',
        title: 'Testee 1',
        cssClass: ['testee-1'],
      }),
    }));

    // navigate to testee-2 view (app1)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();

    await testeeViewPagePO.viewTabPO.activate();
    await expect(await testeeViewPagePO.getViewCapability()).toEqual(jasmine.objectContaining({
      qualifier: {component: 'testee-2'},
      type: 'view',
      properties: jasmine.objectContaining({
        path: 'test-view',
        title: 'Testee 2',
        cssClass: ['testee-2'],
      }),
    }));

    // navigate to testee-3 view (app2)
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    await testeeViewPagePO.viewTabPO.activate();
    await expect(await testeeViewPagePO.getViewCapability()).toEqual(jasmine.objectContaining({
      qualifier: {component: 'testee-3'},
      type: 'view',
      properties: jasmine.objectContaining({
        path: 'test-view',
        title: 'Testee 3',
        cssClass: ['testee-3'],
      }),
    }));
  });

  it('should provide the view\'s identity', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.findViewTab({cssClass: 'testee-1'}).getViewId();
    await expect(await new ViewPagePO(testee1ViewId).getViewId()).toEqual(testee1ViewId);

    // navigate to testee-2 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testee2ViewId = await appPO.findViewTab({cssClass: 'testee-2'}).getViewId();
    await expect(await new ViewPagePO(testee2ViewId).getViewId()).toEqual(testee2ViewId);

    // navigate to testee-3 view
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testee3ViewId = await appPO.findViewTab({cssClass: 'testee-3'}).getViewId();
    await expect(await new ViewPagePO(testee3ViewId).getViewId()).toEqual(testee3ViewId);
  });

  describe('keystroke bubbling of view context menu items', () => {

    it('should propagate `ctrl+k` for closing the current view', async () => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1PO = await ViewPagePO.openInNewTab('app1');
      const viewPage2PO = await ViewPagePO.openInNewTab('app1');
      const viewPage3PO = await ViewPagePO.openInNewTab('app1');

      await expect(await appPO.getViewTabCount()).toEqual(3);

      // Press 'ctrl+k' in view 2
      await viewPage2PO.viewTabPO.activate();
      await viewPage2PO.sendKeys(Key.chord(Key.CONTROL, 'k'));

      await expect(await appPO.getViewTabCount()).toEqual(2);
      await expect(await viewPage1PO.isPresent()).toBe(true);
      await expect(await viewPage2PO.isPresent()).toBe(false);
      await expect(await viewPage3PO.isPresent()).toBe(true);
    });

    it('should propagate `ctrl+shift+k` for closing other views', async () => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1PO = await ViewPagePO.openInNewTab('app1');
      const viewPage2PO = await ViewPagePO.openInNewTab('app1');
      const viewPage3PO = await ViewPagePO.openInNewTab('app1');

      await expect(await appPO.getViewTabCount()).toEqual(3);

      // Press 'ctrl+shift+k' in view 2
      await viewPage2PO.viewTabPO.activate();
      await viewPage2PO.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, 'k'));

      await expect(await appPO.getViewTabCount()).toEqual(1);
      await expect(await viewPage1PO.isPresent()).toBe(false);
      await expect(await viewPage2PO.isPresent()).toBe(true);
      await expect(await viewPage3PO.isPresent()).toBe(false);
    });

    it('should propagate `ctrl+shift+alt+k` for closing all views', async () => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1PO = await ViewPagePO.openInNewTab('app1');
      const viewPage2PO = await ViewPagePO.openInNewTab('app1');
      const viewPage3PO = await ViewPagePO.openInNewTab('app1');

      await expect(await appPO.getViewTabCount()).toEqual(3);

      // Press 'ctrl+shift+alt+k' in view 2
      await viewPage2PO.viewTabPO.activate();
      await viewPage2PO.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, Key.ALT, 'k'));

      await expect(await appPO.getViewTabCount()).toEqual(0);
      await expect(await viewPage1PO.isPresent()).toBe(false);
      await expect(await viewPage2PO.isPresent()).toBe(false);
      await expect(await viewPage3PO.isPresent()).toBe(false);
    });
  });
});

