/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText} from '../../helper/testing.util';
import {AppPO, PopupPO} from '../../app.po';
import {$, ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';
import {PopupSize} from '@scion/workbench';
import {ISize} from 'selenium-webdriver';
import {Params} from '@angular/router';
import {WorkbenchPopupCapability} from '@scion/workbench-client';
import {RouterOutletPO} from './router-outlet.po';
import {SciAccordionPO} from '../../../deps/scion/components.internal/accordion.po';
import {SciPropertyPO} from '../../../deps/scion/components.internal/property.po';
import {RouterOutletSelector} from '../../helper/element-finders';

/**
 * Page object to interact {@link PopupPageComponent}.
 */
export class PopupPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;
  private _routerOutletSelector: RouterOutletSelector;

  public readonly popupPO: PopupPO;

  constructor(cssClass: string) {
    this.popupPO = this._appPO.findPopup({cssClass});
    this._pageFinder = $('app-popup-page');
    this._routerOutletSelector = {cssClass: ['e2e-popup'].concat(cssClass)};
  }

  public async isPresent(): Promise<boolean> {
    if (!await this.popupPO.isPresent()) {
      return false;
    }

    if (!await new RouterOutletPO().isPresent(this._routerOutletSelector)) {
      return false;
    }

    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    return this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    if (!await this.popupPO.isDisplayed()) {
      return false;
    }

    if (!await new RouterOutletPO().isDisplayed(this._routerOutletSelector)) {
      return false;
    }

    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    return await this._pageFinder.isPresent() && await this._pageFinder.isDisplayed();
  }

  public async getComponentInstanceId(): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-component-instance-id').getText();
  }

  public async getPopupCapability(): Promise<WorkbenchPopupCapability> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-popup-capability'));
    await accordionPO.expand();
    try {
      return JSON.parse(await this._pageFinder.$('div.e2e-popup-capability').getText());
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getPopupParams(): Promise<Params> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-popup-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._pageFinder.$('sci-property.e2e-popup-params')).readAsDictionary();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-route-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._pageFinder.$('sci-property.e2e-route-params')).readAsDictionary();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-route-query-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._pageFinder.$('sci-property.e2e-route-query-params')).readAsDictionary();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-route-fragment'));
    await accordionPO.expand();
    try {
      return await this._pageFinder.$('span.e2e-route-fragment').getText();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterComponentSize(size: PopupSize): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    await enterText(size.width, this._pageFinder.$('input.e2e-width'));
    await enterText(size.height, this._pageFinder.$('input.e2e-height'));
    await enterText(size.minWidth, this._pageFinder.$('input.e2e-min-width'));
    await enterText(size.maxWidth, this._pageFinder.$('input.e2e-max-width'));
    await enterText(size.minHeight, this._pageFinder.$('input.e2e-min-height'));
    await enterText(size.maxHeight, this._pageFinder.$('input.e2e-max-height'));
  }

  public async enterReturnValue(returnValue: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-return-value'));
    await accordionPO.expand();
    try {
      await enterText(returnValue, this._pageFinder.$('input.e2e-return-value'));
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async clickClose(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);

    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError === true) {
      await this._pageFinder.$('button.e2e-close-with-error').click();
    }
    else {
      await this._pageFinder.$('button.e2e-close').click();
    }
  }

  public async getSize(): Promise<ISize> {
    await WebdriverExecutionContexts.switchToIframe(this._routerOutletSelector);
    await assertPageToDisplay(this._pageFinder);
    const {width, height} = await this._pageFinder.getSize();
    return {width, height};
  }
}
