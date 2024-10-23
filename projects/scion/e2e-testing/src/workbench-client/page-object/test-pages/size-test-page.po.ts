/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RouterPagePO} from '../router-page.po';
import {DomRect, fromRect} from '../../../helper/testing.util';
import {DialogOpenerPagePO} from '../dialog-opener-page.po';
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from '../register-workbench-capability-page.po';
import {PopupOpenerPagePO} from '../popup-opener-page.po';
import {PopupPO} from '../../../popup.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';

export class SizeTestPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO {

  public readonly locator: Locator;

  constructor(public outlet: SciRouterOutletPO, private _locateBy: ViewPO | DialogPO | PopupPO) {
    this.locator = this.outlet.frameLocator.locator('app-size-test-page');
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  public get dialog(): DialogPO {
    if (this._locateBy instanceof DialogPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a dialog.');
    }
  }

  public get popup(): PopupPO {
    if (this._locateBy instanceof PopupPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a popup.');
    }
  }

  public async getRecordedSizeChanges(): Promise<string[]> {
    const sizes = new Array<string>();
    for (const size of await this.locator.locator('span.e2e-size').all()) {
      sizes.push(await size.innerText());
    }
    return sizes;
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public static async openInNewTab(appPO: AppPO): Promise<SizeTestPagePO> {
    const microfrontendNavigator = new MicrofrontendNavigator(appPO);
    const identifier = `size-${crypto.randomUUID()}`;

    // Register view capability.
    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
      type: 'view',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/size-test-page',
        title: 'View Size',
      },
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({test: identifier}, {cssClass: identifier});

    const view = appPO.view({cssClass: identifier});
    const outlet = new SciRouterOutletPO(appPO, {cssClass: identifier});
    return new SizeTestPagePO(outlet, view);
  }

  public static async openInDialog(appPO: AppPO): Promise<SizeTestPagePO> {
    const microfrontendNavigator = new MicrofrontendNavigator(appPO);
    const identifier = `size-${crypto.randomUUID()}`;

    // Register dialog capability.
    await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
      type: 'dialog',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/size-test-page',
        title: 'Dialog Size',
        size: {
          width: '500px',
          height: '300px',
        },
      },
    });

    // Open dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({test: identifier}, {cssClass: identifier});

    const dialog = appPO.dialog({cssClass: identifier});
    const outlet = new SciRouterOutletPO(appPO, {locator: dialog.locator.locator('sci-router-outlet')});
    return new SizeTestPagePO(outlet, dialog);
  }

  public static async openInPopup(appPO: AppPO): Promise<SizeTestPagePO> {
    const microfrontendNavigator = new MicrofrontendNavigator(appPO);
    const identifier = `size-${crypto.randomUUID()}`;

    // Register popup capability.
    await microfrontendNavigator.registerCapability<WorkbenchPopupCapability>('app1', {
      type: 'popup',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/size-test-page',
        size: {
          width: '500px',
          height: '300px',
        },
      },
    });

    // Open popup.
    const popupOpenerPage = await microfrontendNavigator.openInNewTab(PopupOpenerPagePO, 'app1');
    await popupOpenerPage.enterQualifier({test: identifier});
    await popupOpenerPage.enterCssClass(identifier);
    await popupOpenerPage.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpenerPage.open();

    const popup = appPO.popup({cssClass: identifier});
    const outlet = new SciRouterOutletPO(appPO, {locator: popup.locator.locator('sci-router-outlet')});
    return new SizeTestPagePO(outlet, popup);
  }
}
