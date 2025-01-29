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
import {styleFixture, waitForInitialWorkbenchLayout} from '../../testing/testing.util';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {Component, inject, signal} from '@angular/core';
import {WorkbenchPartActionDirective} from './part-action.directive';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter} from '@angular/router';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {By} from '@angular/platform-browser';
import {WorkbenchPart} from '../workbench-part.model';

describe('PartActionDirective', () => {

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
    await waitForInitialWorkbenchLayout();

    const part = TestBed.inject(WorkbenchService).getPart('part.part')!;
    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;

    expect(part.actions()).toEqual([
      jasmine.objectContaining({cssClass: 'action-1'}),
      jasmine.objectContaining({cssClass: 'action-2'}),
      jasmine.objectContaining({cssClass: 'action-3'}),
    ]);

    // Change CSS class of action 2.
    view.getComponent<SpecViewComponent>()!.cssClassAction2.set('ACTION-2');
    await fixture.whenStable();

    // Expect order to be retained.
    expect(part.actions()).toEqual([
      jasmine.objectContaining({cssClass: 'action-1'}),
      jasmine.objectContaining({cssClass: 'ACTION-2'}),
      jasmine.objectContaining({cssClass: 'action-3'}),
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
    await waitForInitialWorkbenchLayout();

    const part = TestBed.inject(WorkbenchService).getPart('part.part')!;
    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;

    // Expect contribution.
    await fixture.whenStable();
    expect(part.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Expect no contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(false);
    await fixture.whenStable();
    expect(part.actions()).toEqual([]);

    // Expect contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(true);
    await fixture.whenStable();
    expect(part.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
  });

  it('should pass the part to the `canMatch` function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'}),
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

    styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitForInitialWorkbenchLayout();

    const leftPart = TestBed.inject(WorkbenchService).getPart('part.left')!;
    const rightPart = TestBed.inject(WorkbenchService).getPart('part.right')!;

    // Contribute action to all parts.
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Contribute action to the right part.
    partFilter.set('part.right');
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
  });

  it('should run `canMach` function in the part\'s injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'}),
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

    styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitForInitialWorkbenchLayout();

    const leftPart = TestBed.inject(WorkbenchService).getPart('part.left')!;
    const rightPart = TestBed.inject(WorkbenchService).getPart('part.right')!;

    // Contribute action to all parts.
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Contribute action to the right part.
    partFilter.set('part.right');
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
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
    await waitForInitialWorkbenchLayout();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;

    // Expect default alignment.
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="start"].testee'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="end"].testee'))).toBeNull();

    // Align action to the right.
    view.getComponent<SpecViewComponent>()!.align.set('end');
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="start"].testee'))).toBeNull();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="end"].testee'))).not.toBeNull();

    // Align action to the left.
    view.getComponent<SpecViewComponent>()!.align.set('start');
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="start"].testee'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="end"].testee'))).toBeNull();
  });

  it('should contribute to view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
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

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const leftPart = TestBed.inject(WorkbenchService).getPart('part.left')!;
    const rightPart = TestBed.inject(WorkbenchService).getPart('part.right')!;
    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
    const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;

    // Expect action because view is active.
    await view1.activate();
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Expect no action because view is not active.
    await view2.activate();
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([]);

    // Expect action because view is active.
    await view1.activate();
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Move view to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.101', 'part.right', {activateView: true}));

    // Expect action in the right part.
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
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

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const leftPart = TestBed.inject(WorkbenchService).getPart('part.left')!;
    const rightPart = TestBed.inject(WorkbenchService).getPart('part.right')!;

    // Expect action in left part.
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Open view in left part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addView('view.100', {partId: 'part.left', activateView: true}));

    // Expect no action in left part.
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([]);

    // Close view.
    await TestBed.inject(WorkbenchService).getView('view.100')!.close();

    // Expect no action in left part.
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);
  });
});
