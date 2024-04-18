/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {RouterUtils} from './router.util';
import {TestBed} from '@angular/core/testing';
import {Router, UrlSegment} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {TestComponent} from '../testing/test.component';
import {waitForInitialWorkbenchLayout} from '../testing/testing.util';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {WorkbenchRouter} from './workbench-router.service';
import {ɵWorkbenchRouter} from './ɵworkbench-router.service';
import {canMatchWorkbenchView} from '../view/workbench-view-route-guards';

describe('RouterUtils.segmentsToCommands', () => {

  it('should convert segments to commands', () => {
    expect(RouterUtils.segmentsToCommands([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})])).toEqual(['a', 'b', 'c']);
  });

  it('should convert segments with matrix parameters to commands', () => {
    expect(RouterUtils.segmentsToCommands([new UrlSegment('a', {}), new UrlSegment('b', {param1: 'value1'}), new UrlSegment('c', {param1: 'value1', param2: 'value2'})])).toEqual(['a', 'b', {param1: 'value1'}, 'c', {param1: 'value1', param2: 'value2'}]);
  });
});

describe('RouterUtils.commandsToSegments', () => {

  it('should convert commands to segments', () => {
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments(['a', 'b', 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
      expect(RouterUtils.commandsToSegments(['a/b/c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
      expect(RouterUtils.commandsToSegments(['/a/b/c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {})]);
    });
  });

  it('should convert commands that contain matrix parameters', () => {
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments(['a', 'b', 'c', {param: 'value'}])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {param: 'value'})]);
      expect(RouterUtils.commandsToSegments(['a/b/c', {param: 'value'}])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('c', {param: 'value'})]);
      expect(RouterUtils.commandsToSegments(['a', 'b', {param: 'value'}, 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {param: 'value'}), new UrlSegment('c', {})]);
      expect(RouterUtils.commandsToSegments(['a/b', {param: 'value'}, 'c'])).toEqual([new UrlSegment('a', {}), new UrlSegment('b', {param: 'value'}), new UrlSegment('c', {})]);
    });
  });

  it('should convert empty commands array to empty segments array', () => {
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments([])).toEqual([]);
      expect(RouterUtils.commandsToSegments([''])).toEqual([]);
    });
  });

  it('should error if root segment contains matrix parameters', () => {
    TestBed.runInInjectionContext(() => {
      expect(() => RouterUtils.commandsToSegments(['', {name: 'param'}])).toThrowError('NG04003: Root segment cannot have matrix parameters');
      expect(() => RouterUtils.commandsToSegments([{name: 'param'}])).toThrowError('NG04003: Root segment cannot have matrix parameters');
    });
  });

  it('should error if appending matrix parameters to empty-path `relativeTo`', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect 'RouterUtils.commandsToSegments' to error.
    TestBed.runInInjectionContext(() => {
      expect(() => RouterUtils.commandsToSegments([{matrix: 'param'}], {relativeTo})).toThrowError('NG04003: Root segment cannot have matrix parameters');
    });
  });

  it('should ignore `relativeTo` for absolute commands', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect 'relativeTo' to be ignored for absolute commands
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments(['/path/to/view'], {relativeTo})).toEqual([new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {})]);
    });
  });

  it('should make commands relative to another route', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect segments to be relative to 'relative/to'.
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments(['1'], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('to', {}), new UrlSegment('1', {})]);
      expect(RouterUtils.commandsToSegments(['../abc'], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('abc', {})]);
    });
  });

  it('should ignore navigational symbols if not passing a `relativeTo`', () => {
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments(['../../path'])).toEqual([new UrlSegment('path', {})]);
    });
  });

  it('should append matrix parameters to `relativeTo`', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect commands to contain matrix parameters.
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments([{matrix: 'param'}], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('to', {matrix: 'param'})]);
    });
  });

  it('should append commands to empty-path `relativeTo`', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect segments to be 'path/to/view'.
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments(['path/to/view'], {relativeTo})).toEqual([new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {})]);
    });
  });

  it('should append empty commands to empty-path `relativeTo`', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect segments to be empty.
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments([], {relativeTo})).toEqual([]);
    });
  });

  it('should append empty commands to `relativeTo`', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'relative/to', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    // Add view to use as 'relativeTo'.
    await TestBed.inject(WorkbenchRouter).navigate(['relative/to'], {target: 'view.100'});
    const relativeTo = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.100')!;
    expect(relativeTo).toBeDefined();

    // Expect segments to be 'path/to
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.commandsToSegments([], {relativeTo})).toEqual([new UrlSegment('relative', {}), new UrlSegment('to', {})]);
    });
  });
});

describe('RouterUtils.pathToCommands', () => {

  it('should convert path to commands', () => {
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.pathToCommands('a/b/c')).toEqual(['a', 'b', 'c']);
    });
  });

  it('should convert path with matrix parameters to commands', () => {
    TestBed.runInInjectionContext(() => {
      expect(RouterUtils.pathToCommands('a/b;param1=value1/c;param2=value2;param3=value3')).toEqual(['a', 'b', {param1: 'value1'}, 'c', {param2: 'value2', param3: 'value3'}]);
    });
  });
});

describe('RouterUtils.parseViewOutlets', () => {

  it('should parse view outlets from URL', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'path/to/view/:id', component: TestComponent},
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

    // Add a non-view outlet.
    await TestBed.inject(Router).navigate([{outlets: {otherOutlet: ['a', 'b', 'c']}}]);

    // Expect to parse view outlets contained in the URL.
    const urlTree = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(RouterUtils.parseViewOutlets(urlTree)).toEqual(new Map()
      .set('view.101', [new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {}), new UrlSegment('101', {})])
      .set('view.103', [new UrlSegment('path', {}), new UrlSegment('to', {}), new UrlSegment('view', {}), new UrlSegment('103', {param1: 'value1', param2: 'value2'})]),
    );
  });
});

describe('RouterUtils.hasEmptyPathFromRoot', () => {

  it('should test', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: '', canMatch: [canMatchWorkbenchView('test-view')], component: TestComponent},
          {path: 'path/to/view', component: TestComponent},
        ]),
      ],
    });
    await waitForInitialWorkbenchLayout();

    const rootRoute = TestBed.inject(Router).routerState.root;
    expect(RouterUtils.hasEmptyPathFromRoot(rootRoute)).toBeTrue();

    await TestBed.inject(WorkbenchRouter).navigate([], {hint: 'test-view', target: 'view.1'});
    const route1 = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.1')!;
    expect(RouterUtils.hasEmptyPathFromRoot(route1)).toBeTrue();

    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.2'});
    const route2 = TestBed.inject(Router).routerState.root.children.find(route => route.outlet === 'view.2')!;
    expect(RouterUtils.hasEmptyPathFromRoot(route2)).toBeFalse();
  });
});
