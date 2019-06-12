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
import { switchToIFrameContext } from '../util/testing.util';
import { SciPropertyPanelPO } from './sci-property.po';
import { ViewNavigationPanelPO } from './view-navigation-panel.po';

const E2E_TESTING_VIEW_CONTEXT: string[] = ['e2e-testing-app', 'e2e-view', 'e2e-view-68f302b4'];

export class Testcase68f302b4ViewPO {

  public readonly viewNavigationPanelPO = new ViewNavigationPanelPO(E2E_TESTING_VIEW_CONTEXT);

  public async getAppInstanceUuid(): Promise<string> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    return await $('.e2e-app-instance-uuid').getText();
  }

  public async getComponentInstanceUuid(): Promise<string> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    return await $('.e2e-component-instance-uuid').getText();
  }

  public async getUrlParameters(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-url-params'));
  }

  public async getUrlQueryParameters(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(E2E_TESTING_VIEW_CONTEXT);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-url-query-params'));
  }
}
