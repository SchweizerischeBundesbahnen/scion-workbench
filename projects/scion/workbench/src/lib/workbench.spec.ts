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
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from './testing/testing.util';
import {WorkbenchTestingModule} from './testing/workbench-testing.module';
import {withComponentContent} from './testing/test.component';
import {WorkbenchComponent} from './workbench.component';

describe('Workbench', () => {

  it('should support configuring a start page', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {
            path: '',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Start Page')],
          },
          {
            path: 'test-view',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('View')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const wbRouter = TestBed.inject(WorkbenchRouter);

    // Expect start page to display
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page');

    // Open view
    await wbRouter.navigate(['/test-view']);
    await waitUntilStable();

    // Expect start page not to display
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet'))).toBeNull();

    // Close view
    await wbRouter.navigate(['/test-view'], {close: true});
    await waitUntilStable();

    // Expect start page to display
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page');
  });
});

