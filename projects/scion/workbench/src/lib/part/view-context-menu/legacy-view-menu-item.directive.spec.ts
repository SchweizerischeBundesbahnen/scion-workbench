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
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {WorkbenchComponent} from '../../workbench.component';
import {Component, inject, signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {WorkbenchViewMenuItemDirective} from './view-menu-item.directive';
import {MenuPO} from '../../testing/jasmine/matcher/menu.po';
import {toEqualMenuCustomMatcher} from '../../testing/jasmine/matcher/to-equal-menu.matcher';
import {ViewId} from '../../workbench.identifiers';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';

describe('LegacyViewMenuItemDirective', () => {

  beforeEach(() => {
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
  });

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
    await waitUntilWorkbenchStarted();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const menu = new MenuPO(fixture);

    await openViewContextMenu({viewId: 'view.100'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'menu-item-1',
          },
          {
            type: 'menu-item',
            cssClass: 'menu-item-2',
          },
          {
            type: 'menu-item',
            cssClass: 'menu-item-3',
          },
        ],
      },
    ]);

    // Change CSS class of menu item 2.
    view.getComponent<SpecViewComponent>()!.cssClassMenuItem2.set('MENU-ITEM-2');
    await fixture.whenStable();

    // Expect order to be retained.
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'menu-item-1',
          },
          {
            type: 'menu-item',
            cssClass: 'MENU-ITEM-2',
          },
          {
            type: 'menu-item',
            cssClass: 'menu-item-3',
          },
        ],
      },
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
    await waitUntilWorkbenchStarted();

    const view = TestBed.inject(ɵWorkbenchService).getView('view.100')!;
    const menu = new MenuPO(fixture);

    // Expect contribution.
    await fixture.whenStable();
    await openViewContextMenu({viewId: 'view.100'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    // Expect no contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(false);
    await fixture.whenStable();
    await openViewContextMenu({viewId: 'view.100'});
    await expectAsync(menu).toEqualMenu([]);

    // Expect contribution.
    view.getComponent<SpecViewComponent>()!.canMatch.set(true);
    await fixture.whenStable();
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);
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

    const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitUntilWorkbenchStarted();

    const menu = new MenuPO(fixture);

    // Contribute menu item to all parts.
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    // Contribute menu item to view 1.
    viewFilter.set('view.101');
    await fixture.whenStable();
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([]);

    // Contribute menu item to the right part.
    viewFilter.set('view.102');
    await fixture.whenStable();
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);
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

    const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
    await waitUntilWorkbenchStarted();

    const menu = new MenuPO(fixture);

    // Contribute menu item to all views.
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    // Contribute menu item to view 1.
    viewFilter.set('view.101');
    await fixture.whenStable();

    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([]);

    // Contribute menu item to view 2.
    viewFilter.set('view.102');
    await fixture.whenStable();

    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);

    // Contribute menu item to view 2 in the right part.
    viewFilter.set('view.102');
    partFilter.set('part.right');
    await fixture.whenStable();

    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([]);

    // Move view 2 to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.right'));
    await fixture.whenStable();

    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
          },
        ],
      },
    ]);
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

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const menu = new MenuPO(fixture);

    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.101')!;
    const view2 = TestBed.inject(ɵWorkbenchService).getView('view.102')!;

    // Expect views to have different menu items.
    await view1.activate();
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee-1',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee-2',
          },
        ],
      },
    ]);

    await view2.activate();
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee-1',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee-2',
          },
        ],
      },
    ]);

    // Move view to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.101', 'part.right', {activateView: true}));

    // Expect views to have different menu items.
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee-1',
          },
        ],
      },
    ]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee-2',
          },
        ],
      },
    ]);
  });
});

async function openViewContextMenu(locator: {viewId: ViewId}): Promise<void> {
  const viewTabElement = document.querySelector<HTMLElement>(`wb-view-tab[data-viewid="${locator.viewId}"]`)!;
  viewTabElement.dispatchEvent(new MouseEvent('contextmenu'));
  await waitUntilStable();
}
