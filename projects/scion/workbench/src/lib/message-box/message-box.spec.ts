/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchTestingModule} from '../spec/workbench-testing.module';
import {MessageBoxService} from './message-box.service';
import {WorkbenchModule} from '../workbench.module';
import {WorkbenchLauncher} from '../startup/workbench-launcher.service';

describe('MessageBox', () => {

  describe('Workbench in a Router Outlet (Angular sets up a separate injector for standalone components loaded via router)', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          WorkbenchTestingModule.forRoot({startup: {launcher: 'LAZY'}}),
          RouterTestingModule.withRoutes([
            {path: '', component: WorkbenchTestComponent},
            {path: 'view', component: ViewTestComponent},
          ]),
          NoopAnimationsModule,
        ],
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });
      TestBed.inject(Router).initialNavigation();
    });

    it('should display application-modal message box', async () => {
      // Create fixture
      const fixture = TestBed.createComponent(RootTestComponent);
      fixture.debugElement.nativeElement.style.border = '1px solid black';

      // Launch workbench
      await TestBed.inject(WorkbenchLauncher).launch();

      // Open application-modal message box
      TestBed.inject(MessageBoxService).open({content: 'message', cssClass: 'testee'}).then();

      // Expect message box to show
      await fixture.whenStable();
      expect(querySelector(fixture, 'wb-message-box.testee')).toBeDefined();
    });

    it('should display view-local message box', async () => {
      // Create fixture
      const fixture = TestBed.createComponent(RootTestComponent);
      fixture.debugElement.nativeElement.style.border = '1px solid black';

      // Launch workbench
      await TestBed.inject(WorkbenchLauncher).launch();

      // Open view
      await TestBed.inject(WorkbenchRouter).navigate(['view']);
      await fixture.whenStable();

      // Open view-local message box
      const viewDebugElement = debugElement(fixture, ViewTestComponent);
      viewDebugElement.injector.get(MessageBoxService).open({content: 'Message from View', cssClass: 'testee'}).then();
      await fixture.whenStable();

      // Expect message box to show
      expect(querySelector(fixture, 'wb-message-box.testee')).toBeDefined();
    });

    /****************************************************************************************************
     * Definition of Test Components                                                                    *
     ****************************************************************************************************/
    @Component({
      selector: 'spec-root',
      template: '<router-outlet></router-outlet>',
      standalone: true,
      imports: [
        RouterOutlet,
      ],
    })
    class RootTestComponent {
    }

    @Component({
      selector: 'spec-workbench',
      template: '<wb-workbench></wb-workbench>',
      styles: [':host {display: grid; height: 500px;}'],
      standalone: true,
      imports: [
        WorkbenchModule,
      ],
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

function querySelector(fixture: ComponentFixture<any>, selector: string): HTMLElement | undefined {
  return fixture.debugElement.query(By.css(selector))?.nativeElement ?? undefined;
}

function debugElement(fixture: ComponentFixture<any>, view: ComponentType<any>): DebugElement | undefined {
  return fixture.debugElement.query(By.directive(view)) ?? undefined;
}
