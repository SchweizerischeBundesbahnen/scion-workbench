/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {MicrofrontendDialogPagePO} from '../../../workbench/page-object/workbench-dialog-page.po';
import {ViewPO} from '../../../view.po';
import {DialogPO} from '../../../dialog.po';
import {AppPO} from '../../../app.po';
import {DialogId, Translatable, ViewId} from '@scion/workbench-client';

export class TextTestPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO {

  public readonly locator: Locator;
  public readonly text1: TextObservePO;
  public readonly text2: TextObservePO;
  public readonly text3: TextObservePO;
  public readonly text4: TextObservePO;

  private constructor(public outlet: SciRouterOutletPO, private _locateBy: ViewPO | DialogPO) {
    this.locator = this.outlet.frameLocator.locator('app-text-test-page');
    this.text1 = new TextObservePO(this.locator.locator('app-observe-text:nth-of-type(1)'));
    this.text2 = new TextObservePO(this.locator.locator('app-observe-text:nth-of-type(2)'));
    this.text3 = new TextObservePO(this.locator.locator('app-observe-text:nth-of-type(3)'));
    this.text4 = new TextObservePO(this.locator.locator('app-observe-text:nth-of-type(4)'));
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

  public async provideText(key: string, text: string | '<undefined>'): Promise<void> {
    await this.locator.locator('section.e2e-provide-text input.e2e-key').fill(key);
    await this.locator.locator('section.e2e-provide-text input.e2e-text').fill(text);
    await this.locator.locator('section.e2e-provide-text button.e2e-save').click();
  }

  public async provideValue(key: string, value: string | '<undefined>'): Promise<void> {
    await this.locator.locator('section.e2e-provide-value input.e2e-key').fill(key);
    await this.locator.locator('section.e2e-provide-value input.e2e-value').fill(value);
    await this.locator.locator('section.e2e-provide-value button.e2e-save').click();
  }

  public async unregisterTextProvider(): Promise<void> {
    await this.locator.locator('section.e2e-text-provider button.e2e-unregister').click();
  }

  public async registerTextProvider(): Promise<void> {
    await this.locator.locator('section.e2e-text-provider button.e2e-register').click();
  }

  public async setViewTitle(title: Translatable): Promise<void> {
    await this.locator.locator('section.e2e-view-handle input.e2e-title').fill(title);
    await this.locator.locator('section.e2e-view-handle button.e2e-set-title').click();
  }

  public async setViewHeading(heading: Translatable): Promise<void> {
    await this.locator.locator('section.e2e-view-handle input.e2e-heading').fill(heading);
    await this.locator.locator('section.e2e-view-handle button.e2e-set-heading').click();
  }

  public async setDialogTitle(title: Translatable): Promise<void> {
    await this.locator.locator('section.e2e-dialog-handle input.e2e-title').fill(title);
    await this.locator.locator('section.e2e-dialog-handle button.e2e-set-title').click();
  }

  public static newViewPO(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}): TextTestPagePO {
    const view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    const outlet = new SciRouterOutletPO(appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    return new TextTestPagePO(outlet, view);
  }

  public static newDialogPO(appPO: AppPO, locateBy: {dialogId?: DialogId; cssClass?: string}): TextTestPagePO {
    const dialog = appPO.dialog({dialogId: locateBy.dialogId, cssClass: locateBy.cssClass});
    const outlet = new SciRouterOutletPO(appPO, {locator: dialog.locator.locator('sci-router-outlet')});
    return new TextTestPagePO(outlet, dialog);
  }
}

export class TextObservePO {

  public readonly text: Locator;

  constructor(public locator: Locator) {
    this.text = this.locator.locator('output.e2e-text');
  }

  public async observe(translatable: string, options: {app: 'workbench-client-testing-app1' | 'workbench-client-testing-app2'; ttl?: number}): Promise<void> {
    await this.locator.locator(`input.e2e-translatable`).fill(translatable);
    await this.locator.locator('input.e2e-app').fill(options.app);
    await this.locator.locator('input.e2e-ttl').fill(`${options.ttl ?? ''}`);
    await this.locator.locator('button.e2e-observe').click();
  }

  public async state(): Promise<undefined | 'completed' | 'errored'> {
    return (await this.locator.getAttribute('data-state') as null | 'completed' | 'errored') ?? undefined;
  }

  public async cancel(): Promise<void> {
    await this.locator.locator('button.e2e-cancel').click();
  }
}
