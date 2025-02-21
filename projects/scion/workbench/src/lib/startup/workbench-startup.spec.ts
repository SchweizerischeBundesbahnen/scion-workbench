/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {ApplicationInitStatus, inject, provideAppInitializer} from '@angular/core';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchLauncher} from './workbench-launcher.service';

describe('Workbench Startup', () => {

  /**
   * Tests that activation of the initial perspective does not block application startup.
   */
  it('should not block application startup if starting workbench in APP_INITIALIZER', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {
            launcher: 'APP_INITIALIZER',
          },
        }),
      ],
    });

    await expectAsync(TestBed.inject(ApplicationInitStatus).donePromise).toBeResolved();
  });

  /**
   * Tests that activation of the initial perspective does not block application startup.
   */
  it('should not block application startup if starting workbench manually in APP_INITIALIZER', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideAppInitializer(() => inject(WorkbenchLauncher).launch()),
      ],
    });

    await expectAsync(TestBed.inject(ApplicationInitStatus).donePromise).toBeResolved();
  });
});
