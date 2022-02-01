/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertPageToDisplay, enterText, getInputValue} from '../../helper/testing.util';
import {Params} from '@angular/router';
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {SciAccordionPO, SciCheckboxPO, SciPropertyPO} from '@scion/toolkit.internal/widgets.po';
import {Arrays, Dictionary} from '@scion/toolkit/util';
import {ElementFinder} from 'protractor';
import {WebdriverExecutionContexts} from '../../helper/webdriver-execution-context';

/**
 * Page object to interact {@link ViewPageComponent}.
 */
export class ViewPagePO {

  private _appPO = new AppPO();
  private _pageFinder: ElementFinder;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(public viewId: string) {
    this.viewPO = this._appPO.findView({viewId: viewId});
    this.viewTabPO = this._appPO.findViewTab({viewId: viewId});
    this._pageFinder = this.viewPO.$('app-view-page');
  }

  public async isPresent(): Promise<boolean> {
    if (!await this.viewTabPO.isPresent()) {
      return false;
    }

    await WebdriverExecutionContexts.switchToDefault();
    return this._pageFinder.isPresent();
  }

  public async getViewId(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-view-id').getText();
  }

  public async getPartId(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-part-id').getText();
  }

  public async getComponentInstanceId(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return this._pageFinder.$('span.e2e-component-instance-id').getText();
  }

  public async getRouteParams(): Promise<Params> {
    await WebdriverExecutionContexts.switchToDefault();
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
    await WebdriverExecutionContexts.switchToDefault();
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

  public async getNavigationalState(): Promise<Dictionary> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-navigational-state'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._pageFinder.$('sci-property.e2e-navigational-state')).readAsDictionary();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getTitle(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return getInputValue(this._pageFinder.$('input.e2e-title'));
  }

  public async enterTitle(title: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(title, this._pageFinder.$('input.e2e-title'));
  }

  public async getHeading(): Promise<string> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return getInputValue(this._pageFinder.$('input.e2e-heading'));
  }

  public async enterHeading(heading: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await enterText(heading, this._pageFinder.$('input.e2e-heading'));
  }

  public async isDirty(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-dirty')).isChecked();
  }

  public async checkDirty(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-dirty')).toggle(check);
  }

  public async isClosable(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-closable')).isChecked();
  }

  public async checkClosable(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async isBlocked(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    return new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-blocked')).isChecked();
  }

  public async checkBlocked(check: boolean): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-blocked')).toggle(check);
  }

  public async clickClose(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-view-actions'));
    await accordionPO.expand();
    try {
      await this._pageFinder.$('button.e2e-close').click();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async addViewAction(viewpartAction: ViewpartAction | null, options?: {append?: boolean}): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await assertPageToDisplay(this._pageFinder);

    const accordionPO = new SciAccordionPO(this._pageFinder.$('sci-accordion.e2e-viewpart-actions'));
    await accordionPO.expand();
    try {
      const inputFinder = this._pageFinder.$('input.e2e-viewpart-actions');
      if (options?.append ?? true) {
        const presentActions: ViewpartAction[] = Arrays.coerce(JSON.parse(await getInputValue(inputFinder) || null));
        await enterText(JSON.stringify(presentActions.concat(viewpartAction || [])), inputFinder, 'setValue');
      }
      else {
        await enterText(JSON.stringify([].concat(viewpartAction || [])), inputFinder, 'setValue');
      }
    }
    finally {
      await accordionPO.collapse();
    }
  }

  /**
   * Opens the page to test the workbench view in a new view tab.
   */
  public static async openInNewTab(): Promise<ViewPagePO> {
    const appPO = new AppPO();
    const startPO = await appPO.openNewViewTab();
    await startPO.openWorkbenchView('e2e-test-view');
    const viewId = await appPO.findActiveView().getViewId();
    return new ViewPagePO(viewId);
  }
}

export interface ViewpartAction {
  icon: string;
  align?: 'start' | 'end';
  cssClass?: string;
}
