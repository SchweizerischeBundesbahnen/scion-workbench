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
import {Component, inject, OnDestroy, Type} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {WorkbenchViewRegistry} from './workbench-view.registry';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ViewId, WorkbenchView} from './workbench-view.model';
import {WorkbenchViewPreDestroy} from '../workbench.model';
import {Observable} from 'rxjs';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {By} from '@angular/platform-browser';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {canMatchWorkbenchView} from './workbench-view-route-guards';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';

describe('View', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect view not to be dirty when opened.
    expect(isViewDirty(fixture, 'view.100')).toBeFalse();

    // Set dirty flag.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').dirty = true;
    fixture.detectChanges();
    expect(isViewDirty(fixture, 'view.100')).toBeTrue();

    // Clear dirty flag.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').dirty = false;
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect title to be empty when opened.
    expect(getViewTitle(fixture, 'view.100')).toEqual('');

    // Set title.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').title = 'Title 1';
    fixture.detectChanges();
    expect(getViewTitle(fixture, 'view.100')).toEqual('Title 1');

    // Set title.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').title = 'Title 2';
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect heading not to display when opened.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();

    // Set heading.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').heading = 'Heading';
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect heading not to display when opened.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();

    // Set heading.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').heading = 'Heading';
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect heading to be empty when opened.
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeFalse();

    // Set heading.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').heading = 'Heading 1';
    fixture.detectChanges();
    expect(isViewHeadingVisible(fixture, 'view.100')).toBeTrue();
    expect(getViewHeading(fixture, 'view.100')).toEqual('Heading 1');

    // Set heading.
    TestBed.inject(WorkbenchViewRegistry).get('view.100').heading = 'Heading 2';
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();

    const view1 = TestBed.inject(WorkbenchViewRegistry).get('view.101');
    const view2 = TestBed.inject(WorkbenchViewRegistry).get('view.102');

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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Navigate to "path/to/view/2".
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();

    const view1 = TestBed.inject(WorkbenchViewRegistry).get('view.101');
    const view2 = TestBed.inject(WorkbenchViewRegistry).get('view.102');

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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Navigate to "path/to/view/2".
    await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.102'});
    await waitUntilStable();

    const view1 = TestBed.inject(WorkbenchViewRegistry).get('view.101');
    const view2 = TestBed.inject(WorkbenchViewRegistry).get('view.102');

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    expect(view1.active).toBeTrue();
    expect(view1.getComponent<SpecViewComponent>()!.activated).toBeTrue();
    expect(view2.active).toBeFalse();
    expect(view2.getComponent<SpecViewComponent>()!.activated).toBeFalse();

    // Activate view 2.
    await view2.activate();
    await waitUntilStable();

    expect(view1.active).toBeFalse();
    expect(view1.getComponent<SpecViewComponent>()!.activated).toBeFalse();
    expect(view2.active).toBeTrue();
    expect(view2.getComponent<SpecViewComponent>()!.activated).toBeTrue();

    // Activate view 1.
    await view1.activate();
    await waitUntilStable();

    expect(view1.active).toBeTrue();
    expect(view1.getComponent<SpecViewComponent>()!.activated).toBeTrue();
    expect(view2.active).toBeFalse();
    expect(view2.getComponent<SpecViewComponent>()!.activated).toBeFalse();
  });

  it('should prevent the view from being closed', async () => {
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view/1".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    // Try to close View (prevent)
    component.preventDestroy = true;
    await view.close();
    await waitUntilStable();

    // Expect view not to be destroyed.
    expect(view.destroyed).toBeFalse();
    expect(component.destroyed).toBeFalse();
    expect(fixture).toShow(SpecViewComponent);

    // Try to close to View 1 (accept)
    component.preventDestroy = false;
    await view.close();
    await waitUntilStable();

    // Expect view to be destroyed.
    expect(view.destroyed).toBeTrue();
    expect(component.destroyed).toBeTrue();
    expect(fixture).not.toShow(SpecViewComponent);
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
    await waitForInitialWorkbenchLayout();

    // Add view without navigating it.
    const workbenchRouter = TestBed.inject(ɵWorkbenchRouter);
    await workbenchRouter.navigate(layout => layout.addView('view.100', {partId: layout.activePart({grid: 'mainArea'})!.id}));
    await waitUntilStable();
    expect(TestBed.inject(WorkbenchViewRegistry).get('view.100').getComponent()).toBeNull();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();
    expect(TestBed.inject(WorkbenchViewRegistry).get('view.100').getComponent()).toBe(getComponent(fixture, SpecView1Component));

    // Navigate to "path/to/module/view".
    await workbenchRouter.navigate(['path/to/module/view'], {target: 'view.100'});
    await waitUntilStable();
    expect(TestBed.inject(WorkbenchViewRegistry).get('view.100').getComponent()).toBe(getComponent(fixture, SpecView2Component));
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
      await waitForInitialWorkbenchLayout();

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
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      const workbenchRouter = TestBed.inject(WorkbenchRouter);
      await waitForInitialWorkbenchLayout();

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
      await waitForInitialWorkbenchLayout();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Route');
      expect(getViewHeading(fixture, 'view.100')).toBeNull();

      // Set title and heading via handle.
      TestBed.inject(WorkbenchViewRegistry).get('view.100').title = 'Title From Handle';
      TestBed.inject(WorkbenchViewRegistry).get('view.100').heading = 'Heading From Handle';
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
      await waitForInitialWorkbenchLayout();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewTitle(fixture, 'view.100')).toEqual('Title From Route 1');
      expect(getViewHeading(fixture, 'view.100')).toEqual('Heading From Route 1');

      // Set title and heading via handle.
      TestBed.inject(WorkbenchViewRegistry).get('view.100').title = 'Title From Handle';
      TestBed.inject(WorkbenchViewRegistry).get('view.100').heading = 'Heading From Handle';
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
      await waitForInitialWorkbenchLayout();

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
      await waitForInitialWorkbenchLayout();

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
      await waitForInitialWorkbenchLayout();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeFalse();

      // Mark view dirty.
      TestBed.inject(WorkbenchViewRegistry).get('view.100').dirty = true;
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
      await waitForInitialWorkbenchLayout();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();
      expect(isViewDirty(fixture, 'view.100')).toBeFalse();

      // Mark view dirty.
      TestBed.inject(WorkbenchViewRegistry).get('view.100').dirty = true;
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
      await waitForInitialWorkbenchLayout();

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
      await waitForInitialWorkbenchLayout();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();

      // Set CSS class.
      TestBed.inject(WorkbenchViewRegistry).get('view.100').cssClass = 'css-class';
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
      await waitForInitialWorkbenchLayout();

      // Navigate to "path/to/view/1"
      await workbenchRouter.navigate(['path/to/view/1'], {target: 'view.100'});
      await waitUntilStable();

      // Set CSS class.
      TestBed.inject(WorkbenchViewRegistry).get('view.100').cssClass = 'css-class';
      fixture.detectChanges();
      expect(getViewCssClass(fixture, 'view.100')).toContain('css-class');

      // Navigate to "path/to/view/2"
      await workbenchRouter.navigate(['path/to/view/2'], {target: 'view.100'});
      await waitUntilStable();
      expect(getViewCssClass(fixture, 'view.100')).not.toContain('css-class');
    });
  });
});

@Component({
  selector: 'spec-view',
  template: '{{onCheckForChanges()}}',
  standalone: true,
})
class SpecViewComponent implements OnDestroy, WorkbenchViewPreDestroy {

  public destroyed = false;
  public activated: boolean | undefined;
  public checkedForChanges = false;
  public preventDestroy = false;
  public view = inject(WorkbenchView);

  constructor() {
    this.view.active$
      .pipe(takeUntilDestroyed())
      .subscribe(active => this.activated = active);

    const params = inject(ActivatedRoute).snapshot.paramMap;
    if (params.has('title')) {
      this.view.title = params.get('title');
    }
    if (params.has('heading')) {
      this.view.heading = params.get('heading');
    }
    if (params.has('dirty')) {
      this.view.dirty = coerceBooleanProperty(params.get('dirty'));
    }
    if (params.has('cssClass')) {
      this.view.cssClass = params.get('cssClass')!;
    }
  }

  public onWorkbenchViewPreDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return !this.preventDestroy;
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
  }

  public onCheckForChanges(): boolean {
    this.checkedForChanges = true;
    return true;
  }
}

@Component({
  selector: 'spec-view-1',
  template: '{{onCheckForChanges()}}',
  standalone: true,
})
class SpecView1Component extends SpecViewComponent {
}

@Component({
  selector: 'spec-view-2',
  template: '{{onCheckForChanges()}}',
  standalone: true,
})
class SpecView2Component extends SpecViewComponent {
}

function setDesignToken(fixture: ComponentFixture<unknown>, name: string, value: string): void {
  const workbenchElement = (fixture.debugElement.nativeElement as HTMLElement);
  workbenchElement.style.setProperty(name, value);
}

function getViewTitle(fixture: ComponentFixture<unknown>, viewId: ViewId): string | null {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  return viewTabElement.query(By.css('span.e2e-title'))?.nativeElement?.innerText?.trim() ?? null;
}

function getViewHeading(fixture: ComponentFixture<unknown>, viewId: ViewId): string | null {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  return viewTabElement.query(By.css('span.e2e-heading'))?.nativeElement.innerText?.trim() ?? null;
}

function isViewHeadingVisible(fixture: ComponentFixture<unknown>, viewId: ViewId): boolean {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  const headingElement = viewTabElement.query(By.css('span.e2e-heading'));
  return headingElement !== null && getComputedStyle(headingElement.nativeElement).display !== 'none';
}

function isViewDirty(fixture: ComponentFixture<unknown>, viewId: ViewId): boolean {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  return viewTabElement.query(By.css('span.e2e-dirty')) !== null;
}

function getViewCssClass(fixture: ComponentFixture<unknown>, viewId: ViewId): string[] | null {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${viewId}"]`));
  return viewTabElement ? Object.keys(viewTabElement.classes) : null;
}

function getComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T | null {
  return fixture.debugElement.query(By.directive(type)).componentInstance;
}
