/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {booleanAttribute, Component, DebugElement, DestroyRef, Directive, effect, inject, Injector, OnDestroy, OnInit, Type} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {WORKBENCH_VIEW_REGISTRY} from './workbench-view.registry';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ViewId, WorkbenchView, WorkbenchViewNavigation} from './workbench-view.model';
import {firstValueFrom, ReplaySubject, Subject} from 'rxjs';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {canMatchWorkbenchView} from '../routing/workbench-route-guards';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {WorkbenchService} from '../workbench.service';
import {ViewSlotComponent} from './view-slot.component';
import {WorkbenchMessageBoxService} from '../message-box/workbench-message-box.service';
import {WorkbenchDialogService} from '../dialog/workbench-dialog.service';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {TestComponent} from '../testing/test.component';
import {WorkbenchDialog} from '../dialog/workbench-dialog';
import {throwError} from '../common/throw-error.util';
import {WorkbenchPartActionDirective} from '../part/part-action-bar/part-action.directive';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {MAIN_AREA} from '../layout/workbench-layout';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout.factory';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {NavigationData, NavigationState} from '../routing/routing.model';
import {NullContentComponent} from '../null-content/null-content.component';
import {SciViewportComponent} from '@scion/components/viewport';
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {PartId} from '../part/workbench-part.model';

describe('View', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should destroy handle\'s injector when closing the view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Get reference to the view injector.
    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');
    let injectorDestroyed = false;
    view.injector.get(DestroyRef).onDestroy(() => injectorDestroyed = true);

    // Close the view.
    await view.close();
    await waitUntilStable();

    // Expect the injector to be destroyed.
    expect(injectorDestroyed).toBeTrue();
  });

  it('should render dirty state', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect view not to be dirty when opened.
    expect(isViewDirty(fixture, 'view.100')).toBeFalse();

    // Set dirty flag.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').dirty = true;
    fixture.detectChanges();
    expect(isViewDirty(fixture, 'view.100')).toBeTrue();

    // Clear dirty flag.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').dirty = false;
    fixture.detectChanges();
    expect(isViewDirty(fixture, 'view.100')).toBeFalse();
  });

  it('should render title', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect title to be empty when opened.
    expect(getViewTitle(fixture, 'view.100')).toEqual('');

    // Set title.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').title = 'Title 1';
    fixture.detectChanges();
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title 1');

    // Set title.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').title = 'Title 2';
    fixture.detectChanges();
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title 2');
  });

  it('should not render heading (by default)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect heading not to display when opened.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();

    // Set heading.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').heading = 'Heading';
    fixture.detectChanges();

    // Expect heading not to display.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();
  });

  it('should not render heading if tab height < 3.5rem', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    setDesignToken(fixture, '--sci-workbench-tab-height', '3.4rem');
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect heading not to display when opened.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();

    // Set heading.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').heading = 'Heading';
    fixture.detectChanges();

    // Expect heading not to display.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();
  });

  it('should render heading if tab height >= 3.5rem', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    setDesignToken(fixture, '--sci-workbench-tab-height', '3.5rem');
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect heading to be empty when opened.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();

    // Set heading.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').heading = 'Heading 1';
    fixture.detectChanges();
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeTrue();
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 1');

    // Set heading.
    TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').heading = 'Heading 2';
    fixture.detectChanges();
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeTrue();
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 2');
  });

  it('should detach inactive view from Angular component tree and DOM', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view/1', component: SpecView1Component},
          {path: 'path/to/view/2', component: SpecView2Component},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();

    const view1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.101');
    const view2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.102');

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    // Expect view 2 not to be in the DOM.
    expect(fixture).toShow(SpecView1Component);
    expect(fixture).not.toShow(SpecView2Component);

    // Expect view 2 not to be checked for changes.
    view1.getComponent<SpecViewComponent>()!.checkedForChanges = false;
    view2.getComponent<SpecViewComponent>()!.checkedForChanges = false;
    fixture.detectChanges();
    expect(view1.getComponent<SpecViewComponent>()!.checkedForChanges).toBeTrue();
    expect(view2.getComponent<SpecViewComponent>()!.checkedForChanges).toBeFalse();

    // Activate view 2.
    await view2.activate();
    await waitUntilStable();

    // Expect view 1 not to be in the DOM.
    expect(fixture).not.toShow(SpecView1Component);
    expect(fixture).toShow(SpecView2Component);

    // Expect view 1 not to be checked for changes.
    view1.getComponent<SpecViewComponent>()!.checkedForChanges = false;
    view2.getComponent<SpecViewComponent>()!.checkedForChanges = false;
    fixture.detectChanges();
    expect(view1.getComponent<SpecViewComponent>()!.checkedForChanges).toBeFalse();
    expect(view2.getComponent<SpecViewComponent>()!.checkedForChanges).toBeTrue();

  });

  it('should not destroy component when inactivating the view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Navigate to "path/to/view/2".
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();

    const view1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.101');
    const view2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.102');

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    // Expect view 1 and view 2 not to be destroyed.
    expect(view1.destroyed).toBeFalse();
    expect(view1.getComponent<SpecViewComponent>()!.destroyed).toBeFalse();
    expect(view2.destroyed).toBeFalse();
    expect(view2.getComponent<SpecViewComponent>()!.destroyed).toBeFalse();
    const viewComponent1 = view1.getComponent();

    // Activate view 2.
    await view2.activate();
    await waitUntilStable();

    // Expect view 1 and view 2 not to be destroyed.
    expect(view1.destroyed).toBeFalse();
    expect(view1.getComponent<SpecViewComponent>()!.destroyed).toBeFalse();
    expect(view2.destroyed).toBeFalse();
    expect(view2.getComponent<SpecViewComponent>()!.destroyed).toBeFalse();

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    // Expect view 1 and view 2 not to be destroyed.
    expect(view1.destroyed).toBeFalse();
    expect(view1.getComponent<SpecViewComponent>()!.destroyed).toBeFalse();
    expect(view2.destroyed).toBeFalse();
    expect(view2.getComponent<SpecViewComponent>()!.destroyed).toBeFalse();

    // Expect view 1 not be constructed anew.
    expect(viewComponent1).toBe(view1.getComponent());
  });

  it('should destroy component when closing the view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    // Expect component not to be destroyed.
    expect(view.destroyed).toBeFalse();
    expect(component.destroyed).toBeFalse();

    // Close the view.
    await view.close();
    await waitUntilStable();

    // Expect component to be destroyed.
    expect(view.destroyed).toBeTrue();
    expect(component.destroyed).toBeTrue();
    expect(view.getComponent<SpecViewComponent>()).toBeNull();
  });

  it('should have correct view active state', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Navigate to "path/to/view/2".
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();

    const view1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.101');
    const view2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.102');

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    expect(view1.active()).toBeTrue();
    expect(view2.active()).toBeFalse();

    // Activate view 2.
    await view2.activate();
    await waitUntilStable();

    expect(view1.active()).toBeFalse();
    expect(view2.active()).toBeTrue();

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    expect(view1.active()).toBeTrue();
    expect(view2.active()).toBeFalse();
  });

  it('should close views via WorkbenchRouter (unless prevent closing or non-closable)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent},
          {path: 'path/to/view/3', component: SpecViewComponent},
          {path: 'path/to/view/4', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    const workbenchViewRegistry = TestBed.inject(WORKBENCH_VIEW_REGISTRY);
    const workbenchService = TestBed.inject(WorkbenchService);

    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await workbenchRouter.navigate(['path/to/view/3'], {target: 'view.103'});
    await workbenchRouter.navigate(['path/to/view/4'], {target: 'view.104'});
    await waitUntilStable();

    const componentView1 = workbenchViewRegistry.get('view.101').getComponent<SpecViewComponent>()!;
    const componentView2 = workbenchViewRegistry.get('view.102').getComponent<SpecViewComponent>()!;
    const componentView3 = workbenchViewRegistry.get('view.103').getComponent<SpecViewComponent>()!;
    const componentView4 = workbenchViewRegistry.get('view.104').getComponent<SpecViewComponent>()!;

    // Prevent closing view 2.
    componentView2.preventClosing = true;

    // Make view 4 not closable.
    componentView4.view.closable = false;

    // Close all views via WorkbenchRouter.
    await workbenchRouter.navigate(['path/to/view/*'], {close: true});
    await waitUntilStable();

    // Expect view 2 und view 4 not to be closed.
    expect(workbenchService.views().map(view => view.id)).toEqual(['view.102', 'view.104']);

    // Expect view 1 to be closed.
    expect(componentView1.destroyed).toBeTrue();
    // Expect view 2 not to be closed.
    expect(componentView2.destroyed).toBeFalse();
    // Expect view 3 to be closed.
    expect(componentView3.destroyed).toBeTrue();
    // Expect view 4 not to be closed.
    expect(componentView2.destroyed).toBeFalse();
  });

  it('should close views via WorkbenchService (unless prevent closing or non-closable)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent},
          {path: 'path/to/view/3', component: SpecViewComponent},
          {path: 'path/to/view/4', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    const workbenchViewRegistry = TestBed.inject(WORKBENCH_VIEW_REGISTRY);
    const workbenchService = TestBed.inject(WorkbenchService);

    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await workbenchRouter.navigate(['path/to/view/3'], {target: 'view.103'});
    await workbenchRouter.navigate(['path/to/view/4'], {target: 'view.104'});
    await waitUntilStable();

    const componentView1 = workbenchViewRegistry.get('view.101').getComponent<SpecViewComponent>()!;
    const componentView2 = workbenchViewRegistry.get('view.102').getComponent<SpecViewComponent>()!;
    const componentView3 = workbenchViewRegistry.get('view.103').getComponent<SpecViewComponent>()!;
    const componentView4 = workbenchViewRegistry.get('view.104').getComponent<SpecViewComponent>()!;

    // Prevent closing view 2.
    componentView2.preventClosing = true;

    // Make view 4 not closable.
    componentView4.view.closable = false;

    // Close all views via WorkbenchService.
    await workbenchService.closeViews('view.101', 'view.102', 'view.103', 'view.104');
    await waitUntilStable();

    // Expect view 2 und view 4 not to be closed.
    expect(workbenchService.views().map(view => view.id)).toEqual(['view.102', 'view.104']);

    // Expect view 1 to be closed.
    expect(componentView1.destroyed).toBeTrue();
    // Expect view 2 not to be closed.
    expect(componentView2.destroyed).toBeFalse();
    // Expect view 3 to be closed.
    expect(componentView3.destroyed).toBeTrue();
    // Expect view 4 not to be closed.
    expect(componentView2.destroyed).toBeFalse();
  });

  it('should prevent closing view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    // Try to close View (prevent)
    component.preventClosing = true;
    await view.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(component.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Try to close to View 1 (accept)
    component.preventClosing = false;
    await view.close();
    await waitUntilStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(component.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should prevent closing empty-path view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('view-1')], component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "" (hint: view-1)
    await workbenchRouter.navigate([], {hint: 'view-1', target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    // Try to close View (prevent)
    component.preventClosing = true;
    await view.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(component.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Try to close to View 1 (accept)
    component.preventClosing = false;
    await view.close();
    await waitUntilStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(component.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should prevent closing view navigated to a child route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {
            path: 'path',
            loadChildren: () => [
              {
                path: 'to',
                loadChildren: () => [
                  {
                    path: 'module',
                    loadChildren: () => [
                      {path: 'view', component: SpecViewComponent},
                    ],
                  },
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

    // Navigate to "path/to/module/view".
    await workbenchRouter.navigate(['path/to/module/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    // Try to close View (prevent)
    component.preventClosing = true;
    await view.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(component.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Try to close to View 1 (accept)
    component.preventClosing = false;
    await view.close();
    await waitUntilStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(component.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should not close view if blocked by view-modal message-box', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');

    // Open view-modal message box.
    void TestBed.inject(WorkbenchMessageBoxService).open('Message', {
      modality: 'view',
      context: {viewId: 'view.100'},
      cssClass: 'message-box',
    });
    await waitUntilStable();

    // Try to close the view (prevented by the message box).
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the message box.
    const messageBox = getDialog('message-box');
    messageBox.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should not close view if blocked by application-modal message-box', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');

    // Open application-modal message box.
    void TestBed.inject(WorkbenchMessageBoxService).open('Message', {
      modality: 'application',
      cssClass: 'message-box',
    });
    await waitUntilStable();

    // Try to close the view (prevented by the message box).
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the message box.
    const messageBox = getDialog('message-box');
    messageBox.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should not close view if blocked by view-modal dialog', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');

    // Open view-modal dialog.
    void TestBed.inject(WorkbenchDialogService).open(TestComponent, {
      modality: 'view',
      context: {viewId: 'view.100'},
      cssClass: 'dialog',
    });
    await waitUntilStable();

    // Try to close the view (prevented by the dialog).
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the dialog.
    const dialog = getDialog('dialog');
    dialog.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should not close view if blocked by application-modal dialog', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');

    // Open application-modal dialog.
    void TestBed.inject(WorkbenchDialogService).open(TestComponent, {
      modality: 'application',
      cssClass: 'dialog',
    });
    await waitUntilStable();

    // Try to close the view (prevented by the dialog).
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the dialog.
    const dialog = getDialog('dialog');
    dialog.close();
    await waitUntilStable();

    // Expect view not to be closed.
    expect(view.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Close the view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {close: true});
    await fixture.whenStable();

    // Expect view to be closed.
    expect(view.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
  });

  it('should invoke `CanClose` guard on correct view component', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {
                id: 'A',
                layout: factory => factory
                  .addPart('part.left')
                  .addView('view.100', {partId: 'part.left'})
                  .navigateView('view.100', ['path/to/view/1']),
              },
              {
                id: 'B',
                layout: factory => factory
                  .addPart('part.left')
                  .addView('view.100', {partId: 'part.left'}) // Add view with same id as in perspective A.
                  .navigateView('view.100', ['path/to/view/2'])
                  .removeView('view.100'), // Remove view to test that `CanClose` of view.100 in perspective A is not invoked.
              },
            ],
          },
        }),
        provideRouter([
          {path: 'path/to/view/1', component: SpecViewComponent},
          {path: 'path/to/view/2', component: SpecViewComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    spyOn(console, 'log').and.callThrough();

    // Switch to perspective A.
    await TestBed.inject(WorkbenchService).switchPerspective('A');

    // Switch to perspective B.
    await TestBed.inject(WorkbenchService).switchPerspective('B');

    // Expect `CanClose` guard not to be invoked for view.100 of perspective A.
    expect(console.log).not.toHaveBeenCalledWith(`[SpecViewComponent][CanClose] CanClose invoked for view 'view.100'. [path=path/to/view/1]`);
  });

  it('should not invoke `CanClose` guard when creating URL tree', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Spy console.
    spyOn(console, 'log').and.callThrough();

    await TestBed.inject(ɵWorkbenchRouter).createUrlTree(layout => layout.removeView('view.100'));

    // Expect `CanClose` guard not to be invoked.
    expect(console.log).not.toHaveBeenCalledWith(`[SpecViewComponent][CanClose] CanClose invoked for view 'view.100'. [path=path/to/view]`);

    // Expect view not to be closed.
    expect(fixture).toShow(SpecViewComponent);
  });

  it('should invoke `CanClose` in view injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    await view.close();
    await fixture.whenStable();

    // Expect `CanClose` guard to be invoked in the view's injection context.
    expect(component.canCloseInjector!.get(WorkbenchView)).toBe(view);
    expect(component.canCloseInjector!.get(WorkbenchMessageBoxService)).toBe(component.injector.get(WorkbenchMessageBoxService));
    expect(component.canCloseInjector!.get(WorkbenchMessageBoxService)).not.toBe(TestBed.inject(WorkbenchMessageBoxService));
  });

  it('should remove view without a view handle', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.part', {align: 'right'})
      .addView('view.100', {partId: 'part.part'}) // add view
      .removeView('view.100'), // remove view in same navigation
    );
    await fixture.whenStable();

    expect(TestBed.inject(WORKBENCH_VIEW_REGISTRY).has('view.100')).toBeFalse();
  });

  it('should provide navigated component', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecView1Component},
          {
            path: 'path',
            loadChildren: () => [
              {
                path: 'to',
                loadChildren: () => [
                  {
                    path: 'module',
                    loadChildren: () => [
                      {path: 'view', component: SpecView2Component},
                    ],
                  },
                ],
              },
            ],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view without navigating it.
    const workbenchRouter = TestBed.inject(ɵWorkbenchRouter);
    await workbenchRouter.navigate(layout => layout.addView('view.100', {partId: layout.activePart({grid: 'mainArea'}).id, activateView: true}));
    await waitUntilStable();
    expect(TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent()).toBe(getComponent(fixture, NullContentComponent));

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();
    expect(TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent()).toBe(getComponent(fixture, SpecView1Component));

    // Navigate to "path/to/module/view".
    await workbenchRouter.navigate(['path/to/module/view'], {target: 'view.100'});
    await waitUntilStable();
    expect(TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent()).toBe(getComponent(fixture, SpecView2Component));
  });

  it('should fill view content to available space', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {
            path: 'view',
            component: SpecViewComponent,
          },
          {
            path: 'path',
            loadChildren: () => [
              {
                path: 'to',
                loadChildren: () => [
                  {
                    path: 'view',
                    component: SpecViewComponent,
                  },
                ],
              },
            ],
          },

        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Navigate to "view".
    await TestBed.inject(ɵWorkbenchRouter).navigate(['view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect size to be equal.
    expect(getSize(fixture, SpecViewComponent)).toEqual(getSize(fixture, ViewSlotComponent));

    // Navigate to "path/to/view".
    await TestBed.inject(ɵWorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect size to be equal.
    expect(getSize(fixture, SpecViewComponent)).toEqual(getSize(fixture, ViewSlotComponent));
  });

  it('should show action after one change detection cycle', async () => {
    @Component({
      selector: 'spec-view',
      template: `
        @if (showAction) {
          <ng-template wbPartAction>
            <button class="spec-action">click</button>
          </ng-template>
        }
      `,
      imports: [WorkbenchPartActionDirective],
    })
    class SpecViewComponent {
      public showAction = false;
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecViewComponent);

    // Expect action not to show.
    expect(body).not.toShow(By.css('button.spec-action'));

    // Show action.
    const componentInstance = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecViewComponent>()!;
    componentInstance.showAction = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
    await waitUntilStable();

    // Expect action to show.
    expect(body).toShow(By.css('button.spec-action'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should not throw "ExpressionChangedAfterItHasBeenCheckedError" if setting view properties in constructor (navigate new view)', async () => {
    @Component({
      selector: 'spec-view',
      template: 'View',
    })
    class SpecViewComponent {

      constructor() {
        const view = inject(WorkbenchView);

        view.title = 'Title';
        view.heading = 'Heading';
        view.cssClass = ['class-1', 'class-2'];
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect view to show.
    expect(fixture).toShow(SpecViewComponent);

    // Expect view properties.
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title');
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading');
    expect(getViewCssClass(fixture, 'view.100')).toEqual(jasmine.arrayContaining(['class-1', 'class-2']));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should not throw "ExpressionChangedAfterItHasBeenCheckedError" if setting view properties in "ngOnInit" (navigate new view)', async () => {
    @Component({
      selector: 'spec-view',
      template: 'View',
    })
    class SpecViewComponent implements OnInit {

      private readonly _view = inject(WorkbenchView);

      public ngOnInit(): void {
        this._view.title = 'Title';
        this._view.heading = 'Heading';
        this._view.cssClass = ['class-1', 'class-2'];
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect view to show.
    expect(fixture).toShow(SpecViewComponent);

    // Expect view properties.
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title');
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading');
    expect(getViewCssClass(fixture, 'view.100')).toEqual(jasmine.arrayContaining(['class-1', 'class-2']));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should not throw "ExpressionChangedAfterItHasBeenCheckedError" if setting view properties in constructor (navigate existing view)', async () => {
    @Component({
      selector: 'spec-view',
      template: 'View',
    })
    class SpecViewComponent {

      constructor() {
        const view = inject(WorkbenchView);

        view.title = 'Title';
        view.heading = 'Heading';
        view.cssClass = ['class-1', 'class-2'];
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open view.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: layout.grids.mainArea.activePartId}));
    await waitUntilStable();

    // Navigate view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect view to show.
    expect(fixture).toShow(SpecViewComponent);

    // Expect view properties.
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title');
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading');
    expect(getViewCssClass(fixture, 'view.100')).toEqual(jasmine.arrayContaining(['class-1', 'class-2']));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should not throw "ExpressionChangedAfterItHasBeenCheckedError" if setting view properties in "ngOnInit" (navigate existing view)', async () => {
    @Component({
      selector: 'spec-view',
      template: 'View',
    })
    class SpecViewComponent implements OnInit {

      private readonly _view = inject(WorkbenchView);

      public ngOnInit(): void {
        this._view.title = 'Title';
        this._view.heading = 'Heading';
        this._view.cssClass = ['class-1', 'class-2'];
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open view.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: layout.grids.mainArea.activePartId}));
    await waitUntilStable();

    // Navigate view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect view to show.
    expect(fixture).toShow(SpecViewComponent);

    // Expect view properties.
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title');
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading');
    expect(getViewCssClass(fixture, 'view.100')).toEqual(jasmine.arrayContaining(['class-1', 'class-2']));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should have different view handle when replacing layout', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('testee', {partId: 'part.main'}),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const view1 = TestBed.inject(ɵWorkbenchService).views().find(view => view.alternativeId === 'testee')!;

    // Replace layout and add view.
    await TestBed.inject(ɵWorkbenchRouter).navigate(() => inject(ɵWorkbenchLayoutFactory)
      .addPart('part.main')
      .addView('testee', {partId: 'part.main'}),
    );

    // Expect the view handle NOT to be the same.
    const view2 = TestBed.inject(ɵWorkbenchService).views().find(view => view.alternativeId === 'testee')!;
    expect(view1).not.toBe(view2);
    expect(view1.id).not.toBe(view2.id);
    expect(view1.alternativeId).toBe(view2.alternativeId);
  });

  it('should have different view handle when removing and adding view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('testee', {partId: 'part.main'}),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const view1 = TestBed.inject(ɵWorkbenchService).views().find(view => view.alternativeId === 'testee')!;

    // Remove view and add view again.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout
      .removeView('testee', {force: true})
      .addView('testee', {partId: 'part.main'}),
    );

    // Expect the view handle NOT to be the same.
    const view2 = TestBed.inject(ɵWorkbenchService).views().find(view => view.alternativeId === 'testee')!;
    expect(view1).not.toBe(view2);
    expect(view1.id).not.toBe(view2.id);
    expect(view1.alternativeId).toBe(view2.alternativeId);
  });

  describe('Activated Route', () => {

    it('should set title and heading from route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: '',
              loadChildren: () => [
                {path: '', canMatch: [canMatchWorkbenchView('view-1')], component: SpecViewComponent, data: {[WorkbenchRouteData.title]: 'Title 1', [WorkbenchRouteData.heading]: 'Heading 1', [WorkbenchRouteData.cssClass]: 'class-1'}},
                {path: '', canMatch: [canMatchWorkbenchView('view-2')], component: SpecViewComponent, data: {[WorkbenchRouteData.title]: 'Title 2', [WorkbenchRouteData.heading]: 'Heading 2', [WorkbenchRouteData.cssClass]: 'class-2'}},
              ],
            },
            {
              path: 'module',
              loadChildren: () => [
                {path: 'view-3', component: SpecViewComponent, data: {[WorkbenchRouteData.title]: 'Title 3', [WorkbenchRouteData.heading]: 'Heading 3', [WorkbenchRouteData.cssClass]: 'class-3'}},
                {path: 'view-4', component: SpecViewComponent},
                {
                  path: 'sub-module',
                  loadChildren: () => [
                    {path: 'view-5', component: SpecViewComponent, data: {[WorkbenchRouteData.title]: 'Title 5', [WorkbenchRouteData.heading]: 'Heading 5', [WorkbenchRouteData.cssClass]: 'class-5'}},
                    {path: 'view-6', component: SpecViewComponent, data: {[WorkbenchRouteData.title]: 'Title 6', [WorkbenchRouteData.heading]: 'Heading 6', [WorkbenchRouteData.cssClass]: 'class-6'}},
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

      // Navigate to "" (hint: view-1)
      await workbenchRouter.navigate([], {hint: 'view-1', target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title 1');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 1');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-1');

      // Navigate to "" (hint: view-2)
      await workbenchRouter.navigate([], {hint: 'view-2', target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title 2');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 2');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-2');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-1');

      // Navigate to "module/view-3"
      await workbenchRouter.navigate(['module/view-3'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title 3');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 3');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-3');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-1');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-2');

      // Navigate to "module/view-4"
      await workbenchRouter.navigate(['module/view-4'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('');
      expect(getViewHeading(fixture, 'view.100')).toBeNull();
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-1');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-2');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-3');

      // Navigate to "module/sub-module/view-5"
      await workbenchRouter.navigate(['module/sub-module/view-5'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title 5');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 5');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-5');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-1');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-2');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-3');

      // Navigate to "module/sub-module/view-6"
      await workbenchRouter.navigate(['module/sub-module/view-6'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title 6');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 6');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-6');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-1');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-2');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-3');
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('class-5');
    });

    it('should resolve title and heading from route hierarchy', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: '',
              data: {
                [WorkbenchRouteData.title]: 'Base-Title',
                [WorkbenchRouteData.heading]: 'Base-Heading',
                [WorkbenchRouteData.cssClass]: 'Base-class',
              },
              children: [
                {
                  path: 'path',
                  data: {[WorkbenchRouteData.cssClass]: 'class'},
                  loadChildren: () => [
                    {
                      path: 'to',
                      data: {[WorkbenchRouteData.heading]: 'Heading'},
                      loadChildren: () => [
                        {
                          path: 'module',
                          data: {[WorkbenchRouteData.title]: 'Title'},
                          loadChildren: () => [
                            {path: 'view', component: SpecViewComponent},
                          ],
                        },
                      ],
                    },
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

      // Navigate to "path/to/module/view"
      await workbenchRouter.navigate(['path/to/module/view'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class');
    });

    it('should not unset/overwrite title and heading set via handle when navigating to the same route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'path/to/view/:id',
              component: SpecViewComponent,
              data: {[WorkbenchRouteData.title]: 'Title From Route'},
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Route');
      expect(getViewHeading(fixture, 'view.100')).toBeNull();

      // Set title and heading via handle.
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').title = 'Title From Handle';
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').heading = 'Heading From Handle';
      fixture.detectChanges();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Handle');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading From Handle');

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Handle');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading From Handle');
    });

    it('should unset/overwrite title and heading set via handle when navigating to a different route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'path/to/view/1',
              component: SpecViewComponent,
              data: {[WorkbenchRouteData.title]: 'Title From Route 1', [WorkbenchRouteData.heading]: 'Heading From Route 1'},
            },
            {
              path: 'path/to/view/2',
              component: SpecViewComponent,
              data: {[WorkbenchRouteData.title]: 'Title From Route 2'},
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Route 1');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading From Route 1');

      // Set title and heading via handle.
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').title = 'Title From Handle';
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').heading = 'Heading From Handle';
      fixture.detectChanges();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Handle');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading From Handle');

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Route 2');
      expect(getViewHeading(fixture, 'view.100')).toBeNull();
    });

    it('should not unset/overwrite title and heading set in view constructor', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'path/to/view',
              component: SpecViewComponent,
              data: {[WorkbenchRouteData.title]: 'Title From Route', [WorkbenchRouteData.heading]: 'Heading From Route'},
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view"
      await workbenchRouter.navigate(['path/to/view', {title: 'Title From Constructor', heading: 'Heading From Constructor'}], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Constructor');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading From Constructor');
    });

    it('should not unset dirty state set in view constructor', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view', component: SpecViewComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view"
      await workbenchRouter.navigate(['path/to/view', {dirty: true}], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeTrue();
    });

    it('should not unset dirty state when navigating to the same route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view/:id', component: SpecViewComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeFalse();

      // Mark view dirty.
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').dirty = true;
      fixture.detectChanges();
      expect(isViewDirty(fixture, 'view.100')).toBeTrue();

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeTrue();
    });

    it('should unset dirty state when navigating to a different route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view/1', component: SpecViewComponent},
            {path: 'path/to/view/2', component: SpecViewComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeFalse();

      // Mark view dirty.
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').dirty = true;
      fixture.detectChanges();
      expect(isViewDirty(fixture, 'view.100')).toBeTrue();

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeFalse();
    });

    it('should not unset CSS class set in view constructor', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view', component: SpecViewComponent, data: {[WorkbenchRouteData.cssClass]: 'class-from-route'}},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view"
      await workbenchRouter.navigate(['path/to/view', {cssClass: 'class-from-constructor'}], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-from-route');
      expect(getViewCssClass(fixture, 'view.100')).toContain('class-from-constructor');
    });

    it('should not unset CSS class when navigating to the same route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view/:id', component: SpecViewComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();

      // Set CSS class.
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').cssClass = 'css-class';
      fixture.detectChanges();
      expect(getViewCssClass(fixture, 'view.100')).toContain('css-class');

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewCssClass(fixture, 'view.100')).toContain('css-class');
    });

    it('should unset CSS class when navigating to a different route', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view/1', component: SpecViewComponent},
            {path: 'path/to/view/2', component: SpecViewComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();

      // Set CSS class.
      TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').cssClass = 'css-class';
      fixture.detectChanges();
      expect(getViewCssClass(fixture, 'view.100')).toContain('css-class');

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('css-class');
    });

    /**
     * Verifies that view properties are set after destroying the current component but before constructing the new component.
     *
     * This test navigates a view to the following routes. Properties are associated with the routes and navigation.
     *
     * Routes:
     * - /view-1
     * - /view-2
     * - /view/3
     * - /view/4
     * - /path/to/module-a/view-5
     * - /path/to/module-b/view/6
     * - /path/to/module-b/view/7
     */
    it('should set view and navigation properties after destroying the current component (if any) but before constructing new component', async () => {
      @Directive()
      abstract class AbstractSpecViewComponent implements OnDestroy {

        private _view = inject(ɵWorkbenchView);

        public titleReadInConstructor: string | null = null;
        public titleReadInDestroy: string | null = null;

        public headingReadInConstructor: string | null = null;
        public headingReadInDestroy: string | null = null;

        public navigationReadInConstructor: WorkbenchViewNavigation | undefined;
        public navigationReadInDestroy: WorkbenchViewNavigation | undefined;

        public navigationCssClassReadInConstructor: string[];
        public navigationCssClassReadInDestroy: string[] | undefined;

        constructor() {
          // Title
          this.titleReadInConstructor = this._view.title();
          // Heading
          this.headingReadInConstructor = this._view.heading();
          // Navigation
          this.navigationReadInConstructor = this._view.navigation();
          // Navigation CSS Class
          this.navigationCssClassReadInConstructor = this._view.classList.navigation();
        }

        public ngOnDestroy(): void {
          // Title
          this.titleReadInDestroy = this._view.title();
          // Heading
          this.headingReadInDestroy = this._view.heading();
          // Navigation
          this.navigationReadInDestroy = this._view.navigation();
          // Navigation CSS Class
          this.navigationCssClassReadInDestroy = this._view.classList.navigation();
        }
      }

      @Component({selector: 'spec-view-1', template: 'View 1'})
      class SpecView1Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-2', template: 'View 2'})
      class SpecView2Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-3', template: 'View 3'})
      class SpecView3Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-4', template: 'View 4'})
      class SpecView4Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-5', template: 'View 5'})
      class SpecView5Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-6', template: 'View 6'})
      class SpecView6Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-7', template: 'View 7'})
      class SpecView7Component extends AbstractSpecViewComponent {
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'view-1',
              loadComponent: () => SpecView1Component,
              data: {[WorkbenchRouteData.title]: 'Title View 1', [WorkbenchRouteData.heading]: 'Heading View 1'},
            },
            {
              path: 'view-2',
              loadComponent: () => SpecView2Component,
              data: {[WorkbenchRouteData.title]: 'Title View 2', [WorkbenchRouteData.heading]: 'Heading View 2'},
            },
            {
              path: 'view/3',
              loadComponent: () => SpecView3Component,
              data: {[WorkbenchRouteData.title]: 'Title View 3', [WorkbenchRouteData.heading]: 'Heading View 3'},
            },
            {
              path: 'view/4',
              loadComponent: () => SpecView4Component,
              data: {[WorkbenchRouteData.title]: 'Title View 4', [WorkbenchRouteData.heading]: 'Heading View 4'},
            },
            {
              path: 'path/to/module-a',
              loadChildren: () => [
                {
                  path: 'view-5',
                  loadComponent: () => SpecView5Component,
                  data: {[WorkbenchRouteData.title]: 'Title View 5', [WorkbenchRouteData.heading]: 'Heading View 5'},
                },
              ],
              data: {[WorkbenchRouteData.title]: 'Title Module A', [WorkbenchRouteData.heading]: 'Heading Module A'},
            },
            {
              path: 'path/to/module-b',
              loadChildren: () => [
                {
                  path: 'view/6',
                  loadComponent: () => SpecView6Component,
                  data: {[WorkbenchRouteData.title]: 'Title View 6', [WorkbenchRouteData.heading]: 'Heading View 6'},
                },
                {
                  path: 'view/7',
                  loadComponent: () => SpecView7Component,
                  data: {[WorkbenchRouteData.title]: 'Title View 7', [WorkbenchRouteData.heading]: 'Heading View 7'},
                },
              ],
              data: {[WorkbenchRouteData.title]: 'Title Module B', [WorkbenchRouteData.heading]: 'Heading Module B'},
            },
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate "view.100" to "view-1".
      await workbenchRouter.navigate(['view-1'], {target: 'view.100', data: {data: 'view-1'}, state: {state: 'view-1'}, hint: 'view-1', cssClass: 'view-1'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView1Component>()!;
      expect(componentInstanceView1).toBeInstanceOf(SpecView1Component);
      expect(componentInstanceView1.titleReadInConstructor).toEqual('Title View 1');
      expect(componentInstanceView1.headingReadInConstructor).toEqual('Heading View 1');
      expect(componentInstanceView1.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-1'}, state: {state: 'view-1'}, hint: 'view-1'}));
      expect(componentInstanceView1.navigationCssClassReadInConstructor).toEqual(['view-1']);

      // Navigate "view.100" to "view-2".
      await workbenchRouter.navigate(['view-2'], {target: 'view.100', data: {data: 'view-2'}, state: {state: 'view-2'}, hint: 'view-2', cssClass: 'view-2'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView2Component>()!;
      expect(componentInstanceView2).toBeInstanceOf(SpecView2Component);
      expect(componentInstanceView2.titleReadInConstructor).toEqual('Title View 2');
      expect(componentInstanceView2.headingReadInConstructor).toEqual('Heading View 2');
      expect(componentInstanceView2.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-2'}, state: {state: 'view-2'}, hint: 'view-2'}));
      expect(componentInstanceView2.navigationCssClassReadInConstructor).toEqual(['view-2']);
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView1.titleReadInDestroy).toEqual('Title View 1');
      expect(componentInstanceView1.headingReadInDestroy).toEqual('Heading View 1');
      expect(componentInstanceView1.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-1'}, state: {state: 'view-1'}, hint: 'view-1'}));
      expect(componentInstanceView1.navigationCssClassReadInDestroy).toEqual(['view-1']);

      // Navigate "view.100" to "view/3".
      await workbenchRouter.navigate(['view/3'], {target: 'view.100', data: {data: 'view-3'}, state: {state: 'view-3'}, hint: 'view-3', cssClass: 'view-3'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView3 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView3Component>()!;
      expect(componentInstanceView3).toBeInstanceOf(SpecView3Component);
      expect(componentInstanceView3.titleReadInConstructor).toEqual('Title View 3');
      expect(componentInstanceView3.headingReadInConstructor).toEqual('Heading View 3');
      expect(componentInstanceView3.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-3'}, state: {state: 'view-3'}, hint: 'view-3'}));
      expect(componentInstanceView3.navigationCssClassReadInConstructor).toEqual(['view-3']);
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView2.titleReadInDestroy).toEqual('Title View 2');
      expect(componentInstanceView2.headingReadInDestroy).toEqual('Heading View 2');
      expect(componentInstanceView2.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-2'}, state: {state: 'view-2'}, hint: 'view-2'}));
      expect(componentInstanceView2.navigationCssClassReadInDestroy).toEqual(['view-2']);

      // Navigate "view.100" to "view/4".
      await workbenchRouter.navigate(['view/4'], {target: 'view.100', data: {data: 'view-4'}, state: {state: 'view-4'}, hint: 'view-4', cssClass: 'view-4'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView4 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView4Component>()!;
      expect(componentInstanceView4).toBeInstanceOf(SpecView4Component);
      expect(componentInstanceView4.titleReadInConstructor).toEqual('Title View 4');
      expect(componentInstanceView4.headingReadInConstructor).toEqual('Heading View 4');
      expect(componentInstanceView4.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-4'}, state: {state: 'view-4'}, hint: 'view-4'}));
      expect(componentInstanceView4.navigationCssClassReadInConstructor).toEqual(['view-4']);
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView3.titleReadInDestroy).toEqual('Title View 3');
      expect(componentInstanceView3.headingReadInDestroy).toEqual('Heading View 3');
      expect(componentInstanceView3.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-3'}, state: {state: 'view-3'}, hint: 'view-3'}));
      expect(componentInstanceView3.navigationCssClassReadInDestroy).toEqual(['view-3']);

      // Navigate "view.100" to "path/to/module-a/view-5".
      await workbenchRouter.navigate(['path/to/module-a/view-5'], {target: 'view.100', data: {data: 'view-5'}, state: {state: 'view-5'}, hint: 'view-5', cssClass: 'view-5'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView5 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView5Component>()!;
      expect(componentInstanceView5).toBeInstanceOf(SpecView5Component);
      expect(componentInstanceView5.titleReadInConstructor).toEqual('Title View 5');
      expect(componentInstanceView5.headingReadInConstructor).toEqual('Heading View 5');
      expect(componentInstanceView5.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-5'}, state: {state: 'view-5'}, hint: 'view-5'}));
      expect(componentInstanceView5.navigationCssClassReadInConstructor).toEqual(['view-5']);
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView4.titleReadInDestroy).toEqual('Title View 4');
      expect(componentInstanceView4.headingReadInDestroy).toEqual('Heading View 4');
      expect(componentInstanceView4.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-4'}, state: {state: 'view-4'}, hint: 'view-4'}));
      expect(componentInstanceView4.navigationCssClassReadInDestroy).toEqual(['view-4']);

      // Navigate "view.100" to "path/to/module-b/view/6".
      await workbenchRouter.navigate(['path/to/module-b/view/6'], {target: 'view.100', data: {data: 'view-6'}, state: {state: 'view-6'}, hint: 'view-6', cssClass: 'view-6'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView6 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView6Component>()!;
      expect(componentInstanceView6).toBeInstanceOf(SpecView6Component);
      expect(componentInstanceView6.titleReadInConstructor).toEqual('Title View 6');
      expect(componentInstanceView6.headingReadInConstructor).toEqual('Heading View 6');
      expect(componentInstanceView6.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-6'}, state: {state: 'view-6'}, hint: 'view-6'}));
      expect(componentInstanceView6.navigationCssClassReadInConstructor).toEqual(['view-6']);
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView5.titleReadInDestroy).toEqual('Title View 5');
      expect(componentInstanceView5.headingReadInDestroy).toEqual('Heading View 5');
      expect(componentInstanceView5.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-5'}, state: {state: 'view-5'}, hint: 'view-5'}));
      expect(componentInstanceView5.navigationCssClassReadInDestroy).toEqual(['view-5']);

      // Navigate "view.100" to "path/to/module-b/view/7".
      await workbenchRouter.navigate(['path/to/module-b/view/7'], {target: 'view.100', data: {data: 'view-7'}, state: {state: 'view-7'}, hint: 'view-7', cssClass: 'view-7'});
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView7 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView7Component>()!;
      expect(componentInstanceView7).toBeInstanceOf(SpecView7Component);
      expect(componentInstanceView7.titleReadInConstructor).toEqual('Title View 7');
      expect(componentInstanceView7.headingReadInConstructor).toEqual('Heading View 7');
      expect(componentInstanceView7.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'view-7'}, state: {state: 'view-7'}, hint: 'view-7'}));
      expect(componentInstanceView7.navigationCssClassReadInConstructor).toEqual(['view-7']);
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView6.titleReadInDestroy).toEqual('Title View 6');
      expect(componentInstanceView6.headingReadInDestroy).toEqual('Heading View 6');
      expect(componentInstanceView6.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-6'}, state: {state: 'view-6'}, hint: 'view-6'}));
      expect(componentInstanceView6.navigationCssClassReadInDestroy).toEqual(['view-6']);

      // Close view.
      await workbenchRouter.navigate([], {target: 'view.100', close: true});
      await waitUntilStable();
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView7.titleReadInDestroy).toEqual('Title View 7');
      expect(componentInstanceView7.headingReadInDestroy).toEqual('Heading View 7');
      expect(componentInstanceView7.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'view-7'}, state: {state: 'view-7'}, hint: 'view-7'}));
      expect(componentInstanceView7.navigationCssClassReadInDestroy).toEqual(['view-7']);
    });

    /**
     * Verifies that the component on the left has the part 'left' when being destroyed and the component on the right has the part 'right' when being constructed.
     *
     * This test adds a view to the left and navigates it. The test then moves the view to the right and navigates it to a different component.
     */
    it(`should set the view's workbench part after destroying the previous component (if any) but before constructing new component`, async () => {
      @Directive()
      abstract class AbstractSpecViewComponent implements OnDestroy {

        private _view = inject(ɵWorkbenchView);

        public partReadInConstructor: PartId | null = null;
        public partReadInDestroy: PartId | null = null;

        constructor() {
          this.partReadInConstructor = this._view.part().id;
        }

        public ngOnDestroy(): void {
          this.partReadInDestroy = this._view.part().id;
        }
      }

      @Component({selector: 'spec-view-1', template: 'View 1'})
      class SpecView1Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-2', template: 'View 2'})
      class SpecView2Component extends AbstractSpecViewComponent {
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'path/to/module-a',
              loadChildren: () => [
                {
                  path: 'view-1',
                  loadComponent: () => SpecView1Component,
                  data: {[WorkbenchRouteData.title]: 'View 1'},
                },
              ],
            },
            {
              path: 'path/to/module-b',
              loadChildren: () => [
                {
                  path: 'view-2',
                  loadComponent: () => SpecView2Component,
                  data: {[WorkbenchRouteData.title]: 'View 2'},
                },
              ],
            },
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate "view.100" to "path/to/module-a/view-1" in the left part.
      await workbenchRouter.navigate(() => inject(WorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.left', {align: 'left'})
        .addView('view.100', {partId: 'part.left'})
        .navigateView('view.100', ['path/to/module-a/view-1'])
        .activateView('view.100'),
      );
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView1Component>()!;
      expect(componentInstanceView1).toBeInstanceOf(SpecView1Component);
      expect(componentInstanceView1.partReadInConstructor).toEqual('part.left');

      // Navigate "view.100" to "path/to/module-b/view-2" in the right part.
      await workbenchRouter.navigate(() => inject(WorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.right', {align: 'right'})
        .addView('view.100', {partId: 'part.right'})
        .navigateView('view.100', ['path/to/module-b/view-2'])
        .activateView('view.100'),
      );
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView2Component>()!;
      expect(componentInstanceView2).toBeInstanceOf(SpecView2Component);
      expect(componentInstanceView2.partReadInConstructor).toEqual('part.right');
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView1.partReadInDestroy).toEqual('part.left');

      // Close view
      await workbenchRouter.navigate([], {target: 'view.100', close: true});
      await waitUntilStable();
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView2.partReadInDestroy).toEqual('part.right');
    });

    /**
     * Verifies that the component is active when being destroyed and the new component is inactive when being constructed.
     *
     * This test adds a view and navigates it. The test then navigates the view to another component and activates another view,
     * simulating changing the view's active state.
     */
    it(`should set the view's active state after destroying the previous component (if any) but before constructing new component`, async () => {
      @Directive()
      abstract class AbstractSpecViewComponent implements OnDestroy {

        private _view = inject(ɵWorkbenchView);

        public activeReadInConstructor: boolean | undefined;
        public activeReadInDestroy: boolean | undefined;

        constructor() {
          this.activeReadInConstructor = this._view.active();
        }

        public ngOnDestroy(): void {
          this.activeReadInDestroy = this._view.active();
        }
      }

      @Component({selector: 'spec-view-1', template: 'View 1'})
      class SpecView1Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-2', template: 'View 2'})
      class SpecView2Component extends AbstractSpecViewComponent {
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {
              path: 'path/to/module-a',
              loadChildren: () => [
                {
                  path: 'view-1',
                  loadComponent: () => SpecView1Component,
                  data: {[WorkbenchRouteData.title]: 'View 1'},
                },
              ],
            },
            {
              path: 'path/to/module-b',
              loadChildren: () => [
                {
                  path: 'view-2',
                  loadComponent: () => SpecView2Component,
                  data: {[WorkbenchRouteData.title]: 'View 2'},
                },
              ],
            },
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate "view.100" to "path/to/module-a/view-1".
      await workbenchRouter.navigate(() => inject(WorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addView('view.100', {partId: 'part.initial'})
        .navigateView('view.100', ['path/to/module-a/view-1'])
        .activateView('view.100'),
      );
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView1Component>()!;
      expect(componentInstanceView1).toBeInstanceOf(SpecView1Component);
      expect(componentInstanceView1.activeReadInConstructor).toBeTrue();

      // Navigate "view.100" to "path/to/module-b/view-2".
      await workbenchRouter.navigate(layout => layout
        .navigateView('view.100', ['path/to/module-b/view-2'])
        .addView('view.101', {partId: 'part.initial'})
        .activateView('view.101'),
      );
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView2Component>()!;
      expect(componentInstanceView2).toBeInstanceOf(SpecView2Component);
      expect(componentInstanceView2.activeReadInConstructor).toBeFalse();
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView1.activeReadInDestroy).toBeTrue();

      // Close view
      await workbenchRouter.navigate([], {target: 'view.100', close: true});
      await waitUntilStable();
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView2.activeReadInDestroy).toBeFalse();
    });

    /**
     * Verifies that the component is dirty when being destroyed and the new component is pristine when being constructed.
     *
     * This test adds a view and navigates it. The test then marks it dirty and navigates it to another component.
     */
    it(`should unset the view's dirty state after destroying the previous component (if any) but before constructing new component`, async () => {
      @Directive()
      abstract class AbstractSpecViewComponent implements OnDestroy {

        public view = inject(ɵWorkbenchView);

        public dirtyReadInConstructor: boolean | undefined;
        public dirtyReadInDestroy: boolean | undefined;

        constructor() {
          this.dirtyReadInConstructor = this.view.dirty();
        }

        public ngOnDestroy(): void {
          this.dirtyReadInDestroy = this.view.dirty();
        }
      }

      @Component({selector: 'spec-view-1', template: 'View 1'})
      class SpecView1Component extends AbstractSpecViewComponent {
      }

      @Component({selector: 'spec-view-2', template: 'View 2'})
      class SpecView2Component extends AbstractSpecViewComponent {
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {
              path: 'path/to/module-a',
              loadChildren: () => [
                {
                  path: 'view-1',
                  loadComponent: () => SpecView1Component,
                  data: {[WorkbenchRouteData.title]: 'View 1'},
                },
              ],
            },
            {
              path: 'path/to/module-b',
              loadChildren: () => [
                {
                  path: 'view-2',
                  loadComponent: () => SpecView2Component,
                  data: {[WorkbenchRouteData.title]: 'View 2'},
                },
              ],
            },
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate "view.100" to "path/to/module-a/view-1".
      await workbenchRouter.navigate(() => inject(WorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addView('view.100', {partId: 'part.initial'})
        .navigateView('view.100', ['path/to/module-a/view-1'])
        .activateView('view.100'),
      );
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView1 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView1Component>()!;
      expect(componentInstanceView1).toBeInstanceOf(SpecView1Component);
      expect(componentInstanceView1.dirtyReadInConstructor).toBeFalse();

      // Mark the view dirty.
      componentInstanceView1.view.dirty = true;

      // Navigate "view.100" to "path/to/module-b/view-2".
      await workbenchRouter.navigate(layout => layout.navigateView('view.100', ['path/to/module-b/view-2']));
      await waitUntilStable();
      // Expect properties to be set in constructor.
      const componentInstanceView2 = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecView2Component>()!;
      expect(componentInstanceView2).toBeInstanceOf(SpecView2Component);
      expect(componentInstanceView2.dirtyReadInConstructor).toBeFalse();
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView1.dirtyReadInDestroy).toBeTrue();

      // Close view
      await workbenchRouter.navigate([], {target: 'view.100', close: true});
      await waitUntilStable();
      // Expect properties not to be changed until destroyed previous component.
      expect(componentInstanceView2.dirtyReadInDestroy).toBeFalse();
    });

    it('should observe navigation data', async () => {
      @Component({selector: 'spec-view', template: 'View'})
      class SpecViewComponent {

        public readonly view = inject(WorkbenchView);

        public navigationDataCaptor = new Array<NavigationData | undefined>();

        constructor() {
          effect(() => this.navigationDataCaptor.push(this.view.navigation()?.data));
        }
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {path: 'path/to/view', component: SpecViewComponent},
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate view with data.
      await workbenchRouter.navigate(layout => layout
        .addView('view.100', {partId: 'part.initial'})
        .navigateView('view.100', ['path/to/view'], {data: {data: 'a'}})
        .activateView('view.100'),
      );
      await waitUntilStable();
      const viewComponent = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecViewComponent>()!;
      expect(viewComponent.view.navigation()!.data).toEqual({data: 'a'});
      expect(viewComponent.navigationDataCaptor).toEqual([{data: 'a'}]);

      // Navigate view with different data.
      await workbenchRouter.navigate(layout => layout.navigateView('view.100', ['path/to/view'], {data: {data: 'b'}}));
      await waitUntilStable();
      expect(viewComponent.view.navigation()!.data).toEqual({data: 'b'});
      expect(viewComponent.navigationDataCaptor).toEqual([{data: 'a'}, {data: 'b'}]);

      // Navigate view with different data.
      await workbenchRouter.navigate(['path/to/view'], {data: {data: 'c'}});
      await waitUntilStable();
      expect(viewComponent.view.navigation()!.data).toEqual({data: 'c'});
      expect(viewComponent.navigationDataCaptor).toEqual([{data: 'a'}, {data: 'b'}, {data: 'c'}]);
    });

    it('should observe navigation state', async () => {
      @Component({selector: 'spec-view', template: 'View'})
      class SpecViewComponent {

        public readonly view = inject(WorkbenchView);

        public navigationStateCaptor = new Array<NavigationState | undefined>();

        constructor() {

          effect(() => this.navigationStateCaptor.push(this.view.navigation()?.state));
        }
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {path: 'path/to/view', component: SpecViewComponent},
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Navigate view with state.
      await workbenchRouter.navigate(layout => layout
        .addView('view.100', {partId: 'part.initial'})
        .navigateView('view.100', ['path/to/view'], {state: {state: 'a'}})
        .activateView('view.100'),
      );
      await waitUntilStable();
      const viewComponent = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.100').getComponent<SpecViewComponent>()!;
      expect(viewComponent.view.navigation()!.state).toEqual({state: 'a'});
      expect(viewComponent.navigationStateCaptor).toEqual([{state: 'a'}]);

      // Navigate view with different state.
      await workbenchRouter.navigate(layout => layout.navigateView('view.100', ['path/to/view'], {state: {state: 'b'}}));
      await waitUntilStable();
      expect(viewComponent.view.navigation()!.state).toEqual({state: 'b'});
      expect(viewComponent.navigationStateCaptor).toEqual([{state: 'a'}, {state: 'b'}]);

      // Navigate view with different state.
      await workbenchRouter.navigate(['path/to/view'], {state: {state: 'c'}});
      await waitUntilStable();
      expect(viewComponent.view.navigation()!.state).toEqual({state: 'c'});
      expect(viewComponent.navigationStateCaptor).toEqual([{state: 'a'}, {state: 'b'}, {state: 'c'}]);
    });

    it('should change detect inactive path-based view', async () => {
      const log = new Array<string>();

      @Component({selector: 'spec-view-1', template: '{{view.title()}}'})
      class SpecViewComponent1 implements OnInit {

        public readonly view = inject(WorkbenchView);

        constructor() {
          this.view.title = 'SpecViewComponent1.construct';
          log.push('SpecViewComponent1.construct');
        }

        public ngOnInit(): void {
          this.view.title = 'SpecViewComponent1.ngOnInit';
          log.push('SpecViewComponent1.ngOnInit');
        }
      }

      @Component({selector: 'spec-view-2', template: '{{view.title()}}'})
      class SpecViewComponent2 implements OnInit {

        public readonly view = inject(WorkbenchView);

        constructor() {
          this.view.title = 'SpecViewComponent2.construct';
          log.push('SpecViewComponent2.construct');
        }

        public ngOnInit(): void {
          this.view.title = 'SpecViewComponent2.ngOnInit';
          log.push('SpecViewComponent2.ngOnInit');
        }
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {path: 'path/to/view/1', component: SpecViewComponent1},
            {path: 'path/to/view/2', component: SpecViewComponent2},
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Open view 1.
      await workbenchRouter.navigate(layout => layout.addView('view.101', {partId: 'part.initial', activateView: true}));

      // Open view 2 and navigate it to "path/to/view/1".
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.102', activate: false});
      await waitUntilStable();
      expect(log).toEqual(['SpecViewComponent1.construct', 'SpecViewComponent1.ngOnInit']);
      log.length = 0;

      // Navigate view 2 to "path/to/view/2".
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102', activate: false});
      await waitUntilStable();
      expect(log).toEqual(['SpecViewComponent2.construct', 'SpecViewComponent2.ngOnInit']);
    });

    it('should change detect inactive empty-path view', async () => {
      const log = new Array<string>();

      @Component({selector: 'spec-view-1', template: '{{view.title()}}'})
      class SpecViewComponent1 implements OnInit {

        public readonly view = inject(WorkbenchView);

        constructor() {
          this.view.title = 'SpecViewComponent1.construct';
          log.push('SpecViewComponent1.construct');
        }

        public ngOnInit(): void {
          this.view.title = 'SpecViewComponent1.ngOnInit';
          log.push('SpecViewComponent1.ngOnInit');
        }
      }

      @Component({selector: 'spec-view-2', template: '{{view.title()}}'})
      class SpecViewComponent2 implements OnInit {

        public readonly view = inject(WorkbenchView);

        constructor() {
          this.view.title = 'SpecViewComponent2.construct';
          log.push('SpecViewComponent2.construct');
        }

        public ngOnInit(): void {
          this.view.title = 'SpecViewComponent2.ngOnInit';
          log.push('SpecViewComponent2.ngOnInit');
        }
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {path: '', canMatch: [canMatchWorkbenchView('view-101')], component: SpecViewComponent1},
            {path: '', canMatch: [canMatchWorkbenchView('view-102')], component: SpecViewComponent2},
          ]),
        ],
      });
      styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitUntilWorkbenchStarted();

      // Open view 1.
      await workbenchRouter.navigate(layout => layout.addView('view.101', {partId: 'part.initial', activateView: true}));

      // Open view 2 and navigate it to "" passing hint "view-101".
      await workbenchRouter.navigate([], {target: 'view.102', hint: 'view-101', activate: false});
      await waitUntilStable();
      expect(log).toEqual(['SpecViewComponent1.construct', 'SpecViewComponent1.ngOnInit']);
      log.length = 0;

      // Open view 2 and navigate it to "" passing hint "view-102".
      await workbenchRouter.navigate([], {target: 'view.102', hint: 'view-102', activate: false});
      await waitUntilStable();
      expect(log).toEqual(['SpecViewComponent2.construct', 'SpecViewComponent2.ngOnInit']);
    });
  });

  describe('Scroll Position', () => {

    it('should retain view scroll position when switching views', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {path: 'path/to/view', loadComponent: () => TestViewComponent},
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestViewComponent {
        public viewport = inject(SciViewportComponent);
      }

      styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open two views.
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.101'});
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.102'});
      await waitUntilStable();

      const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
      const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
      const viewportView2 = view2.getComponent<TestViewComponent>()!.viewport;

      // Scroll view 2 to the bottom.
      viewportView2.scrollTop = 2000;
      const scrollTop = viewportView2.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Activate view 1.
      await view1.activate();
      await waitUntilStable();

      // Activate view 2.
      await view2.activate();
      await waitUntilStable();

      // Expect scroll position to be restored.
      expect(viewportView2.scrollTop).toBe(scrollTop);
    });

    it('should retain view scroll position when opening new view (synchronous route activation)', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'path/to/view', loadComponent: () => TestViewComponent,
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestViewComponent {
        public viewport = inject(SciViewportComponent);
      }

      styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open view 1.
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.101'});
      await waitUntilStable();

      const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
      const viewportView1 = view1.getComponent<TestViewComponent>()!.viewport;

      // Scroll view 1 to the bottom.
      viewportView1.scrollTop = 2000;
      const scrollTop = viewportView1.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Open new view.
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.102'});
      await waitUntilStable();

      // Expect view 1 to be inactive.
      expect(view1.active()).toBeFalse();

      // Activate view 1.
      await view1.activate();
      await waitUntilStable();

      // Expect scroll position to be restored.
      expect(viewportView1.scrollTop).toBe(scrollTop);
    });

    it('should retain view scroll position when opening new view (asynchronous route activation)', async () => {
      const onCanActivate$ = new ReplaySubject<void>(1);
      const canActivate$ = new Subject<boolean>();

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          provideRouter([
            {
              path: 'path/to/view/1',
              loadComponent: () => TestViewComponent,
            },
            {
              path: 'path/to/view/2',
              loadComponent: () => TestViewComponent,
              canActivate: [() => {
                onCanActivate$.next();
                return canActivate$;
              }],
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestViewComponent {
        public viewport = inject(SciViewportComponent);
      }

      styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open view 1.
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.101'});
      await waitUntilStable();

      const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
      const viewportView1 = view1.getComponent<TestViewComponent>()!.viewport;

      // Scroll view 1 to the bottom.
      viewportView1.scrollTop = 2000;
      const scrollTop = viewportView1.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Open view 2 but block the navigation.
      const navigation2 = TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.102'});

      // Wait until entering 'CanActivate' guard.
      await firstValueFrom(onCanActivate$);
      await waitUntilStable();

      // Continue navigation of view 2.
      canActivate$.next(true);
      await navigation2;
      await waitUntilStable();

      // Expect view 1 to be inactive.
      expect(view1.active()).toBeFalse();

      // Activate view 1.
      await view1.activate();
      await waitUntilStable();

      // Expect scroll position to be restored.
      expect(viewportView1.scrollTop).toBe(scrollTop);
    });

    it('should retain view scroll position when moving view', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {path: 'path/to/view', loadComponent: () => TestViewComponent},
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestViewComponent {
        public viewport = inject(SciViewportComponent);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open two views.
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.101'});
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.102'});
      await waitUntilStable();

      const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
      const viewportView2 = view2.getComponent<TestViewComponent>()!.viewport;

      // Scroll view 2 to the bottom.
      viewportView2.scrollTop = 2000;
      const scrollTop = viewportView2.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Add right part.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addPart('part.right', {relativeTo: 'part.initial', align: 'right'}));
      await waitUntilStable();

      // Move view to the right part.
      view2.move('part.right');
      await waitUntilStable();

      // Expect scroll position to be restored.
      expect(viewportView2.scrollTop).toBe(scrollTop);

      // Expect view to be moved.
      expect(fixture).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MPart({id: MAIN_AREA}),
          },
          mainArea: {
            root: new MTreeNode({
              child1: new MPart({id: 'part.initial', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
              child2: new MPart({id: 'part.right', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
            }),
          },
        },
      });
    });

    it('should retain view scroll position when changing the layout', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
          provideRouter([
            {path: 'path/to/view', loadComponent: () => TestViewComponent},
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestViewComponent {
        public viewport = inject(SciViewportComponent);
      }

      styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open two views.
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.101'});
      await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.102'});
      await waitUntilStable();

      const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;
      const viewportView2 = view2.getComponent<TestViewComponent>()!.viewport;

      // Scroll view 2 to the bottom.
      viewportView2.scrollTop = 2000;
      const scrollTop = viewportView2.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Change layout.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout
        .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
        .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
        .addPart('part.top', {relativeTo: 'part.initial', align: 'top'})
        .addPart('part.bottom', {relativeTo: 'part.initial', align: 'bottom'})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.right', activateView: true})
        .addView('view.105', {partId: 'part.top', activateView: true})
        .addView('view.106', {partId: 'part.bottom', activateView: true}),
      );
      await waitUntilStable();

      // Expect scroll position to be restored.
      expect(viewportView2.scrollTop).toBe(scrollTop);

      // Move view to part 'top'.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.top', {activateView: true}));
      await waitUntilStable();
      // Expect view to be moved and scroll position to be restored.
      expect(view2.part().id).toEqual('part.top');
      expect(viewportView2.scrollTop).toBe(scrollTop);

      // Move view to part 'bottom'.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.bottom', {activateView: true}));
      await waitUntilStable();
      // Expect view to be moved and scroll position to be restored.
      expect(view2.part().id).toEqual('part.bottom');
      expect(viewportView2.scrollTop).toBe(scrollTop);

      // Move view to part 'right'.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.right', {activateView: true}));
      await waitUntilStable();
      // Expect view to be moved and scroll position to be restored.
      expect(view2.part().id).toEqual('part.right');
      expect(viewportView2.scrollTop).toBe(scrollTop);

      // Move view to part 'left'.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.left', {activateView: true}));
      await waitUntilStable();
      // Expect view to be moved and scroll position to be restored.
      expect(view2.part().id).toEqual('part.left');
      expect(viewportView2.scrollTop).toBe(scrollTop);
    });
  });

  it('should display translated title', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.100', {partId: 'part.main'}),
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Set view title.
    TestBed.inject(WorkbenchService).getView('view.100')!.title = '%title';
    await fixture.whenStable();

    // Expect view title to be translated.
    const titleElement = fixture.debugElement.query(By.css('wb-view-tab[data-viewid="view.100"] span.e2e-title')).nativeElement as HTMLElement;
    expect(titleElement.innerText).toEqual('TITLE (translated)');
  });

  it('should display translated heading', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.100', {partId: 'part.main'}),
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    setDesignToken(fixture, '--sci-workbench-tab-height', '3.5rem');
    await waitUntilWorkbenchStarted();

    // Set view heading.
    TestBed.inject(WorkbenchService).getView('view.100')!.heading = '%heading';
    await fixture.whenStable();

    // Expect view heading to be translated.
    const headingElement = fixture.debugElement.query(By.css('wb-view-tab[data-viewid="view.100"] span.e2e-heading')).nativeElement as HTMLElement;
    expect(headingElement.innerText).toEqual('HEADING (translated)');
  });
});

@Component({
  selector: 'spec-view',
  template: '{{onCheckForChanges()}}',
})
class SpecViewComponent {

  public destroyed = false;
  public checkedForChanges = false;
  public preventClosing = false;
  public view = inject(WorkbenchView);
  public injector = inject(Injector);
  public canCloseInjector: Injector | undefined;

  constructor() {
    const params = inject(ActivatedRoute).snapshot.paramMap;
    if (params.has('title')) {
      this.view.title = params.get('title');
    }
    if (params.has('heading')) {
      this.view.heading = params.get('heading');
    }
    if (params.has('dirty')) {
      this.view.dirty = booleanAttribute(params.get('dirty'));
    }
    if (params.has('cssClass')) {
      this.view.cssClass = params.get('cssClass')!;
    }
    this.view.canClose(() => {
      console.log(`[SpecViewComponent][CanClose] CanClose invoked for view '${this.view.id}'. [path=${this.view.navigation()?.path.join('/')}]`);
      this.canCloseInjector = inject(Injector);
      return !this.preventClosing;
    });

    inject(DestroyRef).onDestroy(() => this.destroyed = true);
  }

  protected onCheckForChanges(): boolean {
    this.checkedForChanges = true;
    return true;
  }
}

@Component({
  selector: 'spec-view-1',
  template: '{{onCheckForChanges()}}',
})
class SpecView1Component extends SpecViewComponent {
}

@Component({
  selector: 'spec-view-2',
  template: '{{onCheckForChanges()}}',
})
class SpecView2Component extends SpecViewComponent {
}

function setDesignToken(fixture: ComponentFixture<unknown>, name: string, value: string): void {
  const workbenchElement = fixture.debugElement.nativeElement as HTMLElement;
  workbenchElement.style.setProperty(name, value);
}

function getViewTitle(fixture: ComponentFixture<unknown>, viewId: ViewId): string | null {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  const titleElement = viewTabElement.query(By.css('span.e2e-title')) as DebugElement | null;
  return titleElement ? (titleElement.nativeElement as HTMLElement).innerText.trim() : null;
}

function getViewHeading(fixture: ComponentFixture<unknown>, viewId: ViewId): string | null {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  const headingElement = viewTabElement.query(By.css('span.e2e-heading')) as DebugElement | null;
  return headingElement ? (headingElement.nativeElement as HTMLElement).innerText.trim() : null;
}

function isViewHeadingVisible(fixture: ComponentFixture<unknown>, viewId: ViewId): boolean {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  const headingElement = viewTabElement.query(By.css('span.e2e-heading')) as DebugElement | null;
  return headingElement !== null && getComputedStyle(headingElement.nativeElement as HTMLElement).display !== 'none';
}

function isViewDirty(fixture: ComponentFixture<unknown>, viewId: ViewId): boolean {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  return viewTabElement.query(By.css('wb-icon.e2e-dirty')) as DebugElement | null !== null;
}

function getViewCssClass(fixture: ComponentFixture<unknown>, viewId: ViewId): string[] {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  return Object.keys(viewTabElement.classes);
}

function getComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.query(By.directive(type)).componentInstance as T;
}

function getDialog(cssClass: string): WorkbenchDialog {
  return TestBed.inject(WorkbenchDialogRegistry).dialogs().find(dialog => dialog.cssClass().includes(cssClass)) ?? throwError('[NullDialogError]');
}

function getSize(fixture: ComponentFixture<unknown>, type: Type<unknown>): {width: number; height: number} {
  const htmlElement = fixture.debugElement.query(By.directive(type)).nativeElement as HTMLElement;
  return {
    width: htmlElement.offsetWidth,
    height: htmlElement.offsetHeight,
  };
}
