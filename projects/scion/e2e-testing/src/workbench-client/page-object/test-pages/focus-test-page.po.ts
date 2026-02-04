/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {PartPO} from '../../../part.po';
import {ViewPO} from '../../../view.po';
import {DialogPO} from '../../../dialog.po';
import {PopupPO} from '../../../popup.po';
import {NotificationPO} from '../../../notification.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';
import {MicrofrontendPopupPagePO} from '../../../workbench/page-object/workbench-popup-page.po';
import {MicrofrontendNotificationPagePO} from '../../../workbench/page-object/workbench-notification-page.po';

/**
 * Page object to interact with {@link FocusTestPageComponent}.
 */
export class FocusTestPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO, MicrofrontendNotificationPagePO {

  public readonly locator: Locator;
  public readonly part: PartPO;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly notification: NotificationPO;
  public readonly outlet: SciRouterOutletPO;

  public firstField: Locator;
  public middleField: Locator;
  public lastField: Locator;

  constructor(locateBy: PartPO | ViewPO | DialogPO | PopupPO | NotificationPO) {
    this.outlet = new SciRouterOutletPO(locateBy.locator.page(), {name: locateBy.locateBy?.id, cssClass: locateBy.locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-focus-test-page');

    this.part = locateBy instanceof PartPO ? locateBy : undefined!;
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.popup = locateBy instanceof PopupPO ? locateBy : undefined!;
    this.notification = locateBy instanceof NotificationPO ? locateBy : undefined!;

    this.firstField = this.locator.locator('input.e2e-first-field');
    this.middleField = this.locator.locator('input.e2e-middle-field');
    this.lastField = this.locator.locator('input.e2e-last-field');
  }

  public waitUntilAttached(): Promise<void> {
    return this.locator.waitFor({state: 'attached'});
  }

  public async isFocused(): Promise<boolean> {
    return coerceBooleanProperty(await this.locator.locator('input.e2e-focused').inputValue());
  }
}
