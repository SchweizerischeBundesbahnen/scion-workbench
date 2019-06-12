/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { HostAppPO } from './host-app.po';
import { SciAccordionPO } from './sci-accordion-p.o';
import { switchToIFrameContext } from '../util/testing.util';
import { SciPropertyPanelPO } from './sci-property.po';
import { ActivityInteractionPanelPO } from './activity-interaction-panel.po';
import { ActivityActionsPanelPo } from './activity-actions-panel.po';
import { ViewOpenActivityActionPanelPO } from './view-open-activity-action-panel.po';
import { PopupOpenActivityActionPanelPO } from './popup-open-activity-action-panel.po';

export class TestingActivityPO {

  constructor(public iframeContext: string[]) {
  }

  public async navigateTo(): Promise<void> {
    await new HostAppPO().clickActivityItem('e2e-testing-activity');
  }

  public async getUrlParameters(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(this.iframeContext);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-url-params'));
  }

  public async getUrlQueryParameters(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(this.iframeContext);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-url-query-params'));
  }

  public async openActivityInteractionPanel(): Promise<ActivityInteractionPanelPO> {
    await switchToIFrameContext(this.iframeContext);
    await new SciAccordionPO().toggle($('sci-accordion'), 'e2e-activity-interaction-panel', true);
    return new ActivityInteractionPanelPO(this.iframeContext);
  }

  public async openActivityActionsPanel(): Promise<ActivityActionsPanelPo> {
    await switchToIFrameContext(this.iframeContext);
    await new SciAccordionPO().toggle($('sci-accordion'), 'e2e-activity-actions-panel', true);
    return new ActivityActionsPanelPo(this.iframeContext);
  }

  public async openViewOpenActivityActionPanel(): Promise<ViewOpenActivityActionPanelPO> {
    await switchToIFrameContext(this.iframeContext);
    await new SciAccordionPO().toggle($('sci-accordion'), 'e2e-add-view-open-activity-action', true);
    return new ViewOpenActivityActionPanelPO(this.iframeContext);
  }

  public async openPopupOpenActivityActionPanel(): Promise<PopupOpenActivityActionPanelPO> {
    await switchToIFrameContext(this.iframeContext);
    await new SciAccordionPO().toggle($('sci-accordion'), 'e2e-add-popup-open-activity-action', true);
    return new PopupOpenActivityActionPanelPO(this.iframeContext);
  }

  public async closePopupOpenActivityActionPanel(): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await new SciAccordionPO().toggle($('sci-accordion'), 'e2e-add-popup-open-activity-action', false);
  }
}
