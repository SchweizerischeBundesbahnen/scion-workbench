/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from './testing/testing.util';
import {TestComponent} from './testing/test.component';
import {WorkbenchComponent} from './workbench.component';
import {WorkbenchService} from './workbench.service';
import {WORKBENCH_VIEW_REGISTRY} from './view/workbench-view.registry';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from './testing/workbench.provider';

describe('Workbench Service', () => {

  it(`should not close 'non-closable' views`, async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.1
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {target: 'view.1'});
    await waitUntilStable();

    // Open view.2
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {target: 'view.2'});
    await waitUntilStable();

    // Open view.3
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {target: 'view.3'});
    await waitUntilStable();

    // Mark view.2 non-closable
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.2').closable = false;

    // Close all views.
    await TestBed.inject(WorkbenchService).closeViews('view.1', 'view.2', 'view.3');
    await waitUntilStable();

    // Expect view.2 not to be closed.
    expect(TestBed.inject(WorkbenchService).views().map(view => view.id)).toEqual(['view.2']);
  });

  it('should provide activated perspective', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory.addPart('part.part'),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart('part.part'),
              },
            ],
          },
        }),
      ],
    });
    await waitForInitialWorkbenchLayout();
    const workbenchService = TestBed.inject(WorkbenchService);

    // Expect initial perspective.
    expect(workbenchService.activePerspective()!.id).toEqual('perspective-1');

    // Switch to perspective-1.
    await workbenchService.switchPerspective('perspective-2');
    expect(workbenchService.activePerspective()!.id).toEqual('perspective-2');

    // Switch perspective-1.
    await workbenchService.switchPerspective('perspective-1');
    expect(workbenchService.activePerspective()!.id).toEqual('perspective-1');
  });
});
