/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {expect} from '@playwright/test';
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {DialogPagePO} from '../page-object/dialog-page.po';

test.describe('Workbench Dialog Params', () => {

  test('should pass params as values to the dialog component', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-dialog',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {params: {id: '123'}, cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    await expect.poll(() => dialogPage.getDialogParams()).toEqual({id: '123'});
  });

  test('should substitute named URL params with values of the params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
        {name: 'mp1', required: true},
        {name: 'qp1', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/dialog-test-page/:seg1/segment2;mp1=:mp1?qp1=:qp1#:fragment',
        size: {
          height: '460px',
          width: '300px',
        },
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open(
      {component: 'testee'},
      {
        params: {seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'},
        cssClass: 'testee',
      },
    );

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect named params to be substituted.
    await expect.poll(() => dialogPage.getDialogParams()).toEqual({seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1', fragment: 'FRAGMENT'});
    await expect.poll(() => dialogPage.getRouteParams()).toEqual({segment1: 'SEG1', mp1: 'MP1'});
    await expect.poll(() => dialogPage.getRouteQueryParams()).toEqual({qp1: 'QP1'});
    await expect.poll(() => dialogPage.getRouteFragment()).toEqual('FRAGMENT');
  });
});
