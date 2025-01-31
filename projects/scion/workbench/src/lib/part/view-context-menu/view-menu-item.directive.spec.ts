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
import {Component, inject, signal} from '@angular/core';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter} from '@angular/router';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {WorkbenchViewMenuItemDirective} from './view-menu-item.directive';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPart} from '../workbench-part.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';

describe('ViewMenuItemDirective', () => {

  it('should retain order when updating menu item', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part'})
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
        <ng-template wbViewMenuItem [cssClass]="'menu-item-1'">Menu Item 1</ng-template>
        <ng-template wbViewMenuItem [cssClass]="cssClassMenuItem2()">Menu Item 2</ng-template>
        <ng-template wbViewMenuItem [cssClass]="'menu-item-3'">Menu Item 3</ng-template>
      `,
      imports: [
        WorkbenchViewMenuItemDirective,
      ],
    })
    class SpecViewComponent {
      public cssClassMenuItem2 = signal('menu-item-2');
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    expect(view.menuItems()).toEqual([
      jasmine.objectContaining({cssClass: 'menu-item-1'}),
      jasmine.objectContaining({cssClass: 'menu-item-2'}),
      jasmine.objectContaining({cssClass: 'menu-item-3'}),
    ]);

    // Change CSS class of menu item 2.
    view.getComponent<SpecViewComponent>()!.cssClassMenuItem2.set('MENU-ITEM-2');
    await fixture.whenStable();

    // Expect order to be retained.
    expect(view.menuItems()).toEqual([
      jasmine.objectContaining({cssClass: 'menu-item-1'}),
      jasmine.objectContaining({cssClass: 'MENU-ITEM-2'}),
      jasmine.objectContaining({cssClass: 'menu-item-3'}),
    ]);
  });

  it('should control contribution via `canMatch` function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
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
      template: '<ng-template wbViewMenuItem [canMatch]="canMatchFn" cssClass="testee">Menu Item</ng-template>',
      imports: [
        WorkbenchViewMenuItemDirective,
      ],
    })
    class SpecViewComponent {
      public canMatch = signal(true);
      protected canMatchFn = (): boolean => this.canMatch();
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;

    // Expect contribution.
    await fixture.whenStable();
    expect(view.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Expect no contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(false);
    await fixture.whenStable();
    expect(view.menuItems()).toEqual([]);

    // Expect contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(true);
    await fixture.whenStable();
    expect(view.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
  });

  it('should pass the view to the `canMatch` function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.part')
            .addView('view.101', {partId: 'part.part'})
            .addView('view.102', {partId: 'part.part'}),
        }),
      ],
    });

    const viewFilter = signal<'view.101' | 'view.102' | undefined>(undefined);

    @Component({
      selector: 'spec-root',
      template: `
        <wb-workbench>
          <ng-template wbViewMenuItem [canMatch]="canMatchFn" cssClass="testee">Menu Item</ng-template>
        </wb-workbench>
      `,
      styles: `
        :host {
          display: grid;
        }
      `,
      imports: [WorkbenchComponent, WorkbenchViewMenuItemDirective],
    })
    class SpecRootComponent {
      protected canMatchFn = (view: WorkbenchView): boolean => {
        return !viewFilter() || viewFilter() === view.id;
      };
    }

    styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitForInitialWorkbenchLayout();

    const view1 = TestBed.inject(WorkbenchService).getView('view.101')!;
    const view2 = TestBed.inject(WorkbenchService).getView('view.102')!;

    // Contribute menu item to all parts.
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute menu item to view 1.
    viewFilter.set('view.101');
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(view2.menuItems()).toEqual([]);

    // Contribute menu item to the right part.
    viewFilter.set('view.102');
    expect(view1.menuItems()).toEqual([]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
  });

  it('should run `canMach` function in the view\'s injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .addView('view.101', {partId: 'part.left'})
            .addView('view.102', {partId: 'part.left'}),
        }),
      ],
    });

    const viewFilter = signal<'view.101' | 'view.102' | undefined>(undefined);
    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);

    @Component({
      selector: 'spec-root',
      template: `
        <wb-workbench>
          <ng-template wbViewMenuItem [canMatch]="canMatchFn" cssClass="testee">Menu Item</ng-template>
        </wb-workbench>
      `,
      styles: `
        :host {
          display: grid;
        }
      `,
      imports: [WorkbenchComponent, WorkbenchViewMenuItemDirective],
    })
    class SpecRootComponent {
      protected canMatchFn = (): boolean => {
        const view = inject(WorkbenchView);
        const part = inject(WorkbenchPart);

        if (viewFilter() && viewFilter() !== view.id) {
          return false;
        }
        if (partFilter() && partFilter() !== part.id) {
          return false;
        }
        return true;
      };
    }

    styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitForInitialWorkbenchLayout();

    const view1 = TestBed.inject(WorkbenchService).getView('view.101')!;
    const view2 = TestBed.inject(WorkbenchService).getView('view.102')!;

    // Contribute menu item to all views.
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute menu item to view 1.
    viewFilter.set('view.101');
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(view2.menuItems()).toEqual([]);

    // Contribute menu item to view 2.
    viewFilter.set('view.102');
    expect(view1.menuItems()).toEqual([]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute menu item to view 2 in the right part.
    viewFilter.set('view.102');
    partFilter.set('part.right');
    expect(view1.menuItems()).toEqual([]);
    expect(view2.menuItems()).toEqual([]);

    // Move view 2 to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.right'));
    expect(view1.menuItems()).toEqual([]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
  });

  it('should contribute to view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
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
      template: '<ng-template wbViewMenuItem cssClass="testee-1">Menu Item View 1</ng-template>',
      imports: [
        WorkbenchViewMenuItemDirective,
      ],
    })
    class SpecView1Component {
    }

    @Component({
      selector: 'spec-view-2',
      template: '<ng-template wbViewMenuItem cssClass="testee-2">Menu Item View 2</ng-template>',
      imports: [
        WorkbenchViewMenuItemDirective,
      ],
    })
    class SpecView2Component {
    }

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
    const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;

    // Expect views to have different menu items.
    await view1.activate();
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee-1'})]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee-2'})]);

    await view2.activate();
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee-1'})]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee-2'})]);

    // Move view to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.101', 'part.right', {activateView: true}));

    // Expect views to have different menu items.
    expect(view1.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee-1'})]);
    expect(view2.menuItems()).toEqual([jasmine.objectContaining({cssClass: 'testee-2'})]);
  });
});
