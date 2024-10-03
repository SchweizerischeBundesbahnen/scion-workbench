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
import {By} from '@angular/platform-browser';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {getDesktopElement, segments, styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from './testing/testing.util';
import {enterComponentState, TestComponent, withComponentContent, withComponentStateInputElement} from './testing/test.component';
import {WorkbenchComponent} from './workbench.component';
import {WorkbenchLayoutFactory} from './layout/workbench-layout.factory';
import {expect} from './testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from './testing/workbench.provider';
import {DESKTOP_OUTLET, MAIN_AREA} from './layout/workbench-layout';
import {Component, inject} from '@angular/core';
import {ANYTHING, toEqualWorkbenchLayoutCustomMatcher} from './testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {throwError} from './common/throw-error.util';
import {WorkbenchRouteData} from './routing/workbench-route-data';
import {ɵWorkbenchDesktop} from './desktop/ɵworkbench-desktop.model';
import {toHaveComponentStateCustomMatcher} from './testing/jasmine/matcher/to-have-component-state.matcher';
import {ViewDragService} from './view-dnd/view-drag.service';
import {WORKBENCH_ID} from './workbench-id';
import {SciViewportComponent} from '@scion/components/viewport';
import {ɵWorkbenchService} from './ɵworkbench.service';

describe('Desktop', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
    jasmine.addMatchers(toHaveComponentStateCustomMatcher);
  });

  it('should display desktop (layout with main area)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigateDesktop(['path/to/desktop']),
        }),
        provideRouter([
          {
            path: 'path/to/desktop',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Desktop')],
          },
          {
            path: 'path/to/view',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('View')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const wbRouter = TestBed.inject(WorkbenchRouter);

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: true})!.innerText).toEqual('Desktop');

    // Open view
    await wbRouter.navigate(['path/to/view']);
    await waitUntilStable();

    // Expect desktop not to display
    expect(getDesktopElement(fixture, 'spec-test-component')).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('wb-part')).length).toBeGreaterThan(0);

    // Close view
    await wbRouter.navigate(['path/to/view'], {close: true});
    await waitUntilStable();

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: true})!.innerText).toEqual('Desktop');
  });

  it('should display desktop (layout without main area)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: (factory: WorkbenchLayoutFactory) => factory
            .addPart('part')
            .navigateDesktop(['path/to/desktop']),
        }),
        provideRouter([
          {
            path: 'path/to/desktop',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Desktop')],
          },
          {
            path: 'path/to/view',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('View')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const wbRouter = TestBed.inject(WorkbenchRouter);

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: false})!.innerText).toEqual('Desktop');

    // Open view
    await wbRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Expect desktop not to display
    expect(getDesktopElement(fixture, 'spec-test-component')).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('wb-part')).length).toBeGreaterThan(0);

    // Close view
    await wbRouter.navigate([], {target: 'view.100', close: true});
    await waitUntilStable();

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: false})!.innerText).toEqual('Desktop');
  });

  it('should display desktop (layout with main area, primary outlet)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory.addPart(MAIN_AREA),
        }),
        provideRouter([
          {
            path: '',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Desktop')],
          },
          {
            path: 'path/to/view',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('View')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const wbRouter = TestBed.inject(WorkbenchRouter);

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: true})!.innerText).toEqual('Desktop');

    // Open view
    await wbRouter.navigate(['path/to/view']);
    await waitUntilStable();

    // Expect desktop not to display
    expect(getDesktopElement(fixture, 'spec-test-component')).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('wb-part')).length).toBeGreaterThan(0);

    // Close view
    await wbRouter.navigate(['path/to/view'], {close: true});
    await waitUntilStable();

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: true})!.innerText).toEqual('Desktop');
  });

  it('should display desktop (layout without main area, primary outlet)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory.addPart('part'),
        }),
        provideRouter([
          {
            path: '',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Desktop')],
          },
          {
            path: 'path/to/view',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('View')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const wbRouter = TestBed.inject(WorkbenchRouter);

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: false})!.innerText).toEqual('Desktop');

    // Open view
    await wbRouter.navigate(['path/to/view']);
    await waitUntilStable();

    // Expect desktop not to display
    expect(getDesktopElement(fixture, 'spec-test-component')).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('wb-part')).length).toBeGreaterThan(0);

    // Close view
    await wbRouter.navigate(['path/to/view'], {close: true});
    await waitUntilStable();

    // Expect desktop to display
    expect(getDesktopElement(fixture, 'spec-test-component', {mainArea: false})!.innerText).toEqual('Desktop');
  });

  it('should display desktop in a viewport (layout with main area)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(
          {
            layout: factory => factory
              .addPart(MAIN_AREA)
              .navigateDesktop(['path/to/desktop']),
          },
        ),
        provideRouter([
          {
            path: 'path/to/desktop',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Desktop')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    fixture.debugElement.nativeElement.style.height = '500px';
    await waitForInitialWorkbenchLayout();

    // Change height of desktop to 5000px
    const desktopElement = getDesktopElement(fixture, 'spec-test-component', {mainArea: true})!;
    desktopElement.style.height = '5000px';

    // Expect desktop not to exceed 500px
    expect(getComputedStyle(fixture.debugElement.query(By.css('wb-workbench-layout wb-main-area-layout > div.desktop > wb-desktop')).nativeElement).height).toEqual('500px');
  });

  it('should display desktop in a viewport (layout without main area)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: (factory: WorkbenchLayoutFactory) => factory
            .addPart('part')
            .navigateDesktop(['path/to/desktop']),
        }),
        provideRouter([
          {
            path: 'path/to/desktop',
            loadComponent: () => import('./testing/test.component'),
            providers: [withComponentContent('Desktop')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    fixture.debugElement.nativeElement.style.height = '500px';
    await waitForInitialWorkbenchLayout();

    // Change height of desktop to 5000px
    const desktopElement = getDesktopElement(fixture, 'spec-test-component', {mainArea: false})!;
    desktopElement.style.height = '5000px';

    // Expect desktop not to exceed 500px
    expect(getComputedStyle(fixture.debugElement.query(By.css('wb-workbench-layout > div.desktop > wb-desktop')).nativeElement).height).toEqual('500px');
  });

  it('should rollback layout when navigation is cancelled', async () => {
    @Component({selector: 'spec-desktop', template: 'Desktop', standalone: true})
    class SpecDesktopComponent {
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
        provideRouter([
          {path: 'path/to/desktop/1', loadComponent: () => SpecDesktopComponent, data: {[WorkbenchRouteData.cssClass]: 'route-1'}},
          {path: 'path/to/desktop/2', loadComponent: () => SpecDesktopComponent, data: {[WorkbenchRouteData.cssClass]: 'route-2'}, canActivate: [() => false]},
          {path: 'path/to/desktop/3', loadComponent: () => SpecDesktopComponent, data: {[WorkbenchRouteData.cssClass]: 'route-3'}},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Navigate to "path/to/desktop/1".
    await workbenchRouter.navigate(layout => layout.navigateDesktop(['path/to/desktop/1'], {hint: 'hint-1', data: {navigation: 1}, cssClass: 'navigation-1'}));
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      desktop: {
        navigation: {
          id: ANYTHING,
          hint: 'hint-1',
          cssClass: ['navigation-1'],
          data: {
            navigation: 1,
          },
        },
      },
      outlets: {[DESKTOP_OUTLET]: segments(['path/to/desktop/1'])},
    });
    expect(TestBed.inject(ɵWorkbenchDesktop).classList.asList()).toEqual(jasmine.arrayWithExactContents(['route-1', 'navigation-1']));
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationData()).toEqual({navigation: 1});
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationHint()).toEqual('hint-1');
    expect(TestBed.inject(ɵWorkbenchDesktop).urlSegments()).toEqual(segments(['path/to/desktop/1']));

    // Navigate to "path/to/desktop/2" [canActivate=false].
    await workbenchRouter.navigate(layout => layout.navigateDesktop(['path/to/desktop/2'], {hint: 'hint-2', data: {navigation: 2}, cssClass: 'navigation-2'}));
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      desktop: {
        navigation: {
          id: ANYTHING,
          hint: 'hint-1',
          cssClass: ['navigation-1'],
          data: {
            navigation: 1,
          },
        },
      },
      outlets: {[DESKTOP_OUTLET]: segments(['path/to/desktop/1'])},
    });
    expect(TestBed.inject(ɵWorkbenchDesktop).classList.asList()).toEqual(jasmine.arrayWithExactContents(['route-1', 'navigation-1']));
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationData()).toEqual({navigation: 1});
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationHint()).toEqual('hint-1');
    expect(TestBed.inject(ɵWorkbenchDesktop).urlSegments()).toEqual(segments(['path/to/desktop/1']));

    // Navigate to "path/to/desktop/3".
    await workbenchRouter.navigate(layout => layout.navigateDesktop(['path/to/desktop/3'], {hint: 'hint-3', data: {navigation: 3}, cssClass: 'navigation-3'}));
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      desktop: {
        navigation: {
          id: ANYTHING,
          hint: 'hint-3',
          cssClass: ['navigation-3'],
          data: {
            navigation: 3,
          },
        },
      },
      outlets: {[DESKTOP_OUTLET]: segments(['path/to/desktop/3'])},
    });
    expect(TestBed.inject(ɵWorkbenchDesktop).classList.asList()).toEqual(jasmine.arrayWithExactContents(['route-3', 'navigation-3']));
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationData()).toEqual({navigation: 3});
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationHint()).toEqual('hint-3');
    expect(TestBed.inject(ɵWorkbenchDesktop).urlSegments()).toEqual(segments(['path/to/desktop/3']));
  });

  it('should rollback layout when navigation fails', async () => {
    @Component({selector: 'spec-desktop', template: 'Desktop', standalone: true})
    class SpecDesktopComponent {
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
        provideRouter([
          {path: 'path/to/desktop/1', loadComponent: () => SpecDesktopComponent, data: {[WorkbenchRouteData.cssClass]: 'route-1'}},
          {path: 'path/to/desktop/2', loadComponent: () => SpecDesktopComponent, data: {[WorkbenchRouteData.cssClass]: 'route-2'}, canActivate: [() => throwError('navigation error')]},
          {path: 'path/to/desktop/3', loadComponent: () => SpecDesktopComponent, data: {[WorkbenchRouteData.cssClass]: 'route-3'}},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Navigate to "path/to/desktop/1".
    await workbenchRouter.navigate(layout => layout.navigateDesktop(['path/to/desktop/1'], {hint: 'hint-1', data: {navigation: 1}, cssClass: 'navigation-1'}));
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      desktop: {
        navigation: {
          id: ANYTHING,
          hint: 'hint-1',
          cssClass: ['navigation-1'],
          data: {
            navigation: 1,
          },
        },
      },
      outlets: {[DESKTOP_OUTLET]: segments(['path/to/desktop/1'])},
    });
    expect(TestBed.inject(ɵWorkbenchDesktop).classList.asList()).toEqual(jasmine.arrayWithExactContents(['route-1', 'navigation-1']));
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationData()).toEqual({navigation: 1});
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationHint()).toEqual('hint-1');
    expect(TestBed.inject(ɵWorkbenchDesktop).urlSegments()).toEqual(segments(['path/to/desktop/1']));

    // Navigate to "path/to/desktop/2" [canActivate=() => error)].
    const navigation2 = workbenchRouter.navigate(layout => layout.navigateDesktop(['path/to/desktop/2'], {hint: 'hint-2', data: {navigation: 2}, cssClass: 'navigation-2'}));
    await expectAsync(navigation2).toBeRejectedWithError('navigation error');
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      desktop: {
        navigation: {
          id: ANYTHING,
          hint: 'hint-1',
          cssClass: ['navigation-1'],
          data: {
            navigation: 1,
          },
        },
      },
      outlets: {[DESKTOP_OUTLET]: segments(['path/to/desktop/1'])},
    });
    expect(TestBed.inject(ɵWorkbenchDesktop).classList.asList()).toEqual(jasmine.arrayWithExactContents(['route-1', 'navigation-1']));
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationData()).toEqual({navigation: 1});
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationHint()).toEqual('hint-1');
    expect(TestBed.inject(ɵWorkbenchDesktop).urlSegments()).toEqual(segments(['path/to/desktop/1']));

    // Navigate to "path/to/desktop/3".
    await workbenchRouter.navigate(layout => layout.navigateDesktop(['path/to/desktop/3'], {hint: 'hint-3', data: {navigation: 3}, cssClass: 'navigation-3'}));
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      desktop: {
        navigation: {
          id: ANYTHING,
          hint: 'hint-3',
          cssClass: ['navigation-3'],
          data: {
            navigation: 3,
          },
        },
      },
      outlets: {[DESKTOP_OUTLET]: segments(['path/to/desktop/3'])},
    });
    expect(TestBed.inject(ɵWorkbenchDesktop).classList.asList()).toEqual(jasmine.arrayWithExactContents(['route-3', 'navigation-3']));
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationData()).toEqual({navigation: 3});
    expect(TestBed.inject(ɵWorkbenchDesktop).navigationHint()).toEqual('hint-3');
    expect(TestBed.inject(ɵWorkbenchDesktop).urlSegments()).toEqual(segments(['path/to/desktop/3']));
  });

  it('should preserve component state (layout with main area)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('left', {align: 'left'})
            .addPart('right', {align: 'right'})
            .navigateDesktop(['path/to/desktop']),
        }),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent},
          {path: 'path/to/desktop', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Enter component state
    enterComponentState(fixture, 'desktop', 'A');
    expect('desktop').toHaveComponentState('A');

    // Open view 1 in main area
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {close: true});
    await waitUntilStable();

    // Expect component state to be preserved
    expect('desktop').toHaveComponentState('A');

    // Open view 1 in left part
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {partId: 'left'});
    await waitUntilStable();

    // Expect component state to be preserved
    expect('desktop').toHaveComponentState('A');

    // Move view 1 to right part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'left',
        viewId: 'view.1',
        viewUrlSegments: segments(['path/to/view/1']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'right',
      },
    });
    await waitUntilStable();

    // Expect component state to be preserved
    expect('desktop').toHaveComponentState('A');
  });

  it('should preserve component state (layout without main area)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('left')
            .addPart('right', {align: 'right'})
            .navigateDesktop(['path/to/desktop']),
        }),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent},
          {path: 'path/to/desktop', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Enter component state
    enterComponentState(fixture, 'desktop', 'A');
    expect('desktop').toHaveComponentState('A');

    // Open view 1 in main area
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {close: true});
    await waitUntilStable();

    // Expect component state to be preserved
    expect('desktop').toHaveComponentState('A');

    // Open view 1 in left part
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {partId: 'left'});
    await waitUntilStable();

    // Expect component state to be preserved
    expect('desktop').toHaveComponentState('A');

    // Move view 1 to right part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'left',
        viewId: 'view.1',
        viewUrlSegments: segments(['path/to/view/1']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'right',
      },
    });
    await waitUntilStable();

    // Expect component state to be preserved
    expect('desktop').toHaveComponentState('A');
  });

  it('should restore scroll position', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigateDesktop(['path/to/desktop']),
        }),
        provideRouter([
          {path: 'path/to/view', loadComponent: () => TestDesktopComponent},
          {path: 'path/to/desktop', loadComponent: () => TestDesktopComponent},
        ]),
      ],
    });

    @Component({
      selector: 'spec-desktop',
      template: '<div style="height: 2000px">Content</div>',
      standalone: true,
    })
    class TestDesktopComponent {
      public viewport = inject(SciViewportComponent);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const desktop = fixture.debugElement.query(By.directive(TestDesktopComponent));

    // Scroll desktop to the bottom.
    const desktopViewport = desktop.componentInstance.viewport;
    desktopViewport.scrollTop = 2000;
    const scrollTop = desktopViewport.scrollTop;
    await waitUntilStable();

    // Expect content to be scrolled.
    expect(scrollTop).toBeGreaterThan(0);

    // Open view 1.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.101'});
    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
    await waitUntilStable();

    // Expect view 1 to be active.
    expect(view1.active()).toBeTrue();

    // Close view 1.
    await view1.close();
    await waitUntilStable();

    // Expect scroll position to be restored.
    expect(desktopViewport.scrollTop).toBe(scrollTop);
  });
});
