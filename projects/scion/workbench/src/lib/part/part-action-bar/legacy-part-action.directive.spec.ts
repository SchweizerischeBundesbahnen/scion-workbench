/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {styleFixture, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {WorkbenchComponent} from '../../workbench.component';
import {Component, inject, signal} from '@angular/core';
import {WorkbenchPartActionDirective} from './part-action.directive';
import {provideRouter} from '@angular/router';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {ToolbarPO} from '../../testing/jasmine/matcher/toolbar.po';
import {toEqualToolbarCustomMatcher} from '../../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {WorkbenchService} from '../../workbench.service';

describe('LegacyPartActionDirective', () => {

  beforeEach(() => {
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
  });

  it('should retain order when updating action', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part', activateView: true})
            .navigateView('view.100', ['path/to/view']),
        }),
        provideRouter([
          {
            path: 'path/to/view',
            loadComponent: () => SpecViewComponent,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-view',
      template: `
        <ng-template wbPartAction [cssClass]="'action-1'">Action 1</ng-template>
        <ng-template wbPartAction [cssClass]="cssClassAction2()">Action 2</ng-template>
        <ng-template wbPartAction [cssClass]="'action-3'">Action 3</ng-template>
      `,
      imports: [
        WorkbenchPartActionDirective,
      ],
    })
    class SpecViewComponent {
      public cssClassAction2 = signal('action-2');
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const toolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'action-1',
      },
      {
        type: 'menu-item',
        cssClass: 'action-2',
      },
      {
        type: 'menu-item',
        cssClass: 'action-3',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Change CSS class of action 2.
    view.getComponent<SpecViewComponent>()!.cssClassAction2.set('ACTION-2');
    await fixture.whenStable();

    // Expect order to be retained.
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'action-1',
      },
      {
        type: 'menu-item',
        cssClass: 'ACTION-2',
      },
      {
        type: 'menu-item',
        cssClass: 'action-3',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
  });

  it('should control contribution via `canMatch` function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part', activateView: true})
            .navigateView('view.100', ['path/to/view']),
        }),
        provideRouter([
          {
            path: 'path/to/view',
            loadComponent: () => SpecViewComponent,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-view',
      template: '<ng-template wbPartAction [canMatch]="canMatchFn" cssClass="testee">Action</ng-template>',
      imports: [
        WorkbenchPartActionDirective,
      ],
    })
    class SpecViewComponent {
      public canMatch = signal(true);
      protected canMatchFn = (): boolean => this.canMatch();
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const toolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Expect contribution.
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Expect no contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(false);
    await fixture.whenStable();
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Expect contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(true);
    await fixture.whenStable();
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
  });

  it('should pass the part to the `canMatch` function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .navigatePart('part.left', ['test-part'])
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.right', ['test-part']),
        }),
      ],
    });

    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);

    @Component({
      selector: 'spec-root',
      template: `
        <wb-workbench>
          <ng-template wbPartAction [canMatch]="canMatchFn" cssClass="testee">Action</ng-template>
        </wb-workbench>
      `,
      styles: `
        :host {
          display: grid;
        }
      `,
      imports: [WorkbenchComponent, WorkbenchPartActionDirective],
    })
    class SpecRootComponent {
      protected canMatchFn = (part: WorkbenchPart): boolean => {
        return !partFilter() || partFilter() === part.id;
      };
    }

    const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitUntilWorkbenchStarted();

    const leftPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Contribute action to all parts.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Contribute action to the right part.
    partFilter.set('part.right');
    await expectAsync(leftPartToolbar).toEqualToolbar([]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
  });

  it('should run `canMach` function in the part\'s injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .navigatePart('part.left', ['test-part'])
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.right', ['test-part']),
        }),
      ],
    });

    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);

    @Component({
      selector: 'spec-root',
      template: `
        <wb-workbench>
          <ng-template wbPartAction [canMatch]="canMatchFn" cssClass="testee">Action</ng-template>
        </wb-workbench>
      `,
      styles: `
        :host {
          display: grid;
        }
      `,
      imports: [WorkbenchComponent, WorkbenchPartActionDirective],
    })
    class SpecRootComponent {
      protected canMatchFn = (): boolean => {
        const part = inject(WorkbenchPart);
        return !partFilter() || partFilter() === part.id;
      };
    }

    const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitUntilWorkbenchStarted();

    const leftPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Contribute action to all parts.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Contribute action to the right part.
    partFilter.set('part.right');
    await expectAsync(leftPartToolbar).toEqualToolbar([]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
  });

  it('should align action', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part', activateView: true})
            .navigateView('view.100', ['path/to/view']),
        }),
        provideRouter([
          {
            path: 'path/to/view',
            loadComponent: () => SpecViewComponent,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-view',
      template: '<ng-template wbPartAction [align]="align()" cssClass="testee">Action</ng-template>',
      imports: [
        WorkbenchPartActionDirective,
      ],
    })
    class SpecViewComponent {
      public align = signal<'start' | 'end' | undefined>(undefined);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const partTabbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.tabbar"]`});
    const partToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;

    // Expect default alignment.
    await expectAsync(partTabbar).toEqualToolbar([]);
    await expectAsync(partToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Align action to the left.
    view.getComponent<SpecViewComponent>()!.align.set('start');
    await expectAsync(partTabbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(partToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Align action to the right.
    view.getComponent<SpecViewComponent>()!.align.set('end');
    await expectAsync(partTabbar).toEqualToolbar([]);
    await expectAsync(partToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
  });

  it('should contribute to view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .navigatePart('part.left', ['test-part'])
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.right', ['test-part'])
            .addView('view.101', {partId: 'part.left'})
            .addView('view.102', {partId: 'part.left'})
            .navigateView('view.101', ['path/to/view/1'])
            .navigateView('view.102', ['path/to/view/2']),
        }),
        provideRouter([
          {
            path: 'path/to/view/1',
            loadComponent: () => SpecView1Component,
          },
          {
            path: 'path/to/view/2',
            loadComponent: () => SpecView2Component,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-view-1',
      template: '<ng-template wbPartAction cssClass="testee">Action</ng-template>',
      imports: [
        WorkbenchPartActionDirective,
      ],
    })
    class SpecView1Component {
    }

    @Component({
      selector: 'spec-view-2',
      template: '',
    })
    class SpecView2Component {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const leftPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
    const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;

    // Expect action because view is active.
    await view1.activate();
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Expect no action because view is not active.
    await view2.activate();
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Expect action because view is active.
    await view1.activate();
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Move view to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.101', 'part.right', {activateView: true}));

    // Expect action in the right part.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
  });

  it('should contribute to part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.left', ['path/to/part/left'])
            .navigatePart('part.right', ['path/to/part/right']),
        }),
        provideRouter([
          {
            path: 'path/to/part/left',
            loadComponent: () => SpecPartLeftComponent,
          },
          {
            path: 'path/to/part/right',
            loadComponent: () => SpecPartRightComponent,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-part-left',
      template: '<ng-template wbPartAction cssClass="testee">Action</ng-template>',
      imports: [
        WorkbenchPartActionDirective,
      ],
    })
    class SpecPartLeftComponent {
    }

    @Component({
      selector: 'spec-part-right',
      template: '',
    })
    class SpecPartRightComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const leftPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Expect action in left part.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Open view in left part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: 'part.left', activateView: true}));

    // Expect no action in left part.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);

    // Close view.
    await TestBed.inject(WorkbenchService).getView('view.100')!.close();

    // Expect action in left part.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([]);
  });
});
