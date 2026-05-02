/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DoCheck, DOCUMENT, effect, inject, Injector, NgZone, runInInjectionContext, signal, Signal, untracked, WritableSignal} from '@angular/core';
import {filter, map, scan} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID, WorkbenchDialog, WorkbenchDialogService, WorkbenchMenuContexts, WorkbenchNotification, WorkbenchPart, WorkbenchRouter, WorkbenchService, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {Settings} from './settings.service';
import {installFocusHighlighter} from './focus-highlight/focus-highlighter';
import {installGlasspaneHighlighter} from './glasspane-highlight/glasspane-highlighter';
import {installMicrofrontendApplicationLabels} from './microfrontend-application-labels/microfrontend-application-labels';
import {contributeMenu} from '@scion/components/menu';
import {ViewMoveDialogTestPageComponent} from './test-pages/view-move-dialog-test-page/view-move-dialog-test-page.component';
import {ViewInfoDialogComponent} from './view-info-dialog/view-info-dialog.component';
import {createDestroyableInjector} from '@scion/components/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  host: {
    '[attr.data-workbench-id]': 'workbenchId',
    '[attr.data-perspective-id]': 'activePerspective()?.id',
    '[attr.data-navigationid]': 'navigationId()',
  },
})
export class AppComponent implements DoCheck {

  private readonly _zone = inject(NgZone);
  private readonly _logAngularChangeDetectionCycles = inject(Settings).logAngularChangeDetectionCycles;

  protected readonly workbenchStartup = inject(WorkbenchStartup);
  protected readonly activePerspective = inject(WorkbenchService).activePerspective;
  protected readonly workbenchId = inject(WORKBENCH_ID);
  protected readonly workbenchRouter = inject(WorkbenchRouter);
  /**
   * Unique id that is set after a navigation has been performed.
   *
   * @see RouterPagePO
   */
  protected readonly navigationId = this.computeNavigationId();

  constructor() {
    this.installPropagatedKeyboardEventLogger();
    this.provideWorkbenchService();
    this.contributeNewTabToolbarItem();
    this.contributeViewContextMenuAdditions();
    installFocusHighlighter();
    installGlasspaneHighlighter();
    installMicrofrontendApplicationLabels();
    this.contributeSampleMenus();
  }

  public ngDoCheck(): void {
    if (this._logAngularChangeDetectionCycles()) {
      console.log('[AppComponent] Angular change detection cycle');
    }
  }

  private computeNavigationId(): Signal<string | undefined> {
    const navigationId$ = inject(Router).events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
        scan(navigationId => navigationId + 1, 0),
        map(navigationId => `${navigationId}`),
      );
    return toSignal(navigationId$, {initialValue: undefined});
  }

  /**
   * Logs propagated keyboard events, i.e., keyboard events propagated across iframe boundaries.
   *
   * Do not install via host listener to not trigger change detection for each keyboard event.
   */
  private installPropagatedKeyboardEventLogger(): void {
    fromEvent<KeyboardEvent>(inject(DOCUMENT), 'keydown')
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe((event: KeyboardEvent) => {
        if (!event.isTrusted && (event.target as Element).tagName === 'SCI-ROUTER-OUTLET') {
          console.debug(`[AppComponent][synth-event][event=${event.type}][key=${event.key}][key.control=${event.ctrlKey}][key.shift=${event.shiftKey}][key.alt=${event.altKey}][key.meta=${event.metaKey}]`);
        }
      });
  }

  private contributeNewTabToolbarItem(): void {
    contributeMenu('toolbar:workbench.part.tabbar', toolbar => {
      const part = inject(WorkbenchPart);
      if (part.peripheral()) {
        return;
      }

      toolbar.addToolbarItem('add', () => void this.workbenchRouter.navigate(['/start-page'], {target: 'blank', partId: part.id, position: 'end'}));
    });
  }

  private contributeViewContextMenuAdditions(): void {
    // Contribute menu item to move view to new window.
    contributeMenu({location: 'menu:workbench.view.contextmenu.internal:move'}, menu => {
      const view = inject(WorkbenchView);
      const workbenchDialogService = inject(WorkbenchDialogService);

      menu.addMenuItem({
        label: 'Move View...',
        cssClass: 'e2e-move-view',
        onSelect: () => void workbenchDialogService.open(ViewMoveDialogTestPageComponent, {
          inputs: {view},
          modality: 'application', // to also open dialog if view is inactive
          cssClass: 'e2e-move-view',
        }),
      });
    });

    // Contribute menu item to show view info.
    contributeMenu('menu:workbench.view.contextmenu', menu => {
      const view = inject(WorkbenchView);
      const workbenchDialogService = inject(WorkbenchDialogService);

      menu.addMenuItem({
        label: 'Show View Info',
        cssClass: 'e2e-show-view-info',
        accelerator: {key: 'F1'},
        onSelect: () => void workbenchDialogService.open(ViewInfoDialogComponent, {
          inputs: {view},
          modality: 'application', // to also open dialog if view is inactive
          cssClass: 'e2e-view-info',
        }),
      });
    });
  }

  /**
   * Injects {@link WorkbenchService} into the global window object for tests to interact with the workbench.
   */
  private provideWorkbenchService(): void {
    (window as unknown as Record<string, unknown>)['__workbenchService'] = inject(WorkbenchService);
  }

  /**
   * Contributes sample toolbars and menus when `showSampleMenus` application setting is enabled.
   */
  private contributeSampleMenus(): void {
    const showSampleMenus = inject(Settings).showSampleMenus;
    const injector = inject(Injector);

    effect(onCleanup => {
      if (!showSampleMenus()) {
        return;
      }

      untracked(() => {
        const contributionInjector = createDestroyableInjector({parent: injector});
        onCleanup(() => contributionInjector.destroy());

        runInInjectionContext(contributionInjector, () => {
          this.contributeWorkbenchActivityMenu();
          this.contributeWorkbenchPartToolbarMenu();
          this.contributeWorkbenchDialogToolbarMenu();
          this.contributeWorkbenchNotificationToolbarMenu();
          this.contributeWorkbenchViewContextMenu();
        });
      });
    });
  }

  private contributeWorkbenchActivityMenu(): void {
    contributeMenu('menu:workbench.activitybar:activities', menu => menu
      .addMenuItem({icon: 'bookmark', label: 'Bookmarks', onSelect})
      .addMenuItem({icon: 'play_circle', label: 'Run', onSelect})
      .addMenuItem({icon: 'play_circle', label: 'Debug', onSelect})
      .addMenuItem({icon: 'earthquake', label: 'Profiler', onSelect}),
    );
  }

  private contributeWorkbenchPartToolbarMenu(): void {
    contributeMenu('menu:workbench.part.toolbar', menu => {
      const part = inject(WorkbenchPart);
      const flag1 = signal(true);
      const flag2 = signal(true);
      const viewMode = signal<string>('dock_pinned');
      const moveTo = signal<string>('dock_to_left');

      menu
        .addMenuItem({label: 'Expand All', accelerator: {ctrl: true, key: '+', location: 'numpad'}, onSelect: () => console.log(`>>> Ctrl+NumPad+ [location=menu:workbench.part.toolbar, contributor=${part.id}]`)})
        .addMenuItem({label: 'Collapse All', accelerator: {ctrl: true, key: '-', location: 'numpad'}, onSelect: () => console.log(`>>> Ctrl+NumPad- [location=menu:workbench.part.toolbar, contributor=${part.id}]`)})
        .addGroup(group => group
          .addMenuItem({label: 'Navigate with Single Click', checked: flag1, onSelect: () => flag1.update(value => !value)})
          .addMenuItem({label: 'Always Select Opened Element', checked: flag2, onSelect: () => flag2.update(value => !value)}),
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: {ctrl: true, key: 'F'}, onSelect: () => console.log(`>>> Ctrl+F [location=menu:workbench.part.toolbar, contributor=${part.id}]`)}),
        )
        .addGroup(group => group
          .addMenu({label: 'View Mode'}, menu => menu
            .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned'), onSelect: () => viewMode.set('dock_pinned')})
            .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned'), onSelect: () => viewMode.set('dock_unpinned')})
            .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock'), onSelect: () => viewMode.set('unddock')})
            .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float'), onSelect: () => viewMode.set('float')})
            .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window'), onSelect: () => viewMode.set('window')}),
          )
          .addMenu({label: 'Move To'}, menu => menu
            .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top'), onSelect: () => moveTo.set('left_top')})
            .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom'), onSelect: () => moveTo.set('left_bottom')})
            .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left'), onSelect: () => moveTo.set('bottom_left')})
            .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right'), onSelect: () => moveTo.set('bottom_right')})
            .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom'), onSelect: () => moveTo.set('right_bottom')})
            .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top'), onSelect: () => moveTo.set('right_top')}),
          )
          .addMenu({label: 'Resize'}, menu => menu
            .addMenuItem('Stretch to Left', onSelect)
            .addMenuItem('Stretch to Right', onSelect)
            .addMenuItem('Stretch to Top', onSelect)
            .addMenuItem('Stretch to Bottom', onSelect)
            .addMenuItem('Maximize Tool Window', onSelect),
          ),
        )
        .addMenuItem('Remove from Sidebar', onSelect);
    }, {requiredContext: new Map().set(WorkbenchMenuContexts.Peripheral, true)});

    contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
      const flag1 = signal(true);
      const flag2 = signal(true);
      const flag3 = signal(false);
      const flag4 = signal(true);
      const flag6 = signal(true);
      const flag7 = signal(true);
      const flag8 = signal(false);
      const flag9 = signal(false);
      const flag10 = signal(true);
      const flag11 = signal(true);
      const flag12 = signal(false);
      const flag13 = signal(false);
      const flag14 = signal(true);
      const flag15 = signal(true);
      const flag16 = signal(false);
      const flag17 = signal(false);
      const flag18 = signal(false);
      const flag19 = signal(true);
      const flag20 = signal(false);
      const flag21 = signal(false);
      const flag22 = signal(true);
      const flag23 = signal(true);
      const flag24 = signal(true);

      toolbar
        .addMenu({icon: 'visibility'}, menu => menu
          .addGroup({label: 'Sort'}, group => group
            .addMenuItem({label: 'Alphabetically', checked: flag1, onSelect: () => flag1.update(value => !value)})
            .addMenuItem({label: 'By Type', checked: flag23, onSelect: () => flag23.update(value => !value)})
            .addMenuItem({label: 'By Visibility', checked: flag24, onSelect: () => flag24.update(value => !value)}),
          )
          .addGroup({label: 'Show'}, group => group
            .addMenuItem({label: 'Fields', checked: flag2, onSelect: () => flag2.update(value => !value)})
            .addMenuItem({label: 'Inherited', checked: flag3, onSelect: () => flag3.update(value => !value)})
            .addMenuItem({label: 'Inherited from Object', checked: flag4, onSelect: () => flag4.update(value => !value)}),
          )
          .addMenu({icon: 'tv_options_edit_channels', label: 'Adavanced Settings', filter: true}, menu => {
            // Add 'View in Groups' group.
            menu.addGroup({
              label: 'View in Groups',
              actions: actions => actions
                .addToolbarItem({icon: 'done_all', tooltip: 'Select All', onSelect: () => selectAll(flag6, flag7, flag8, flag9, flag10, flag11, flag12, flag13)})
                .addToolbarItem({icon: 'remove_done', tooltip: 'Deselect All', onSelect: () => deselectAll(flag6, flag7, flag8, flag9, flag10, flag11, flag12, flag13)}),
            }, group => group
              .addMenuItem({label: 'Databases and Schemas', checked: flag6, onSelect: () => flag6.update(value => !value)})
              .addMenuItem({label: 'Server and Database Objects', checked: flag7, onSelect: () => flag7.update(value => !value)})
              .addMenuItem({label: 'Schema Objects', checked: flag8, onSelect: () => flag8.update(value => !value)})
              .addMenuItem({label: 'Object Elements', checked: flag9, onSelect: () => flag9.update(value => !value)})
              .addGroup(group => group
                .addMenuItem({label: 'Separate Procedures and Functions', checked: flag10, onSelect: () => flag10.update(value => !value)})
                .addMenuItem({label: 'Place Table Elements Under Schema', checked: flag11, onSelect: () => flag11.update(value => !value)})
                .addMenuItem({label: 'Use Natural Order When Sorting', checked: flag12, onSelect: () => flag12.update(value => !value)})
                .addMenuItem({label: 'Sort folders and Data Sources', checked: flag13, onSelect: () => flag13.update(value => !value)}),
              ));

            // Add 'Show Elements' group.
            menu.addGroup({
              label: 'Show Elements',
              collapsible: {collapsed: true},
              actions: actions => actions
                .addToolbarItem({icon: 'done_all', tooltip: 'Select All', onSelect: () => selectAll(flag14, flag15, flag16, flag17, flag18, flag19)})
                .addToolbarItem({icon: 'remove_done', tooltip: 'Deselect All', onSelect: () => deselectAll(flag14, flag15, flag16, flag17, flag18, flag19)}),
            }, group => group
              .addMenuItem({label: 'All Namespaces', checked: flag14, onSelect: () => flag14.update(value => !value)})
              .addMenuItem({label: 'Empty Groups', checked: flag15, onSelect: () => flag15.update(value => !value)})
              .addMenuItem({label: 'Single-Object Levels', checked: flag16, onSelect: () => flag16.update(value => !value)})
              .addMenuItem({label: 'Generate Objects', checked: flag17, onSelect: () => flag17.update(value => !value)})
              .addMenuItem({label: 'Virtual Objects', checked: flag18, onSelect: () => flag18.update(value => !value)})
              .addMenuItem({label: 'Query Files', checked: flag19, onSelect: () => flag19.update(value => !value)}));

            // Add 'Node Detail' group.
            menu.addGroup({
              label: 'Node Detail',
              actions: actions => actions
                .addToolbarItem({icon: 'done_all', tooltip: 'Select All', onSelect: () => selectAll(flag20, flag21, flag22)})
                .addToolbarItem({icon: 'remove_done', tooltip: 'Deselect All', onSelect: () => deselectAll(flag20, flag21, flag22)}),
            }, group => group
              .addMenuItem({label: 'Comments Instead of Details', checked: flag20, onSelect: () => flag20.update(value => !value)})
              .addMenuItem({label: 'Schema Refresh Time', checked: flag21, onSelect: () => flag21.update(value => !value)})
              .addMenuItem({label: 'Bold Folders and Data Sources', checked: flag22, onSelect: () => flag22.update(value => !value)}));
          }),
        );

      function deselectAll(...flags: Array<WritableSignal<boolean>>): boolean {
        flags.forEach(flag => flag.set(false));
        return false;
      }

      function selectAll(...flags: Array<WritableSignal<boolean>>): boolean {
        flags.forEach(flag => flag.set(true));
        return false;
      }
    }, {requiredContext: new Map().set(WorkbenchMenuContexts.Peripheral, true)});
  }

  private contributeWorkbenchDialogToolbarMenu(): void {
    contributeMenu('menu:workbench.dialog.toolbar', menu => {
      const dialog = inject(WorkbenchDialog);
      return menu
        .addMenuItem('Settings...', onSelect)
        .addGroup(group => group
          .addMenuItem({label: 'Auto Save', checked: true, onSelect})
          .addMenuItem({label: 'Reset', accelerator: {ctrl: true, key: 'R'}, onSelect: () => console.log(`>>> Ctrl+R [location=menu:workbench.dialog.toolbar, contributor=${dialog.id}]`)}),
        );
    });
  }

  private contributeWorkbenchNotificationToolbarMenu(): void {
    contributeMenu('menu:workbench.notification.toolbar', menu => {
      const notification = inject(WorkbenchNotification);
      return menu
        .addMenuItem('Settings...', onSelect)
        .addMenuItem('Don\'t Show Again For This Project', onSelect)
        .addMenuItem({label: 'Don\'t Show Again', accelerator: {ctrl: true, key: 'I'}, onSelect: () => console.log(`>>> Ctrl+I [location=menu:workbench.notification.toolbar, contributor=${notification.id}]`)});
    });
  }

  private contributeWorkbenchViewContextMenu(): void {
    contributeMenu('menu:workbench.view.contextmenu', menu => {
      const view = inject(WorkbenchView);
      return menu.addMenuItem({label: 'Sample Menu Item', accelerator: {ctrl: true, shift: true, key: 'Y'}, onSelect: () => console.log(`>>> Ctrl+R [location=menu:workbench.view.contextmenu, contributor=${view.id}]`)});
    });
  }
}

function onSelect(): void {
  // NOOP
}
