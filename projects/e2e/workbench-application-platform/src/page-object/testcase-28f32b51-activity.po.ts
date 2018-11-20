/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { switchToIFrameContext } from '../util/testing.util';

const E2E_TESTING_ACTIVITY_CONTEXT: string[] = ['e2e-testing-app', 'e2e-activity', 'e2e-activity-28f32b51'];

export class Testcase28f32b51ActivityPO {

  public async readActiveLog(): Promise<boolean[]> {
    await switchToIFrameContext(E2E_TESTING_ACTIVITY_CONTEXT);
    const activeLog: string = await $('textarea#active-log').getAttribute('value');
    return activeLog.split(/\s+/).map(activeLogEntry => JSON.parse(activeLogEntry));
  }
}
