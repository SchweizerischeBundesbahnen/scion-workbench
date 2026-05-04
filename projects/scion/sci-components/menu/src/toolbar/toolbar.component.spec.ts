/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Injector, signal} from '@angular/core';
import {ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {contributeMenu, SciToolbarComponent} from '@scion/sci-components/menu';
import {toEqualToolbarCustomMatcher} from '../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {expectAsync} from '../testing/jasmine/matcher/custom-async-matchers.definition';
import {toEqualMenuCustomMatcher} from '../testing/jasmine/matcher/to-equal-menu.matcher';
import {ToolbarPO} from './toolbar.po';
import {MenuPO} from '../menu/menu.po';

describe('Toolbar', () => {

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
  });

  it('should contribute to toolbar', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
      teardown: {destroyAfterEach: false},
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let toolbarFactoryFunctionCallCount = 0;

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => {
      toolbarFactoryFunctionCallCount++;
      toolbar.addToolbarItem({icon: 'icon-1', onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee')
    expect(toolbarFactoryFunctionCallCount).toBe(1);
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    // Contribute to toolbar again.
    contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon-2', onSelect: noop}), {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunctionCallCount).toBe(1);
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
      {
        type: 'menu-item',
        iconLigature: 'icon-2',
      },
    ]);
  });

  it('should contribute to toolbar group', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let toolbarFactoryFunctionCallCount = 0;

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => {
        toolbarFactoryFunctionCallCount++;
        toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addGroup({name: 'toolbar:additions'});
      },
      {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunctionCallCount).toBe(1);
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    // Contribute to toolbar group.
    contributeMenu('toolbar:additions', toolbar => toolbar.addToolbarItem({icon: 'icon-2', onSelect: noop}), {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunctionCallCount).toBe(1);
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            iconLigature: 'icon-2',
          },
        ],
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

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => toolbar
        .addToolbarItem({icon: 'icon-1', cssClass: 'testee-1', onSelect: () => console.log('Click item 1')})
        .addToolbarItem({icon: 'icon-2', cssClass: 'testee-2', onSelect: () => console.log('Click item 2')}),
      {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Spy console.
    spyOn(console, 'log').and.callThrough();

    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');

    // Click on item 1.
    toolbar.item({cssClass: 'testee-1'}).nativeElement.click();

    // Expect onSelect function of item 1 to be invoked.
    expect(console.log).toHaveBeenCalledWith('Click item 1');

    // Click on item 2.
    toolbar.item({cssClass: 'testee-2'}).nativeElement.click();

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

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => toolbar
        .addToolbarItem({icon: '1', cssClass: 'testee-1', accelerator: ['alt', '1'], onSelect: () => console.log('Click item 1')})
        .addToolbarItem({icon: '2', cssClass: 'testee-2', accelerator: ['alt', '2'], onSelect: () => console.log('Click item 2')}),
      {injector: TestBed.inject(Injector)});
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

  it('should call toolbar factory function in reactive context', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let toolbarFactoryFunction1CallCount = 0;
    let toolbarFactoryFunction2CallCount = 0;

    // Signal that tracks if item 2 is visible.
    const item2Visible = signal(false);

    // Contribute to toolbar (track signal).
    contributeMenu('toolbar:testee', toolbar => {
        toolbarFactoryFunction1CallCount++;
        toolbar.addToolbarItem({icon: 'icon-1', onSelect: noop});

        if (item2Visible()) {
          toolbar.addToolbarItem({icon: 'icon-2', onSelect: noop});
        }
      },
      {injector: TestBed.inject(Injector)},
    );

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => {
        toolbarFactoryFunction2CallCount++;
        toolbar.addToolbarItem({icon: 'icon-3', onSelect: noop});
      },
      {injector: TestBed.inject(Injector)},
    );
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunction1CallCount).toBe(1);
    expect(toolbarFactoryFunction2CallCount).toBe(1);
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
      {
        type: 'menu-item',
        iconLigature: 'icon-3',
      },
    ]);

    // Make item 2 visible.
    item2Visible.set(true);
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunction1CallCount).toBe(2);
    expect(toolbarFactoryFunction2CallCount).toBe(1);
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
      {
        type: 'menu-item',
        iconLigature: 'icon-2',
      },
      {
        type: 'menu-item',
        iconLigature: 'icon-3',
      },
    ]);
  })

  it('should not call toolbar factory again when tracked signals change', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let toolbarFactoryFunctionCallCount = 0;

    const icon = signal('icon-1');

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => {
      toolbarFactoryFunctionCallCount++;
      toolbar.addToolbarItem({icon: icon, onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunctionCallCount).toBe(1);
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    // Change signal.
    icon.set('icon-2');

    // Expect toolbar.
    expect(toolbarFactoryFunctionCallCount).toBe(1);
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-2',
      },
    ]);
  });

  it('should call toolbar factory function once (multiple toolbars)', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture1 = TestBed.createComponent(SpecRootComponent);
    const fixture2 = TestBed.createComponent(SpecRootComponent);

    let toolbarFactoryFunction1CallCount = 0;

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => {
        toolbarFactoryFunction1CallCount++;
        toolbar.addToolbarItem({icon: 'icon-1', onSelect: noop});
      },
      {injector: TestBed.inject(Injector)},
    );
    await fixture1.whenStable();
    await fixture2.whenStable();

    // Expect toolbar.
    const toolbar1 = new ToolbarPO(fixture1, 'toolbar:testee')

    expect(toolbarFactoryFunction1CallCount).toBe(1);
    await expectAsync(toolbar1).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    const toolbar2 = new ToolbarPO(fixture2, 'toolbar:testee')
    await expectAsync(toolbar2).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);
  });

  it('should remove contribution on dispose', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to toolbar.
    const toolbarContribution = contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon', onSelect: noop}), {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon',
      },
    ]);

    // Dispose toolbar contribution.
    toolbarContribution.dispose();

    await fixture.whenStable();

    // Expect toolbar.
    await expectAsync(toolbar).toEqualToolbar([]);
  });

  it('should match required context', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to toolbar with required context {key1: value1}.
    contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon-1', onSelect: noop}), {requiredContext: new Map().set('key1', 'value1'), injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar to have no items (context does not match).
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
    await expectAsync(toolbar).toEqualToolbar([]);

    // Set context {key1: value1} on toolbar.
    fixture.componentInstance.context.set(new Map().set('key1', 'value1'));
    await fixture.whenStable();

    // Expect toolbar.
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    // Contribute to toolbar with required context {key2: value2}.
    contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon-2', onSelect: noop}), {requiredContext: new Map().set('key2', 'value2'), injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar (context only matches item 1).
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    // Set context {key1: value1, key2: value2} on toolbar.
    fixture.componentInstance.context.set(new Map().set('key1', 'value1').set('key2', 'value2'));
    await fixture.whenStable();

    // Expect toolbar.
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
      {
        type: 'menu-item',
        iconLigature: 'icon-2',
      },
    ]);
  });

  it('should change toolbar name', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    let toolbarFactoryFunction1CallCount = 0;
    let toolbarFactoryFunction2CallCount = 0;

    // Contribute to toolbar testee-1.
    contributeMenu('toolbar:testee-1', toolbar => {
      toolbarFactoryFunction1CallCount++;
      toolbar.addToolbarItem({icon: 'icon-1', onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Contribute to toolbar testee-2.
    contributeMenu('toolbar:testee-2', toolbar => {
      toolbarFactoryFunction2CallCount++;
      toolbar.addToolbarItem({icon: 'icon-2', onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunction1CallCount).toBe(0);
    expect(toolbarFactoryFunction2CallCount).toBe(0);

    // Set toolbar name to testee-1.
    fixture.componentInstance.name.set('toolbar:testee-1');
    await fixture.whenStable();
    const toolbar1 = new ToolbarPO(fixture, 'toolbar:testee-1');

    // Expect toolbar.
    expect(toolbarFactoryFunction1CallCount).toBe(1);
    expect(toolbarFactoryFunction2CallCount).toBe(0);
    await expectAsync(toolbar1).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);

    // Set toolbar name to testee-2.
    fixture.componentInstance.name.set('toolbar:testee-2');
    await fixture.whenStable();
    const toolbar2 = new ToolbarPO(fixture, 'toolbar:testee-2');

    // Expect toolbar.
    expect(toolbarFactoryFunction1CallCount).toBe(1);
    expect(toolbarFactoryFunction2CallCount).toBe(1);
    await expectAsync(toolbar2).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-2',
      },
    ]);

    // Set toolbar name to testee-1.
    fixture.componentInstance.name.set('toolbar:testee-1');
    await fixture.whenStable();

    // Expect toolbar.
    expect(toolbarFactoryFunction1CallCount).toBe(1);
    expect(toolbarFactoryFunction2CallCount).toBe(1);
    await expectAsync(toolbar1).toEqualToolbar([
      {
        type: 'menu-item',
        iconLigature: 'icon-1',
      },
    ]);
  });

  it('should close menu when clicking toolbar item again', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
      teardown: {destroyAfterEach: false},
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Contribute to toolbar.
    contributeMenu('toolbar:testee', toolbar => toolbar
        .addMenu({icon: 'menu', cssClass: 'testee'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
      {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Click toolbar item.
    const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
    toolbar.item({cssClass: 'testee'}).nativeElement.click();
    const menu = new MenuPO(fixture);

    // Expect menu.
    await expectAsync(menu).toEqualMenu([
      {
        type: 'menu-item',
        labelText: 'label',
      },
    ]);

    // Click toolbar item again.
    toolbar.item({cssClass: 'testee'}).nativeElement.click();
    await fixture.whenStable();

    // Expect menu.
    await expectAsync(menu).notToBeAttached();
  });

  describe('Menu Item Properties', () => {

    it('should provide icon', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: icon, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'testee-1',
        },
      ]);

      // Update icon.
      icon.set('testee-2');

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: SpecTesteeComponent, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconComponent: {
            selector: 'spec-testee',
          },
        },
      ]);
    });

    it('should provide label', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon', label: 'testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon', label: label, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          labelText: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon', label: SpecTesteeComponent, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon',
          labelComponent: {
            selector: 'spec-testee',
          },
        },
      ]);
    });

    it('should provide tooltip', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({tooltip: 'testee', icon: 'icon', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({tooltip: tooltip, icon: 'icon', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          tooltip: 'testee-1',
        },
      ]);

      // Update tooltip.
      tooltip.set('testee-2');
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', disabled: true, onSelect: noop})
          .addToolbarItem({icon: 'icon-2', disabled: false, onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
          disabled: true,
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-2',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon', disabled: disabled, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          disabled: true,
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({checked: true, icon: 'icon', onSelect: noop})
          .addToolbarItem({checked: false, icon: 'icon', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({icon: 'icon', checked: checked, onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon',
          checked: true,
        },
      ]);

      // Update checked.
      checked.set(false);
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon',
          checked: false,
        },
      ]);
    });

    it('should provide control', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({control: SpecTesteeComponent}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          control: {
            selector: 'spec-testee',
          },
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({attributes: {attr1: 'testee-1', attr2: 'testee-2'}, icon: 'icon', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar.addToolbarItem({cssClass: ['testee-1', 'testee-2'], icon: 'icon', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          cssClass: ['testee-1', 'testee-2'],
        },
      ]);
    });
  });

  describe('Menu Properties', () => {

    it('should provide icon', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({icon: 'testee'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({icon: icon}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'testee-1',
        },
      ]);

      // Update icon.
      icon.set('testee-2');

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({icon: SpecTesteeComponent}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          iconComponent: {
            selector: 'spec-testee',
          },
        },
      ]);
    });

    it('should provide label', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({label: 'testee'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({label: label}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          labelText: 'testee-1',
        },
      ]);

      // Update label.
      label.set('testee-2');
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({label: SpecTesteeComponent}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          labelComponent: {
            selector: 'spec-testee',
          },
        },
      ]);
    });

    it('should provide tooltip', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({tooltip: 'testee', label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({tooltip: tooltip, label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          tooltip: 'testee-1',
        },
      ]);

      // Update tooltip.
      tooltip.set('testee-2');
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({disabled: true, label: 'label-1'}, menu => menu.addMenuItem({label: 'label', onSelect: noop}))
          .addMenu({disabled: false, label: 'label-2'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({disabled: disabled, label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          disabled: true,
        },
      ]);

      // Update disabled.
      disabled.set(false);
      await fixture.whenStable();

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          disabled: false,
        },
      ]);
    });

    it('should provide visualMenuHint', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({visualMenuHint: true, icon: 'icon'}, menu => menu.addMenuItem({label: 'label', onSelect: noop}))
          .addMenu({visualMenuHint: true, label: 'label'}, menu => menu.addMenuItem({label: 'label-1', onSelect: noop}))
          .addMenu({visualMenuHint: true, icon: 'icon', label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop}))
          .addMenu({visualMenuHint: false, icon: 'icon'}, menu => menu.addMenuItem({label: 'label', onSelect: noop}))
          .addMenu({visualMenuHint: false, label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop}))
          .addMenu({visualMenuHint: false, icon: 'icon', label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          visualMenuHint: true,
        },
        {
          type: 'menu',
          visualMenuHint: false,
        },
        {
          type: 'menu',
          visualMenuHint: false,
        },
        {
          type: 'menu',
          visualMenuHint: false,
        },
        {
          type: 'menu',
          visualMenuHint: false,
        },
        {
          type: 'menu',
          visualMenuHint: false,
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addMenu({cssClass: ['testee-1', 'testee-2'], label: 'label'}, menu => menu.addMenuItem({label: 'label', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu',
          cssClass: ['testee-1', 'testee-2'],
        },
      ]);
    });
  });

  describe('Group Properties', () => {

    it('should provide disabled', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addGroup({disabled: true}, toolbar => toolbar.addToolbarItem({icon: 'icon', onSelect: noop}))
          .addGroup({disabled: false}, toolbar => toolbar.addToolbarItem({icon: 'icon', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addGroup({disabled: disabled}, toolbar => toolbar.addToolbarItem({icon: 'icon', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
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

      // Expect toolbar.
      await expectAsync(toolbar).toEqualToolbar([
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

    it('should provide css class', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
        teardown: {destroyAfterEach: false},
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addGroup({cssClass: ['testee-1', 'testee-2']}, toolbar => toolbar.addToolbarItem({icon: 'icon', onSelect: noop})),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'group',
          cssClass: ['testee-1', 'testee-2'],
        },
      ]);
    });
  });

  describe('Toolbar Contribution Position', () => {

    it('should contribute at position start', async () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: ComponentFixtureAutoDetect, useValue: true},
        ],
      });

      const fixture = TestBed.createComponent(SpecRootComponent);

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addToolbarItem({icon: 'icon-2', onSelect: noop})
          .addToolbarItem({icon: 'icon-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to toolbar at position start.
      contributeMenu({location: 'toolbar:testee', position: 'start'}, toolbar => toolbar.addToolbarItem({icon: 'icon-testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-testee',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-2',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-3',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addToolbarItem({icon: 'icon-2', onSelect: noop})
          .addToolbarItem({icon: 'icon-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to toolbar at position end.
      contributeMenu({location: 'toolbar:testee', position: 'end'}, toolbar => toolbar.addToolbarItem({icon: 'icon-testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-2',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-3',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-testee',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addToolbarItem({name: 'menuitem:2', icon: 'icon-2', onSelect: noop})
          .addToolbarItem({icon: 'icon-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to toolbar before menuitem:2.
      contributeMenu({location: 'toolbar:testee', before: 'menuitem:2'}, toolbar => toolbar.addToolbarItem({icon: 'icon-testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-testee',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-2',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-3',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addToolbarItem({name: 'menuitem:2', icon: 'icon-2', onSelect: noop})
          .addToolbarItem({icon: 'icon-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to toolbar before menuitem:2.
      contributeMenu({location: 'toolbar:testee', after: 'menuitem:2'}, toolbar => toolbar.addToolbarItem({icon: 'icon-testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-2',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-testee',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-3',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addMenu({name: 'menu:2', icon: 'icon-2'}, menu => menu
            .addMenuItem({label: 'label-2', onSelect: noop}))
          .addToolbarItem({icon: 'icon-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to toolbar before menu:2.
      contributeMenu({location: 'toolbar:testee', before: 'menu:2'}, toolbar => toolbar.addToolbarItem({icon: 'icon-testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-testee',
        },
        {
          type: 'menu',
          iconLigature: 'icon-2',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-3',
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

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
          .addToolbarItem({icon: 'icon-1', onSelect: noop})
          .addMenu({name: 'menu:2', icon: 'icon-2'}, menu => menu
            .addMenuItem({label: 'label-2', onSelect: noop}))
          .addToolbarItem({icon: 'icon-3', onSelect: noop}),
        {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Contribute to toolbar after menu:2.
      contributeMenu({location: 'toolbar:testee', after: 'menu:2'}, toolbar => toolbar.addToolbarItem({icon: 'icon-testee', onSelect: noop}), {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Expect toolbar.
      const toolbar = new ToolbarPO(fixture, 'toolbar:testee');
      await expectAsync(toolbar).toEqualToolbar([
        {
          type: 'menu-item',
          iconLigature: 'icon-1',
        },
        {
          type: 'menu',
          iconLigature: 'icon-2',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-testee',
        },
        {
          type: 'menu-item',
          iconLigature: 'icon-3',
        },
      ]);
    });
  });
});

function noop() {
}

@Component({
  selector: 'spec-root',
  template: '<sci-toolbar [name]="name()" [context]="context()"/>',
  imports: [SciToolbarComponent],
})
class SpecRootComponent {
  public name = signal<`toolbar:${string}`>('toolbar:testee');
  public context = signal<Map<string, unknown>>(new Map());
}

@Component({
  selector: 'spec-testee',
  template: 'spec-testee',
  imports: [],
  host: {
    'class': 'testee',
  },
})
class SpecTesteeComponent {
}
