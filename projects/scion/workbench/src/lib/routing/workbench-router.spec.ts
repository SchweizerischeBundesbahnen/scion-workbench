/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {Component, OnDestroy} from '@angular/core';
import {provideRouter, Router} from '@angular/router';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchService} from '../workbench.service';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchView} from '../view/workbench-view.model';
import {throwError} from '../common/throw-error.util';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {MAIN_AREA} from '../layout/workbench-layout';
import {any, MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';

describe('WorkbenchRouter', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should not automatically activate part when opening view through `WorkbenchLayout.addView`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitForInitialWorkbenchLayout();

    // Add part to the right of the main part.
    await workbenchRouter.navigate(layout => layout.addPart('part.right', {relativeTo: 'part.initial', align: 'right'}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view.101 to main part.
    await workbenchRouter.navigate(layout => layout.addView('view.101', {partId: 'part.initial', activateView: true}));
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view.102 to the right part without activating the part.
    await workbenchRouter.navigate(layout => layout.addView('view.102', {partId: 'part.right', activateView: true}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view.103 to the right part without activating the part.
    await workbenchRouter.navigate(layout => layout.addView('view.103', {partId: 'part.right', activateView: true}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view.104 to the right part and activate the part.
    await workbenchRouter.navigate(layout => layout.addView('view.104', {partId: 'part.right', activateView: true, activatePart: true}));
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.right');

    function findActiveMainAreaPart(): WorkbenchPart {
      return TestBed.inject(WorkbenchService).parts().find(part => part.isInMainArea && part.active())!;
    }
  });

  it('should automatically activate part when opening view through `WorkbenchRouter.navigate([path/to/view])`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitForInitialWorkbenchLayout();

    // Add part to the right of the main part.
    await workbenchRouter.navigate(layout => layout.addPart('part.right', {relativeTo: 'part.initial', align: 'right'}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view to the right part.
    await workbenchRouter.navigate(['path/to/view'], {partId: 'part.right'});
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.right');

    // Activate main part.
    await workbenchRouter.navigate(layout => layout.activatePart('part.initial'));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view to the right part (view already in the layout).
    await workbenchRouter.navigate(['path/to/view'], {partId: 'part.right'});
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.right');

    // Activate main part.
    await workbenchRouter.navigate(layout => layout.activatePart('part.initial'));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.initial');

    // Add view to the right part.
    await workbenchRouter.navigate(['path/to/other/view'], {partId: 'part.right'});
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('part.right');

    function findActiveMainAreaPart(): WorkbenchPart {
      return TestBed.inject(WorkbenchService).parts().find(part => part.isInMainArea && part.active())!;
    }
  });

  it('should not display "Not Found" page when closing view', async () => {
    const log = new Array<string>();

    @Component({selector: 'spec-view', template: 'View'})
    class SpecViewComponent implements OnDestroy {

      constructor() {
        log.push('SpecViewComponent.construct');
      }

      public ngOnDestroy(): void {
        log.push('SpecViewComponent.destroy');
      }
    }

    @Component({selector: 'spec-not-found-page', template: 'View'})
    class PageNotFoundComponent implements OnDestroy {

      constructor() {
        log.push('PageNotFoundComponent.construct');
      }

      public ngOnDestroy(): void {
        log.push('PageNotFoundComponent.destroy');
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          pageNotFoundComponent: PageNotFoundComponent,
        }),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitForInitialWorkbenchLayout();

    // Open view.
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.101'});
    await waitUntilStable();
    expect(log).toEqual(['SpecViewComponent.construct']);
    log.length = 0;

    // Close view.
    await TestBed.inject(WorkbenchService).getView('view.101')!.close();
    await waitUntilStable();

    // Expect view to be closed and "Not Found" page not to be displayed.
    expect(log).toEqual(['SpecViewComponent.destroy']);
    log.length = 0;
  });

  it('should roll back layout when view navigation is cancelled', async () => {
    @Component({selector: 'spec-view', template: '{{view.id}}'})
    class SpecViewComponent {
      constructor(protected view: WorkbenchView) {
        view.title = view.id;
      }
    }

    let canActivate2: boolean;
    let canActivate3: boolean;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent, canActivate: [() => canActivate2]},
          {path: 'path/to/view/3', component: SpecViewComponent, canActivate: [() => canActivate3]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Open view.101 [canActivate=true].
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });

    // Open view.102 [canActivate=false].
    canActivate2 = false;
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });

    // Expect handle registration to be rolled back.
    expect(TestBed.inject(WorkbenchService).getView('view.102')).toBeNull();
    // Expect auxiliary route registration to be rolled back.
    expect(TestBed.inject(Router).config.find(route => route.outlet === 'view.102')).toBeUndefined();

    // Open view.102 [canActivate=true].
    canActivate2 = true;
    await workbenchRouter.navigate(['path/to/view/2', {param: 'A'}], {target: 'view.102'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    const view102 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
    const navigationId = view102.navigation()!.id;

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=false]
    canActivate3 = false;
    await workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'part.initial'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    // Expect view.102 not to be navigated.
    expect(view102.navigation()!.id).toEqual(navigationId);

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=true]
    canActivate3 = true;
    await workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'part.initial'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}], activeViewId: 'view.102'}),
      },
    });
    expect(view102.navigation()!.id).not.toEqual(navigationId);
  });

  it('should roll back layout when view navigation fails', async () => {
    @Component({selector: 'spec-view', template: '{{view.id}}'})
    class SpecViewComponent {
      constructor(protected view: WorkbenchView) {
        view.title = view.id;
      }
    }

    let canActivate2: () => boolean;
    let canActivate3: () => boolean;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent, canActivate: [() => canActivate2()]},
          {path: 'path/to/view/3', component: SpecViewComponent, canActivate: [() => canActivate3()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Open view.101 [canActivate=true].
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });

    // Open view.102 [canActivate=false].
    canActivate2 = () => throwError('navigation error');
    const navigation2 = workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await expectAsync(navigation2).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });
    expect(TestBed.inject(WorkbenchService).getView('view.102')).toBeNull();
    expect(TestBed.inject(Router).config.find(route => route.outlet === 'view.102')).toBeUndefined();

    // Open view.102 [canActivate=true].
    canActivate2 = () => true;
    await workbenchRouter.navigate(['path/to/view/2', {param: 'A'}], {target: 'view.102'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    const view102 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
    const navigationId = view102.navigation()!.id;

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=false]
    canActivate3 = () => throwError('navigation error');
    const navigation3 = workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'part.initial'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await expectAsync(navigation3).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    // Expect view.102 not to be navigated.
    expect(view102.navigation()?.id).toEqual(navigationId);

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=true]
    canActivate3 = () => true;
    await workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'part.initial'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}], activeViewId: 'view.102'}),
      },
    });
    expect(view102.navigation()!.id).not.toEqual(navigationId);
  });

  it('should roll back layout when part navigation is cancelled', async () => {
    @Component({selector: 'spec-view', template: 'testee'})
    class SpecTesteeComponent {
    }

    let canActivate2: boolean;
    let canActivate3: boolean;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {path: 'path/to/part/1', component: SpecTesteeComponent},
          {path: 'path/to/part/2', component: SpecTesteeComponent, canActivate: [() => canActivate2]},
          {path: 'path/to/part/3', component: SpecTesteeComponent, canActivate: [() => canActivate3]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Add part.101 and navigate it to 'path/to/part/1' [canActivate=true].
    await workbenchRouter.navigate(layout => layout
      .addPart('part.101', {align: 'left'})
      .navigatePart('part.101', ['path/to/part/1']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MPart({
            id: 'part.101',
            views: [],
            navigation: {id: any()},
          }),
          child2: new MPart({
            id: MAIN_AREA,
            views: [],
          }),
        }),
      },
    });

    // Add part.102 and navigate it to 'path/to/part/2' [canActivate=false].
    canActivate2 = false;
    await workbenchRouter.navigate(layout => layout
      .addPart('part.102', {align: 'right'})
      .navigatePart('part.102', ['path/to/part/2']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MPart({
            id: 'part.101',
            views: [],
            navigation: {id: any()},
          }),
          child2: new MPart({
            id: MAIN_AREA,
            views: [],
          }),
        }),
      },
    });

    // Expect handle registration to be rolled back.
    expect(TestBed.inject(WorkbenchService).getPart('part.102')).toBeNull();
    // Expect auxiliary route registration to be rolled back.
    expect(TestBed.inject(Router).config.find(route => route.outlet === 'part.102')).toBeUndefined();

    // Add part.102 and navigate it to 'path/to/part/2' [canActivate=true].
    canActivate2 = true;
    await workbenchRouter.navigate(layout => layout
      .addPart('part.102', {align: 'right'})
      .navigatePart('part.102', ['path/to/part/2']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({
              id: 'part.101',
              views: [],
              navigation: {id: any()},
            }),
            child2: new MPart({
              id: MAIN_AREA,
              views: [],
            }),
          }),
          child2: new MPart({
            id: 'part.102',
            views: [],
            navigation: {id: any()},
          }),
        }),
      },
    });

    const part102 = TestBed.inject(ɵWorkbenchService).getPart('part.102')!;
    const navigationId = part102.navigation()!.id;

    // Navigate multiple parts:
    // - Navigate part.102 [canActivate=true]
    // - Add and navigate part.103 [canActivate=false]
    canActivate3 = false;
    await workbenchRouter.navigate(layout => layout
      .navigatePart('part.102', ['path/to/part/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addPart('part.103', {align: 'bottom'})
      .navigatePart('part.103', ['path/to/part/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({
              id: 'part.101',
              views: [],
              navigation: {id: any()},
            }),
            child2: new MPart({
              id: MAIN_AREA,
              views: [],
            }),
          }),
          child2: new MPart({
            id: 'part.102',
            views: [],
            navigation: {id: any()},
          }),
        }),
      },
    });
    // Expect part.102 not to be navigated.
    expect(part102.navigation()!.id).toEqual(navigationId);

    // Navigate multiple parts:
    // - Navigate part.102 [canActivate=true]
    // - Open and navigate part.103 [canActivate=true]
    canActivate3 = true;
    await workbenchRouter.navigate(layout => layout
      .navigatePart('part.102', ['path/to/part/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addPart('part.103', {align: 'bottom'})
      .navigatePart('part.103', ['path/to/part/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MTreeNode({
              direction: 'row',
              child1: new MPart({
                id: 'part.101',
                views: [],
                navigation: {id: any()},
              }),
              child2: new MPart({
                id: MAIN_AREA,
                views: [],
              }),
            }),
            child2: new MPart({
              id: 'part.102',
              views: [],
              navigation: {id: any()},
            }),
          }),
          child2: new MPart({
            id: 'part.103',
            views: [],
            navigation: {id: any()},
          }),
        }),
      },
    });
    expect(part102.navigation()!.id).not.toEqual(navigationId);
  });

  it('should roll back layout when part navigation fails', async () => {
    @Component({selector: 'spec-view', template: 'testee'})
    class SpecTesteeComponent {
    }

    let canActivate2: () => boolean;
    let canActivate3: () => boolean;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {path: 'path/to/part/1', component: SpecTesteeComponent},
          {path: 'path/to/part/2', component: SpecTesteeComponent, canActivate: [() => canActivate2()]},
          {path: 'path/to/part/3', component: SpecTesteeComponent, canActivate: [() => canActivate3()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Add part.101 and navigate it to 'path/to/part/1' [canActivate=true].
    await workbenchRouter.navigate(layout => layout
      .addPart('part.101', {align: 'left'})
      .navigatePart('part.101', ['path/to/part/1']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MPart({
            id: 'part.101',
            views: [],
            navigation: {id: any()},
          }),
          child2: new MPart({
            id: MAIN_AREA,
            views: [],
          }),
        }),
      },
    });

    // Add part.102 and navigate it to 'path/to/part/2' [canActivate=false].
    canActivate2 = () => throwError('navigation error');
    const navigation2 = workbenchRouter.navigate(layout => layout
      .addPart('part.102', {align: 'right'})
      .navigatePart('part.102', ['path/to/part/2']),
    );
    await expectAsync(navigation2).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MPart({
            id: 'part.101',
            views: [],
            navigation: {id: any()},
          }),
          child2: new MPart({
            id: MAIN_AREA,
            views: [],
          }),
        }),
      },
    });

    // Expect handle registration to be rolled back.
    expect(TestBed.inject(WorkbenchService).getPart('part.102')).toBeNull();
    // Expect auxiliary route registration to be rolled back.
    expect(TestBed.inject(Router).config.find(route => route.outlet === 'part.102')).toBeUndefined();

    // Add part.102 and navigate it to 'path/to/part/2' [canActivate=true].
    canActivate2 = () => true;
    await workbenchRouter.navigate(layout => layout
      .addPart('part.102', {align: 'right'})
      .navigatePart('part.102', ['path/to/part/2']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({
              id: 'part.101',
              views: [],
              navigation: {id: any()},
            }),
            child2: new MPart({
              id: MAIN_AREA,
              views: [],
            }),
          }),
          child2: new MPart({
            id: 'part.102',
            views: [],
            navigation: {id: any()},
          }),
        }),
      },
    });

    const part102 = TestBed.inject(ɵWorkbenchService).getPart('part.102')!;
    const navigationId = part102.navigation()!.id;

    // Navigate multiple parts:
    // - Navigate part.102 [canActivate=true]
    // - Add and navigate part.103 [canActivate=false]
    canActivate3 = () => throwError('navigation error');
    const navigation3 = workbenchRouter.navigate(layout => layout
      .navigatePart('part.102', ['path/to/part/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addPart('part.103', {align: 'bottom'})
      .navigatePart('part.103', ['path/to/part/3']),
    );
    await expectAsync(navigation3).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({
              id: 'part.101',
              views: [],
              navigation: {id: any()},
            }),
            child2: new MPart({
              id: MAIN_AREA,
              views: [],
            }),
          }),
          child2: new MPart({
            id: 'part.102',
            views: [],
            navigation: {id: any()},
          }),
        }),
      },
    });
    // Expect part.102 not to be navigated.
    expect(part102.navigation()!.id).toEqual(navigationId);

    // Navigate multiple parts:
    // - Navigate part.102 [canActivate=true]
    // - Open and navigate part.103 [canActivate=true]
    canActivate3 = () => true;
    await workbenchRouter.navigate(layout => layout
      .navigatePart('part.102', ['path/to/part/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addPart('part.103', {align: 'bottom'})
      .navigatePart('part.103', ['path/to/part/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MTreeNode({
              direction: 'row',
              child1: new MPart({
                id: 'part.101',
                views: [],
                navigation: {id: any()},
              }),
              child2: new MPart({
                id: MAIN_AREA,
                views: [],
              }),
            }),
            child2: new MPart({
              id: 'part.102',
              views: [],
              navigation: {id: any()},
            }),
          }),
          child2: new MPart({
            id: 'part.103',
            views: [],
            navigation: {id: any()},
          }),
        }),
      },
    });
    expect(part102.navigation()!.id).not.toEqual(navigationId);
  });
});
