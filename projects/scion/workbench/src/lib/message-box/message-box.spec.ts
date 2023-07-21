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
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {By} from '@angular/platform-browser';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {MessageBoxService} from './message-box.service';
import {WorkbenchModule} from '../workbench.module';
import {styleFixture, waitForInitialWorkbenchLayout, waitForWorkbenchLayoutChange} from '../testing/testing.util';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';

describe('MessageBox', () => {

  describe('Workbench in a Router Outlet (Angular sets up a separate injector for standalone components loaded via router)', () => {

    it('should display application-modal message box', async () => {
      TestBed.configureTestingModule({
        imports: [
          WorkbenchTestingModule.forTest(),
          RouterTestingModule.withRoutes([
            {path: '', component: WorkbenchTestComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(RootTestComponent));
      await waitForInitialWorkbenchLayout();

      // Open application-modal message box
      TestBed.inject(MessageBoxService).open({content: 'message', cssClass: 'testee'}).then();

      // Expect message box to show
      expect(fixture.debugElement.query(By.css('wb-message-box.testee'))).toBeDefined();
    });

    it('should display view-modal message box', async () => {
      TestBed.configureTestingModule({
        imports: [
          WorkbenchTestingModule.forTest(),
          RouterTestingModule.withRoutes([
            {path: '', component: WorkbenchTestComponent},
            {path: 'view', component: ViewTestComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(RootTestComponent));
      await waitForInitialWorkbenchLayout();

      // Open view
      await TestBed.inject(WorkbenchRouter).navigate(['view']);
      await waitForWorkbenchLayoutChange();

      // Open view-modal message box
      const viewDebugElement = fixture.debugElement.query(By.directive(ViewTestComponent))!;
      viewDebugElement.injector.get(MessageBoxService).open({content: 'Message from View', cssClass: 'testee'}).then();

      // Expect message box to show
      expect(fixture.debugElement.query(By.css('wb-message-box.testee'))).toBeDefined();
    });

    /****************************************************************************************************
     * Definition of Test Components                                                                    *
     ****************************************************************************************************/
    @Component({
      selector: 'spec-root',
      template: '<router-outlet></router-outlet>',
      standalone: true,
      imports: [RouterOutlet],
    })
    class RootTestComponent {
    }

    @Component({
      selector: 'spec-workbench',
      template: '<wb-workbench></wb-workbench>',
      styles: [':host {display: grid; height: 500px;}'],
      standalone: true,
      imports: [WorkbenchModule],
    })
    class WorkbenchTestComponent {
    }

    @Component({
      selector: 'spec-view-1',
      template: 'View',
      standalone: true,
    })
    class ViewTestComponent {
    }
  });
});
