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
import {any, MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {TestComponent} from '../testing/test.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {MAIN_AREA, WorkbenchLayout} from './workbench-layout';
import {WorkbenchComponent} from '../workbench.component';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {WorkbenchService} from '../workbench.service';
import {ɵWorkbenchLayoutFactory} from './ɵworkbench-layout.factory';
import {WorkbenchLayoutStorageService} from './workbench-layout-storage.service';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchStorage} from '../storage/workbench-storage';
import {Maps} from '@scion/toolkit/util';
import {firstValueFrom, Subject} from 'rxjs';

describe('WorkbenchPerspectiveStorage', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should write the layout to storage on every layout change', async () => {
    // GIVEN: Single perspective with two parts
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {
                id: 'perspective',
                layout: factory => factory
                  .addPart(MAIN_AREA)
                  .addPart('part.left-top', {align: 'left'})
                  .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom'}),
              },
            ],
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'view', component: TestComponent},
          {path: 'part', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // WHEN: Opening view.1 in part 'left-top'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'part.left-top', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              child2: new MPart({id: 'part.left-bottom', views: []}),
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });

    // WHEN: Opening view.2 in part 'left-bottom'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'part.left-bottom', target: 'view.2'});
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              child2: new MPart({id: 'part.left-bottom', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });

    // WHEN: Adding part.left and navigating it
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.left', {align: 'left'})
      .navigatePart('part.left', ['part']),
    );
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({
              id: 'part.left',
              navigation: {id: any()},
            }),
            child2: new MTreeNode({
              child1: new MTreeNode({
                child1: new MPart({id: 'part.left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
                child2: new MPart({id: 'part.left-bottom', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              }),
              child2: new MPart({id: MAIN_AREA}),
            }),
          }),
        },
      },
    });
  });

  it('should write to storage sequentially, debouncing pending request', async () => {
    /**
     * Test storage that records write operations and can simulate slow writes.
     */
    class TestStorage implements WorkbenchStorage {

      public writes = new Map<string, string[]>();

      private _throttling = false;
      private _unblock$ = new Subject<void>();

      public load(key: string): string | null {
        return this.writes.get(key)?.at(-1) ?? null;
      }

      public async store(key: string, value: string): Promise<void> {
        Maps.addListValue(this.writes, key, value);

        // Simulate slow write (if enabled).
        if (this._throttling) {
          await firstValueFrom(this._unblock$);
        }
      }

      public enableThrottling(): void {
        this._throttling = true;
      }

      public disableThrottlinig(): void {
        this._throttling = false;
        this._unblock$.next();
      }

      public clear(): void {
        this.writes.clear();
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {
                id: 'perspective',
                layout: factory => factory.addPart('part.part'),
              },
            ],
          },
          storage: TestStorage,
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    const storage = TestBed.inject(WorkbenchStorage) as TestStorage;

    // Clear storage and enable throttling.
    storage.clear();
    storage.enableThrottling();

    // Modify the layout in quick succession.
    void workbenchRouter.navigate(['view'], {partId: 'part.part', target: 'view.1'});
    void workbenchRouter.navigate(['view'], {partId: 'part.part', target: 'view.2'});
    void workbenchRouter.navigate(['view'], {partId: 'part.part', target: 'view.3'});
    void workbenchRouter.navigate(['view'], {partId: 'part.part', target: 'view.4'});
    void workbenchRouter.navigate(['view'], {partId: 'part.part', target: 'view.5'});
    await waitUntilStable();

    // The first write is still in progress (because writes are throttled), blocking subsequent writes (serial execution).
    // Disable throttling to continue.
    storage.disableThrottlinig();
    await waitUntilStable();

    // Expect only the most recent write to be executed.
    expect(storage.writes.get('scion.workbench.perspectives.perspective')!.length).toBe(2);

    // Expect the most recent layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            id: 'part.part',
            views: [
              {id: 'view.1'},
              {id: 'view.2'},
              {id: 'view.3'},
              {id: 'view.4'},
              {id: 'view.5'},
            ],
            activeViewId: 'view.5',
          }),
        },
      },
    });
  });

  it('should load the layout from storage when activating the perspective', async () => {
    // GIVEN: Two perspectives with a part
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory.addPart(MAIN_AREA).addPart('part.left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart(MAIN_AREA).addPart('right', {align: 'right'}),
              },
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'view', component: TestComponent},
          {path: 'part', component: TestComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open view.1 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'part.left', target: 'view.1'});
    await waitUntilStable();

    // Add part.right and navigate it in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['part']),
    );
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              child2: new MPart({id: MAIN_AREA}),
            }),
            child2: new MPart({
              id: 'part.right',
              navigation: {id: any()},
              views: [],
            }),
          }),
        },
      },
    });

    // Memoize current layout.
    const layout = localStorage.getItem('scion.workbench.perspectives.perspective-1')!;

    // Open view.2 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'part.left', target: 'view.2'});
    await waitUntilStable();

    // Add part.bottom and navigate it in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.bottom', {align: 'bottom'})
      .navigatePart('part.bottom', ['part']),
    );
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MTreeNode({
                child1: new MPart({id: 'part.left', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
                child2: new MPart({id: MAIN_AREA}),
              }),
              child2: new MPart({
                id: 'part.right',
                navigation: {id: any()},
                views: [],
              }),
            }),
            child2: new MPart({
              id: 'part.bottom',
              navigation: {id: any()},
              views: [],
            }),
          }),
        },
      },
    });

    // Switch to perspective-2.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitUntilStable();

    // Simulate the storage to change.
    localStorage.setItem('scion.workbench.perspectives.perspective-1', layout);

    // WHEN: Switching to perspective-1
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-1');
    await waitUntilStable();

    // THEN: Expect the perspective to have the stored layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              child2: new MPart({id: MAIN_AREA}),
            }),
            child2: new MPart({
              id: 'part.right',
              navigation: {id: any()},
              views: [],
            }),
          }),
        },
      },
    });
  });

  it('should only write the layout of the active perspective to storage', async () => {
    // GIVEN: Two perspectives with a part
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory.addPart(MAIN_AREA).addPart('part.left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart(MAIN_AREA).addPart('part.left', {align: 'left'}),
              },
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'path/to/view', component: TestComponent},
          {path: 'path/to/part', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // WHEN: Opening view.1 in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {partId: 'part.left', target: 'view.1'});
    await waitUntilStable();

    // WHEN: Adding part.bottom and navigating it in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.bottom', {align: 'bottom'})
      .navigatePart('part.bottom', ['path/to/part']),
    );
    await waitUntilStable();

    // THEN: Expect the layout of perspective-1 to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-1')).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              child2: new MPart({id: MAIN_AREA}),
            }),
            child2: new MPart({
              id: 'part.bottom',
              navigation: {id: any()},
              views: [],
            }),
          }),
        },
      },
    });
    // THEN: Expect the layout of perspective-2 not to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-2')).toBeNull();

    // Switch to perspective-2.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitUntilStable();

    // Clear storage.
    localStorage.clear();

    // WHEN: Opening view.1 in perspective-2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {partId: 'part.left', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout of perspective-2 to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-2')).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });
    // THEN: Expect the layout of perspective-1 not to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-1')).toBeNull();
  });
});

async function loadPerspectiveLayoutFromStorage(perspectiveId: string): Promise<WorkbenchLayout | null> {
  const layout = await TestBed.inject(WorkbenchLayoutStorageService).load(perspectiveId);
  if (!layout) {
    return null;
  }

  return TestBed.inject(ɵWorkbenchLayoutFactory).create({
    grids: layout.userLayout.grids,
    outlets: layout.userLayout.outlets,
  });
}
