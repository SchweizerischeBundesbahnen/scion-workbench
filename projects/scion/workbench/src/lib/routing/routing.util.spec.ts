/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Routing} from './routing.util';
import {ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {ActivatedRoute, ActivatedRouteSnapshot, ChildrenOutletContexts, provideRouter, Router, RouterOutlet, UrlSegment} from '@angular/router';
import {TestComponent} from '../testing/test.component';
import {styleFixture, waitForInitialWorkbenchLayout} from '../testing/testing.util';
import {WorkbenchRouter} from './workbench-router.service';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {canMatchWorkbenchView} from './workbench-route-guards';
import {ViewId} from '../view/workbench-view.model';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {Component, inject, OnDestroy} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';

describe('Routing.segmentsToCommands', () => {

  it('should convert segments to commands', () => {
    expect(Routing.segmentsToCommands([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})])).toEqual(['a', 'b', 'c']);
  });

  it('should convert segments with matrix parameters to commands', () => {
    expect(Routing.segmentsToCommands([new UrlSegment('a', {}), new UrlSegment('b', {param1: 'value1'}), new UrlSegment('c', {param1: 'value1', param2: 'value2'})])).toEqual(['a', 'b', {param1: 'value1'}, 'c', {param1: 'value1', param2: 'value2'}]);
  });
});

describe('Routing.commandsToSegments', () => {

  it('should convert commands to segments', () => {
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments(['a', 'b', 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
      expect(Routing.commandsToSegments(['a/b/c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
      expect(Routing.commandsToSegments(['/a/b/c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
    });
  });

  it('should convert commands that contain matrix parameters', () => {
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments(['a', 'b', 'c', {param: 'value'}])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {param: 'value'})]);
      expect(Routing.commandsToSegments(['a/b/c', {param: 'value'}])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {param: 'value'})]);
      expect(Routing.commandsToSegments(['a', 'b', {param: 'value'}, 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {param: 'value'}), new UrlSegment('c', {})]);
      expect(Routing.commandsToSegments(['a/b', {param: 'value'}, 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {param: 'value'}), new UrlSegment('c', {})]);
    });
  });

  it('should convert empty commands array to empty segments array', () => {
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments([])).toEqual([]);
      expect(Routing.commandsToSegments([''])).toEqual([]);
    });
  });

  it('should error if root segment contains matrix parameters', () => {
    TestBed.runInInjectionContext(() => {
      expect(() => Routing.commandsToSegments(['', {name: 'param'}])).toThrowError('NG04003: Root segment cannot have matrix parameters');
      expect(() => Routing.commandsToSegments([{name: 'param'}])).toThrowError('NG04003: Root segment cannot have matrix parameters');
    });
  });

  it('should error if appending matrix parameters to empty-path `relativeTo`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect 'Routing.commandsToSegments' to error.
    TestBed.runInInjectionContext(() => {
      expect(() => Routing.commandsToSegments([{matrix: 'param'}], {relativeTo})).toThrowError('NG04003: Root segment cannot have matrix parameters');
    });
  });

  it('should ignore `relativeTo` for absolute commands', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect 'relativeTo' to be ignored for absolute commands
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments(['/path/to/view'], {relativeTo})).toEqual([new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {})]);
    });
  });

  it('should make commands relative to another route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect segments to be relative to 'relative/to'.
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments(['1'], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('to', {}), new UrlSegment('1', {})]);
      expect(Routing.commandsToSegments(['../abc'], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('abc', {})]);
    });
  });

  it('should ignore navigational symbols if not passing a `relativeTo`', () => {
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments(['../../path'])).toEqual([new UrlSegment('path', {})]);
    });
  });

  it('should append matrix parameters to `relativeTo`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect commands to contain matrix parameters.
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments([{matrix: 'param'}], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('to', {matrix: 'param'})]);
    });
  });

  it('should append commands to empty-path `relativeTo`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect segments to be 'path/to/view'.
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments(['path/to/view'], {relativeTo})).toEqual([new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {})]);
    });
  });

  it('should append empty commands to empty-path `relativeTo`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect segments to be empty.
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments([], {relativeTo})).toEqual([]);
    });
  });

  it('should append empty commands to `relativeTo`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = resolveEffectiveRoute('view.100');
    expect(relativeTo).toBeDefined();

    // Expect segments to be 'path/to
    TestBed.runInInjectionContext(() => {
      expect(Routing.commandsToSegments([], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('to', {})]);
    });
  });
});

describe('Routing.pathToCommands', () => {

  it('should convert path to commands', () => {
    TestBed.runInInjectionContext(() => {
      expect(Routing.pathToCommands('a/b/c')).toEqual(['a', 'b', 'c']);
    });
  });

  it('should convert path with matrix parameters to commands', () => {
    TestBed.runInInjectionContext(() => {
      expect(Routing.pathToCommands('a/b;param1=value1/c;param2=value2;param3=value3')).toEqual(['a', 'b', {param1: 'value1'}, 'c', {param2: 'value2', param3: 'value3'}]);
    });
  });
});

describe('Routing.parseOutlets', () => {

  it('should parse outlets from URL', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/:id', component: TestComponent},
          {path: 'path/to/part/:id', component: TestComponent},
          {path: 'a/b/c', outlet: 'otherOutlet', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view outlets view.101 and view.103 to the URL.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => {
        const activeMainAreaPart = layout.activePart({grid: 'mainArea'})!;
        return layout
          .addView('view.101', {partId: activeMainAreaPart.id})
          .addView('view.102', {partId: activeMainAreaPart.id})
          .addView('view.103', {partId: activeMainAreaPart.id})
          .navigateView('view.101', ['path/to/view/101'])
          .navigateView('view.103', ['path/to/view/103', {param1: 'value1', param2: 'value2'}]);
      },
    );

    // Add part outlets part.left and part.right to the URL.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout
      .addPart('part.left', {align: 'left'})
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part/left'])
      .navigatePart('part.right', ['path/to/part/right', {param1: 'value1', param2: 'value2'}]),
    );

    // Add a different outlet.
    await TestBed.inject(Router).navigate([{outlets: {otherOutlet: ['a', 'b', 'c']}}]);

    // Expect to parse view outlets contained in the URL.
    const urlTree = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(Routing.parseOutlets(urlTree, {view: true})).toEqual(new Map()
      .set('view.101', [new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {}), new UrlSegment('101', {})])
      .set('view.103', [new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {}), new UrlSegment('103', {param1: 'value1', param2: 'value2'})]),
    );

    // Expect to parse part outlets contained in the URL.
    expect(Routing.parseOutlets(urlTree, {part: true})).toEqual(new Map()
      .set('part.left', [new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('part', {}), new UrlSegment('left', {})])
      .set('part.right', [new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('part', {}), new UrlSegment('right', {param1: 'value1', param2: 'value2'})]),
    );
  });
});

describe('Routing.hasEmptyPathFromRoot', () => {

  it('should indicate empty path from root', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
          {path: 'path/to/view', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    const rootRoute = TestBed.inject(Router).routerState.root;
    expect(Routing.hasEmptyPathFromRoot(Routing.resolveEffectiveRoute(rootRoute))).toBeTrue();

    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.1'});
    const route1 = resolveEffectiveRoute('view.1');
    expect(Routing.hasEmptyPathFromRoot(route1)).toBeTrue();

    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.2'});
    const route2 = resolveEffectiveRoute('view.2');
    expect(Routing.hasEmptyPathFromRoot(route2)).toBeFalse();
  });
});

describe('Routing.resolveEffectiveRoute', () => {

  it('should resolve the effective route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {
            path: 'view', loadComponent: () => TestComponent,
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {target: 'view.100'});

    // Get the top-level `ActivatedRoute` of the view.
    const componentInjector = fixture.debugElement.query(By.directive(TestComponent)).injector;
    const viewRoute = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;

    // Expect correct `ActivatedRoute`.
    expect(Routing.resolveEffectiveRoute(viewRoute)).toBe(componentInjector.get(ActivatedRoute));
  });

  it('should resolve the effective child route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {
            path: 'path',
            children: [
              {
                path: 'to',
                loadChildren: () => [
                  {
                    path: 'view',
                    loadComponent: () => TestComponent,
                  },
                ],
              },
            ],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});

    // Get the top-level `ActivatedRoute` of the view.
    const componentInjector = fixture.debugElement.query(By.directive(TestComponent)).injector;
    const viewRoute = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;

    // Expect correct `ActivatedRoute`.
    expect(Routing.resolveEffectiveRoute(viewRoute)).toBe(componentInjector.get(ActivatedRoute));
  });

  it('should resolve the effective child outlet', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {
            path: 'path',
            children: [
              {
                path: 'to',
                loadChildren: () => [
                  {
                    path: 'view',
                    loadComponent: () => TestComponent,
                  },
                ],
              },
            ],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});

    // Get the top-level `OutletContext` of the view.
    const componentInjector = fixture.debugElement.query(By.directive(TestComponent)).injector;
    const outletContext = TestBed.inject(ChildrenOutletContexts).getContext('view.100');

    // Expect correct `OutletContext`.
    expect(Routing.resolveEffectiveOutletContext(outletContext)!.outlet).toBe(componentInjector.get(RouterOutlet));
  });
});

describe('Routing.activatedRoute$', () => {

  const logs = {
    emitOnAlways: new Array<string>(),
    emitOnRouteChange: new Array<string>(),
    emitOnRouteOrParamChange: new Array<string>(),
  };

  beforeEach(() => clearLog());

  /**
   * We have a fixture that displays a router outlet named "outlet".
   *
   * We subscribe to {@link Routing#activatedRoute$} with different emission strategies: `always`, `routeChange` and `routeOrParamChange`.
   * We log component construction, component destruction and `activatedRoute$` emissions per strategy.
   *
   * In this test, we navigate the outlet to the following routes:
   * - /route-1 in outlet 'outlet'
   * - /route-2 in outlet 'outlet'
   * - /route/3 in outlet 'outlet'
   * - /route/4 in outlet 'outlet'
   * - /route/:id in outlet 'outlet'
   * - /path/to/module-a/route-6 in outlet 'outlet'
   * - /path/to/module-b/route/7 in outlet 'outlet'
   * - /path/to/module-b/route/8 in outlet 'outlet'
   * - /path/to/module-b/route/:id in outlet 'outlet'
   * - /route/10 in outlet 'other'
   * - /route/11 in outlet 'primary'
   *
   * This test verifies the correct emission order (after destroying the previous component but before constructing the new component).
   */
  it('should emit between destroying previous and constructing new component', async () => {
    @Component({
      selector: 'spec-testee',
      template: '<router-outlet name="outlet"/>',
      imports: [RouterOutlet],
      standalone: true,
    })
    class TestComponent {
    }

    configureRoutes();
    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();
    styleFixture(fixture);

    // Subscribe to "Routing.activatedRoute$" with emission strategy `always`.
    TestBed.runInInjectionContext(() => Routing.activatedRoute$('outlet', {emitOn: 'always'})).subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
      logs.emitOnAlways.push(`Routing.activatedRoute$ [previousActivatedRoute.data.route=${previous?.data['route'] ?? null}, currentActivatedRoute.data.route=${current.data['route']}, differentRouteConfig=${previous?.routeConfig !== current.routeConfig}]`);
    });
    // Subscribe to "Routing.activatedRoute$" with emission strategy `routeChange`.
    TestBed.runInInjectionContext(() => Routing.activatedRoute$('outlet', {emitOn: 'routeChange'})).subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
      logs.emitOnRouteChange.push(`Routing.activatedRoute$ [previousActivatedRoute.data.route=${previous?.data['route'] ?? null}, currentActivatedRoute.data.route=${current.data['route']}, differentRouteConfig=${previous?.routeConfig !== current.routeConfig}]`);
    });
    // Subscribe to "Routing.activatedRoute$" with emission strategy `routeOrParamChange`.
    TestBed.runInInjectionContext(() => Routing.activatedRoute$('outlet', {emitOn: 'routeOrParamChange'})).subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
      logs.emitOnRouteOrParamChange.push(`Routing.activatedRoute$ [previousActivatedRoute.data.route=${previous?.data['route'] ?? null}, currentActivatedRoute.data.route=${current.data['route']}, differentRouteConfig=${previous?.routeConfig !== current.routeConfig}]`);
    });

    // Navigate outlet to /route-1.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route-1']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=null, currentActivatedRoute.data.route=route#1, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#1]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=null, currentActivatedRoute.data.route=route#1, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#1]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=null, currentActivatedRoute.data.route=route#1, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#1]',
    ]);
    clearLog();

    // Navigate outlet to /route-2.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route-2']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#1]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#1, currentActivatedRoute.data.route=route#2, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#2]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#1]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#1, currentActivatedRoute.data.route=route#2, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#2]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#1]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#1, currentActivatedRoute.data.route=route#2, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#2]',
    ]);
    clearLog();

    // Navigate outlet to /route/3.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', 3]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#2]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#2, currentActivatedRoute.data.route=route#3, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#3]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#2]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#2, currentActivatedRoute.data.route=route#3, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#3]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#2]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#2, currentActivatedRoute.data.route=route#3, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#3]',
    ]);
    clearLog();

    // Navigate outlet to /route/4.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', 4]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#3]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#3, currentActivatedRoute.data.route=route#4, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#4]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#3]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#3, currentActivatedRoute.data.route=route#4, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#4]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#3]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#3, currentActivatedRoute.data.route=route#4, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#4]',
    ]);
    clearLog();

    // Navigate outlet to /route/5a.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', '5a']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#4]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#4, currentActivatedRoute.data.route=route#5, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#5]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#4]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#4, currentActivatedRoute.data.route=route#5, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#5]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#4]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#4, currentActivatedRoute.data.route=route#5, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#5]',
    ]);
    clearLog();

    // Navigate outlet to /route/5b.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', '5b']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#5, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#5, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-a/route-6
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-a', 'route-6']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#5]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-a, currentActivatedRoute.data.route=route#6, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#6]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#5]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-a, currentActivatedRoute.data.route=route#6, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#6]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#5]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-a, currentActivatedRoute.data.route=route#6, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#6]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/7
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 7]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#6]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-b, currentActivatedRoute.data.route=route#7, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#7]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#6]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-b, currentActivatedRoute.data.route=route#7, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#7]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#6]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-b, currentActivatedRoute.data.route=route#7, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#7]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/8
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 8]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#7]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#7, currentActivatedRoute.data.route=route#8, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#8]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#7]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#7, currentActivatedRoute.data.route=route#8, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#8]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#7]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#7, currentActivatedRoute.data.route=route#8, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#8]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9a
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', '9a']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Component.destroy [activatedRoute.data.route=route#8]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#8, currentActivatedRoute.data.route=route#9, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#9]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#8]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#8, currentActivatedRoute.data.route=route#9, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#9]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Component.destroy [activatedRoute.data.route=route#8]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#8, currentActivatedRoute.data.route=route#9, differentRouteConfig=true]',
      'Component.construct [activatedRoute.data.route=route#9]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9b
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', '9b']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9b;param=1
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 9, {param: 1}]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9b;param=2
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 9, {param: 2}]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate other outlet to /route/10
    await TestBed.inject(Router).navigate([{outlets: {other: ['route', 10]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([]);
    clearLog();

    // Navigate other outlet to /route/11
    await TestBed.inject(Router).navigate(['route/11']);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([]);
    clearLog();
  });

  /**
   * We have a fixture that displays no outlet.
   *
   * We subscribe to {@link Routing#activatedRoute$} with different emission strategies: `always`, `routeChange` and `routeOrParamChange`.
   * We log `activatedRoute$` emissions per strategy.
   *
   * In this test, we navigate the outlet to the following routes:
   * - /route-1 in outlet 'outlet'
   * - /route-2 in outlet 'outlet'
   * - /route/3 in outlet 'outlet'
   * - /route/4 in outlet 'outlet'
   * - /route/:id in outlet 'outlet'
   * - /path/to/module-a/route-6 in outlet 'outlet'
   * - /path/to/module-b/route/7 in outlet 'outlet'
   * - /path/to/module-b/route/8 in outlet 'outlet'
   * - /path/to/module-b/route/:id in outlet 'outlet'
   * - /route/10 in outlet 'other'
   * - /route/11 in outlet 'primary'
   *
   * This test verifies the correct activation events to be emitted.
   */
  it('should emit activation events if outlet is not constructed', async () => {
    @Component({
      selector: 'spec-testee',
      template: 'Testee',
      standalone: true,
    })
    class TestComponent {
    }

    configureRoutes();
    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();
    styleFixture(fixture);

    // Subscribe to "Routing.activatedRoute$" with emission strategy `always`.
    TestBed.runInInjectionContext(() => Routing.activatedRoute$('outlet', {emitOn: 'always'})).subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
      logs.emitOnAlways.push(`Routing.activatedRoute$ [previousActivatedRoute.data.route=${previous?.data['route'] ?? null}, currentActivatedRoute.data.route=${current.data['route']}, differentRouteConfig=${previous?.routeConfig !== current.routeConfig}]`);
    });
    // Subscribe to "Routing.activatedRoute$" with emission strategy `routeChange`.
    TestBed.runInInjectionContext(() => Routing.activatedRoute$('outlet', {emitOn: 'routeChange'})).subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
      logs.emitOnRouteChange.push(`Routing.activatedRoute$ [previousActivatedRoute.data.route=${previous?.data['route'] ?? null}, currentActivatedRoute.data.route=${current.data['route']}, differentRouteConfig=${previous?.routeConfig !== current.routeConfig}]`);
    });
    // Subscribe to "Routing.activatedRoute$" with emission strategy `routeOrParamChange`.
    TestBed.runInInjectionContext(() => Routing.activatedRoute$('outlet', {emitOn: 'routeOrParamChange'})).subscribe(([previous, current]: [ActivatedRouteSnapshot | null, ActivatedRouteSnapshot]) => {
      logs.emitOnRouteOrParamChange.push(`Routing.activatedRoute$ [previousActivatedRoute.data.route=${previous?.data['route'] ?? null}, currentActivatedRoute.data.route=${current.data['route']}, differentRouteConfig=${previous?.routeConfig !== current.routeConfig}]`);
    });

    // Navigate outlet to /route-1.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route-1']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=null, currentActivatedRoute.data.route=route#1, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=null, currentActivatedRoute.data.route=route#1, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=null, currentActivatedRoute.data.route=route#1, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /route-2.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route-2']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#1, currentActivatedRoute.data.route=route#2, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#1, currentActivatedRoute.data.route=route#2, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#1, currentActivatedRoute.data.route=route#2, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /route/3.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', 3]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#2, currentActivatedRoute.data.route=route#3, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#2, currentActivatedRoute.data.route=route#3, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#2, currentActivatedRoute.data.route=route#3, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /route/4.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', 4]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#3, currentActivatedRoute.data.route=route#4, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#3, currentActivatedRoute.data.route=route#4, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#3, currentActivatedRoute.data.route=route#4, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /route/5a.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', '5a']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#4, currentActivatedRoute.data.route=route#5, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#4, currentActivatedRoute.data.route=route#5, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#4, currentActivatedRoute.data.route=route#5, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /route/5b.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['route', '5b']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#5, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#5, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-a/route-6
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-a', 'route-6']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#module-a, differentRouteConfig=true]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-a, currentActivatedRoute.data.route=route#6, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#module-a, differentRouteConfig=true]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-a, currentActivatedRoute.data.route=route#6, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#5, currentActivatedRoute.data.route=route#module-a, differentRouteConfig=true]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-a, currentActivatedRoute.data.route=route#6, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/7
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 7]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#6, currentActivatedRoute.data.route=route#module-b, differentRouteConfig=true]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-b, currentActivatedRoute.data.route=route#7, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#6, currentActivatedRoute.data.route=route#module-b, differentRouteConfig=true]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-b, currentActivatedRoute.data.route=route#7, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#6, currentActivatedRoute.data.route=route#module-b, differentRouteConfig=true]',
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#module-b, currentActivatedRoute.data.route=route#7, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/8
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 8]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#7, currentActivatedRoute.data.route=route#8, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#7, currentActivatedRoute.data.route=route#8, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#7, currentActivatedRoute.data.route=route#8, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9a
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', '9a']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#8, currentActivatedRoute.data.route=route#9, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#8, currentActivatedRoute.data.route=route#9, differentRouteConfig=true]',
    ]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#8, currentActivatedRoute.data.route=route#9, differentRouteConfig=true]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9b
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', '9b']}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9b;param=1
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 9, {param: 1}]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate outlet to /path/to/module-b/route/9b;param=2
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'module-b', 'route', 9, {param: 2}]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    clearLog();

    // Navigate other outlet to /route/10
    await TestBed.inject(Router).navigate([{outlets: {other: ['route', 10]}}]);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([]);
    clearLog();

    // Navigate other outlet to /route/11
    await TestBed.inject(Router).navigate(['route/11']);
    await fixture.whenStable();
    expect(logs.emitOnAlways).toEqual([
      'Routing.activatedRoute$ [previousActivatedRoute.data.route=route#9, currentActivatedRoute.data.route=route#9, differentRouteConfig=false]',
    ]);
    expect(logs.emitOnRouteChange).toEqual([]);
    expect(logs.emitOnRouteOrParamChange).toEqual([]);
    clearLog();
  });

  @Component({selector: 'spec-component', template: '{{route}}', standalone: true})
  class SpecComponent implements OnDestroy {

    public route: string;

    constructor() {
      this.route = inject(ActivatedRoute).snapshot.data['route'];
      const logMessasge = `Component.construct [activatedRoute.data.route=${this.route}]`;
      logs.emitOnAlways.push(logMessasge);
      logs.emitOnRouteChange.push(logMessasge);
      logs.emitOnRouteOrParamChange.push(logMessasge);
    }

    public ngOnDestroy(): void {
      const logMessage = `Component.destroy [activatedRoute.data.route=${this.route}]`;
      logs.emitOnAlways.push(logMessage);
      logs.emitOnRouteChange.push(logMessage);
      logs.emitOnRouteOrParamChange.push(logMessage);
    }
  }

  function clearLog(): void {
    logs.emitOnAlways.length = 0;
    logs.emitOnRouteChange.length = 0;
    logs.emitOnRouteOrParamChange.length = 0;
  }

  function configureRoutes(): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'route-1',
            outlet: 'outlet',
            loadComponent: () => SpecComponent,
            data: {route: 'route#1'},
          },
          {
            path: 'route-2',
            outlet: 'outlet',
            loadComponent: () => SpecComponent,
            data: {route: 'route#2'},
          },
          {
            path: 'route/3',
            outlet: 'outlet',
            loadComponent: () => SpecComponent,
            data: {route: 'route#3'},
          },
          {
            path: 'route/4',
            outlet: 'outlet',
            loadComponent: () => SpecComponent,
            data: {route: 'route#4'},
          },
          {
            path: 'route/:id',
            outlet: 'outlet',
            loadComponent: () => SpecComponent,
            data: {route: 'route#5'},
          },
          {
            path: 'path/to/module-a',
            outlet: 'outlet',
            data: {route: 'route#module-a'},
            loadChildren: () => [
              {
                path: 'route-6',
                loadComponent: () => SpecComponent,
                data: {route: 'route#6'},
              },
            ],
          },
          {
            path: 'path/to/module-b',
            outlet: 'outlet',
            data: {route: 'route#module-b'},
            loadChildren: () => [
              {
                path: 'route/7',
                loadComponent: () => SpecComponent,
                data: {route: 'route#7'},
              },
              {
                path: 'route/8',
                loadComponent: () => SpecComponent,
                data: {route: 'route#8'},
              },
              {
                path: 'route/:id',
                loadComponent: () => SpecComponent,
                data: {route: 'route#9'},
              },
            ],
          },
          {
            path: 'route/10',
            outlet: 'other',
            loadComponent: () => SpecComponent,
            data: {route: 'route#10'},
          },
          {
            path: 'route/11',
            loadComponent: () => SpecComponent,
            data: {route: 'route#11'},
          },
        ]),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });
  }
});

/**
 * Resolves the effective route of given view.
 */
function resolveEffectiveRoute(viewId: ViewId): ActivatedRoute {
  return Routing.resolveEffectiveRoute(TestBed.inject(Router).routerState.root.children.find(route => route.outlet === viewId)!);
}
