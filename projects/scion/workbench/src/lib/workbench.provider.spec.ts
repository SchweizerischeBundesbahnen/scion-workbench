/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {provideWorkbenchForTest} from './testing/workbench.provider';
import {provideWorkbench} from './workbench.provider';

describe('WorkbenchProvider', () => {

  it('should error if installed in child environment', async () => {

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {
            path: 'lazy',
            providers: [
              provideWorkbench(), // Provide workbench from child environment.
            ],
            component: TestComponent,
          },
        ]),
      ],
    });

    await expectAsync(TestBed.inject(Router).navigate(['lazy'])).toBeRejectedWithError(/ProvideWorkbenchError/);
  });
});

@Component({template: ''})
class TestComponent {
}
