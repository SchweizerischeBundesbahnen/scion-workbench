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
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {Component, inject, InjectionToken, Injector, input, signal, TemplateRef, viewChild} from '@angular/core';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {noop} from 'rxjs';
import {ViewId} from '../../workbench.identifiers';
import {WorkbenchService} from '../../workbench.service';
import {toEqualMenuCustomMatcher} from '../../testing/jasmine/matcher/to-equal-menu.matcher';
import {MenuPO} from '../../testing/jasmine/matcher/menu.po';
import {provideRouter} from '@angular/router';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {toShowCustomMatcher} from '../../testing/jasmine/matcher/to-show.matcher';
import {UUID} from '@scion/toolkit/uuid';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPart} from '../workbench-part.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {WorkbenchViewMenuItemDirective} from '../view-context-menu/view-menu-item.directive';
import {WorkbenchDialogService} from '../../dialog/workbench-dialog.service';
import {toBeAttachedCustomMatcher} from '../../testing/jasmine/matcher/to-be-attached.matcher';

describe('Legacy View Menu', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
    jasmine.addAsyncMatchers(toBeAttachedCustomMatcher);
  });

  it('should retain order when updating menu items', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Register menu item 1.
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
      content: SpecMenuItemComponent,
      onAction: () => noop(),
      cssClass: 'menu-item-1',
    }));

    // Register menu item 2.
    const cssClassMenuItem2 = signal<string>('menu-item-2');
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
      content: SpecMenuItemComponent,
      onAction: () => noop(),
      cssClass: cssClassMenuItem2(),
    }));

    // Register menu item 3.
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
      content: SpecMenuItemComponent,
      onAction: () => noop(),
      cssClass: 'menu-item-3',
    }));

    await openViewContextMenu({viewId: 'view.100'});
    const menu = new MenuPO(fixture);
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
    cssClassMenuItem2.set('MENU-ITEM-2');
    await waitUntilStable();

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

  /**
   * This test verifies that a change to tracked signals of a menu item does not re-create other menu items.
   */
  it('should re-construct menu item only when tracked signals change', async () => {
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

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const menuItemConstructCount = {
      'view.101': {
        menuItem1: 0,
        menuItem2: 0,
        menuItem3: 0,
      },
      'view.102': {
        menuItem1: 0,
        menuItem2: 0,
        menuItem3: 0,
      },
    };
    const trackedSignals = {
      'view.101': {
        menuItem1: signal(UUID.randomUUID()),
        menuItem2: signal(UUID.randomUUID()),
        menuItem3: signal(UUID.randomUUID()),
      },
      'view.102': {
        menuItem1: signal(UUID.randomUUID()),
        menuItem2: signal(UUID.randomUUID()),
        menuItem3: signal(UUID.randomUUID()),
      },
    };

    // Register menu item 1.
    TestBed.inject(WorkbenchService).registerViewMenuItem(view => {
      const viewId = view.id as 'view.101' | 'view.102';
      menuItemConstructCount[viewId].menuItem1++;
      trackedSignals[viewId].menuItem1();
      return {
        content: SpecMenuItemComponent,
        onAction: () => noop(),
      };
    });

    // Register menu item 2.
    TestBed.inject(WorkbenchService).registerViewMenuItem(view => {
      const viewId = view.id as 'view.101' | 'view.102';
      menuItemConstructCount[viewId].menuItem2++;
      trackedSignals[viewId].menuItem2();
      return {
        content: SpecMenuItemComponent,
        onAction: () => noop(),
      };
    });

    TestBed.tick(); // flush effects
    expect(menuItemConstructCount['view.101']).toEqual({menuItem1: 1, menuItem2: 1, menuItem3: 0});
    expect(menuItemConstructCount['view.102']).toEqual({menuItem1: 1, menuItem2: 1, menuItem3: 0});

    // Change menu item 2 contained in view 1.
    trackedSignals['view.101'].menuItem2.set(UUID.randomUUID());
    TestBed.tick(); // flush effects

    // Expect only menu item 2 in view 1 to be re-constructed.
    expect(menuItemConstructCount['view.101']).toEqual({menuItem1: 1, menuItem2: 2, menuItem3: 0});
    expect(menuItemConstructCount['view.102']).toEqual({menuItem1: 1, menuItem2: 1, menuItem3: 0});

    // Change menu item 1 contained in view 2.
    trackedSignals['view.102'].menuItem1.set(UUID.randomUUID());
    TestBed.tick(); // flush effects

    // Expect only menu item 1 in view 2 to be re-constructed.
    expect(menuItemConstructCount['view.101']).toEqual({menuItem1: 1, menuItem2: 2, menuItem3: 0});
    expect(menuItemConstructCount['view.102']).toEqual({menuItem1: 2, menuItem2: 1, menuItem3: 0});

    // Register menu item 3.
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => {
      const viewId = inject(WorkbenchView).id as 'view.101' | 'view.102';
      menuItemConstructCount[viewId].menuItem3++;
      trackedSignals[viewId].menuItem3();
      return {
        content: SpecMenuItemComponent,
        onAction: () => noop(),
      };
    });
    TestBed.tick(); // flush effects

    // Expect menu item 1 and menu item 2 not to be re-constructed.
    expect(menuItemConstructCount['view.101']).toEqual({menuItem1: 1, menuItem2: 2, menuItem3: 1});
    expect(menuItemConstructCount['view.102']).toEqual({menuItem1: 2, menuItem2: 1, menuItem3: 1});
  });

  it('should re-construct menu item when tracked signals change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part'}),
        }),
      ],
    });

    @Component({
      selector: 'spec-menu-item',
      template: 'Component Menu Item',
    })
    class SpecMenuItemComponent {
      public input1 = input.required<string>();
      public input2 = input.required<string>();
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const input1 = signal<string>('value 1');
    const input2 = signal<string>('value 2');

    // Register menu item.
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
      content: SpecMenuItemComponent,
      onAction: () => noop(),
      inputs: {
        input1: input1(),
        input2: input2(),
      },
      cssClass: 'testee',
    }));
    await fixture.whenStable();

    // Open context menu.
    await openViewContextMenu({viewId: 'view.100'});
    const menu = new MenuPO(fixture);

    // Expect initial inputs.
    const menuItemComponent1 = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;
    expect(menuItemComponent1.input1()).toEqual('value 1');
    expect(menuItemComponent1.input2()).toEqual('value 2');

    // Change input.
    input1.set('value 3');
    await fixture.whenStable();
    const menuItemComponent2 = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;
    expect(menuItemComponent2).not.toBe(menuItemComponent1);
    expect(menuItemComponent2.input1()).toEqual('value 3');
    expect(menuItemComponent2.input2()).toEqual('value 2');

    // Change input.
    input2.set('value 4');
    await fixture.whenStable();
    const menuItemComponent3 = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;
    expect(menuItemComponent3).not.toBe(menuItemComponent2);
    expect(menuItemComponent3.input1()).toEqual('value 3');
    expect(menuItemComponent3.input2()).toEqual('value 4');
  });

  it(`should run factory function in the view's injection context`, async () => {
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

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const viewFilter = signal<'view.101' | 'view.102' | undefined>(undefined);
    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);

    // Register menu item.
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => {
      const view = inject(WorkbenchView);
      const part = inject(WorkbenchPart);

      if (viewFilter() && viewFilter() !== view.id) {
        return null;
      }
      if (partFilter() && partFilter() !== part.id) {
        return null;
      }

      return {
        content: SpecMenuItemComponent,
        onAction: () => noop(),
        cssClass: 'testee',
      };
    });

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
    await waitUntilStable();

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
    await waitUntilStable();

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
    await waitUntilStable();

    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(menu).toEqualMenu([]);

    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(menu).toEqualMenu([]);

    // Move view 2 to the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.moveView('view.102', 'part.right'));
    await waitUntilStable();

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

  it('should pass the view to the factory function', async () => {
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

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const viewFilter = signal<'view.101' | 'view.102' | undefined>(undefined);

    // Register menu item.
    TestBed.inject(WorkbenchService).registerViewMenuItem(view => {
      if (viewFilter() && viewFilter() !== view.id) {
        return null;
      }

      return {
        content: SpecMenuItemComponent,
        onAction: () => noop(),
        cssClass: 'testee',
      };
    });

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
    await waitUntilStable();

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
    await waitUntilStable();

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

  it('should disable menu item', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.part')
            .addView('view.100', {partId: 'part.part'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const disabled = signal<boolean | undefined>(undefined);

    // Register menu item.
    TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
      content: SpecMenuItemComponent,
      onAction: () => void inject(WorkbenchView).close(),
      disabled: disabled(),
      cssClass: 'testee',
    }));
    await fixture.whenStable();

    // Open context menu.
    await openViewContextMenu({viewId: 'view.100'});
    const menu = new MenuPO(fixture);

    // Disable menu item.
    disabled.set(true);
    await fixture.whenStable();

    // Expect menu item to be disabled.
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
            disabled: true,
          },
        ],
      },
    ]);

    // Click menu item.
    menu.item({cssClass: 'testee'}).nativeElement.click();
    await fixture.whenStable();
    expect(TestBed.inject(WorkbenchService).getView('view.100')).not.toBeNull();

    // Enable menu item.
    disabled.set(false);
    await fixture.whenStable();

    // Expect menu item to be enabled.
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            cssClass: 'testee',
            disabled: false,
          },
        ],
      },
    ]);

    // Click menu item.
    menu.item({cssClass: 'testee'}).nativeElement.click();
    await fixture.whenStable();
    expect(TestBed.inject(WorkbenchService).getView('view.100')).toBeNull();
  });

  describe('Template MenuItem', () => {

    it('should render menu item provided as template', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #menu_item>
              Template Menu Item
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent],
      })
      class SpecRootComponent {
        public menuItemTemplate = viewChild.required<TemplateRef<void>>('menu_item');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Register menu item.
      const menuItem = TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: fixture.componentInstance.menuItemTemplate(),
        onAction: () => noop(),
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);

      // Expect menu item to render.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'Template Menu Item',
            },
          ],
        },
      ]);

      // Dispose menu item.
      menuItem.dispose();
      await fixture.whenStable();

      // Expect menu item to be disposed.
      await expectAsync(menu).toEqualMenu([]);
    });

    it('should pass inputs to template menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #menu_item let-input1="input1" let-input2="input2">
              Template Menu Item [input1="{{input1}}", input2="{{input2}}"]
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent],
      })
      class SpecRootComponent {
        public menuItemTemplate = viewChild.required<TemplateRef<void>>('menu_item');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Register menu item.
      TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: fixture.componentInstance.menuItemTemplate(),
        onAction: () => noop(),
        cssClass: 'testee',
        inputs: {
          input1: 'value 1',
          input2: 'value 2',
        },
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);

      // Expect inputs to be available as local template let declarations.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'Template Menu Item [input1="value 1", input2="value 2"]',
            },
          ],
        },
      ]);
    });

    it('should allow for custom injector for template menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-menu-item',
        template: 'Component Menu Item',
      })
      class SpecMenuItemComponent {
        public injector = inject(Injector);
      }

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #menu_item>
              <spec-menu-item/>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, SpecMenuItemComponent],
      })
      class SpecRootComponent {
        public menuItemTemplate = viewChild.required<TemplateRef<void>>('menu_item');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Create custom injector.
      const diToken = new InjectionToken('token');
      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          {provide: diToken, useValue: 'value'},
        ],
      });

      // Register menu item.
      TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: fixture.componentInstance.menuItemTemplate(),
        onAction: () => noop(),
        cssClass: 'testee',
        injector,
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      const menuItemComponent = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;

      // Expect DI token to be available.
      expect(menuItemComponent.injector.get(diToken)).toEqual('value');

      // Expect view can be injected.
      expect(menuItemComponent.injector.get(WorkbenchView)).toBe(TestBed.inject(WorkbenchService).getView('view.100')!);
    });

    it('should provide `WorkbenchView` as default template-local variable in template menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-menu-item',
        template: 'Component Menu Item',
      })
      class SpecMenuItemComponent {
        public injector = inject(Injector);
        public defaultLocalTemplateVariable = input<unknown>();
      }

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #menu_item let-view>
              <spec-menu-item [defaultLocalTemplateVariable]="view"/>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, SpecMenuItemComponent],
      })
      class SpecRootComponent {
        public menuItemTemplate = viewChild.required<TemplateRef<void>>('menu_item');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Register menu item.
      TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: fixture.componentInstance.menuItemTemplate(),
        onAction: () => noop(),
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      const menuItemComponent = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;

      // Expect WorkbenchView to be passed as default local template variable.
      expect(menuItemComponent.defaultLocalTemplateVariable()).toBe(TestBed.inject(WorkbenchService).getView('view.100'));

      // Expect WorkbenchView can be injected.
      expect(menuItemComponent.injector.get(WorkbenchView)).toBe(TestBed.inject(WorkbenchService).getView('view.100')!);
    });
  });

  describe('Component MenuItem', () => {

    it('should render menu item provided as component', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-menu-item',
        template: 'Component Menu Item',
      })
      class SpecMenuItemComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register menu item.
      const menuItem = TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: SpecMenuItemComponent,
        onAction: () => noop(),
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);

      // Expect menu item to render.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'Component Menu Item',
            },
          ],
        },
      ]);

      // Dispose menu item.
      menuItem.dispose();
      await fixture.whenStable();

      // Expect menu item to be disposed.
      await expectAsync(menu).toEqualMenu([]);
    });

    it('should pass inputs to component menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-menu-item',
        template: 'Component Menu Item',
      })
      class SpecMenuItemComponent {
        public input1 = input.required<string>();
        public input2 = input.required<string>();
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register menu item.
      TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: SpecMenuItemComponent,
        onAction: () => noop(),
        cssClass: 'testee',
        inputs: {
          input1: 'value 1',
          input2: 'value 2',
        },
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);

      // Expect menu item to render.
      const menuItemComponent = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;
      expect(menuItemComponent.input1()).toEqual('value 1');
      expect(menuItemComponent.input2()).toEqual('value 2');
    });

    it('should allow for custom injector for component menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-menu-item',
        template: 'Component Menu Item',
      })
      class SpecMenuItemComponent {
        public injector = inject(Injector);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Create custom injector.
      const diToken = new InjectionToken('token');
      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          {provide: diToken, useValue: 'value'},
        ],
      });

      // Register menu item.
      TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: SpecMenuItemComponent,
        onAction: () => noop(),
        cssClass: 'testee',
        injector,
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      const menuItemComponent = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;

      // Expect DI token to be available.
      expect(menuItemComponent.injector.get(diToken)).toEqual('value');

      // Expect view can be injected.
      expect(menuItemComponent.injector.get(WorkbenchView)).toBe(TestBed.inject(WorkbenchService).getView('view.100')!);
    });

    it('should provide `WorkbenchView` for injection in component menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });

      @Component({
        selector: 'spec-menu-item',
        template: 'Component Menu Item',
      })
      class SpecMenuItemComponent {
        public injector = inject(Injector);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register menu item.
      TestBed.inject(WorkbenchService).registerViewMenuItem(() => ({
        content: SpecMenuItemComponent,
        onAction: () => noop(),
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      // Open context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      const menuItemComponent = menu.item({cssClass: 'testee'}).labelComponent('spec-menu-item')!.componentInstance as SpecMenuItemComponent;

      // Expect WorkbenchView can be injected.
      expect(menuItemComponent.injector.get(WorkbenchView)).toBe(TestBed.inject(WorkbenchService).getView('view.100')!);
    });
  });

  describe('Built-in view menu items', () => {

    it('should translate menu items', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
            textProvider: key => texts[key],
          }),
        ],
      });

      const texts: Record<string, string> = {
        'scion.workbench.close_tab.action': 'CLOSE',
        'scion.workbench.close_other_tabs.action': 'CLOSE OTHER TABS',
        'scion.workbench.close_all_tabs.action': 'CLOSE ALL TABS',
        'scion.workbench.close_tabs_to_the_right.action': 'CLOSE TABS TO THE RIGHT',
        'scion.workbench.close_tabs_to_the_left.action': 'CLOSE TABS TO THE LEFT',
        'scion.workbench.move_tab_to_the_right.action': 'MOVE RIGHT',
        'scion.workbench.move_tab_to_the_left.action': 'MOVE LEFT',
        'scion.workbench.move_tab_up.action': 'MOVE UP',
        'scion.workbench.move_tab_down.action': 'MOVE DOWN',
        'scion.workbench.move_tab_to_new_window.action': 'MOVE TO NEW WINDOW',
      };

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open view context menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);

      // Expect menu items to be translated.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'CLOSE',
            },
            {
              type: 'menu-item',
              label: 'CLOSE OTHER TABS',
            },
            {
              type: 'menu-item',
              label: 'CLOSE ALL TABS',
            },
            {
              type: 'menu-item',
              label: 'CLOSE TABS TO THE RIGHT',
            },
            {
              type: 'menu-item',
              label: 'CLOSE TABS TO THE LEFT',
            },
          ],
        },
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'MOVE RIGHT',
            },
            {
              type: 'menu-item',
              label: 'MOVE LEFT',
            },
            {
              type: 'menu-item',
              label: 'MOVE UP',
            },
            {
              type: 'menu-item',
              label: 'MOVE DOWN',
            },
          ],
        },
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'MOVE TO NEW WINDOW',
            },
          ],
        },
      ]);
    });

    it('should exclude built-in menu items', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: false,
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      await expectAsync(menu).toEqualMenu([]);
    });

    it('should exclude built-in menu item', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            viewMenuItems: {
              close: false,
              moveUp: false,
            },
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              cssClass: 'e2e-close-other-tabs',
            },
            {
              type: 'menu-item',
              cssClass: 'e2e-close-all-tabs',
            },
            {
              type: 'menu-item',
              cssClass: 'e2e-close-right-tabs',
            },
            {
              type: 'menu-item',
              cssClass: 'e2e-close-left-tabs',
            },
          ],
        },
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              cssClass: 'e2e-move-right',
            },
            {
              type: 'menu-item',
              cssClass: 'e2e-move-left',
            },
            {
              type: 'menu-item',
              cssClass: 'e2e-move-down',
            },
          ],
        },
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              cssClass: 'e2e-move-to-new-window',
            },
          ],
        },
      ]);
    });
  });

  it(`should exclude 'Move to New Window' in peripheral parts`, async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          mainAreaInitialPartId: 'part.initial',
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.left', {align: 'left', ratio: .25})
            .addView('view.101', {partId: 'part.left'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open view in main area.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.102'});
    await waitUntilStable();

    const menu = new MenuPO(fixture);

    // Expect view in peripheral area not to have 'Move to New Window' menu item.
    const view1 = TestBed.inject(WorkbenchService).getView('view.101')!;
    expect(view1.part().peripheral()).toBeTrue();
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(() => menu.item({cssClass: 'e2e-move-to-new-window'}).debugElement).not.toBeAttached();

    // Expect view in main area to have 'Move to New Window' menu item.
    const view2 = TestBed.inject(WorkbenchService).getView('view.102')!;
    expect(view2.part().peripheral()).toBeFalse();
    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(() => menu.item({cssClass: 'e2e-move-to-new-window'}).debugElement).toBeAttached();

    // Move view from main area to peripheral area.
    view2.move('part.left');
    await waitUntilStable();

    // Expect view in peripheral area not to have 'Move to New Window' menu item.
    expect(view2.part().peripheral()).toBeTrue();
    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(() => menu.item({cssClass: 'e2e-move-to-new-window'}).debugElement).not.toBeAttached();

    // Move view from peripheral area to main area.
    view2.move('part.initial');
    await waitUntilStable();

    // Expect view in main area to have 'Move to New Window' menu item.
    expect(view2.part().peripheral()).toBeFalse();
    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(() => menu.item({cssClass: 'e2e-move-to-new-window'}).debugElement).toBeAttached();
  });

  it(`should exclude 'Move to New Window' in docked parts`, async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Label', icon: 'folder', activate: true})
            .addView('view.101', {partId: 'part.activity'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open view in main area.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.102'});
    await waitUntilStable();

    const menu = new MenuPO(fixture);

    // Expect view in activity not to have 'Move to New Window' menu item.
    const view1 = TestBed.inject(WorkbenchService).getView('view.101')!;
    expect(view1.part().peripheral()).toBeTrue();
    await openViewContextMenu({viewId: 'view.101'});
    await expectAsync(() => menu.item({cssClass: 'e2e-move-to-new-window'}).debugElement).not.toBeAttached();

    // Expect view in main area to have 'Move to New Window' menu item.
    const view2 = TestBed.inject(WorkbenchService).getView('view.102')!;
    expect(view2.part().peripheral()).toBeFalse();
    await openViewContextMenu({viewId: 'view.102'});
    await expectAsync(() => menu.item({cssClass: 'e2e-move-to-new-window'}).debugElement).toBeAttached();
  });

  it('should invoke view menu action in view injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.1', {partId: 'part.main'})
            .addView('view.2', {partId: 'part.main'})
            .navigateView('view.1', ['path/to/view'])
            .navigateView('view.2', ['path/to/view'])
            .activateView('view.1'),
        }),
        provideRouter([
          {path: 'path/to/view', loadComponent: () => SpecViewComponent},
        ]),
      ],
    });

    @Component({
      selector: 'spec-dialog',
      template: 'Dialog',
    })
    class SpecDialogComponent {
    }

    @Component({
      selector: 'spec-view',
      template: '<ng-template wbViewMenuItem (action)="onClick()" cssClass="menu">View Menu Item</ng-template>',
      imports: [
        WorkbenchViewMenuItemDirective,
      ],
    })
    class SpecViewComponent {

      protected onClick(): void {
        void inject(WorkbenchDialogService).open(SpecDialogComponent);
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    const menu = new MenuPO(fixture);

    // Click view menu.
    await openViewContextMenu({viewId: 'view.1'});
    menu.item({cssClass: 'menu'}).nativeElement.click();
    await fixture.whenStable();

    // Expect dialog to display.
    expect(body).toShow(SpecDialogComponent);

    // Activate view.2.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await fixture.whenStable();

    // Expect dialog not to display.
    expect(body).not.toShow(SpecDialogComponent);

    // Activate view.1.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await fixture.whenStable();

    // Expect dialog to display.
    expect(body).toShow(SpecDialogComponent);
  });
});

@Component({
  selector: 'spec-menu-item',
  template: 'Menu Item',
})
class SpecMenuItemComponent {
}

async function openViewContextMenu(locator: {viewId: ViewId}): Promise<void> {
  const viewTabElement = document.querySelector<HTMLElement>(`wb-view-tab[data-viewid="${locator.viewId}"]`)!;
  viewTabElement.dispatchEvent(new MouseEvent('contextmenu'));
  await waitUntilStable();
}
