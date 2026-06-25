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
import {By} from '@angular/platform-browser';
import {Component, inject, Injector} from '@angular/core';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {noop} from 'rxjs';
import {ViewId} from '../../workbench.identifiers';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPart} from '../workbench-part.model';
import {WorkbenchService} from '../../workbench.service';
import {toShowCustomMatcher} from '../../testing/jasmine/matcher/to-show.matcher';
import {contributeMenu} from '@scion/components/menu';
import {MenuPO} from '../../testing/jasmine/matcher/menu.po';
import {toEqualMenuCustomMatcher} from '../../testing/jasmine/matcher/to-equal-menu.matcher';
import {toBeAttachedCustomMatcher} from '../../testing/jasmine/matcher/to-be-attached.matcher';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {WORKBENCH_ELEMENT} from '../../workbench-element-references';

describe('View Menu', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
    jasmine.addAsyncMatchers(toBeAttachedCustomMatcher);
  });

  it(`should run factory function in view and part injection context`, async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .addView('view.1', {partId: 'part.left'})
            .addView('view.2', {partId: 'part.right'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to view context menu.
    contributeMenu('menu:workbench.view.contextmenu', menu => {
      menu.addMenuItem({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}, viewId=${inject(WorkbenchView).id}]`, onSelect: noop});
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Expect view 1 menu.
    await openViewContextMenu({viewId: 'view.1'});
    const menu1 = new MenuPO(fixture, {selector: 'sci-menu[data-viewid="view.1"]'});
    await expectAsync(menu1).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: '[elementId=view.1, partId=part.left, viewId=view.1]',
          },
        ],
      },
    ]);

    // Expect view 2 menu.
    await openViewContextMenu({viewId: 'view.2'});
    const menu2 = new MenuPO(fixture, {selector: 'sci-menu[data-viewid="view.2"]'});
    await expectAsync(menu2).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: '[elementId=view.2, partId=part.right, viewId=view.2]',
          },
        ],
      },
    ]);
  });

  it('should provide `WorkbenchView` for injection in component menu item', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.part')
            .addView('view.1', {partId: 'part.part'}),
        }),
      ],
    });

    @Component({selector: 'spec-label', template: 'spec-label'})
    class SpecLabelComponent {
      public view = inject(WorkbenchView);
    }

    @Component({selector: 'spec-icon', template: 'spec-icon'})
    class SpecIconComponent {
      public view = inject(WorkbenchView);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Register menu item.
    contributeMenu('menu:workbench.view.contextmenu', menu => menu
      .addMenuItem({label: SpecLabelComponent, icon: SpecIconComponent, onSelect: noop}), {injector: TestBed.inject(Injector)},
    );
    await fixture.whenStable();

    // Open context menu.
    await openViewContextMenu({viewId: 'view.1'});

    // Expect WorkbenchView can be injected.
    const labelComponent = fixture.debugElement.parent!.query(By.directive(SpecLabelComponent)).componentInstance as SpecLabelComponent;
    expect(labelComponent.view).toBe(TestBed.inject(WorkbenchService).getView('view.1')!);
    const iconComponent = fixture.debugElement.parent!.query(By.directive(SpecIconComponent)).componentInstance as SpecIconComponent;
    expect(iconComponent.view).toBe(TestBed.inject(WorkbenchService).getView('view.1')!);
  });

  it('should invoke onSelect callback on pressing keystroke', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: false,
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .addView('view.1', {partId: 'part.left'})
            .addView('view.2', {partId: 'part.right'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const spy = spyOn(console, 'log').and.callThrough();

    // Contribute to view context menu.
    contributeMenu('menu:workbench.view.contextmenu', menu => {
      const view = inject(WorkbenchView);
      menu.addMenuItem({
        label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}, viewId=${inject(WorkbenchView).id}]`,
        accelerator: {alt: true, key: '1'},
        onSelect: () => {
          console.log(`menu:workbench.view.contextmenu onSelect ${view.id}`);
        },
      });
    }, {injector: TestBed.inject(Injector)});
    await fixture.whenStable();

    // Press alt-1 on document.
    document.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();

    // Press alt-1 on left part bar.
    const leftPartBar = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-part-bar'));
    leftPartBar.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();

    // Press alt-1 on view 1 slot.
    const viewSlot1 = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-view-slot'));
    viewSlot1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();

    // Press alt-1 on view 1 tab.
    const viewTab1 = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-view-tab[data-viewid="view.1"'));
    viewTab1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();

    // Press alt-1 on left right bar.
    const rightPartBar = fixture.debugElement.query(By.css('wb-part[data-partid="part.right"] wb-part-bar'));
    rightPartBar.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();

    // Press alt-1 on view 2 slot.
    const viewSlot2 = fixture.debugElement.query(By.css('wb-part[data-partid="part.right"] wb-view-slot'));
    viewSlot2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();

    // Press alt-1 on view 2 tab.
    const viewTab2 = fixture.debugElement.query(By.css('wb-part[data-partid="part.right"] wb-view-tab[data-viewid="view.2"'));
    viewTab2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).not.toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.1');
    expect(console.log).toHaveBeenCalledWith('menu:workbench.view.contextmenu onSelect view.2');
    spy.calls.reset();
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

    it('should contribute menu item (built-in menu items excluded)', async () => {
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

      // Contribute menu item.
      contributeMenu('menu:workbench.view.contextmenu', menu => menu
        .addMenuItem({label: 'testee', onSelect: noop}), {injector: TestBed.inject(Injector)},
      );

      // Expect menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              label: 'testee',
            },
          ],
        },
      ]);
    });

    it('should contribute menu item (built-in menu items included)', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .addView('view.100', {partId: 'part.part'}),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Contribute menu item.
      contributeMenu('menu:workbench.view.contextmenu', menu => menu
        .addMenuItem({label: 'testee', onSelect: noop}), {injector: TestBed.inject(Injector)},
      );

      // Expect menu.
      await openViewContextMenu({viewId: 'view.100'});
      const menu = new MenuPO(fixture);
      await expectAsync(menu).toEqualMenu([
        {
          type: 'group',
          children: [
            {
              type: 'menu-item',
              cssClass: 'e2e-close',
            },
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
              label: 'testee',
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
              cssClass: 'e2e-move-up',
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
});

async function openViewContextMenu(locator: {viewId: ViewId}): Promise<void> {
  const viewTabElement = document.querySelector<HTMLElement>(`wb-view-tab[data-viewid="${locator.viewId}"]`)!;
  viewTabElement.dispatchEvent(new MouseEvent('contextmenu'));
  await waitUntilStable();
}
