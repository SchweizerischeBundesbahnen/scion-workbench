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
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {provideRouter, RouterOutlet} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {styleFixture, waitUntilWorkbenchStarted, waitUntilStable} from '../testing/testing.util';
import {Component} from '@angular/core';
import PageNotFoundComponent from '../page-not-found/page-not-found.component';
import {WorkbenchComponent} from '../workbench.component';
import {canMatchWorkbenchView} from '../routing/workbench-route-guards';

describe('CanMatchWorkbenchView Guard', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should match empty path route if not installed `canMatchWorkbenchView` guard', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: '', component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to empty path route.
    await workbenchRouter.navigate([], {hint: 'ignored'});
    await waitUntilStable();

    expect(fixture).toShow(View1Component);
  });

  it('should match empty path route based on hint passed to the navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('view-1')], component: View1Component},
          {path: '', canMatch: [canMatchWorkbenchView('view-2')], component: View2Component},
          {path: '', canMatch: [canMatchWorkbenchView('view-3')], component: View3Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to view 1
    await workbenchRouter.navigate([], {hint: 'view-1', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(View1Component);

    // Navigate to view 2
    await workbenchRouter.navigate([], {hint: 'view-2', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(View2Component);

    // Navigate to view 3
    await workbenchRouter.navigate([], {hint: 'view-3', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(View3Component);
  });

  it('should match nested empty path route based on hint passed to the navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {
            path: '',
            children: [
              {
                path: '',
                children: [
                  {path: '', canMatch: [canMatchWorkbenchView('view-1')], component: View1Component},
                  {path: '', canMatch: [canMatchWorkbenchView('view-2')], component: View2Component},
                  {path: '', canMatch: [canMatchWorkbenchView('view-3')], component: View3Component},
                ],
              },
            ],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to view 1
    await workbenchRouter.navigate([], {hint: 'view-1', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(View1Component);

    // Navigate to view 2
    await workbenchRouter.navigate([], {hint: 'view-2', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(View2Component);

    // Navigate to view 3
    await workbenchRouter.navigate([], {hint: 'view-3', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(View3Component);
  });

  it('should not match route if target of a workbench view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', canMatch: [canMatchWorkbenchView(false)], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to 'path/to/view'.
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view']);
    await waitUntilStable();
    expect(fixture).toShow(PageNotFoundComponent);
  });

  it('should match route if target of a workbench view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', canMatch: [canMatchWorkbenchView(true)], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to 'path/to/view'.
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view']);
    await waitUntilStable();
    expect(fixture).toShow(View1Component);
  });

  it('should match route if matching the hint passed to the navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', canMatch: [canMatchWorkbenchView('hint')], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to 'path/to/view' passing matching hint.
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {hint: 'hint'});
    await waitUntilStable();
    expect(fixture).toShow(View1Component);
  });

  it('should not match route if navigating without hint', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', canMatch: [canMatchWorkbenchView('hint')], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to 'path/to/view' without passing a hint.
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view']);
    await waitUntilStable();
    expect(fixture).toShow(PageNotFoundComponent);
  });

  it('should not match route if navigating with different hint', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', canMatch: [canMatchWorkbenchView('hint')], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to 'path/to/view' passing non-matching hint.
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {hint: 'other-hint'});
    await waitUntilStable();
    expect(fixture).toShow(PageNotFoundComponent);
  });

  it('should error when loading the application root route into a view', async () => {
    await jasmine.spyOnGlobalErrorsAsync(async errors => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: '', component: WorkbenchComponent}, // do not guard the application root route
            {path: '', canMatch: [canMatchWorkbenchView('view-1')], component: View1Component},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(RouterOutletComponent));
      await waitUntilWorkbenchStarted();

      // Navigate to the empty path route.
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await workbenchRouter.navigate([], {hint: 'view-1'});
      await waitUntilStable();

      expect(errors).toHaveBeenCalledWith(jasmine.stringMatching(/\[WorkbenchError] Circular loading of the workbench component detected in view 'view\.1'\. Did you forget to add the CanMatch guard 'canMatchWorkbenchView\(false\)' to the root \(empty-path\) route of the application\?/));
      expect(fixture).not.toShow(View1Component);
    });
  });

  it('should not load the application root route into a view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView(false)], component: WorkbenchComponent}, // prevent loading the application root route into a view
          {path: '', canMatch: [canMatchWorkbenchView('view-1')], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(RouterOutletComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to the empty path route.
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate([], {hint: 'view-1'});
    await waitUntilStable();

    expect(fixture).toShow(View1Component);
  });
});

describe('CanMatchNotFoundPage', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should display "Not Found" page if not matching a route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: '', canMatch: [() => false], component: View1Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to empty path route.
    await workbenchRouter.navigate([], {hint: 'hint', target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(PageNotFoundComponent);

    // Navigate to 'path/to/view'.
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();
    expect(fixture).toShow(PageNotFoundComponent);
  });
});

@Component({
  selector: 'spec-view-1',
  template: 'View 1',
})
class View1Component {
}

@Component({
  selector: 'spec-view-2',
  template: 'View 2',
})
class View2Component {
}

@Component({
  selector: 'spec-view-3',
  template: 'View 3',
})
class View3Component {
}

@Component({
  selector: 'spec-router-outlet',
  template: '<router-outlet/>',
  styles: [':host { display: grid; }'],
  imports: [
    RouterOutlet,
  ],
})
class RouterOutletComponent {
}
