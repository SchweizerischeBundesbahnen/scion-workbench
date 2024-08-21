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
import {Component, inject, Injector, OnDestroy, OnInit, Type} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {WorkbenchViewRegistry} from './workbench-view.registry';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ViewId, WorkbenchView} from './workbench-view.model';
import {CanClose} from '../workbench.model';
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
import {WorkbenchService} from '../workbench.service';
import {ViewComponent} from './view.component';
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
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    const workbenchViewRegistry = TestBed.inject(WorkbenchViewRegistry);
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
    expect(workbenchService.views.map(view => view.id)).toEqual(['view.102', 'view.104']);

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
    await waitForInitialWorkbenchLayout();

    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    const workbenchViewRegistry = TestBed.inject(WorkbenchViewRegistry);
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
    expect(workbenchService.views.map(view => view.id)).toEqual(['view.102', 'view.104']);

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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "" (hint: view-1)
    await workbenchRouter.navigate([], {hint: 'view-1', target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/module/view".
    await workbenchRouter.navigate(['path/to/module/view'], {target: 'view.100'});
    await waitUntilStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');

    // Open view-modal message box.
    TestBed.inject(WorkbenchMessageBoxService).open('Message', {
      modality: 'view',
      context: {viewId: 'view.100'},
      cssClass: 'message-box',
    }).then();
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');

    // Open application-modal message box.
    TestBed.inject(WorkbenchMessageBoxService).open('Message', {
      modality: 'application',
      cssClass: 'message-box',
    }).then();
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');

    // Open view-modal dialog.
    TestBed.inject(WorkbenchDialogService).open(TestComponent, {
      modality: 'view',
      context: {viewId: 'view.100'},
      cssClass: 'dialog',
    }).then();
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');

    // Open application-modal dialog.
    TestBed.inject(WorkbenchDialogService).open(TestComponent, {
      modality: 'application',
      cssClass: 'dialog',
    }).then();
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
                  .addPart('left')
                  .addView('view.100', {partId: 'left'})
                  .navigateView('view.100', ['path/to/view/1']),
              },
              {
                id: 'B',
                layout: factory => factory
                  .addPart('left')
                  .addView('view.100', {partId: 'left'}) // Add view with same id as in perspective A.
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
    await waitForInitialWorkbenchLayout();

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
    await waitForInitialWorkbenchLayout();

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
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await fixture.whenStable();

    const view = TestBed.inject(WorkbenchViewRegistry).get('view.100');
    const component = view.getComponent<SpecViewComponent>()!;

    await view.close();
    await fixture.whenStable();

    // Except `CanClose` guard to be invoked in the component's injection context.
    expect(component.canCloseInjector).toBe(view.getComponentInjector());
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
    await waitForInitialWorkbenchLayout();

    // Navigate to "view".
    await TestBed.inject(ɵWorkbenchRouter).navigate(['view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect size to be equal.
    expect(getSize(fixture, SpecViewComponent)).toEqual(getSize(fixture, ViewComponent));

    // Navigate to "path/to/view".
    await TestBed.inject(ɵWorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect size to be equal.
    expect(getSize(fixture, SpecViewComponent)).toEqual(getSize(fixture, ViewComponent));
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
      standalone: true,
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
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open view.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecViewComponent);

    // Expect action not to show.
    expect(body).not.toShow(By.css('button.spec-action'));

    // Show action.
    const componentInstance = TestBed.inject(WorkbenchViewRegistry).get('view.100').getComponent<SpecViewComponent>()!;
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
      standalone: true,
    })
    class SpecViewComponent {
      constructor(view: WorkbenchView) {
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
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

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
      standalone: true,
    })
    class SpecViewComponent implements OnInit {

      constructor(private _view: WorkbenchView) {
      }

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
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

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
      standalone: true,
    })
    class SpecViewComponent {
      constructor(view: WorkbenchView) {
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
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open view.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: layout.mainAreaGrid!.activePartId!}));
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
      standalone: true,
    })
    class SpecViewComponent implements OnInit {

      constructor(private _view: WorkbenchView) {
      }

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
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open view.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: layout.mainAreaGrid!.activePartId!}));
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

  it('should have uid from MView', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Add layout with view "view.100".
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: 'main'}));
    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const view1Uid = view1.uid;

    // Replace layout view "view.100".
    await TestBed.inject(ɵWorkbenchRouter).navigate(() => inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.100', {partId: 'main'}),
    );

    const view2 = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const view2Uid = view2.uid;

    // Expect the view handle to be the same.
    expect(view1).toBe(view2);
    // Expect the view uid to have changed.
    expect(view1Uid).not.toEqual(view2Uid);

    // Replace layout with view "view.100".
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout
      .removeView('view.100', {force: true})
      .addView('view.100', {partId: 'main'}),
    );

    const view3 = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const view3Uid = view3.uid;

    // Expect the view handle to be the same.
    expect(view1).toBe(view3);
    // Expect the view uid to have changed.
    expect(view1Uid).not.toEqual(view3Uid);
    expect(view2Uid).not.toEqual(view3Uid);
  });

  it('should have alternative id from MView', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Add layout with view "view.1" and alternative view id "testee-1"
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addView('testee-1', {partId: 'main'}));
    const view1 = TestBed.inject(ɵWorkbenchService).views.find(view => view.alternativeId === 'testee-1')!;

    // Replace layout with view "view.1" and alternative view id "testee-2"
    await TestBed.inject(ɵWorkbenchRouter).navigate(() => inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('testee-2', {partId: 'main'}),
    );

    // Expect the view handle to be the same.
    const view2 = TestBed.inject(ɵWorkbenchService).views.find(view => view.alternativeId === 'testee-2')!;
    expect(view1).toBe(view2);

    // Replace layout with view "view.1" and alternative view id "testee-2"
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout
      .removeView('testee-2', {force: true})
      .addView('testee-3', {partId: 'main'}),
    );

    // Expect the view handle to be the same.
    const view3 = TestBed.inject(ɵWorkbenchService).views.find(view => view.alternativeId === 'testee-3')!;
    expect(view1).toBe(view3);
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
class SpecViewComponent implements OnDestroy, CanClose {

  public destroyed = false;
  public activated: boolean | undefined;
  public checkedForChanges = false;
  public preventClosing = false;
  public view = inject(WorkbenchView);
  public canCloseInjector: Injector | undefined;

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

  public canClose(): Observable<boolean> | Promise<boolean> | boolean {
    console.log(`[SpecViewComponent][CanClose] CanClose invoked for view '${this.view.id}'. [path=${this.view.urlSegments.join('/')}]`);
    this.canCloseInjector = inject(Injector);
    return !this.preventClosing;
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

function getDialog(cssClass: string): WorkbenchDialog {
  return TestBed.inject(WorkbenchDialogRegistry).dialogs().find(dialog => dialog.cssClass === cssClass) ?? throwError('[NullDialogError]');
}

function getSize(fixture: ComponentFixture<unknown>, type: Type<unknown>): {width: number; height: number} {
  const htmlElement = fixture.debugElement.query(By.directive(type)).nativeElement as HTMLElement;
  return {
    width: htmlElement.offsetWidth,
    height: htmlElement.offsetHeight,
  };
}
