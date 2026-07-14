/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, InjectionToken, NgZone, Signal, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {ViewTabBarComponent} from '../view-tab-bar/view-tab-bar.component';
import {dimension} from '@scion/components/dimension';
import {EMPTY, fromEvent, mergeMap, of, pairwise, withLatestFrom} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SciTextPipe, text} from '@scion/components/text';
import {contributeMenu, SciMenuFactory, SciMenuRef, SciMenuService, SciToolbarComponent} from '@scion/components/menu';
import {ViewListToolbarIconComponent} from '../view-list-toolbar-icon/view-list-toolbar-icon.component';
import {WorkbenchView} from '../../view/workbench-view.model';
import {PART_NULL_ACTIVE_VIEW_ID, WorkbenchMenuContexts} from '../../menu/workbench-menu-environment';
import {ToolbarVisibilityDirective} from '../../common/toolbar-visibility.directive';
import {WorkbenchRouter} from '../../routing/workbench-router.service';

/**
 * DI token to inject the HTML element of the {@link PartBarComponent}.
 */
export const PART_BAR_ELEMENT = new InjectionToken<HTMLElement>('PART_BAR_ELEMENT');

@Component({
  selector: 'wb-part-bar',
  templateUrl: './part-bar.component.html',
  styleUrls: ['./part-bar.component.scss'],
  imports: [
    ViewTabBarComponent,
    SciTextPipe,
    SciToolbarComponent,
    ToolbarVisibilityDirective,
  ],
  // Required for backward compatibility for zone-based applications to support child components with eager change detection.
  changeDetection: ChangeDetectionStrategy.Eager, // eslint-disable-line @angular-eslint/prefer-on-push-component-change-detection
  providers: [
    {provide: PART_BAR_ELEMENT, useFactory: () => inject(ElementRef).nativeElement as HTMLElement},
  ],
})
export class PartBarComponent {

  private readonly _router = inject(ɵWorkbenchRouter);
  private readonly _viewTabBar = viewChild(ViewTabBarComponent, {read: ElementRef<HTMLElement>});
  private readonly _fillerElement = viewChild.required<ElementRef<HTMLElement>>('filler');

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly maxViewTabBarWidth: Signal<number>;
  protected readonly toolbarContext = computed(() => new Map().set(WorkbenchMenuContexts.ViewId, this.part.activeView()?.id ?? PART_NULL_ACTIVE_VIEW_ID));

  constructor() {
    this.maxViewTabBarWidth = this.calculateMaxViewTabBarWidth();
    this.installActivityMinimizer();
    this.contributeToolbar();
  }

  protected onPartBarMouseDown(event: Event): void {
    // Activate the part or its active view, if any.
    this.part.activeView() ? void this.part.activeView()!.activate() : void this.part.activate();

    // Prevent default to maintain focus on part and view content.
    event.preventDefault();
  }

  /**
   * Minimizes activities when double-clicking the tabbar or filler, but only if the first and second clicks target the same DOM element.
   * This prevents unintended maximization or minimization when double-clicking a tab's close button.
   */
  private installActivityMinimizer(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const zone = inject(NgZone);

    effect(onCleanup => {
      // Maximization/minimization is only supported for tabs not located in the peripheral area.
      if (this.part.peripheral()) {
        return;
      }

      const viewTabBar = this._viewTabBar()?.nativeElement as HTMLElement | undefined;
      const filler = this._fillerElement().nativeElement;

      untracked(() => {
        const subscription = fromEvent<MouseEvent>([filler].concat(viewTabBar ?? []), 'dblclick')
          .pipe(
            withLatestFrom(fromEvent<MouseEvent>(host, 'click', {capture: true}).pipe(pairwise(), subscribeIn(fn => zone.runOutsideAngular(fn)))),
            mergeMap(([dblClickEvent, [clickEvent1, clickEvent2]]) => clickEvent1.target === clickEvent2.target ? of(dblClickEvent) : EMPTY),
          )
          .subscribe(event => {
            void this._router.navigate(layout => layout.toggleMaximized());
            event.preventDefault();
          });
        onCleanup(() => subscription.unsubscribe());
      });
    });
  }

  /**
   * Calculates the maximum available width for the view tab bar.
   */
  private calculateMaxViewTabBarWidth(): Signal<number> {
    const fillerDimension = dimension(this._fillerElement);
    const viewTabBarDimension = dimension(this._viewTabBar);
    return computed(() => (viewTabBarDimension()?.offsetWidth ?? 0) + fillerDimension().offsetWidth);
  }

  /**
   * Contributes built-in toolbar items and menus.
   */
  private contributeToolbar(): void {
    // Clear view context to contribute to parts with and without views.
    const requiredContext = new Map().set(WorkbenchMenuContexts.ViewId, undefined);

    // Contribute to the toolbar.
    contributeViewListMenu();
    contributeAdditionsToolbarMenu();
    contributeMinimizeButton();

    /**
     * Contributes a menu with views opened in this part.
     */
    function contributeViewListMenu(): void {
      const part = inject(ɵWorkbenchPart);
      const router = inject(WorkbenchRouter);
      const viewContainerRef = inject(ViewContainerRef);

      // Contribute view list menu button.
      // Instead of contributing a toolbar menu, we contribute a toolbar button, enabling opening the menu via accelerator. The menu is opened programmatically via `MenuService`.
      contributeMenu({location: 'toolbar:workbench.part.toolbar', position: 'end'}, toolbar => {
        let menuRef: SciMenuRef | undefined; // Reference to currently opened menu.

        // TODO [menu]: Analyze why injecting SciMenuService outside `contributeMenu` does not work!
        const menuService = inject(SciMenuService);

        toolbar.addToolbarButton({
          name: 'menuitem:workbench.part.viewlist.internal',
          icon: ViewListToolbarIconComponent,
          visible: computed(() => part.views().length > 0),
          tooltip: '%scion.workbench.show_open_tabs.tooltip',
          accelerator: {ctrl: true, key: '/'},
          cssClass: ['view-list-toolbar-item', 'e2e-view-list'],
          attributes: {'data-partid': part.id},
          onSelect: () => {
            if (!menuRef) {
              const toolbarButton = document.querySelector<HTMLElement>(`button.menu-item.view-list-toolbar-item[data-partid="${part.id}"]`)!;
              const openedViaAccelerator = document.activeElement !== toolbarButton;

              // Open menu, focusing the filter field if opened via accelerator.
              menuRef = menuService.open('menu:workbench.part.viewlist.menu', {
                anchor: toolbarButton,
                filter: {notFoundMessage: '%scion.workbench.no_views.message', focus: openedViaAccelerator},
                cssClass: 'e2e-view-list',
                maxHeight: '300px',
                maxWidth: 'calc(var(--sci-workbench-tab-max-width) + 3em)', // limit max width to max tab width (plus some space for the action toolbar)
                // Insert the menu outside the toolbar in the DOM. By default, it is added after the anchor, i.e., as a child of the toolbar.
                // As a child, its mousedown events bubble to the toolbar and are prevented by the partbar, preventing native focusing of the filter field.
                viewContainerRef,
              });
              menuRef.onClose(() => menuRef = undefined);
            }
            else {
              menuRef.close();
            }
          },
        });
      }, {requiredContext});

      // Contribute view list menu.
      contributeMenu('menu:workbench.part.viewlist.menu', menu => {
        menu.addGroup(group => populateViewListGroup(group, part.views().filter(view => !view.scrolledIntoView())));
        menu.addGroup(group => populateViewListGroup(group, part.views().filter(view => view.scrolledIntoView())));

        function populateViewListGroup(group: SciMenuFactory, views: WorkbenchView[]): void {
          for (const view of views) {
            const title = untracked(() => text(view.title));
            const heading = untracked(() => text(view.heading));
            const filterText = computed(() => `${title() ?? ''} ${heading() ?? ''}`);

            group.addMenuItem({
              label: computed(() => title() ?? ''),
              tooltip: computed(() => heading() ?? ''),
              actions: actions => {
                actions.addToolbarButton({
                  icon: 'scion.close',
                  visible: view.isClosable,
                  tooltip: '%scion.workbench.close.tooltip',
                  cssClass: 'e2e-close',
                  onSelect: () => void view.close(),
                });
              },
              active: view.active,
              onFilter: filter => filterText().toLowerCase().includes(filter.toLowerCase()),
              // Perform navigation to update activation instant, required to scroll currently active view into view.
              onSelect: () => void router.navigate(layout => layout.activateView(view.id), {skipLocationChange: true}),
            });
          }
        }
      }, {requiredContext});
    }

    /**
     * Contributes a menu for the application to contribute to the toolbar.
     *
     * Public contribution point: 'menu:workbench.part.toolbar'.
     */
    function contributeAdditionsToolbarMenu(): void {
      contributeMenu({location: 'toolbar:workbench.part.toolbar', after: 'menuitem:workbench.part.viewlist.internal'}, toolbar => {
        toolbar.addToolbarMenu({name: 'menuitem:workbench.part.additions.internal', icon: 'scion.more_vertical', visualMenuIndicator: false, menu: {name: 'menu:workbench.part.toolbar'}});
      }, {requiredContext});
    }

    /**
     * Contributes minimize button. Only visible for the top-right part in an activity.
     */
    function contributeMinimizeButton(): void {
      const part = inject(ɵWorkbenchPart);
      const router = inject(ɵWorkbenchRouter);

      contributeMenu({location: 'toolbar:workbench.part.toolbar', after: 'menuitem:workbench.part.additions.internal'}, toolbar => {
        toolbar.addToolbarButton({
          icon: 'scion.minimize',
          visible: part.canMinimize,
          tooltip: '%scion.workbench.minimize.tooltip',
          cssClass: 'e2e-minimize',
          onSelect: () => void router.navigate(layout => layout.toggleActivity(part.activity()!.id)),
        });
      }, {requiredContext});
    }
  }
}
