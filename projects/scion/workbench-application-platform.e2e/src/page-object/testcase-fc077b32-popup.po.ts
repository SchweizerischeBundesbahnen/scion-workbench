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
import { getCssClasses, switchToIFrameContext, switchToMainContext } from '../util/testing.util';

const E2E_TESTING_POPUP_CONTEXT: string[] = ['e2e-testing-app', 'e2e-popup', 'e2e-popup-fc077b32'];

export class Testcasefc077b32PopupPO {

  public async getPosition(): Promise<'north' | 'east' | 'south' | 'west' | null> {
    await switchToMainContext();
    const cssClasses = await getCssClasses($(`.wb-popup.e2e-popup-fc077b32`));
    if (cssClasses.includes('e2e-position-north')) {
      return 'north';
    }
    else if (cssClasses.includes('e2e-position-east')) {
      return 'east';
    }
    else if (cssClasses.includes('e2e-position-south')) {
      return 'south';
    }
    else if (cssClasses.includes('e2e-position-west')) {
      return 'west';
    }
    return null;
  }

  public async close(): Promise<void> {
    await switchToIFrameContext(E2E_TESTING_POPUP_CONTEXT);
    await $('button#e2e-close').click();
  }
}
