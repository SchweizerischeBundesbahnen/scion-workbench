/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ViewNavigationPanelPO } from './view-navigation-panel.po';
import { HostAppPO } from './host-app.po';
import { PingIntentPanelPO } from './ping-intent-panel-po';

const E2E_TESTING_VIEW_CONTEXT: string[] = ['e2e-testing-app', 'e2e-view', 'e2e-view-c985a55b'];

export class TestcaseC985a55bViewPO {

  public async navigateTo(): Promise<void> {
    await new HostAppPO().clickActivityItem('e2e-activity-c985a55b');
  }

  public getViewNavigationPanelPO(): ViewNavigationPanelPO {
    return new ViewNavigationPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }

  public getPingPanelPO(): PingIntentPanelPO {
    return new PingIntentPanelPO(E2E_TESTING_VIEW_CONTEXT);
  }
}
