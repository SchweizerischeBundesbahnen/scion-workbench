/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {ViewPO} from '../../../view.po';
import {Locator} from '@playwright/test';
import {ViewId} from '@scion/workbench';
import {SciTabbarPO} from '../../../@scion/components.internal/tabbar.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {RegisterCapabilityPagePO} from './register-capability-page.po';
import {Capability, Intention} from '@scion/microfrontend-platform';
import {RegisterIntentionPagePO} from './register-intention-page.po';
import {UnregisterCapabilityPagePO} from './unregister-capability-page.po';
import {PublishMessagePagePO} from './publish-message-page.po';
import {Application} from './application';

/**
 * Page object to interact with {@link MicrofrontendPlatformPageComponent}.
 */
export class MicrofrontendPlatformPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  private readonly _tabbar: SciTabbarPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-microfrontend-platform-page');
    this._tabbar = new SciTabbarPO(this.locator.locator('sci-tabbar'));
  }

  /**
   * Registers the given capability.
   *
   * Returns a Promise that resolves to the registered capability upon successful registration, or that rejects on registration error.
   */
  public async registerCapability<T extends Capability>(application: Application, capability: T): Promise<T & Capability> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-register-capability');

    const registerCapabilityPage = new RegisterCapabilityPagePO(this.locator.locator('app-register-capability-page'));
    return registerCapabilityPage.registerCapability(application, capability);
  }

  /**
   * Registers the given intention.
   *
   * Returns a Promise that resolves to the registered capability upon successful registration, or that rejects on registration error.
   */
  public async registerIntention(application: Application, intention: Intention): Promise<string> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-register-intention');

    const registerIntention = new RegisterIntentionPagePO(this.locator.locator('app-register-intention-page'));
    return registerIntention.registerIntention(application, intention);
  }

  /**
   * Unregisters the given capability.
   *
   * Returns a Promise that resolves upon successful unregistration, or that rejects on error.
   */
  public async unregisterCapability(application: Application, id: string): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-unregister-capability');

    const unregisterCapabilityPage = new UnregisterCapabilityPagePO(this.locator.locator('app-unregister-capability-page'));
    return unregisterCapabilityPage.unregisterCapability(application, id);
  }

  /**
   * Publishes a message to the given topic.
   */
  public async publishMessage(topic: string): Promise<void> {
    await this.view.tab.click();
    await this._tabbar.selectTab('e2e-publish-message');

    const publishMessagePage = new PublishMessagePagePO(this.locator.locator('app-publish-message-page'));
    return publishMessagePage.publishMessage(topic);
  }
}
