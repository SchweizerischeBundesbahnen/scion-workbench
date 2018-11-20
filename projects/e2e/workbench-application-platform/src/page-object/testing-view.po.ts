/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { ViewInteractionPanelPO } from './view-interaction-panel.po';
import { ViewNavigationPanelPO } from './view-navigation-panel.po';
import { HostAppPO } from './host-app.po';
import { PopupPanelPO } from './popup-panel.po';
import { SciAccordionPO } from './sci-accordion-p.o';
import { switchToIFrameContext } from '../util/testing.util';
import { MessageBoxPanelPO } from './message-box-panel.po';
import { NotificationPanelPO } from './notification-panel.po';

const E2E_TESTING_VIEW_CONTEXT: string[] = ['e2e-testing-app', 'e2e-view', 'e2e-testing-view'];

export class TestingViewPO {

  private _component = $('app-testing-view');

  public async navigateTo(): Promise<void> {
    await new HostAppPO().clickActivityItem('e2e-open-testing-view');
  }

  public async openViewInteractionPanel(): Promise<ViewInteractionPanelPO> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await new SciAccordionPO().toggle(this._component.$('sci-accordion'), 'e2e-view-interaction-panel', true);
    return new ViewInteractionPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }

  public async openViewNavigationPanel(): Promise<ViewNavigationPanelPO> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await new SciAccordionPO().toggle(this._component.$('sci-accordion'), 'e2e-view-navigation-panel', true);
    return new ViewNavigationPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }

  public async openPopupPanel(): Promise<PopupPanelPO> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await new SciAccordionPO().toggle(this._component.$('sci-accordion'), 'e2e-popup-panel', true);
    return new PopupPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }

  public async closePopupPanel(): Promise<void> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await new SciAccordionPO().toggle(this._component.$('sci-accordion'), 'e2e-popup-panel', false);
  }

  public async openMessageBoxPanel(): Promise<MessageBoxPanelPO> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await new SciAccordionPO().toggle(this._component.$('sci-accordion'), 'e2e-message-box-panel', true);
    return new MessageBoxPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }

  public async openNotificationPanel(): Promise<NotificationPanelPO> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    await new SciAccordionPO().toggle(this._component.$('sci-accordion'), 'e2e-notification-panel', true);
    return new NotificationPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }
}
