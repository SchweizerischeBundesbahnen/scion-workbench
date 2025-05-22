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
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchService} from '../workbench.service';
import {TestComponent, withComponentContent} from '../testing/test.component';
import {By} from '@angular/platform-browser';
import {Component, DestroyRef, inject, isSignal} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {firstValueFrom, Subject, timer} from 'rxjs';
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {canMatchWorkbenchPerspective, canMatchWorkbenchView} from '../routing/workbench-route-guards';
import {WorkbenchPerspective} from './workbench-perspective.model';
import {provideWorkbenchInitializer} from '../startup/workbench-initializer';
import {WORKBENCH_PERSPECTIVE_REGISTRY} from './workbench-perspective.registry';
import {WorkbenchDesktopDirective} from '../desktop/desktop.directive';

describe('Workbench Perspective', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  it('should destroy handle\'s injector when unregistering the perspective', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Register perspective.
    await TestBed.inject(WorkbenchService).registerPerspective({id: 'perspective', layout: factory => factory.addPart('part.part')});
    await waitUntilStable();

    // Get reference to the perspective injector.
    const perspective = TestBed.inject(WORKBENCH_PERSPECTIVE_REGISTRY).get('perspective');
    let injectorDestroyed = false;
    perspective.injector.get(DestroyRef).onDestroy(() => injectorDestroyed = true);

    // Unregister the perspective.
    TestBed.inject(WORKBENCH_PERSPECTIVE_REGISTRY).unregister('perspective');
    await waitUntilStable();

    // Expect the injector to be destroyed.
    expect(injectorDestroyed).toBeTrue();
  });

  it('should have default perspective if not configured any perspectives', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          mainAreaInitialPartId: 'part.initial',
          startup: {launcher: 'APP_INITIALIZER'},
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([{id: 'default', active: true}]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({id: 'part.initial'}),
        },
      },
    });
  });

  it('should have configured layout', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'}),
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([{id: 'default', active: true}]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
          }),
        },
      },
    });
  });

  it('should have configured perspectives', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                data: {label: 'Perspective 1'},
                layout: factory => factory
                  .addPart('part.left')
                  .addPart('part.right', {align: 'right'}),
              },
              {
                id: 'perspective-2',
                data: {label: 'Perspective 2'},
                layout: factory => factory
                  .addPart('part.top')
                  .addPart('part.bottom', {align: 'bottom'}),
              },
            ],
          },
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([
      {id: 'perspective-1', data: {label: 'Perspective 1'}, active: true},
      {id: 'perspective-2', data: {label: 'Perspective 2'}, active: false},
    ]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
          }),
        },
      },
    });
  });

  it('should activate configured perspective (by id)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory
                  .addPart('part.left')
                  .addPart('part.right', {align: 'right'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory
                  .addPart('part.top')
                  .addPart('part.bottom', {align: 'bottom'}),
              },
              {
                id: 'perspective-3',
                layout: factory => factory.addPart(MAIN_AREA),
              },
            ],
            initialPerspective: 'perspective-2',
          },
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([
      {id: 'perspective-1', active: false},
      {id: 'perspective-2', active: true},
      {id: 'perspective-3', active: false},
    ]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.top'}),
            child2: new MPart({id: 'part.bottom'}),
          }),
        },
      },
    });
  });

  it('should activate configured perspective (by function)', async () => {
    let perspectivesForActivation: string[] | undefined;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory
                  .addPart('part.left')
                  .addPart('part.right', {align: 'right'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory
                  .addPart('part.top')
                  .addPart('part.bottom', {align: 'bottom'}),
              },
              {
                id: 'perspective-3',
                layout: factory => factory
                  .addPart('part.left')
                  .addPart(MAIN_AREA, {align: 'right'})
                  .addPart('part.right', {align: 'right'}),
              },
            ],
            initialPerspective: (perspectives: WorkbenchPerspective[]): string => {
              perspectivesForActivation = perspectives.map(perspective => perspective.id);
              return 'perspective-2';
            },
          },
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([
      {id: 'perspective-1', active: false},
      {id: 'perspective-2', active: true},
      {id: 'perspective-3', active: false},
    ]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.top'}),
            child2: new MPart({id: 'part.bottom'}),
          }),
        },
      },
    });
    expect(perspectivesForActivation).toEqual(['perspective-1', 'perspective-2', 'perspective-3']);
  });

  it('should activate first perspective if not configuring an initial perspective', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory
                  .addPart('part.left')
                  .addPart('part.right', {align: 'right'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory
                  .addPart('part.top')
                  .addPart('part.bottom', {align: 'bottom'}),
              },
            ],
          },
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([
      {id: 'perspective-1', active: true},
      {id: 'perspective-2', active: false},
    ]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
          }),
        },
      },
    });
  });

  it('should activate first perspective if initial perspective function returns null', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory
                  .addPart('part.left')
                  .addPart('part.right', {align: 'right'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory
                  .addPart('part.top')
                  .addPart('part.bottom', {align: 'bottom'}),
              },
            ],
            initialPerspective: () => undefined,
          },
        }),
      ],
    });
    await waitUntilWorkbenchStarted();

    expectPerspectives([
      {id: 'perspective-1', active: true},
      {id: 'perspective-2', active: false},
    ]);

    expect(TestBed.inject(WorkbenchService).layout()).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
          }),
        },
      },
    });
  });

  /** @deprecated since version 19.0.0-beta.2. No longer required with the removal of legacy start page support. */
  it('should support configuring different start page per perspective [deprecated]', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: factory => factory.addPart(MAIN_AREA)},
              {id: 'perspective-2', layout: factory => factory.addPart(MAIN_AREA)},
              {id: 'perspective-3', layout: factory => factory.addPart(MAIN_AREA)},
            ],
          },
        }),
        provideRouter([
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page Perspective 1')],
            canMatch: [canMatchWorkbenchPerspective('perspective-1')],
          },
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page Perspective 2')],
            canMatch: [canMatchWorkbenchPerspective('perspective-2')],
          },
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page')],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();
    const workbenchService = TestBed.inject(WorkbenchService);

    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');

    // Switch to perspective-2
    await workbenchService.switchPerspective('perspective-2');
    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 2');

    // Switch to perspective-3
    await workbenchService.switchPerspective('perspective-3');
    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page');

    // Switch to perspective-1
    await workbenchService.switchPerspective('perspective-1');
    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');
  });

  it('should support configuring different desktop per perspective', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: factory => factory.addPart(MAIN_AREA).navigatePart(MAIN_AREA, ['perspective-1/desktop'])},
              {id: 'perspective-2', layout: factory => factory.addPart(MAIN_AREA).navigatePart(MAIN_AREA, ['perspective-2/desktop'])},
              {id: 'perspective-3', layout: factory => factory.addPart(MAIN_AREA)}, // no navigation
              {id: 'perspective-4', layout: factory => factory.addPart('part.part')}, // no main area
            ],
          },
        }),
        provideRouter([
          {
            path: 'perspective-1/desktop',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Desktop Perspective 1 (main area navigation)')],
          },
          {
            path: 'perspective-2/desktop',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Desktop Perspective 2 (main area navigation)')],
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-root',
      template: `
        <wb-workbench>
          @switch (workbenchService.activePerspective()?.id) {
            @case ('perspective-1') {
              <ng-template wbDesktop>
                Desktop Perspective 1 (wbDesktop)
              </ng-template>
            }
            @case ('perspective-2') {
              <ng-template wbDesktop>
                Desktop Perspective 2 (wbDesktop)
              </ng-template>
            }
            @case ('perspective-3') {
              <ng-template wbDesktop>
                Desktop Perspective 3 (wbDesktop)
              </ng-template>
            }
            @default {
              <ng-template wbDesktop>
                Desktop Perspective (wbDesktop)
              </ng-template>
            }
          }
        </wb-workbench>
      `,
      styles: `
        :host {
          display: grid;
        }
      `,
      imports: [WorkbenchComponent, WorkbenchDesktopDirective],
    })
    class SpecRootComponent {
      protected workbenchService = inject(WorkbenchService);
    }

    const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitUntilWorkbenchStarted();
    const workbenchService = TestBed.inject(WorkbenchService);

    // Expect perspective-1
    expect(fixture.debugElement.nativeElement.innerText).toEqual('Desktop Perspective 1 (main area navigation)');

    // Switch to perspective-2
    await workbenchService.switchPerspective('perspective-2');
    expect(fixture.debugElement.nativeElement.innerText).toEqual('Desktop Perspective 2 (main area navigation)');

    // Switch to perspective-3
    await workbenchService.switchPerspective('perspective-3');
    expect(fixture.debugElement.nativeElement.innerText).toEqual('Desktop Perspective 3 (wbDesktop)');
    //
    // // Switch to perspective-4
    await workbenchService.switchPerspective('perspective-4');
    expect(fixture.debugElement.nativeElement.innerText).toEqual('Desktop Perspective (wbDesktop)');

    // Switch to perspective-1
    await workbenchService.switchPerspective('perspective-1');
    expect(fixture.debugElement.nativeElement.innerText).toEqual('Desktop Perspective 1 (main area navigation)');
  });

  /**
   * Regression test for a bug where the main grid of the initial layout got replaced by the "default" grid applied during the initial navigation,
   * resulting in only the main area being displayed.
   */
  it('should display the perspective also for asynchronous/slow initial navigation', async () => {
    const canActivate = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
            .addView('view.101', {partId: 'part.left'})
            .navigateView('view.101', [], {hint: 'navigator'}),
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {
            path: '',
            canMatch: [canMatchWorkbenchView('navigator')],
            component: TestComponent,
            canActivate: [() => firstValueFrom(canActivate)],
          },
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Delay activation of the perspective.
    await firstValueFrom(timer(1000));
    canActivate.next(true);
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
            child2: new MPart({id: MAIN_AREA}),
            direction: 'row',
            ratio: .25,
          }),
        },
      },
    });
  });

  it('should open a empty-path view in the active part of perspective without main area', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .addView('view.101', {partId: 'part.left'})
            .addView('view.102', {partId: 'part.right'})
            .navigateView('view.101', [], {hint: 'list'})
            .navigateView('view.102', [], {hint: 'overview'})
            .activatePart('part.right'),
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('list')], component: TestComponent},
          {path: '', canMatch: [canMatchWorkbenchView('overview')], component: TestComponent},
          {path: 'details/:id', component: TestComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });

    // open new details view
    await TestBed.inject(WorkbenchRouter).navigate(['details/1']);
    await waitUntilStable();

    // empty-path view should be opened in the active part (right) of the main grid
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.102'}, {id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
  });

  it('should activate first view of each part if not specified', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .addView('view.101', {partId: 'part.left'})
            .addView('view.102', {partId: 'part.left'})
            .addView('view.103', {partId: 'part.left'})
            .addView('view.201', {partId: 'part.right'})
            .addView('view.202', {partId: 'part.right', activateView: true})
            .addView('view.203', {partId: 'part.right'}),
          startup: {launcher: 'APP_INITIALIZER'},
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}], activeViewId: 'view.101'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.201'}, {id: 'view.202'}, {id: 'view.203'}], activeViewId: 'view.202'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
  });

  it('should support registering perspectives during workbench startup (without configured perspectives)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideWorkbenchInitializer(async () => {
          const workbenchService = inject(WorkbenchService);
          // Wait some time to simulate late perspective registration.
          await firstValueFrom(timer(500));

          await workbenchService.registerPerspective({
            id: 'perspective',
            layout: factory => factory
              .addPart('part.left')
              .addPart('part.right', {align: 'right'}),
          });
        }),
      ],
    });

    await waitUntilWorkbenchStarted();

    // Expect only the contributed perspective to be registered (and not the default perspective too).
    expectPerspectives([{id: 'perspective', active: true}]);
  });

  it('should support registering perspectives during workbench startup (with configured perspectives)', async () => {
    let perspectivesForActivation: string[] | undefined;
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          startup: {launcher: 'APP_INITIALIZER'},
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory.addPart(MAIN_AREA),
              },
            ],
            initialPerspective: (perspectives: WorkbenchPerspective[]): string => {
              perspectivesForActivation = perspectives.map(perspective => perspective.id);
              return 'perspective-2';
            },
          },
        }),
        provideWorkbenchInitializer(async () => {
          const workbenchServie = inject(WorkbenchService);
          // Wait some time to simulate late perspective registration.
          await firstValueFrom(timer(500));

          await workbenchServie.registerPerspective({
            id: 'perspective-2',
            layout: factory => factory.addPart(MAIN_AREA),
          });
        }),
      ],
    });

    await waitUntilWorkbenchStarted();

    expect(perspectivesForActivation).toEqual(['perspective-2', 'perspective-1']);

    expectPerspectives([
      {id: 'perspective-2', active: true},
      {id: 'perspective-1', active: false},
    ]);
  });
});

/**
 * Expects specified perspectives to be registered, resolving signals to their effective value.
 */
function expectPerspectives(expected: Array<Partial<Omit<WorkbenchPerspective, 'active'> & {active: boolean}>>): void {
  expect(TestBed.inject(WorkbenchService).perspectives().map(resolveSignals)).toEqual(expected.map(perspective => jasmine.objectContaining(perspective)));
}

/**
 * Resolves signal properties.
 */
function resolveSignals<T>(object: T): T {
  return Object.fromEntries(Object.entries(object as Record<any, any>).map(([key, value]) => [key, isSignal(value) ? value() : value])) as T;
}
