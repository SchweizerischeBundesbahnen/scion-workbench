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
import {MPart, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {WorkbenchView} from '../view/workbench-view.model';
import {throwError} from '../common/throw-error.util';
import {ɵWorkbenchService} from '../ɵworkbench.service';

describe('WorkbenchRouter', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should not automatically activate part when opening view through `WorkbenchLayout.addView`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
        provideRouter([]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitForInitialWorkbenchLayout();

    // Add part to the right of the main part.
    await workbenchRouter.navigate(layout => layout.addPart('right', {relativeTo: 'main', align: 'right'}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view.101 to main part.
    await workbenchRouter.navigate(layout => layout.addView('view.101', {partId: 'main', activateView: true}));
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view.102 to the right part without activating the part.
    await workbenchRouter.navigate(layout => layout.addView('view.102', {partId: 'right', activateView: true}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view.103 to the right part without activating the part.
    await workbenchRouter.navigate(layout => layout.addView('view.103', {partId: 'right', activateView: true}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view.104 to the right part and activate the part.
    await workbenchRouter.navigate(layout => layout.addView('view.104', {partId: 'right', activateView: true, activatePart: true}));
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('right');

    function findActiveMainAreaPart(): WorkbenchPart {
      return TestBed.inject(WorkbenchService).parts().find(part => part.isInMainArea && part.active())!;
    }
  });

  it('should automatically activate part when opening view through `WorkbenchRouter.navigate([path/to/view])`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
        provideRouter([]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitForInitialWorkbenchLayout();

    // Add part to the right of the main part.
    await workbenchRouter.navigate(layout => layout.addPart('right', {relativeTo: 'main', align: 'right'}));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view to the right part.
    await workbenchRouter.navigate(['path/to/view'], {partId: 'right'});
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('right');

    // Activate main part.
    await workbenchRouter.navigate(layout => layout.activatePart('main'));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view to the right part (view already in the layout).
    await workbenchRouter.navigate(['path/to/view'], {partId: 'right'});
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('right');

    // Activate main part.
    await workbenchRouter.navigate(layout => layout.activatePart('main'));
    await waitUntilStable();
    // Expect main part to be active.
    expect(findActiveMainAreaPart().id).toEqual('main');

    // Add view to the right part.
    await workbenchRouter.navigate(['path/to/other/view'], {partId: 'right'});
    await waitUntilStable();
    // Expect right part to be active.
    expect(findActiveMainAreaPart().id).toEqual('right');

    function findActiveMainAreaPart(): WorkbenchPart {
      return TestBed.inject(WorkbenchService).parts().find(part => part.isInMainArea && part.active())!;
    }
  });

  it('should not display "Not Found" page when closing view', async () => {
    const log = new Array<string>();

    @Component({selector: 'spec-view', template: 'View', standalone: true})
    class SpecViewComponent implements OnDestroy {

      constructor() {
        log.push('SpecViewComponent.construct');
      }

      public ngOnDestroy(): void {
        log.push('SpecViewComponent.destroy');
      }
    }

    @Component({selector: 'spec-not-found-page', template: 'View', standalone: true})
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

  it('should rollback layout when navigation is cancelled', async () => {
    @Component({selector: 'spec-view', template: '{{view.id}}', standalone: true})
    class SpecViewComponent {
      constructor(protected view: WorkbenchView) {
        view.title = view.id;
      }
    }

    let canActivate2: boolean;
    let canActivate3: boolean;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
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
        root: new MPart({id: 'main', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });

    // Open view.102 [canActivate=false].
    canActivate2 = false;
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });
    expect(TestBed.inject(WorkbenchService).getView('view.102')).toBeNull();
    expect(TestBed.inject(Router).config.find(route => route.outlet === 'view.102')).toBeUndefined();

    // Open view.102 [canActivate=true].
    canActivate2 = true;
    await workbenchRouter.navigate(['path/to/view/2', {param: 'A'}], {target: 'view.102'});
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    const view102 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
    const navigationId = view102.navigationId();

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=false]
    canActivate3 = false;
    await workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'main'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    // Expect view.102 not to be navigated.
    expect(view102.navigationId()).toEqual(navigationId);
    expect(view102.navigationData()).toEqual({});
    expect(view102.navigationState()).toEqual({});

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=true]
    canActivate3 = true;
    await workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'main'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}], activeViewId: 'view.102'}),
      },
    });
    expect(view102.navigationId()).not.toEqual(navigationId);
    expect(view102.navigationData()).toEqual({some: 'data'});
    expect(view102.navigationState()).toEqual({some: 'state'});
  });

  it('should rollback layout when navigation fails', async () => {
    @Component({selector: 'spec-view', template: '{{view.id}}', standalone: true})
    class SpecViewComponent {
      constructor(protected view: WorkbenchView) {
        view.title = view.id;
      }
    }

    let canActivate2: () => boolean;
    let canActivate3: () => boolean;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
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
        root: new MPart({id: 'main', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
      },
    });

    // Open view.102 [canActivate=false].
    canActivate2 = () => throwError('navigation error');
    const navigation2 = workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await expectAsync(navigation2).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
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
        root: new MPart({id: 'main', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    const view102 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
    const navigationId = view102.navigationId();

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=false]
    canActivate3 = () => throwError('navigation error');
    const navigation3 = workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'main'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await expectAsync(navigation3).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
      },
    });
    // Expect view.102 not to be navigated.
    expect(view102.navigationId()).toEqual(navigationId);
    expect(view102.navigationData()).toEqual({});
    expect(view102.navigationState()).toEqual({});

    // Navigate multiple views:
    // - Navigate view.102 [canActivate=true]
    // - Open view.103 [canActivate=true]
    canActivate3 = () => true;
    await workbenchRouter.navigate(layout => layout
      .navigateView('view.102', ['path/to/view/2', {param: 'B'}], {data: {some: 'data'}, state: {some: 'state'}})
      .addView('view.103', {partId: 'main'})
      .navigateView('view.103', ['path/to/view/3']),
    );
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}], activeViewId: 'view.102'}),
      },
    });
    expect(view102.navigationId()).not.toEqual(navigationId);
    expect(view102.navigationData()).toEqual({some: 'data'});
    expect(view102.navigationState()).toEqual({some: 'state'});
  });
});
