/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, inject, Injector, signal} from '@angular/core';
import {ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {contributeMenu, installMenuAccelerators, SciMenuFactoryFn, SciMenuService} from '@scion/sci-components/menu';
import {expectAsync} from '../testing/jasmine/matcher/custom-async-matchers.definition';
import {NO_ITEMS_FOUND, toEqualMenuCustomMatcher} from '../testing/jasmine/matcher/to-equal-menu.matcher';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {SUB_MENU_VERTICAL_OFFSET, toHaveMenuPositionCustomMatcher} from '../testing/jasmine/matcher/to-have-menu-position.matcher';
import {MenuPO} from './menu.po';

fdescribe('Menu', () => {

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
    jasmine.addMatchers(toHaveMenuPositionCustomMatcher);
  });

  it('should contribute to menu', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let menuFactoryFunctionCallCount = 0;

    // Contribute to menu.
    contributeMenu('menu:testee', menu => {
      menuFactoryFunctionCallCount++;
      menu.addMenuItem({label: 'testee-1', onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Open menu.
    TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu = new MenuPO(fixture);

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'testee-1',
      },
    ]);

    // Contribute to menu again.
    contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'testee-2', onSelect: noop}), {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'testee-1',
      },
      {
        type: 'menu-item',
        labelText: 'testee-2',
      },
    ]);
  });

  it('should contribute to menu group', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let menuFactoryFunctionCallCount = 0;

    // Contribute to menu.
    contributeMenu('menu:testee', menu => {
        menuFactoryFunctionCallCount++;
        menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addGroup({name: 'menu:additions'});
      },
      {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Open menu.
    TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu = new MenuPO(fixture);

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
    ]);

    // Contribute to menu group.
    contributeMenu('menu:additions', menu => menu.addMenuItem({label: 'label-2', onSelect: noop}), {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            labelText: 'label-2',
          },
        ],
      },
    ]);
  });

  it('should call menu factory function in reactive context', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let menuFactoryFunctionCallCount = 0;

    // Signal that tracks if item 2 is visible.
    const item2Visible = signal(false);

    // Contribute to menu.
    contributeMenu('menu:testee', menu => {
        menuFactoryFunctionCallCount++;
        menu.addMenuItem({label: 'label-1', onSelect: noop});
        if (item2Visible()) {
          menu.addMenuItem({label: 'label-2', onSelect: noop});
        }
      },
      {injector: TestBed.inject(Injector)},
    );
    await fixture.whenStable();

    // Open menu.
    TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu = new MenuPO(fixture);

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
    ]);

    // Make menu item 2 visible.
    item2Visible.set(true);
    await fixture.whenStable();

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(2);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
      {
        type: 'menu-item',
        labelText: 'label-2',
      },
    ]);
  })

  it('should not call menu factory function again when tracked signals change', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let menuFactoryFunctionCallCount = 0;

    const label = signal('label-1');

    // Contribute to menu.
    contributeMenu('menu:testee', menu => {
      menuFactoryFunctionCallCount++;
      menu.addMenuItem({label: label, onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Open menu.
    TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu = new MenuPO(fixture);

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
    ]);

    // Change signal.
    label.set('label-2');
    await fixture.whenStable();

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-2',
      },
    ]);
  });

  it('should invoke onSelect callback on click', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to menu.
    contributeMenu('menu:testee', menu => menu
        .addMenuItem({label: 'testee-1', cssClass: 'testee-1', onSelect: () => console.log('Click item 1')})
        .addMenuItem({label: 'testee-2', cssClass: 'testee-2', onSelect: () => console.log('Click item 2')}),
      {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Spy console.
    spyOn(console, 'log').and.callThrough();

    // Open menu.
    TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu = new MenuPO(fixture);

    // Click on item 1.
    const item1 = menu.item({cssClass: 'testee-1'}).nativeElement;
    item1.click();

    // Expect onSelect function of item 1 to be invoked.
    expect(console.log).toHaveBeenCalledWith('Click item 1');

    // Click on item 2.
    const item2 = menu.item({cssClass: 'testee-2'}).nativeElement;
    item2.click();

    // Expect onSelect function of item 2 to be invoked.
    expect(console.log).toHaveBeenCalledWith('Click item 2');
  });

  it('should invoke onSelect callback on pressing keystroke', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to menu.
    contributeMenu('menu:testee', menu => menu
        .addMenuItem({label: 'testee-1', cssClass: 'testee-1', accelerator: ['alt', '1'], onSelect: () => console.log('Click item 1')})
        .addMenuItem({label: 'testee-2', cssClass: 'testee-2', accelerator: ['alt', '2'], onSelect: () => console.log('Click item 2')}),
      {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Install accelerators.
    installMenuAccelerators('menu:testee', {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Spy console.
    spyOn(console, 'log').and.callThrough();

    // Press alt-1.
    document.dispatchEvent(new KeyboardEvent('keydown', {key: '1', altKey: true}));

    // Expect onSelect function of item 1 to be invoked.
    expect(console.log).toHaveBeenCalledWith('Click item 1');

    // Press alt-2.
    document.dispatchEvent(new KeyboardEvent('keydown', {key: '2', altKey: true}));

    // Expect onSelect function of item 2 to be invoked.
    expect(console.log).toHaveBeenCalledWith('Click item 2');
  });

  it('should remove contribution on dispose', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to menu.
    const menuContribution = contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Open menu.
    TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu = new MenuPO(fixture);

    // Expect menu.
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label',
      },
    ]);

    // Dispose menu contribution.
    menuContribution.dispose();
    await fixture.whenStable();

    // Expect menu.
    await expectAsync(menu).toEqualMenu([]);
  });

  it('should match required context', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to menu with required context {key1: value1}.
    contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label-1', onSelect: noop}), {requiredContext: new Map().set('key1', 'value1'), injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Open menu without passing context.
    const sciMenuRef1 = TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
    const menu1 = new MenuPO(fixture);

    // Expect menu to have no items (context does not match).
    await expectAsync(menu1).toEqualMenu([]);

    // Close menu.
    sciMenuRef1.close();

    // Open menu with context {key1: value1}.
    const sciMenuRef2 = TestBed.inject(SciMenuService).open('menu:testee', {context: new Map().set('key1', 'value1'), anchor: {x: 0, y: 0}});
    const menu2 = new MenuPO(fixture);

    // Expect menu.
    await expectAsync(menu2).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
    ]);

    // Close menu.
    sciMenuRef2.close();

    // Contribute to menu with required context {key2: value2}.
    contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label-2', onSelect: noop}), {requiredContext: new Map().set('key2', 'value2'), injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Open menu with context {key1: value1}.
    const sciMenuRef3 = TestBed.inject(SciMenuService).open('menu:testee', {context: new Map().set('key1', 'value1'), anchor: {x: 0, y: 0}});
    const menu3 = new MenuPO(fixture);

    // Expect menu (context only matches item 1).
    await expectAsync(menu3).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
    ]);

    // Close menu.
    sciMenuRef3.close();

    // Open menu with context {key1: value1, key2. value2}.
    TestBed.inject(SciMenuService).open('menu:testee', {context: new Map().set('key1', 'value1').set('key2', 'value2'), anchor: {x: 0, y: 0}});
    const menu4 = new MenuPO(fixture);

    // Expect menu.
    await expectAsync(menu4).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
      {
        type: 'menu-item',
        labelText: 'label-2',
      },
    ]);
  });

  describe('Menu Item Properties', () => {

    it('should provide label', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'testee',
        },
      ]);
    });

    it('should provide label (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const label = signal('testee-1');

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: label, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'testee-2',
        },
      ]);
    });

    it('should provide label (component)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'testee',
        },
      ]);
    });

    it('should provide icon', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({icon: 'testee', label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          iconLigature: 'testee',
        },
      ])
    });

    it('should provide icon (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const icon = signal('testee-1');

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({icon: icon, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          iconLigature: 'testee-1',
        },
      ]);

      // Update icon.
      icon.set('testee-2');

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          iconLigature: 'testee-2',
        },
      ]);
    });

    it('should provide icon (component)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({icon: SpecTesteeComponent, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          iconComponent: {
            selector: 'spec-testee',
          },
        },
      ])
    });

    it('should provide tooltip', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({tooltip: 'testee', label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          tooltip: 'testee',
        },
      ]);
    });

    it('should provide tooltip (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const tooltip = signal('testee-1');

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({tooltip: tooltip, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          tooltip: 'testee-1',
        },
      ]);

      // Update tooltip.
      tooltip.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          tooltip: 'testee-2',
        },
      ]);
    });

    it('should provide disabled', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({disabled: true, label: 'label', onSelect: noop})
          .addMenuItem({disabled: false, label: 'label', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          disabled: true,
        },
        {
          type: 'menu-item',
          disabled: false,
        },
      ]);
    });

    it('should provide disabled (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const disabled = signal(true);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({disabled: disabled, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          disabled: true,
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          disabled: false,
        },
      ]);
    });

    it('should provide checked', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({checked: true, label: 'label', onSelect: noop})
          .addMenuItem({checked: false, label: 'label', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          checked: true,
        },
        {
          type: 'menu-item',
          checked: false,
        },
      ]);
    });

    it('should provide checked (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const checked = signal(true);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({checked: checked, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          checked: true,
        },
      ]);

      // Update checked.
      checked.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          checked: false,
        },
      ]);
    });

    it('should provide active', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({active: true, label: 'label', onSelect: noop})
          .addMenuItem({active: false, label: 'label', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          active: true,
        },
        {
          type: 'menu-item',
          active: false,
        },
      ]);
    });

    it('should provide active (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const active = signal(true);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({active: active, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          active: true,
        },
      ]);

      // Update active.
      active.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          active: false,
        },
      ]);
    });

    it('should provide actions', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({
            label: 'label',
            onSelect: noop,
            actions: toolbar => toolbar
              .addToolbarItem({icon: 'icon-1', onSelect: noop})
              .addToolbarItem({icon: 'icon-2', onSelect: noop}),
          }),
        {injector: TestBed.inject(Injector)});

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label',
          actions: [
            {
              type: 'menu-item',
              iconLigature: 'icon-1',
            },
            {
              type: 'menu-item',
              iconLigature: 'icon-2',
            },
          ],
        },
      ]);
    });

    it('should provide attributes', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({attributes: {attr1: 'testee-1', attr2: 'testee-2'}, label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          attributes: {attr1: 'testee-1', attr2: 'testee-2'},
        },
      ]);
    });

    it('should provide css class', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({cssClass: ['testee-1', 'testee-2'], label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          cssClass: ['testee-1', 'testee-2'],
        },
      ]);
    });
  });

  describe('Menu Properties', () => {

    it('should provide label', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({label: 'testee'}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'testee',
        },
      ]);
    });

    it('should provide label (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const label = signal('testee-1');

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({label: label}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'testee-2',
        },
      ]);
    });

    it('should provide label (component)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({label: SpecTesteeComponent}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelComponent: {
            selector: 'spec-testee',
          },
        },
      ]);
    });

    it('should provide icon', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({icon: 'testee', label: 'label'}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          iconLigature: 'testee',
        },
      ]);
    });

    it('should provide icon (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const icon = signal('testee-1');

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({icon: icon, label: 'label'}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          iconLigature: 'testee-1',
        },
      ]);

      // Update icon.
      icon.set('testee-2');

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          iconLigature: 'testee-2',
        },
      ]);
    });

    it('should provide icon (component)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({icon: SpecTesteeComponent, label: 'label'}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          iconComponent: {
            selector: 'spec-testee',
          },
        },
      ]);
    });

    it('should provide disabled', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({disabled: true, label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop}))
          .addMenu({disabled: false, label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          disabled: true,
        },
        {
          type: 'menu',
          disabled: false,
        },
      ]);
    });

    it('should provide disabled (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const disabled = signal(true);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({disabled: disabled, label: 'label'}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          disabled: true,
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          disabled: false,
        },
      ]);
    });

    it('should provide css class', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenu({cssClass: ['testee-1', 'testee-2'], label: 'label'}, menu => menu
            .addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          cssClass: ['testee-1', 'testee-2'],
        },
      ]);
    });

    it('should provide filter (omit filter option)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu (omit filter option).
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        filter: false,
      });
    });

    it('should provide filter (filter=false)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu (filter=false).
      TestBed.inject(SciMenuService).open('menu:testee', {filter: false, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        filter: false,
      });
    });

    it('should provide filter (filter=true)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu (filter=true).
      TestBed.inject(SciMenuService).open('menu:testee', {filter: true, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        filter: true,
      });
    });

    it('should provide filter (placeholder)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu (filter placeholder).
      TestBed.inject(SciMenuService).open('menu:testee', {filter: {placeholder: 'testee-placeholder'}, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        filter: {placeholder: 'testee-placeholder'},
      });
    });

    it('should provide filter (notFoundText)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu (filter notFoundText).
      TestBed.inject(SciMenuService).open('menu:testee', {filter: {notFoundText: 'testee-not-found-text'}, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Filter to show no results
      menu.filterMenuItems('xyz');

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        notFoundText: 'testee-not-found-text',
      });
    });
  });

  describe('Group Properties', () => {

    it('should provide label', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({label: 'testee'}, group => group.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          label: 'testee',
        },
      ]);
    });

    it('should provide label (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const label = signal('testee-1');

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({label: label}, group => group.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          label: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          label: 'testee-2',
        },
      ]);
    });

    it('should provide disabled', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({disabled: true}, group => group.addMenuItem({label: 'label', onSelect: noop}))
          .addGroup({disabled: false}, group => group.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              disabled: true,
            },
          ],
        },
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              disabled: false,
            },
          ],
        },
      ]);
    });

    it('should provide disabled (signal)', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      const disabled = signal(true);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({disabled: disabled}, group => group.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              disabled: true,
            },
          ],
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              disabled: false,
            },
          ],
        },
      ]);
    });

    it('should provide actions', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({
              label: 'label',
              actions: toolbar => toolbar
                .addToolbarItem({icon: 'icon-1', onSelect: noop})
                .addToolbarItem({icon: 'icon-2', onSelect: noop}),
            }, group => group
              .addMenuItem({label: 'label', onSelect: noop}),
          ),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          actions: [
            {
              type: 'menu-item',
              iconLigature: 'icon-1',
            },
            {
              type: 'menu-item',
              iconLigature: 'icon-2',
            },
          ],
        },
      ]);
    });

    it('should provide collapsible', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({collapsible: true}, group => group.addMenuItem({label: 'label-1', onSelect: noop}))
          .addGroup({collapsible: {collapsed: false}}, group => group.addMenuItem({label: 'label-2', onSelect: noop}))
          .addGroup({collapsible: {collapsed: true}}, group => group.addMenuItem({label: 'label-3', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          collapsible: {collapsed: false},
          children: [
            {
              type: 'menu-item',
              labelText: 'label-1',
            },
          ],
        },
        {
          type: 'group',
          collapsible: {collapsed: false},
          children: [
            {
              type: 'menu-item',
              labelText: 'label-2',
            },
          ],
        },
        {
          type: 'group',
          collapsible: {collapsed: true},
          children: [],
        },
      ]);
    });

    it('should toggle collapsed', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addGroup({collapsible: true, cssClass: 'testee'}, group => group.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          collapsible: {collapsed: false},
          children: [
            {
              type: 'menu-item',
              labelText: 'label',
            },
          ],
        },
      ]);

      // Toggle collapsed.
      const groupHeader = menu.group({cssClass: 'testee'}).header.nativeElement;
      groupHeader.click();

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          collapsible: {collapsed: true},
          children: [],
        },
      ]);
    });
  });

  describe('Menu Position', () => {

    describe('x/y coordinates', () => {

      it('should position menu (center)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: window.innerWidth / 2, y: window.innerHeight / 2};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (top-right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: window.innerWidth, y: 0};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: window.innerWidth, y: window.innerHeight / 2};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (bottom-right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: window.innerWidth, y: window.innerHeight};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'left',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (top-left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: 0, y: 0};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: 0, y: window.innerHeight / 2};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (bottom-left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: 0, y: window.innerHeight};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (top)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: window.innerWidth / 2, y: 0};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (bottom)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = {x: window.innerWidth / 2, y: window.innerHeight};
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });
    });

    describe('Anchor HTML Element', () => {

      it('should position menu (html element center)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          left: '50%',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element top-right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '0',
          right: '0',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element near top-right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50px',
          right: '50px',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
          originXOffset: 50,
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          right: '0',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element near right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          right: '50px',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
          originXOffset: 50,
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element bottom-right)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '0',
          right: '0',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'left',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element near bottom-right', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '50px',
          right: '50px',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
          originXOffset: 50,
          originYOffset: 50,
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'left',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element top-left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '0',
          left: '0',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element near top-left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50px',
          left: '50px',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          left: '0',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element bottom-left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '0',
          left: '0',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'left',
          originY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element near bottom-left)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '50px',
          left: '50px',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'left',
          originY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element top)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '0',
          left: '50%',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
          originYOffset: -SUB_MENU_VERTICAL_OFFSET,
        });
      });

      it('should position menu (html element bottom)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
        });

        const fixture = TestBed.createComponent(SpecRootComponent);

        // Contribute to menu.
        contributeMenu('menu:testee', menu => menu
            .addMenuItem({label: 'label-1', onSelect: noop})
            .addMenuItem({label: 'label-2', onSelect: noop})
            .addMenuItem({label: 'label-3', onSelect: noop})
            .addMenu({label: 'submenu-1', cssClass: 'submenu-1'}, menu => menu
              .addMenuItem({label: 'label-1', onSelect: noop})
              .addMenuItem({label: 'label-2', onSelect: noop})
              .addMenuItem({label: 'label-3', onSelect: noop}),
            ),
          {injector: TestBed.inject(Injector)});
        await fixture.whenStable();

        // Open menu.
        const anchor = fixture.componentInstance.createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '0',
          left: '50%',
          background: 'red',
        });
        TestBed.inject(SciMenuService).open('menu:testee', {anchor});
        const menu = new MenuPO(fixture);
        const submenu = await menu.openSubMenu({cssClass: 'submenu-1'});

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'left',
          originY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.item({cssClass: 'submenu-1'}).nativeElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
          originYOffset: SUB_MENU_VERTICAL_OFFSET,
        });
      });
    });
  });

  describe('Menu Filtering', () => {

    const menuFactoryFn: SciMenuFactoryFn = menu => menu
      // ========== TOP LEVEL (simple + overlapping) ==========
      .addMenuItem({label: 'Open', onSelect: noop})
      .addMenuItem({label: 'Open File', onSelect: noop})
      .addMenuItem({label: 'Open Folder', onSelect: noop})
      .addMenuItem({label: 'Close', onSelect: noop})
      .addMenuItem({label: 'Save', onSelect: noop})

      // ========== FILE OPERATIONS (branch A) ==========
      .addMenu({label: 'File', cssClass: 'file'}, menu => menu
        .addMenuItem({label: 'New File', onSelect: noop})
        .addMenuItem({label: 'Open Recent', onSelect: noop})
        .addMenuItem({label: 'Save As', onSelect: noop})
        .addMenuItem({label: 'Close File', onSelect: noop})

        // nested overlap zone
        .addMenu({label: 'Recent', cssClass: 'recent'}, menu => menu
          .addMenuItem({label: 'project-alpha', onSelect: noop})
          .addMenuItem({label: 'project-beta', onSelect: noop})
          .addMenuItem({label: 'open-log.txt', onSelect: noop}),
        ),
      )

      // ========== EDIT (branch B, shared terms like "Copy") ==========
      .addMenu('Edit', menu => menu
        .addMenuItem({label: 'Undo', onSelect: noop})
        .addMenuItem({label: 'Redo', onSelect: noop})
        .addMenuItem({label: 'Copy', onSelect: noop})
        .addMenuItem({label: 'Cut', onSelect: noop})
        .addMenuItem({label: 'Paste', onSelect: noop})

        .addMenu('Clipboard', menu => menu
          .addMenuItem({label: 'Copy Special', onSelect: noop})
          .addMenuItem({label: 'Paste Without Formatting', onSelect: noop})
          .addMenuItem({label: 'Clear Clipboard', onSelect: noop}),
        ),
      )

      // ========== SEARCH (heavy overlap domain) ==========
      .addMenu({label: 'Search', cssClass: 'search'}, menu => menu
        .addMenuItem({label: 'Find', onSelect: noop})
        .addMenuItem({label: 'Find in Files', onSelect: noop})
        .addMenuItem({label: 'Replace', onSelect: noop})

        .addMenu('Find', menu => menu
          .addMenuItem({label: 'Find Next', onSelect: noop})
          .addMenuItem({label: 'Find Previous', onSelect: noop})
          .addMenuItem({label: 'Find All References', onSelect: noop}),
        ),
      )

      // ========== SETTINGS (case + substring + nested matching) ==========
      .addMenu('Settings', menu => menu
        .addMenuItem({label: 'Settings', onSelect: noop})
        .addMenuItem({label: 'User Settings', onSelect: noop})
        .addMenuItem({label: 'Workspace Settings', onSelect: noop})
        .addMenuItem({label: 'Reset Settings', onSelect: noop})

        .addMenu('Advanced Settings', menu => menu
          .addMenuItem({label: 'Editor Settings', onSelect: noop})
          .addMenuItem({label: 'System Settings', onSelect: noop})
          .addMenuItem({label: 'Reset Layout', onSelect: noop}),
        ),
      )

      // ========== GIT (deep nesting + hierarchical filtering) ==========
      .addMenu({label: 'Git', cssClass: 'git'}, menu => menu
        .addMenuItem({label: 'Commit', onSelect: noop})
        .addMenuItem({label: 'Push', onSelect: noop})
        .addMenuItem({label: 'Pull', onSelect: noop})

        .addMenu({label: 'Branches', cssClass: 'branches'}, menu => menu
          .addMenuItem({label: 'Create Branch', onSelect: noop})
          .addMenuItem({label: 'Delete Branch', onSelect: noop})
          .addMenuItem({label: 'Checkout Branch', onSelect: noop})

          .addMenu({label: 'Remote', cssClass: 'remote'}, menu => menu
            .addMenuItem({label: 'origin/main', onSelect: noop})
            .addMenuItem({label: 'origin/feature/open-ui', onSelect: noop})
            .addMenuItem({label: 'origin/fix-copy-bug', onSelect: noop}),
          ),
        ),
      )

      // ========== MIXED EDGE CASES ==========
      .addMenu({label: 'Mixed Case', cssClass: 'mixed-case'}, menu => menu
        .addMenuItem({label: 'alpha', onSelect: noop})
        .addMenuItem({label: 'Alpha', onSelect: noop})
        .addMenuItem({label: 'ALPHA', onSelect: noop})
        .addMenuItem({label: 'alpha-beta', onSelect: noop})
        .addMenuItem({label: 'AlphaBeta', onSelect: noop})

        .addMenu({label: 'alpha', cssClass: 'alpha'}, menu => menu
          .addMenuItem({label: 'alpha child', onSelect: noop})
          .addMenuItem({label: 'beta child', onSelect: noop}),
        ),
      )

      // ========== ISOLATED BRANCH (for negative tests) ==========
      .addMenu('Isolated', menu => menu
        .addMenuItem({label: 'zzz-should-not-match-often', onSelect: noop})
        .addMenuItem({label: 'qwerty-only', onSelect: noop}),
      );

    it('should match basic: "open"', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menuFactoryFn, {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {filter: true, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Filter: open
      menu.filterMenuItems('open');

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'Open',
        },
        {
          type: 'menu-item',
          labelText: 'Open File',
        },
        {
          type: 'menu-item',
          labelText: 'Open Folder',
        },
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Git',
        },
      ]);

      // Open File -> Recent.
      const fileMenu = await menu.openSubMenu({cssClass: 'file'});
      await fileMenu.openSubMenu({cssClass: 'recent'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'Open',
        },
        {
          type: 'menu-item',
          labelText: 'Open File',
        },
        {
          type: 'menu-item',
          labelText: 'Open Folder',
        },
        {
          type: 'menu',
          labelText: 'File',
          children: [
            {
              type: 'menu-item',
              labelText: 'Open Recent',
            },
            {
              type: 'menu',
              labelText: 'Recent',
              children: [
                {
                  type: 'menu-item',
                  labelText: 'open-log.txt',
                },
              ],
            },
          ],
        },
        {
          type: 'menu',
          labelText: 'Git',
        },
      ]);

      // Open Git -> Branches -> Remote.
      const gitMenu = await menu.openSubMenu({cssClass: 'git'});
      const branchesMenu = await gitMenu.openSubMenu({cssClass: 'branches'});
      await branchesMenu.openSubMenu({cssClass: 'remote'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'Open',
        },
        {
          type: 'menu-item',
          labelText: 'Open File',
        },
        {
          type: 'menu-item',
          labelText: 'Open Folder',
        },
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Git',
          children: [
            {
              type: 'menu',
              labelText: 'Branches',
              children: [
                {
                  type: 'menu',
                  labelText: 'Remote',
                  children: [
                    {
                      type: 'menu-item',
                      labelText: 'origin/feature/open-ui',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should match partial: "fil"', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menuFactoryFn, {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {filter: true, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Filter: fil
      menu.filterMenuItems('fil');

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'Open File',
        },
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Search',
        },
      ]);

      // Open File.
      await menu.openSubMenu({cssClass: 'file'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'Open File',
        },
        {
          type: 'menu',
          labelText: 'File',
          children: [
            {
              type: 'menu-item',
              labelText: 'New File',
            },
            {
              type: 'menu-item',
              labelText: 'Close File',
            },
          ],
        },
        {
          type: 'menu',
          labelText: 'Search',
        },
      ]);

      // Open Search.
      await menu.openSubMenu({cssClass: 'search'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'Open File',
        },
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Search',
          children: [
            {
              type: 'menu-item',
              labelText: 'Find in Files',
            },
          ],
        },
      ]);
    });

    it('should match case insensitive: "ALPHA"', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menuFactoryFn, {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {filter: true, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Filter: ALPHA
      menu.filterMenuItems('ALPHA');

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Mixed Case',
        },
      ]);

      // Open File -> Recent.
      const fileMenu = await menu.openSubMenu({cssClass: 'file'});
      await fileMenu.openSubMenu({cssClass: 'recent'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'File',
          children: [
            {
              type: 'menu',
              labelText: 'Recent',
              children: [
                {
                  type: 'menu-item',
                  labelText: 'project-alpha',
                },
              ],
            },
          ],
        },
        {
          type: 'menu',
          labelText: 'Mixed Case',
        },
      ]);

      // Open Mixed Case -> alpha.
      const mixedCaseMenu = await menu.openSubMenu({cssClass: 'mixed-case'});
      await mixedCaseMenu.openSubMenu({cssClass: 'alpha'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Mixed Case',
          children: [
            {
              type: 'menu-item',
              labelText: 'alpha',
            },
            {
              type: 'menu-item',
              labelText: 'Alpha',
            },
            {
              type: 'menu-item',
              labelText: 'ALPHA',
            },
            {
              type: 'menu-item',
              labelText: 'alpha-beta',
            },
            {
              type: 'menu-item',
              labelText: 'AlphaBeta',
            },
            {
              type: 'menu',
              labelText: 'alpha',
              children: [
                {
                  type: 'menu-item',
                  labelText: 'alpha child',
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should match case insensitive: "alpha"', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menuFactoryFn, {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {filter: true, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Filter: alpha
      menu.filterMenuItems('alpha');

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Mixed Case',
        },
      ]);

      // Open File -> Recent.
      const fileMenu = await menu.openSubMenu({cssClass: 'file'});
      await fileMenu.openSubMenu({cssClass: 'recent'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'File',
          children: [
            {
              type: 'menu',
              labelText: 'Recent',
              children: [
                {
                  type: 'menu-item',
                  labelText: 'project-alpha',
                },
              ],
            },
          ],
        },
        {
          type: 'menu',
          labelText: 'Mixed Case',
        },
      ]);

      // Open Mixed Case -> alpha.
      const mixedCaseMenu = await menu.openSubMenu({cssClass: 'mixed-case'});
      await mixedCaseMenu.openSubMenu({cssClass: 'alpha'});

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu',
          labelText: 'File',
        },
        {
          type: 'menu',
          labelText: 'Mixed Case',
          children: [
            {
              type: 'menu-item',
              labelText: 'alpha',
            },
            {
              type: 'menu-item',
              labelText: 'Alpha',
            },
            {
              type: 'menu-item',
              labelText: 'ALPHA',
            },
            {
              type: 'menu-item',
              labelText: 'alpha-beta',
            },
            {
              type: 'menu-item',
              labelText: 'AlphaBeta',
            },
            {
              type: 'menu',
              labelText: 'alpha',
              children: [
                {
                  type: 'menu-item',
                  labelText: 'alpha child',
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should match negative case: "should-match-nothing"', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menuFactoryFn, {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {filter: true, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Filter: should-match-nothing
      menu.filterMenuItems('should-match-nothing');

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        notFoundText: NO_ITEMS_FOUND,
      });
    });
  });

  describe('Menu Contribution Position', () => {

    it('should contribute at position start', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addMenuItem({label: 'label-2', onSelect: noop})
          .addMenuItem({label: 'label-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to menu at position start.
      contributeMenu({location: 'menu:testee', position: 'start'}, menu => menu.addMenuItem({label: 'label-testee', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label-testee',
        },
        {
          type: 'menu-item',
          labelText: 'label-1',
        },
        {
          type: 'menu-item',
          labelText: 'label-2',
        },
        {
          type: 'menu-item',
          labelText: 'label-3',
        },
      ]);
    });

    it('should contribute at position end', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addMenuItem({label: 'label-2', onSelect: noop})
          .addMenuItem({label: 'label-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to menu at position end.
      contributeMenu({location: 'menu:testee', position: 'end'}, menu => menu.addMenuItem({label: 'label-testee', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label-1',
        },
        {
          type: 'menu-item',
          labelText: 'label-2',
        },
        {
          type: 'menu-item',
          labelText: 'label-3',
        },
        {
          type: 'menu-item',
          labelText: 'label-testee',
        },
      ]);
    });

    it('should contribute before menu-item', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addMenuItem({name: 'menuitem:2', label: 'label-2', onSelect: noop})
          .addMenuItem({label: 'label-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to menu before menuitem:2.
      contributeMenu({location: 'menu:testee', before: 'menuitem:2'}, menu => menu.addMenuItem({label: 'label-testee', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label-1',
        },
        {
          type: 'menu-item',
          labelText: 'label-testee',
        },
        {
          type: 'menu-item',
          labelText: 'label-2',
        },
        {
          type: 'menu-item',
          labelText: 'label-3',
        },
      ]);
    });

    it('should contribute after menu-item', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addMenuItem({name: 'menuitem:2', label: 'label-2', onSelect: noop})
          .addMenuItem({label: 'label-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to menu after menuitem:2.
      contributeMenu({location: 'menu:testee', after: 'menuitem:2'}, menu => menu.addMenuItem({label: 'label-testee', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label-1',
        },
        {
          type: 'menu-item',
          labelText: 'label-2',
        },
        {
          type: 'menu-item',
          labelText: 'label-testee',
        },
        {
          type: 'menu-item',
          labelText: 'label-3',
        },
      ]);
    });

    it('should contribute before menu', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addMenu({name: 'menu:2', label: 'label-2'}, menu => menu
            .addMenuItem({label: 'label-2', onSelect: noop}))
          .addMenuItem({label: 'label-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to menu before menu:2.
      contributeMenu({location: 'menu:testee', before: 'menu:2'}, menu => menu.addMenuItem({label: 'label-testee', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label-1',
        },
        {
          type: 'menu-item',
          labelText: 'label-testee',
        },
        {
          type: 'menu',
          labelText: 'label-2',
        },
        {
          type: 'menu-item',
          labelText: 'label-3',
        },
      ]);
    });

    it('should contribute after menu', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label-1', onSelect: noop})
          .addMenu({name: 'menu:2', label: 'label-2'}, menu => menu
            .addMenuItem({label: 'label-2', onSelect: noop}))
          .addMenuItem({label: 'label-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to menu after menu:2.
      contributeMenu({location: 'menu:testee', after: 'menu:2'}, menu => menu.addMenuItem({label: 'label-testee', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'label-1',
        },
        {
          type: 'menu',
          labelText: 'label-2',
        },
        {
          type: 'menu-item',
          labelText: 'label-testee',
        },
        {
          type: 'menu-item',
          labelText: 'label-3',
        },
      ]);
    });

  });

  describe('Menu Size', () => {

    it('should configure menu width', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {size: {width: '500px'}, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        width: 500,
      });
    });

    it('should configure menu minWidth', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'label', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {size: {minWidth: '500px'}, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        width: 500,
      });
    });

    it('should configure menu maxWidth', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu.addMenuItem({label: 'long label text to exceed maximum width', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {size: {maxWidth: '200px'}, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        width: 200,
      });
    });

    it('should configure menu maxHeight', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop})
          .addMenuItem({label: 'label', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      TestBed.inject(SciMenuService).open('menu:testee', {size: {maxHeight: '200px'}, anchor: {x: 0, y: 0}});
      const menu = new MenuPO(fixture);

      // Expect menu.
      await expectAsync(menu).toEqualMenu({
        height: 200,
      });
    });
  });
});

function noop() {
}

@Component({
  selector: 'spec-root',
  template: ``,
})
class SpecRootComponent {

  private readonly _destroyRef = inject(DestroyRef);

  public createAnchorElement(tagName: string, styles: Partial<CSSStyleDeclaration> = {}): HTMLElement {
    const element = document.createElement(tagName);
    Object.assign(element.style, styles);
    document.body.appendChild(element);
    this._destroyRef.onDestroy(() => element.remove());
    return element;
  }
}

@Component({
  selector: 'spec-testee',
  template: 'spec-testee',
  imports: [],
})
class SpecTesteeComponent {
}

function drawAnchorPoint(anchor: {x: number, y: number}): HTMLElement {
  const dot = document.createElement('div');

  Object.assign(dot.style, {
    position: 'absolute',
    left: `${anchor.x}px`,
    top: `${anchor.y}px`,
    width: '6px',
    height: '6px',
    background: 'red',
    borderRadius: '50%',
    zIndex: '9999',
    pointerEvents: 'none',
  });

  document.body.appendChild(dot);
  return dot;
}
