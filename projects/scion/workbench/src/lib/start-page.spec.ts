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
import {WorkbenchLayoutFactory} from './layout/workbench-layout.factory';
import {expect} from './testing/jasmine/matcher/custom-matchers.definition';

describe('Start Page', () => {

  describe('Layout with main area', () => {

    it('should display start page when all views are closed', async () => {
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
      expect(fixture.debugElement.query(By.css('wb-main-area-layout > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page');
      expect(fixture.debugElement.query(By.css('wb-part'))).toBeNull();

      // Open view
      await wbRouter.navigate(['/test-view']);
      await waitUntilStable();

      // Expect start page not to display
      expect(fixture.debugElement.query(By.css('wb-main-area-layout > sci-viewport > router-outlet'))).toBeNull();
      expect(fixture.debugElement.query(By.css('wb-part'))).not.toBeNull();

      // Close view
      await wbRouter.navigate(['/test-view'], {close: true});
      await waitUntilStable();

      // Expect start page to display
      expect(fixture.debugElement.query(By.css('wb-main-area-layout > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page');
      expect(fixture.debugElement.query(By.css('wb-part'))).toBeNull();
    });

    it('should overflow start page if exceeding available vertical space ', async () => {
      TestBed.configureTestingModule({
        imports: [
          WorkbenchTestingModule.forTest(),
          RouterTestingModule.withRoutes([
            {
              path: '',
              loadComponent: () => import('./testing/test.component'),
              providers: [withComponentContent('Start Page')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      fixture.debugElement.nativeElement.style.height = '500px';
      await waitForInitialWorkbenchLayout();

      // Change height of start page to 5000px
      fixture.debugElement.query(By.css('spec-test-component')).nativeElement.style.height = '5000px';

      // Expect start page not to exceed 500px
      expect(getComputedStyle(fixture.debugElement.query(By.css('wb-main-area-layout > sci-viewport')).nativeElement).height).toEqual('500px');
    });
  });

  describe('Layout without main area', () => {

    it('should display start page when all views are closed', async () => {
      TestBed.configureTestingModule({
        imports: [
          WorkbenchTestingModule.forTest({
            layout: (factory: WorkbenchLayoutFactory) => factory
              .addPart('part')
              .addView('test-view', {partId: 'part', activateView: true}),
          }),
          RouterTestingModule.withRoutes([
            {
              path: '',
              loadComponent: () => import('./testing/test.component'),
              providers: [withComponentContent('Start Page')],
            },
            {
              path: '',
              outlet: 'test-view',
              loadComponent: () => import('./testing/test.component'),
              providers: [withComponentContent('View')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitForInitialWorkbenchLayout();
      const wbRouter = TestBed.inject(WorkbenchRouter);

      // Expect start page not to display
      expect(fixture.debugElement.query(By.css('wb-workbench-layout > sci-viewport > router-outlet'))).toBeNull();
      expect(fixture.debugElement.query(By.css('wb-part'))).not.toBeNull();

      // Close view
      await wbRouter.navigate([], {target: 'test-view', close: true});
      await waitUntilStable();

      // Expect start page to display
      expect(fixture.debugElement.query(By.css('wb-workbench-layout > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page');
      expect(fixture.debugElement.query(By.css('wb-part'))).toBeNull();
    });

    it('should overflow start page if exceeding available vertical space ', async () => {
      TestBed.configureTestingModule({
        imports: [
          WorkbenchTestingModule.forTest({
            layout: (factory: WorkbenchLayoutFactory) => factory.addPart('part'),
          }),
          RouterTestingModule.withRoutes([
            {
              path: '',
              loadComponent: () => import('./testing/test.component'),
              providers: [withComponentContent('Start Page')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      fixture.debugElement.nativeElement.style.height = '500px';
      await waitForInitialWorkbenchLayout();

      // Change height of start page to 5000px
      fixture.debugElement.query(By.css('spec-test-component')).nativeElement.style.height = '5000px';

      // Expect start page not to exceed 500px
      expect(getComputedStyle(fixture.debugElement.query(By.css('wb-workbench-layout > sci-viewport')).nativeElement).height).toEqual('500px');
    });
  });
});
