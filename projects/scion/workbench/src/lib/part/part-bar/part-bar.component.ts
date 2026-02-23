/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, inject, InjectionToken, NgZone, Signal, untracked, viewChild} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {ViewTabBarComponent} from '../view-tab-bar/view-tab-bar.component';
import {dimension} from '@scion/components/dimension';
import {EMPTY, fromEvent, mergeMap, of, pairwise, withLatestFrom} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SciTextPipe, text} from '@scion/sci-components/text';
import {contributeMenu, SciMenuFactory, SciToolbarComponent, SciToolbarFactory, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {ViewListToolbarIconComponent} from '../view-list-toolbar-icon/view-list-toolbar-icon.component';
import {WorkbenchView} from '../../view/workbench-view.model';
import {PART_CONTEXT_VIEW_ID, WorkbenchMenuContextKeys} from '../../menu/workbench-menu-environment-provider';
import {ToolbarVisibilityDirective} from '../../common/toolbar-visibility.directive';

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
  protected readonly toolbarActiveViewContext = computed(() => new Map().set(WorkbenchMenuContextKeys.ViewId, this.part.activeView()?.id ?? PART_CONTEXT_VIEW_ID));

  constructor() {
    this.maxViewTabBarWidth = this.calculateMaxViewTabBarWidth();
    this.installActivityMinimizer();

    contributeMenu({location: 'toolbar:workbench.part.toolbar', position: 'end'}, toolbar => {
      this.contributeViewListMenuButton(toolbar);
      this.contributeToolbarAdditionsMenu(toolbar);
      this.contributeMinimizeButton(toolbar);
    }, {requiredContext: new Map().set(WorkbenchMenuContextKeys.ViewId, undefined)}); // clear view constraint to contribute to parts with and without views

    // Contribute viewlist menu items via separate contribution to scope its reactive context, i.e., to not re-create other menu items when views are added, removed, or scrolled.
    contributeMenu('menu:workbench.part.toolbar:viewlist', menu => {
      menu.addGroup(group => this.contributeViewMenuItems(group, this.part.views().filter(view => !view.scrolledIntoView())));
      menu.addGroup(group => this.contributeViewMenuItems(group, this.part.views().filter(view => view.scrolledIntoView())));
    }, {requiredContext: new Map().set(WorkbenchMenuContextKeys.ViewId, undefined)}); // clear view constraint to contribute to parts with and without views
  }

  protected onPartBarMouseDown(event: Event): void {
    // Activate the part or its active view, if any.
    this.part.activeView() ? void this.part.activeView()!.activate() : void this.part.activate();

    // Prevent default to maintain focus on part and view content.
    event.preventDefault();
  }

  protected onToolbarMouseDown(): void {
    // Activate the part or its active view, if any.
    // Otherwise, if the toolbar is configured to display on hover or focus only, a menu opened from the toolbar would close when the pointer leaves the menu popover or the part.
    this.part.activeView() ? void this.part.activeView()!.activate() : void this.part.activate();

    // TODO [menu] write test, then, this comment can be removed
    // Do not `preventDefault` on mousedown, unlike on the part bar. Otherwise, since the toolbar (or its menus) is a child of the part bar,
    // `preventDefault` would break toolbar/menu interaction, like clicking the menu filter field to gain focus.
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
   * Contributes a menu for the application to contribute to the toolbar.
   *
   * Public contribution point: 'menu:workbench.part.toolbar'
   */
  private contributeToolbarAdditionsMenu(toolbar: SciToolbarFactory): void {
    toolbar.addMenu({name: 'menu:workbench.part.toolbar', icon: 'more_vert', visualMenuHint: false}, menu => menu);
  }

  private contributeViewListMenuButton(toolbar: SciToolbarFactory): void {
    toolbar.addMenu({
      name: 'menu:workbench.part.toolbar:viewlist',
      icon: ViewListToolbarIconComponent,
      tooltip: '%scion.workbench.show_open_tabs.tooltip',
      visualMenuHint: false,
      filter: {notFoundText: '%scion.workbench.no_views.message'},
      maxHeight: '300px',
      maxWidth: 'calc(var(--sci-workbench-tab-max-width) + 3em)', // plus actionbar width
    } satisfies SciToolbarMenuDescriptor, menu => menu);
  }

  private contributeViewMenuItems(group: SciMenuFactory, views: WorkbenchView[]): void {
    for (const view of views) {
      const title = untracked(() => text(view.title));
      const heading = untracked(() => text(view.heading));

      group.addMenuItem({
        label: computed(() => title() || ''),
        tooltip: computed(() => join([title(), heading()], {delimiter: '\n'})),
        actions: actions => {
          if (view.isClosable()) {
            actions.addToolbarItem({
              icon: 'scion.close',
              tooltip: '%scion.workbench.close.tooltip',
              cssClass: 'e2e-close',
              onSelect: () => void view.close(),
            });
          }
        },
        active: view.active,
        // Perform navigation to update activation instant, required to scroll currently active view into view.
        onSelect: () => void this._router.navigate(layout => layout.activateView(view.id), {skipLocationChange: true}),
      });
    }
  }

  private contributeMinimizeButton(toolbar: SciToolbarFactory): void {
    if (this.part.canMinimize()) {
      toolbar.addToolbarItem({
        icon: 'scion.minimize',
        tooltip: '%scion.workbench.minimize.tooltip',
        cssClass: 'e2e-minimize',
        onSelect: () => void this._router.navigate(layout => layout.toggleActivity(this.part.activity()!.id)),
      });
    }
  }

  /**
   * Calculates the maximum available width for the view tab bar.
   */
  private calculateMaxViewTabBarWidth(): Signal<number> {
    const fillerDimension = dimension(this._fillerElement);
    const viewTabBarDimension = dimension(this._viewTabBar);
    return computed(() => (viewTabBarDimension()?.offsetWidth ?? 0) + fillerDimension().offsetWidth);
  }
}

function join(tokens: unknown[], options: {delimiter: string}): string {
  return tokens.filter(token => token !== null && token !== undefined).join(options.delimiter);
}
