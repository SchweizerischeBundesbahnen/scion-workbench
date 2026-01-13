/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter, RouterOutlet} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {styleFixture, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {Component} from '@angular/core';
import {WorkbenchComponent} from '../workbench.component';
import {canMatchWorkbenchPart} from '../routing/workbench-route-guards';
import PageNotFoundComponent from '../page-not-found/page-not-found.component';

describe('CanMatchWorkbenchPart Guard', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should match route if target of a workbench part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', ['path/to/part']),
        }),
        provideRouter([
          {path: 'path/to/part', canMatch: [canMatchWorkbenchPart(false)], component: Part1Component},
          {path: 'path/to/part', canMatch: [canMatchWorkbenchPart(true)], component: Part2Component},
          {path: 'path/to/part', component: Part3Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(Part2Component);
  });

  it('should match empty-path route if target of a workbench part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', ['']),
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchPart(false)], component: Part1Component},
          {path: '', canMatch: [canMatchWorkbenchPart(true)], component: Part2Component},
          {path: '', component: Part3Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(Part2Component);
  });

  it('should match route if matching the hint passed to the navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', ['path/to/part'], {hint: 'hint-2'}),
        }),
        provideRouter([
          {path: 'path/to/part', canMatch: [canMatchWorkbenchPart('hint-1')], component: Part1Component},
          {path: 'path/to/part', canMatch: [canMatchWorkbenchPart('hint-2')], component: Part2Component},
          {path: 'path/to/part', component: Part3Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(Part2Component);
  });

  it('should match empty-path route if matching the hint passed to the navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', [''], {hint: 'hint-2'}),
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchPart('hint-1')], component: Part1Component},
          {path: '', canMatch: [canMatchWorkbenchPart('hint-2')], component: Part2Component},
          {path: '', component: Part3Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(Part2Component);
  });

  it('should not match route if navigating without hint', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', ['path/to/part']),
        }),
        provideRouter([
          {path: 'path/to/part', canMatch: [canMatchWorkbenchPart('hint')], component: Part1Component},
          {path: 'path/to/part', component: Part2Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(Part2Component);
  });

  it('should not match empty-path route if navigating without hint', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', ['']),
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchPart('hint')], component: Part1Component},
          {path: '', component: Part2Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(Part2Component);
  });

  it('should error when loading the application\'s default route into a part', async () => {
    await jasmine.spyOnGlobalErrorsAsync(async errors => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.1')
              .navigatePart('part.1', [''], {hint: 'hint'}),
          }),
          provideRouter([
            {path: '', component: WorkbenchComponent}, // do not guard the application's default route
            {path: '', canMatch: [canMatchWorkbenchPart(true)], component: Part1Component},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(RouterOutletComponent));
      await waitUntilWorkbenchStarted();

      expect(errors).toHaveBeenCalledWith(jasmine.stringMatching(/\[WorkbenchError] Circular loading of the workbench component detected in workbench outlet 'part\.1'\./));
      expect(fixture).not.toShow(Part1Component);
    });
  });
});

describe('CanMatchNotFoundPage', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should display "Not Found" page if not matching a route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.1')
            .navigatePart('part.1', ['path/to/part']),
        }),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toShow(PageNotFoundComponent);
  });
});

@Component({
  selector: 'spec-part-1',
  template: 'Part 1',
})
class Part1Component {
}

@Component({
  selector: 'spec-part-2',
  template: 'Part 2',
})
class Part2Component {
}

@Component({
  selector: 'spec-part-3',
  template: 'Part 3',
})
class Part3Component {
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
