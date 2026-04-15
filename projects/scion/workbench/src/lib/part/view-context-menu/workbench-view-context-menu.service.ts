/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, inject, Injectable, Injector, input, inputBinding, Provider, runInInjectionContext, signal, TemplateRef} from '@angular/core';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {MenuItemConfig, WorkbenchConfig} from '../../workbench-config';
import {ViewId} from '../../workbench.identifiers';
import {WorkbenchView} from '../../view/workbench-view.model';
import {contributeMenu, Disposable, installMenuAccelerators, SciMenuFactory, SciMenuService} from '@scion/sci-components/menu';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {WORKBENCH_ELEMENT} from '../../workbench-element-references';
import {MaybeArray, SciComponentDescriptor} from '@scion/sci-components/common';
import {createDestroyableInjector} from '../../common/injector.util';
import {NgTemplateOutlet} from '@angular/common';
import {WorkbenchMenuItem, WorkbenchViewMenuItemFn} from '../../workbench.model';
import {WORKBENCH_VIEW_CONTEXT} from '../../view/workbench-view-context.provider';
import {WorkbenchMenuContextKeys} from '../../menu/workbench-menu-context-provider';

/**
 * Provides the contextmenu of a view.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewContextMenuService {

  private readonly _menuService = inject(SciMenuService);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _injector = inject(Injector);

  /**
   * Opens the context menu for the given view.
   */
  public open(event: MouseEvent, context: {viewId: ViewId}): void {
    this._menuService.open('menu:workbench.view.contextmenu.internal', {
      anchor: event,
      size: {width: 'var(--sci-workbench-contextmenu-width)'},
      context: this.createViewMenuContext(context.viewId), // Pass menu context to be independent of the invocation context.
    });
  }

  /**
   * Registers built-in view context menu items such as 'Close' and 'Move'.
   */
  public registerBuiltInMenuItems(): void {
    const config = this._workbenchConfig.viewMenuItems ?? {};
    if (config === false) {
      return;
    }

    // Contribute contextmenu.
    contributeMenu({location: 'menu:workbench.view.contextmenu.internal'}, menu => {
      const view = inject(WorkbenchView);

      // Add 'close' group.
      menu.addGroup(group => {
        this.registerCloseMenuItem(config.close ?? {}, group, view);
        this.registerCloseOtherTabsMenuItem(config.closeOthers ?? {}, group, view);
        this.registerCloseAllTabsMenuItem(config.closeAll ?? {}, group, view);
        this.registerCloseRightTabsMenuItem(config.closeToTheRight ?? {}, group, view);
        this.registerCloseLeftTabsMenuItem(config.closeToTheLeft ?? {}, group, view);
      });

      // Add group for the application to contribute to the contextmenu.
      menu.addGroup({name: 'menu:workbench.view.contextmenu'});

      // Add 'move' group.
      menu.addGroup({name: 'menu:workbench.view.contextmenu.internal:move'}, group => {
        this.registerMoveRightMenuItem(config.moveRight ?? {}, group, view);
        this.registerMoveLeftMenuItem(config.moveLeft ?? {}, group, view);
        this.registerMoveUpMenuItem(config.moveUp ?? {}, group, view);
        this.registerMoveDownMenuItem(config.moveDown ?? {}, group, view);
      });

      menu.addGroup(group => {
        this.registerMoveToNewWindowMenuItem(config.moveToNewWindow ?? {}, group, view);
      });
    });
  }

  /**
   * Registers a legacy view menu contribution in the view context menu.
   */
  public registerLegacyMenuContribution(legacyViewMenuItemFn: WorkbenchViewMenuItemFn): Disposable {
    const contribution = contributeMenu('menu:workbench.view.contextmenu', group => {
      const view = inject(ɵWorkbenchView);

      const legacyViewMenuItem = legacyViewMenuItemFn(view);
      if (!legacyViewMenuItem) {
        return;
      }

      const providers: Provider[] = [
        {provide: ɵWorkbenchView, useValue: view},
        {provide: WorkbenchView, useExisting: ɵWorkbenchView},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchView},
        inject(WORKBENCH_VIEW_CONTEXT, {optional: true}) ?? [],
      ];
      const injector = createDestroyableInjector({providers});

      group.addMenuItem({
        label: coerceComponent(legacyViewMenuItem, {providers, view}),
        onSelect: () => runInInjectionContext(injector, () => legacyViewMenuItem.onAction()),
        accelerator: legacyViewMenuItem.accelerator,
        disabled: legacyViewMenuItem.disabled,
        cssClass: legacyViewMenuItem.cssClass,
      })
    }, {injector: this._injector}); // Pass root injector to be independent of the invocation context.

    return {
      dispose: () => contribution.dispose(),
    };

    function coerceComponent(legacyViewMenuItem: WorkbenchMenuItem, options: {view: WorkbenchView, providers: Provider[]}): SciComponentDescriptor {
      if (legacyViewMenuItem.content instanceof TemplateRef) {
        return {
          component: MenuItemComponent,
          bindings: [
            inputBinding('template', signal(legacyViewMenuItem.content)),
            inputBinding('context', signal({$implicit: options.view, ...legacyViewMenuItem.inputs})),
          ],
          providers: options.providers,
          injector: legacyViewMenuItem.injector,
          cssClass: legacyViewMenuItem.cssClass,
        };
      }
      else {
        return {
          component: legacyViewMenuItem.content,
          bindings: Object.entries(legacyViewMenuItem.inputs ?? {}).map(([key, value]) => inputBinding(key, signal(value))),
          providers: options.providers,
          injector: legacyViewMenuItem.injector,
          cssClass: legacyViewMenuItem.cssClass,
        };
      }
    }
  }

  /**
   * Installs view context menu keyboard shortcuts on the given element.
   */
  public installAccelerators(target: MaybeArray<Element | ElementRef<Element>> | undefined, context: {viewId: ViewId}): Disposable {
    return installMenuAccelerators('menu:workbench.view.contextmenu.internal', {
      target,
      context: this.createViewMenuContext(context.viewId), // Specify menu context to be independent of the invocation context.
      injector: this._injector, // Specify root injector to be independent of the invocation context.
    });
  }

  private registerCloseMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.close_tab.action',
        accelerator: config.accelerator ?? ['ctrl', 'k'],
        cssClass: config.cssClass ?? 'e2e-close',
        disabled: computed(() => !view.isClosable()),
        onSelect: () => void view.close(),
      });
    }
  }

  private registerCloseOtherTabsMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.close_other_tabs.action',
        accelerator: config.accelerator ?? ['ctrl', 'shift', 'k'],
        cssClass: config.cssClass ?? 'e2e-close-other-tabs',
        disabled: computed(() => view.first() && view.last()),
        onSelect: () => void view.close('other-views'),
      });
    }
  }

  private registerCloseAllTabsMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.close_all_tabs.action',
        accelerator: config.accelerator ?? ['ctrl', 'shift', 'alt', 'k'],
        cssClass: config.cssClass ?? 'e2e-close-all-tabs',
        onSelect: () => void view.close('all-views'),
      });
    }
  }

  private registerCloseRightTabsMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.close_tabs_to_the_right.action',
        accelerator: config.accelerator,
        cssClass: config.cssClass ?? 'e2e-close-right-tabs',
        disabled: view.last,
        onSelect: () => void view.close('views-to-the-right'),
      });
    }
  }

  private registerCloseLeftTabsMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.close_tabs_to_the_left.action',
        accelerator: config.accelerator,
        cssClass: config.cssClass ?? 'e2e-close-left-tabs',
        disabled: view.first,
        onSelect: () => void view.close('views-to-the-left'),
      });
    }
  }

  private registerMoveRightMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.move_tab_to_the_right.action',
        accelerator: ['ctrl', 'alt', 'end'],
        cssClass: config.cssClass ?? 'e2e-move-right',
        disabled: computed(() => view.first() && view.last()),
        onSelect: () => view.move(view.part().id, {region: 'east'}),
      });
    }
  }

  private registerMoveLeftMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.move_tab_to_the_left.action',
        accelerator: config.accelerator,
        cssClass: config.cssClass ?? 'e2e-move-left',
        disabled: computed(() => view.first() && view.last()),
        onSelect: () => view.move(view.part().id, {region: 'west'}),
      });
    }
  }

  private registerMoveUpMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.move_tab_up.action',
        accelerator: config.accelerator,
        cssClass: config.cssClass ?? 'e2e-move-up',
        disabled: computed(() => view.first() && view.last()),
        onSelect: () => view.move(view.part().id, {region: 'north'}),
      });
    }
  }

  private registerMoveDownMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (config) {
      group.addMenuItem({
        label: '%scion.workbench.move_tab_down.action',
        accelerator: config.accelerator,
        cssClass: config.cssClass ?? 'e2e-move-down',
        disabled: computed(() => view.first() && view.last()),
        onSelect: () => view.move(view.part().id, {region: 'south'}),
      });
    }
  }

  private registerMoveToNewWindowMenuItem(config: MenuItemConfig | false, group: SciMenuFactory, view: WorkbenchView): void {
    if (!config || view.part().peripheral()) {
      return;
    }

    group.addMenuItem({
      label: '%scion.workbench.move_tab_to_new_window.action',
      accelerator: config.accelerator,
      cssClass: config.cssClass ?? 'e2e-move-to-new-window',
      onSelect: () => view.move('new-window'),
    });
  }

  /**
   * Creates the menu context for given view.
   */
  private createViewMenuContext(viewId: ViewId): Map<string, unknown> {
    const view = this._viewRegistry.get(viewId);
    return new Map()
      .set(WorkbenchMenuContextKeys.ViewId, view.id)
      .set(WorkbenchMenuContextKeys.PartId, view.part().id)
      .set(WorkbenchMenuContextKeys.Peripheral, view.part().peripheral())
      .set(WorkbenchMenuContextKeys.MainArea, view.part().isInMainArea);
  }
}

@Component({
  selector: 'wb-menu-item',
  template: '<ng-container *ngTemplateOutlet="template(); context: context()"/>',
  imports: [NgTemplateOutlet],
})
class MenuItemComponent {

  public readonly template = input.required<TemplateRef<unknown>>();
  public readonly context = input<{[name: string]: unknown}>();
}
