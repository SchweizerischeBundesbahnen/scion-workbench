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
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {TestComponent} from '../testing/test.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {MAIN_AREA, WorkbenchLayout} from '../layout/workbench-layout';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {WorkbenchService} from '../workbench.service';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';
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
                  .addPart('left-top', {align: 'left'})
                  .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'}),
              },
            ],
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // WHEN: Opening view.1 in part 'left-top'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'left-top', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'left-bottom', views: []}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // WHEN: Opening view.2 in part 'left-bottom'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'left-bottom', target: 'view.2'});
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'left-bottom', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
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
                layout: factory => factory.addPart('main'),
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
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    const storage = TestBed.inject(WorkbenchStorage) as TestStorage;

    // Clear storage and enable throttling.
    storage.clear();
    storage.enableThrottling();

    // Modify the layout in quick succession.
    workbenchRouter.navigate(['view'], {partId: 'main', target: 'view.1'}).then();
    workbenchRouter.navigate(['view'], {partId: 'main', target: 'view.2'}).then();
    workbenchRouter.navigate(['view'], {partId: 'main', target: 'view.3'}).then();
    workbenchRouter.navigate(['view'], {partId: 'main', target: 'view.4'}).then();
    workbenchRouter.navigate(['view'], {partId: 'main', target: 'view.5'}).then();
    await waitUntilStable();

    // The first write is still in progress (because writes are throttled), blocking subsequent writes (serial execution).
    // Disable throttling to continue.
    storage.disableThrottlinig();
    await waitUntilStable();

    // Expect only the most recent write to be executed.
    expect(storage.writes.get('scion.workbench.perspectives.perspective')!.length).toBe(2);

    // Expect the most recent layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'main',
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
                layout: factory => factory.addPart(MAIN_AREA).addPart('left', {align: 'left'}),
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
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.1 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'left', target: 'view.1'});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Memoize current layout.
    const layout = localStorage.getItem('scion.workbench.perspectives.perspective-1')!;

    // Open view.2 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {partId: 'left', target: 'view.2'});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
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
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
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
                layout: factory => factory.addPart(MAIN_AREA).addPart('left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart(MAIN_AREA).addPart('left', {align: 'left'}),
              },
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'path/to/view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // WHEN: Opening view.1 in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {partId: 'left', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout of perspective-1 to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-1')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
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
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {partId: 'left', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout of perspective-2 to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-2')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
    // THEN: Expect the layout of perspective-1 not to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-1')).toBeNull();
  });
});

async function loadPerspectiveLayoutFromStorage(perspectiveId: string): Promise<WorkbenchLayout | null> {
  const perspectiveLayout = await TestBed.inject(WorkbenchPerspectiveStorageService).loadPerspectiveLayout(perspectiveId);
  if (!perspectiveLayout) {
    return null;
  }

  return TestBed.inject(ɵWorkbenchLayoutFactory).create({
    workbenchGrid: perspectiveLayout.userLayout.workbenchGrid,
    viewOutlets: perspectiveLayout.userLayout.viewOutlets,
  });
}
