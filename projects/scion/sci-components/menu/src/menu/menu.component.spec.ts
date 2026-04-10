/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DebugElement, ElementRef, Injector, signal} from '@angular/core';
import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {contributeMenu, installMenuAccelerators, SciMenuOrigin, SciMenuRef, SciMenuService} from '@scion/sci-components/menu';
import {By} from '@angular/platform-browser';
import {expectAsync} from '../testing/jasmine/matcher/custom-async-matchers.definition';
import {toEqualMenuCustomMatcher} from '../testing/jasmine/matcher/to-equal-menu.matcher';
import {MaybeSignal, RequireOne} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {toHaveMenuPositionCustomMatcher} from '../testing/jasmine/matcher/to-have-menu-position.matcher';
import {toHaveSubMenuPositionCustomMatcher} from '../testing/jasmine/matcher/to-have-sub-menu-position.matcher';

describe('Menu', () => {

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
    jasmine.addMatchers(toHaveMenuPositionCustomMatcher);
    jasmine.addMatchers(toHaveSubMenuPositionCustomMatcher);
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
    await openMenu(fixture, {name: 'menu:testee'});

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(fixture).toEqualMenu([
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
    await expectAsync(fixture).toEqualMenu([
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
    await openMenu(fixture, {name: 'menu:testee'});

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(fixture).toEqualMenu([
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
    await expectAsync(fixture).toEqualMenu([
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
    await openMenu(fixture, {name: 'menu:testee'});

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(fixture).toEqualMenu([
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
    await expectAsync(fixture).toEqualMenu([
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
    await openMenu(fixture, {name: 'menu:testee'});

    // Expect menu.
    expect(menuFactoryFunctionCallCount).toBe(1);
    await expectAsync(fixture).toEqualMenu([
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
    await expectAsync(fixture).toEqualMenu([
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
    await openMenu(fixture, {name: 'menu:testee'});

    // Get menu.
    const menu = fixture.debugElement.parent!.query(By.css('sci-menu'));

    // Click on item 1.
    const item1 = menu.query(By.css('button.testee-1')).nativeElement as HTMLButtonElement;
    item1.click();

    // Expect onSelect function of item 1 to be invoked.
    expect(console.log).toHaveBeenCalledWith('Click item 1');

    // Click on item 2.
    const item2 = menu.query(By.css('button.testee-2')).nativeElement as HTMLButtonElement;
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
    await openMenu(fixture, {name: 'menu:testee'});

    // Expect menu.
    await expectAsync(fixture).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label',
      },
    ]);

    // Dispose menu contribution.
    menuContribution.dispose();
    await fixture.whenStable();

    // Expect menu.
    await expectAsync(fixture).toEqualMenu([]);
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
    const {sciMenuRef: sciMenuRef1} = await openMenu(fixture, {name: 'menu:testee'});

    // Expect menu to have no items (context does not match).
    await expectAsync(fixture).toEqualMenu([]);

    // Close menu.
    sciMenuRef1.close();

    // Open menu with context {key1: value1}.
    const {sciMenuRef: sciMenuRef2} = await openMenu(fixture, {name: 'menu:testee', context: new Map().set('key1', 'value1')});

    // Expect menu.
    await expectAsync(fixture).toEqualMenu([
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
    const {sciMenuRef: sciMenuRef3} = await openMenu(fixture, {name: 'menu:testee', context: new Map().set('key1', 'value1')});

    // Expect menu (context only matches item 1).
    await expectAsync(fixture).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label-1',
      },
    ]);

    // Close menu.
    sciMenuRef3.close();

    // Open menu with context {key1: value1, key2. value2}.
    await openMenu(fixture, {name: 'menu:testee', context: new Map().set('key1', 'value1').set('key2', 'value2')});

    // Expect menu.
    await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu-item',
          labelText: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu-item',
          iconLigature: 'testee-1',
        },
      ]);

      // Update icon.
      icon.set('testee-2');

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu-item',
          tooltip: 'testee-1',
        },
      ]);

      // Update tooltip.
      tooltip.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu-item',
          disabled: true,
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu-item',
          checked: true,
        },
      ]);

      // Update checked.
      checked.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu-item',
          checked: false,
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
      await openMenu(fixture, {name: 'menu:testee'});
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          labelText: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});
      // await new Promise(resolve => setTimeout(resolve));

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          iconLigature: 'testee-1',
        },
      ]);

      // Update icon.
      icon.set('testee-2');

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          disabled: true,
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          cssClass: ['testee-1', 'testee-2'],
        },
      ]);
    });

    it('should provide filter', async () => {
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          menu: {
            filter: false,
          },
        },
      ]);

      // Open menu (filter=false).
      await openMenu(fixture, {name: 'menu:testee', filter: false});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          menu: {
            filter: false,
          },
        },
      ]);

      // Open menu (filter=true).
      await openMenu(fixture, {name: 'menu:testee', filter: true});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          menu: {
            filter: true,
          },
        },
      ]);

      // Open menu (filter placeholder).
      await openMenu(fixture, {name: 'menu:testee', filter: {placeholder: 'testee-placeholder'}});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          menu: {
            filter: {placeholder: 'testee-placeholder'},
          },
        },
      ]);
    });

    xit('should filter menu items TODO', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to menu.
      contributeMenu('menu:testee', menu => menu
          .addMenuItem({label: 'A', onSelect: noop})
          .addMenuItem({label: 'B', onSelect: noop})
          .addMenuItem({label: 'C', onSelect: noop})
          .addMenu('label-ABC', menu => menu
            .addMenuItem({label: 'AA', onSelect: noop})
            .addMenuItem({label: 'BB', onSelect: noop})
            .addMenuItem({label: 'CC', onSelect: noop}),
          )
        ,
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Open menu.
      await openMenu(fixture, {name: 'menu:testee', filter: true});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'menu',
          menu: {
            filter: {placeholder: 'testee-placeholder'},
          },
        },
      ]);
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'group',
          label: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      await openMenu(fixture, {name: 'menu:testee'});
      await fixture.whenStable();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
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
      const menu = fixture.debugElement.parent!.query(By.css('sci-menu'));
      const group = menu.query(By.css('sci-menu-group.testee'));
      const groupHeaderButton = group.query(By.css('button.e2e-group-header')).nativeElement as HTMLButtonElement;
      groupHeaderButton.click();

      // Expect menu.
      await expectAsync(fixture).toEqualMenu([
        {
          type: 'group',
          collapsible: {collapsed: true},
          children: [],
        },
      ]);
    });
  });

  fdescribe('Menu Position', () => {

    it('should position menu playbook', async () => {
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
      drawAnchorPoint(anchor);
      const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
      const menu = menus[0]!;
      const submenu = menus[1]!;

      // Expect menu.
      expect(menu).toHaveMenuPosition(anchor, {
        menuX: 'left',
        menuY: 'top',
      });

      // Expect submenu.
      const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
      expect(submenu).toHaveMenuPosition(subMenuAnchor, {
        menuX: 'left',
        menuY: 'top',
        originX: 'right',
        originY: 'top',
      });
    });

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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        drawAnchorPoint(anchor);
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'left',
          originY: 'bottom',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          left: '50%',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '0',
          right: '0',
          background: 'red',
        });
        console.log('>>> body', document.body.getBoundingClientRect());
        console.log('>>> body', document.body);

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          right: '0',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
        });
      });

      fit('should position menu (html element right near edge)', async () => {
        TestBed.configureTestingModule({
          providers: [
            {provide: ComponentFixtureAutoDetect, useValue: true},
          ],
          teardown: {destroyAfterEach: false},
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          right: '50px',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'right',
          originY: 'bottom',
          originXOffset: 50,
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'top',
          originX: 'left',
          originY: 'top',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '0',
          right: '0',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'right',
          menuY: 'bottom',
          originX: 'left',
          originY: 'bottom',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '0',
          left: '0',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '50%',
          left: '0',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '0',
          left: '0',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'left',
          originY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          top: '0',
          left: '50%',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'left',
          originY: 'bottom',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'top',
          originX: 'right',
          originY: 'top',
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
        const anchor = createAnchorElement('div', {
          position: 'absolute',
          width: '50px',
          height: '20px',
          bottom: '0',
          left: '50%',
          background: 'red',
        });

        const {menus} = await openMenu(fixture, {name: 'menu:testee', anchor, path: ['submenu-1']});
        const menu = menus[0]!;
        const submenu = menus[1];

        // Expect menu.
        expect(menu).toHaveMenuPosition(anchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'left',
          originY: 'top',
        });

        // Expect submenu.
        const subMenuAnchor = menu.query(By.css('.e2e-menu-item.submenu-1')).nativeElement as HTMLElement;
        expect(submenu).toHaveMenuPosition(subMenuAnchor, {
          menuX: 'left',
          menuY: 'bottom',
          originX: 'right',
          originY: 'bottom',
        });
      });
    });
  });
});

function noop() {
}

async function openMenu(fixture: ComponentFixture<unknown>, options: {
  name: `menu:${string}`,
  context?: Map<string, unknown>,
  filter?: boolean | RequireOne<{
    placeholder?: MaybeSignal<Translatable>;
    notFoundText?: MaybeSignal<Translatable>
  }>,
  anchor?: HTMLElement | ElementRef<HTMLElement> | SciMenuOrigin | MouseEvent,
  path?: string[]
}): Promise<MenuRef> {
  const sciMenuRef = TestBed.inject(SciMenuService).open(options.name, {context: options.context, filter: options.filter, anchor: options.anchor ?? {x: 0, y: 0}});
  const path = options.path ?? [];

  const menus = new Array<DebugElement>();

  await openSubMenu(fixture, fixture.debugElement.parent!.query(By.css('sci-menu')), menus, path);

  return {sciMenuRef, menus};
}

interface MenuRef {
  sciMenuRef: SciMenuRef;
  menus: DebugElement[];
}

async function openSubMenu(fixture: ComponentFixture<unknown>, menu: DebugElement, menus: DebugElement[], path?: string[]): Promise<DebugElement[]> {
  menus.push(menu);
  if (!path?.length) {
    return menus;
  }
  const cssClass = path.shift();

  await fixture.whenStable();

  // Find menu item by css class.
  const menuItemDebugElement = menu.children.find(child => child.nativeElement.classList.contains('e2e-menu-item') && child.nativeElement.classList.contains(cssClass))!;
  const menuItemNativeElement = menuItemDebugElement.nativeElement as HTMLButtonElement;

  // Simulate 'hover' to open submenu.
  menuItemNativeElement.dispatchEvent(new MouseEvent('mouseenter'));

  await fixture.whenStable();

  // Find submenu.
  const submenu = menuItemDebugElement.parent!.query(By.css('sci-menu'))

  // Open submenu.
  return openSubMenu(fixture, submenu, menus, path);
}

@Component({
  selector: 'spec-root',
  template: ``,
})
class SpecRootComponent {
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

export function createAnchorElement(tagName: string, styles: Partial<CSSStyleDeclaration> = {}): HTMLElement {
  const element = document.createElement(tagName);
  Object.assign(element.style, styles);
  document.body.appendChild(element);
  return element;
}
