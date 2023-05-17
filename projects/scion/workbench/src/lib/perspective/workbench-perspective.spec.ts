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
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {styleFixture, waitForInitialWorkbenchLayout} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchService} from '../workbench.service';
import {withComponentContent} from '../testing/test.component';
import {By} from '@angular/platform-browser';
import {inject} from '@angular/core';

describe('Workbench Perspective', () => {

  it('should support configuring different start page per perspective', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: layout => layout},
              {id: 'perspective-2', layout: layout => layout},
            ],
          },
        }),
        RouterTestingModule.withRoutes([
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page Perspective 1')],
            canMatch: [() => inject(WorkbenchService).getPerspective('perspective-1')?.active],
          },
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page Perspective 2')],
            canMatch: [() => inject(WorkbenchService).getPerspective('perspective-2')?.active],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const workbenchService = TestBed.inject(WorkbenchService);

    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');

    // Switch to perspective-2
    await workbenchService.switchPerspective('perspective-2');
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 2');

    // Switch to perspective-1
    await workbenchService.switchPerspective('perspective-1');
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');
  });
});

