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

const E2E_TESTING_POPUP_CONTEXT: string[] = ['e2e-testing-app', 'e2e-popup', 'e2e-popup-f4286ac4'];

export class TestcaseF4286ac4PopupPO {

  /**
   * Reads URL parameters.
   */
  public async getUrlParameters(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(E2E_TESTING_POPUP_CONTEXT);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-url-params'));
  }

  /**
   * Reads URL query parameters.
   */
  public async getUrlQueryParameters(): Promise<{ [key: string]: string }> {
    await switchToIFrameContext(E2E_TESTING_POPUP_CONTEXT);
    return new SciPropertyPanelPO().readProperties($('sci-property.e2e-url-query-params'));
  }
}
