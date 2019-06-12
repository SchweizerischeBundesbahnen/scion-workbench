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

const E2E_TESTING_ACTIVITY_CONTEXT: string[] = ['e2e-testing-app', 'e2e-activity', 'e2e-activity-4a3a8984'];

export class Testcase4a3a8984ActivityPO {

  public async getComponentInstanceUuid(): Promise<string> {
    await switchToIFrameContext(E2E_TESTING_ACTIVITY_CONTEXT);
    return await $('.e2e-component-instance-uuid').getText();
  }
}
