/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { assertPageToDisplay, enterText } from '../../helper/testing.util';
import { AppPO, ViewPO, ViewTabPO } from '../../app.po';
import { SciAccordionPO, SciCheckboxPO, SciParamsEnterPO, SciPropertyPO } from '@scion/toolkit.internal/widgets.po';
import { $, ElementFinder } from 'protractor';
import { WebdriverExecutionContexts } from '../../helper/webdriver-execution-context';
import { Params } from '@angular/router';
import { WorkbenchViewCapability } from '@scion/workbench-client';
import { RouterOutletPO } from './router-outlet.po';

/**
 * Page object to interact {@link ViewPageComponent} of workbench-client testing app.
 */
export class ViewPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = $('app-view-page');
  }

  public async isPresent(): Promise<boolean> {
    if (!await this.viewTabPO.isPresent()) {
      return false;
    }

    if (!await new RouterOutletPO().isPresent(this.viewId)) {
      return false;
    }

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    return this._pageFinder.isPresent();
  }

  public async isDisplayed(): Promise<boolean> {
    if (!await this.viewPO.isPresent()) {
      return false;
    }

    if (!await new RouterOutletPO().isDisplayed(this.viewId)) {
      return false;
    }

    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    return await this._pageFinder.isPresent() && await this._pageFinder.isDisplayed();
  }

  public async getViewId(): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-view-id').getText();
  }

  public async getComponentInstanceId(): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-component-instance-id').getText();
  }

  public async getAppInstanceId(): Promise<string> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-app-instance-id').getText();
  }

  public async getViewCapability(): Promise<WorkbenchViewCapability> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-view-capability'));
    await accordionPO.expand();
    try {
      return JSON.parse(await this._pageFinder.$('div.e2e-view-capability').getText());
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getViewParams(): Promise<Params> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-view-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._pageFinder.$('sci-property.e2e-view-params')).readAsDictionary();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
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

  public async enterTitle(title: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(title, this._pageFinder.$('input.e2e-title'));
  }

  public async enterHeading(heading: string): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await enterText(heading, this._pageFinder.$('input.e2e-heading'));
  }

  public async markDirty(dirty?: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    switch (dirty) {
      case true: {
        await this._pageFinder.$('button.e2e-mark-dirty').click();
        break;
      }
      case false: {
        await this._pageFinder.$('button.e2e-mark-pristine').click();
        break;
      }
      default: {
        await this._pageFinder.$('button.e2e-mark-dirty-noarg').click();
        break;
      }
    }
  }

  public async checkClosable(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async checkConfirmClosing(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-confirm-closing')).toggle(check);
  }

  public async clickClose(): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-view-actions'));
    await accordionPO.expand();
    await this._pageFinder.$('button.e2e-close').click();
    // do not close the accordion as this action removes the iframe from the DOM.
  }

  public async updateViewParams(params: Params): Promise<void> {
    await WebdriverExecutionContexts.switchToIframe(this.viewId);
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-update-view-params'));
    await accordionPO.expand();
    try {
      const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-view-params'));
      await paramsEnterPO.clear();
      await paramsEnterPO.enterParams(params);
      await this._pageFinder.$('button.e2e-update-view-params').click();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  /**
   * Opens the page in a new view tab.
   */
  public static async openInNewTab(app: 'app1' | 'app2'): Promise<ViewPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openMicrofrontendView('e2e-test-view', `workbench-client-testing-${app}`);
    const viewId = await appPO.findActiveView().getViewId();
    return new ViewPagePO(viewId);
  }
}
