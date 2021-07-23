/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Key} from 'protractor';
import {AppPO} from '../app.po';
import {RouterPagePO} from './page-object/router-page.po';
import {consumeBrowserLog} from '../helper/testing.util';

describe('Workbench RouterLink', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  it('should open the view in the current view tab (by default)', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee', heading: 'testee'});
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.findActiveViewTab().getHeading()).toEqual('testee');
  });

  it('should open the view in the current view tab (target="self")', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee', heading: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.getViewTabCount()).toEqual(1);
    await expect(await appPO.findActiveViewTab().getHeading()).toEqual('testee');
  });

  it('should open the view in a new view tab (target="blank")', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee', heading: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigateViaRouterLink();

    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await appPO.findActiveViewTab().getHeading()).toEqual('testee');
  });

  it('should open the view in a new view tab when pressing the CTRL modifier key', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee', heading: 'testee'});
    await routerPagePO.clickNavigateViaRouterLink(Key.CONTROL);

    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await appPO.findActiveViewTab().getHeading()).toEqual('testee');
  });

  it('should open the view in a new view tab when pressing the COMMAND modifier key', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee', heading: 'testee'});
    await routerPagePO.clickNavigateViaRouterLink(Key.COMMAND);

    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await appPO.findActiveViewTab().getHeading()).toEqual('testee');
  });

  it('should open the view in a new view tab when pressing the META modifier key', async () => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await RouterPagePO.openInNewTab();

    await routerPagePO.enterPath('/test-view');
    await routerPagePO.enterMatrixParams({cssClass: 'testee', heading: 'testee'});
    await routerPagePO.clickNavigateViaRouterLink(Key.META);

    await expect(await appPO.getViewTabCount()).toEqual(2);
    await expect(await appPO.findActiveViewTab().getHeading()).toEqual('testee');
  });
});
