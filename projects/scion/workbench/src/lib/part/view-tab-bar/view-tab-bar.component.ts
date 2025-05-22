/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, inject, input, NgZone, OnDestroy, signal, untracked, viewChild, viewChildren} from '@angular/core';
import {ViewTabComponent} from '../view-tab/view-tab.component';
import {map, mergeMap, takeUntil} from 'rxjs/operators';
import {from, fromEvent, merge, Observable, OperatorFunction, Subject, timer} from 'rxjs';
import {ConstrainFn, ViewTabDragImageRenderer} from '../../view-dnd/view-tab-drag-image-renderer.service';
import {ViewDragData, ViewDragService, ViewMoveEvent} from '../../view-dnd/view-drag.service';
import {getCssTranslation, setCssClass, setCssVariable, unsetCssClass, unsetCssVariable} from '../../common/dom.util';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {filterArray, subscribeIn} from '@scion/toolkit/operators';
import {SciViewportComponent} from '@scion/components/viewport';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {boundingClientRect, dimension} from '@scion/components/dimension';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID} from '../../workbench-id';
import {clamp} from '../../common/math.util';
import {PART_BAR_ELEMENT} from '../part-bar/part-bar.component';

/**
 * Renders view tabs of a {@link WorkbenchPart}.
 *
 * Tabs are added to a viewport, which the user can scroll if not enough space. The viewport grows with its tabs,
 * allowing actions to be placed directly after the last tab or on the right side.
 *
 * ## Drag and Drop
 * This component subscribes to drag events to visualize tabs during a drag operation. The drag operation is initiated in {@link ViewTabComponent}.
 *
 * We use native drag and drop to support dragging views to other windows.
 *
 * Following events are triggered:
 * - dragstart: when start dragging a tab (only received in the tabbar where the drag operation has started)
 * - dragend:   when end dragging a tab, either via drop or cancel (only received in the tabbar where the drag operation has started)
 * - dragenter: when a tab enters the tabbar
 * - dragover:  when dragging a tab over the tabbar, every few hundred milliseconds
 * - dragleave: when a tab leaves the tabbar
 * - drop:      when the user drops a tab in the tabbar
 *
 * - Note that `dragleave` event is not fired on drop action. Therefore, always handle both events, `dragleave` and `drop` events, respectively.
 *
 * ## Terminology
 * - Drag source: Tab that is being dragged.
 * - Drop target: Tab before which to insert the drag source on drop, or `end` if dropping it after the last tab.
 * - Drag image:  Image for the tab to be dragged. We do not use the native drag image support to control drag image position and size,
 *                e.g., to snap the drag image to the tabbar when dragging near it.
 */
@Component({
  selector: 'wb-view-tab-bar',
  templateUrl: './view-tab-bar.component.html',
  styleUrls: ['./view-tab-bar.component.scss'],
  imports: [
    SciViewportComponent,
    ViewTabComponent,
  ],
})
export class ViewTabBarComponent implements OnDestroy {

  /**
   * Defines the maximum available width for the tab bar, used to constrain the drag image to the tab bar bounds.
   */
  public readonly maxWidth = input.required<number>();

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _partBarElement = inject(PART_BAR_ELEMENT);
  private readonly _viewportChange$ = new Subject<void>();
  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _router = inject(ɵWorkbenchRouter);
  private readonly _viewTabDragImageRenderer = inject(ViewTabDragImageRenderer);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _zone = inject(NgZone);
  private readonly _viewTabs = viewChildren(ViewTabComponent);
  private readonly _hostBoundingClientRect = boundingClientRect(inject(ElementRef));
  private readonly _viewportComponent = viewChild.required(SciViewportComponent);
  private readonly _viewportComponentElement = viewChild.required(SciViewportComponent, {read: ElementRef<HTMLElement>});
  private readonly _tabCornerRadiusElement = viewChild.required('tab_corner_radius', {read: ElementRef<HTMLElement>});
  private readonly _viewportBoundingBox = boundingClientRect(this._viewportComponentElement);
  private readonly _canDrop = inject(ViewDragService).canDrop(inject(ɵWorkbenchPart));

  /**
   * Reference to the part.
   */
  protected readonly part = inject(ɵWorkbenchPart);

  /**
   * Reference to the tab before which to insert the drag source on drop, or `end` if dropping it after the last tab.
   */
  protected dropTargetViewTab = signal<ViewTabComponent | 'end' | null>(null);

  /**
   * Reference to the tab where the drag operation was started.
   * This reference is only set if the drag operation started on a tab of this tabbar.
   */
  protected dragSourceViewTab = signal<ViewTabComponent | null>(null);

  /**
   * Transfer data of the tab being dragged over this tabbar.
   */
  private _dragData: ViewDragData | null = null;

  /**
   * Function for snapping the drag image to the tabbar when dragging near it.
   */
  private _constrainFn: ConstrainFn | null = null;

  /**
   * Signals when unsetting drag state.
   */
  private _onUnsetDragState = signal<void>(undefined, {equal: () => false});

  /**
   * Tabbar indents where to display the rounded bottom corners of the first and last view tab.
   */
  private _tabbarIndent = {
    left: 0,
    right: 0,
  };

  constructor() {
    this.installActiveViewScroller();
    this.installScrolledIntoViewUpdater();
    this.installViewDragListener();
    this.installTabbarIndentSizeTracker();
    this.installViewportChangeTracker();
  }

  /**
   * Method invoked when the user starts dragging a tab of this tabbar, only in the tabbar where the drag started.
   */
  private onTabDragStart(): void {
    // Memoize drag data.
    this._dragData = this._viewDragService.viewDragData()!;

    // Indicate dragging over this tabbar.
    this._viewDragService.signalTabbarDragEnter(this.part.id);

    // Snap drag image to tabbar when dragging near it.
    this._constrainFn = this.createDragImageConstrainFn();
    this._viewTabDragImageRenderer.setConstrainDragImageRectFn(this._constrainFn);

    // Disable pointer events to not break the drag operation (in Firefox, but not Chrome and Edge).
    requestAnimationFrame(() => setCssClass(this._host, 'pointer-events-disabled'));

    // Set CSS class to not animate start dragging.
    setCssClass(this._host, 'on-drag-start');
    this.onDragAnimationStable(() => unsetCssClass(this._host, 'on-drag-start'));

    // Check if the user continues dragging over this tabbar.
    // If not, the user has quickly dragged the tab out of the tabbar, so manually call `onTabbarDragEnter` and `onTabbarDragLeave`.
    fromEvent<DragEvent>(window, 'dragenter', {once: true})
      .pipe(takeUntil(merge(fromEvent(this._partBarElement, 'dragenter'), fromEvent(this._partBarElement, 'dragend'))))
      .subscribe(event => {
        this.onTabbarDragEnter(event);
        this.onTabbarDragLeave(event);
      });
  }

  /**
   * Method invoked when the user ends dragging a tab of this tabbar, either by drop or cancel, only in the tabbar where the drag started.
   */
  private onTabDragEnd(event: DragEvent): void {
    // Unset drag state only on cancel, not on drop, to prevent tabs from temporarily reverting to their pre-drag state. Drag state is reset in `onTabMoved` after a drop.
    if (event.dataTransfer!.dropEffect === 'none') {
      // Reactivate the drag source view on cancel.
      void this.dragSourceViewTab()?.view().activate({skipLocationChange: true});
      // Unset drag state.
      this.unsetDragState();
    }
  }

  /**
   * Method invoked when the layout has changed after a drop. The drop may not be related to a tab of this tabbar.
   */
  private onTabMoved(event: ViewMoveEvent): void {
    // Unset drag state only if no new drag has started since the drop.
    if (this._dragData?.uid === event.dragData?.uid) {
      this.unsetDragState();
    }
  }

  /**
   * Method invoked when the user drags a tab into this tabbar.
   */
  private onTabbarDragEnter(event: DragEvent): void {
    if (!this._canDrop()) {
      return;
    }

    // Memoize drag data.
    const dragData = this._dragData = this._viewDragService.viewDragData()!;

    // Indicate dragging over this tabbar.
    this._viewDragService.signalTabbarDragEnter(this.part.id);

    // Snap drag image to tabbar when dragging near it.
    this._constrainFn = this.createDragImageConstrainFn();
    this._viewTabDragImageRenderer.setConstrainDragImageRectFn(this._constrainFn);

    // Set drag source, but only if started the drag operation in this part.
    // We do not set the drag source in `dragstart` to not break the drag operation (in Chrome and Edge, but not Firefox).
    if (this._host.classList.contains('on-drag-start')) {
      this.dragSourceViewTab.set(this._viewTabs().find(viewTab => viewTab.view().id === dragData.viewId) ?? null);
      setCssVariable(this._host, {'--ɵpart-bar-drag-placeholder-width': `${dragData.viewTabWidth}px`});
    }

    // Locate the tab the user is dragging over.
    this.dropTargetViewTab.set(this.computeDropTarget(event));

    // Disable pointer events on the tabbar for a smoother drag and drop experience when quickly swapping tabs.
    setCssClass(this._host, 'pointer-events-disabled');

    // Set CSS class to animate entering the tabbar.
    setCssClass(this._host, 'on-drag-enter');
    this.onDragAnimationStable(() => unsetCssClass(this._host, 'on-drag-enter'));

    // Inject drag source width into CSS.
    setCssVariable(this._host, {'--ɵpart-bar-drag-source-width': `${dragData.viewTabWidth}px`});
  }

  /**
   * Method invoked when the user drags a tab out of this tabbar.
   */
  private onTabbarDragLeave(event: DragEvent): void {
    if (!this._canDrop()) {
      return;
    }

    // Set CSS class to animate leaving the tabbar, but not when canceling the drag operation for instant reset.
    // Pointer coordinates are not set when the drag operation is canceled or when dragging the tab out of the window.
    if (event.screenX || event.screenY) {
      setCssClass(this._host, 'on-drag-leave');
      this.onDragAnimationStable(() => unsetCssClass(this._host, 'on-drag-leave'));
    }

    // Activate the adjacent tab, only if the drag operation is not canceled.
    // The drag event does not provide information about cancelation. Therefore, we wait for a macrotask, canceling it when receiving `dragend`, i.e., the drag operation has been canceled.
    if (this.dragSourceViewTab()?.view().active) {
      timer(0)
        .pipe(takeUntil(fromEvent(window, 'dragend')))
        .subscribe(() => void this._router.navigate(layout => layout.activateAdjacentView(this.dragSourceViewTab()!.view().id), {skipLocationChange: true}));
    }

    // Clean up drag state.
    this.unsetDragState({unsetDragSource: false, unsetDragData: false});
  }

  /**
   * Method invoked when the user is dragging a tab over this tabbar.
   */
  private onTabbarDragOver(event: DragEvent, dragDistance: number, scrollDistance: number): void {
    NgZone.assertNotInAngularZone();

    if (!this._canDrop()) {
      return;
    }

    event.preventDefault(); // allow view drop

    // Locate the tab the user is dragging over.
    // - Run in animation frame for better performance, most noticeable on lower CPU power.
    // - Do not wait for the drag animation to complete for a smoother drag and drop experience when quickly moving the tab in the tabbar.
    requestAnimationFrame(() => {
      // Skip if the drag operation has ended.
      if (this._viewDragService.isDragOverTabbar !== this.part.id) {
        return;
      }

      // Ignore the drag distance if `drag-enter` animation is in progress to avoid incorrect drop target computation when dragging a tab from the left.
      if (this._host.classList.contains('on-drag-enter')) {
        this.dropTargetViewTab.set(this.computeDropTarget(event, 0));
      }
      // Compute drop target only when moving the drag pointer to prevent tabs from sliding back and forth (while animation is in progress)
      else if (dragDistance) {
        this.dropTargetViewTab.set(this.computeDropTarget(event, dragDistance));
      }
      // Compute drop target when scrolling the viewport, i.e., not moving the drag pointer but scrolling the viewport because placed the drag pointer at the viewport edges.
      else if (scrollDistance) {
        this.dropTargetViewTab.set(this.computeDropTarget(event, scrollDistance));
      }

      // Set CSS class to animate dragging over the tabbar.
      setCssClass(this._host, 'drag-over');

      // Calculate the new size of the drag source placeholder.
      // The placeholder expands the viewport when dragging a tab to the right, moving part actions along with the dragover event.
      setCssVariable(this._host, {'--ɵpart-bar-drag-placeholder-width': `${this.calculateDragPlaceholderWidth(event)}px`});
    });
  }

  /**
   * Method invoked when the user drops a tab in this tabbar.
   */
  private async onTabbarDrop(): Promise<void> {
    const dragData = this._dragData!;
    const dropTargetViewTab = this.dropTargetViewTab()!;
    const dropPosition = dropTargetViewTab === 'end' ? 'end' : this._viewTabs().indexOf(dropTargetViewTab);

    this._viewDragService.dispatchViewMoveEvent({
      source: {
        workbenchId: dragData.workbenchId,
        partId: dragData.partId,
        viewId: dragData.viewId,
        alternativeViewId: dragData.alternativeViewId,
        navigation: dragData.navigation,
        classList: dragData.classList,
      },
      target: {
        workbenchId: this._workbenchId,
        position: dropPosition,
        elementId: this.part.id,
      },
      dragData: dragData,
    });
  }

  /**
   * Locates the tab before which the dragged tab is to be inserted when it is dropped. Dragging beyond the last tab returns `end`.
   */
  private computeDropTarget(event: DragEvent, dragDistanceX: number = 0): ViewTabComponent | 'end' {
    const dragImage = this._viewTabDragImageRenderer.calculateDragImageRect(this._dragData!, event);
    const viewTabs = this._viewTabs().filter(viewTab => viewTab !== this.dragSourceViewTab());

    for (const viewTab of viewTabs) {
      const {left, width} = viewTab.boundingClientRect();
      const viewTabHCenter = left + (width / 2);

      // Moving the pointer to the left.
      if (dragDistanceX <= 0 && dragImage.left < viewTabHCenter) {
        return viewTab;
      }
      // Moving the pinter to the right.
      if (dragDistanceX > 0 && dragImage.right < viewTabHCenter) {
        return viewTab;
      }
    }
    return 'end';
  }

  /**
   * Creates the function for snapping the drag image to the tabbar when dragging near it.
   */
  private createDragImageConstrainFn(): ConstrainFn {
    return (dragImage: DOMRect): DOMRect => new DOMRect(
      clamp(dragImage.x, {
        min: this._hostBoundingClientRect().left + this._tabbarIndent.left,
        max: this._hostBoundingClientRect().left + this.maxWidth() - dragImage.width - this._tabbarIndent.right,
      }),
      this._viewportBoundingBox().top,
      dragImage.width,
      this._viewportBoundingBox().height, // fit into tabbar, e.g., when dragging a tab into a tabbar of a different height
    );
  }

  /**
   * Calculates the width for the drag placeholder.
   *
   * The placeholder expands the viewport when dragging a tab to the right, moving part actions along with the dragover event.
   *
   * Calculation:
   * - When dragging over tabs, the width is equal to the width of the drag source.
   * - When dragging to the right of the last tab, the width of the placeholder is the distance between the last tab and the position of the drag pointer.
   */
  private calculateDragPlaceholderWidth(event: DragEvent): number {
    const viewDragImageRect = this._viewTabDragImageRenderer.calculateDragImageRect(this._dragData!, event);
    const lastViewTab = this._viewTabs().filter(viewTab => viewTab !== this.dragSourceViewTab()).at(-1);
    const lastViewTabRight = lastViewTab?.boundingClientRect().right ?? this._hostBoundingClientRect().left + this._tabbarIndent.left;
    return Math.max(lastViewTabRight + viewDragImageRect.width, viewDragImageRect.right) - lastViewTabRight;
  }

  /**
   * Indicates whether CSS animations have finished when dragging a tab over the tabbar.
   * The animation is considered stable when all tabs have moved to their final position.
   */
  private isDragAnimationStable(): boolean {
    const dropTargetViewTab = this.dropTargetViewTab();
    if (this._viewDragService.isDragOverTabbar !== this.part.id) {
      return this._viewTabs().every(viewTab => getCssTranslation(viewTab.host).translateX === 'none');
    }

    const viewTabs = this._viewTabs().filter(viewTab => viewTab !== this.dragSourceViewTab());
    const dropTargetIndex = dropTargetViewTab === 'end' ? viewTabs.length : viewTabs.indexOf(dropTargetViewTab!);
    const dragSourceWidth = this._dragData!.viewTabWidth;

    return viewTabs.every((viewTab, i) => {
      const viewTabTranslateX = getCssTranslation(viewTab.host).translateX;
      // Expect tabs preceding the drop target not to be shifted to the right.
      if (i < dropTargetIndex && viewTabTranslateX !== 'none') {
        return false;
      }
      // Expect drop target and tabs following the drop target to be shifted to the right.
      if (i >= dropTargetIndex && Math.floor(Number(viewTabTranslateX)) !== Math.floor(dragSourceWidth)) { // compare floored numbers because `translateX` is not precise
        return false;
      }
      return true;
    });
  }

  /**
   * Cleans up the drag state, unsetting drag data and drag source based on provided options.
   */
  private unsetDragState(options?: {unsetDragSource?: false; unsetDragData?: false}): void {
    this.dropTargetViewTab.set(null);
    this._onUnsetDragState.set();
    this._viewTabDragImageRenderer.unsetConstrainDragImageRectFn(this._constrainFn!);
    this._viewDragService.signalTabbarDragLeave(this.part.id);
    this._constrainFn = null;

    unsetCssClass(this._host, 'drag-over', 'pointer-events-disabled');
    unsetCssVariable(this._host, '--ɵpart-bar-drag-source-width', '--ɵpart-bar-drag-placeholder-width');

    if (options?.unsetDragSource ?? true) {
      this.dragSourceViewTab.set(null);
    }
    if (options?.unsetDragData ?? true) {
      this._dragData = null;
    }
  }

  /**
   * Executes given function when the drag animation has finished, i.e., tabs have transitioned to their final position.
   */
  private onDragAnimationStable(callback: () => void): void {
    if (NgZone.isInAngularZone()) {
      this._zone.runOutsideAngular(() => this.onDragAnimationStable(callback));
      return;
    }
    requestAnimationFrame(() => this.isDragAnimationStable() ? callback() : this.onDragAnimationStable(callback));
  }

  /**
   * Scrolls the tab of the active view into view.
   */
  private installActiveViewScroller(): void {
    effect(() => {
      // Track the active view.
      const activeViewId = this.part.activeViewId();
      // There may be no active view, e.g., if no view has been activated, or when dragging the last view out of the tabbar.
      if (!activeViewId) {
        return;
      }

      // Do not track rendered tabs in general to prevent unwanted scrolling when opening or closing inactive tabs.
      const viewTabs = untracked(() => this._viewTabs());

      // Get a reference to the currently rendered active tab, waiting if necessary by tracking the rendered tabs.
      const activeViewTab = viewTabs.find(viewTab => viewTab.view().id === activeViewId);
      if (!activeViewTab) {
        this._viewTabs(); // Track rendered tabs to re-execute once rendered.
        return;
      }

      // Track navigation of the active view, scrolling its tab into view if necessary.
      activeViewTab.view().navigation();

      // Track unsetting drag state to ensure the active view is scrolled into view after drop or cancel.
      this._onUnsetDragState();

      // Scroll the tab into view if scrolled out of view.
      untracked(() => requestAnimationFrame(() => {
        if (!this._viewportComponent().isElementInView(activeViewTab.host, 'full')) {
          this._viewportComponent().scrollIntoView(activeViewTab.host);
        }
      }));
    });
  }

  /**
   * Updates {@link ɵWorkbenchView} when its tab is scrolled into view.
   */
  private installScrolledIntoViewUpdater(): void {
    this._viewportChange$
      .pipe(
        map(() => this._viewTabs()),
        filterArray(viewTab => viewTab !== this.dragSourceViewTab()), // skip drag source as always scrolled out of view
        mergeMap(viewTabs => from(viewTabs)),
        takeUntilDestroyed(),
      )
      .subscribe(viewTab => {
        viewTab.view().scrolledIntoView = this._viewportComponent().isElementInView(viewTab.host, 'full');
      });
  }

  /**
   * Subscribes to drag events.
   */
  private installViewDragListener(): void {
    const zone = inject(NgZone);

    // Subscribe to drag events relevant for this tabbar.
    this._viewDragService.viewDrag$(this._partBarElement)
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        calculateDistance(() => this._viewportComponent()), // provide viewport lazily because not injected yet
        takeUntilDestroyed(),
      )
      .subscribe(({event, dragDistance, scrollDistance}) => {
        switch (event.type) {
          case 'dragstart':
            this.onTabDragStart();
            break;
          case 'dragend':
            this.onTabDragEnd(event);
            break;
          case 'dragenter':
            this.onTabbarDragEnter(event);
            break;
          case 'dragover':
            this.onTabbarDragOver(event, dragDistance, scrollDistance);
            break;
          case 'dragleave':
            this.onTabbarDragLeave(event);
            break;
          case 'drop':
            void this.onTabbarDrop();
            break;
        }
      });

    // Get notified when a view has moved in the layout.
    this._viewDragService.viewMoved$
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(event => this.onTabMoved(event));

    /**
     * Calculates the distance the drag pointer and viewport have moved since the last drag event.
     */
    function calculateDistance(viewport: () => SciViewportComponent): OperatorFunction<DragEvent, DragEventPlusDistance> {
      return source$ => new Observable<DragEventPlusDistance>(observer => {
        let lastScreenX: number | undefined;
        let lastScrollLeft: number | undefined;

        const subscription = source$.subscribe(event => {
          observer.next({
            event,
            dragDistance: event.screenX - (lastScreenX ?? event.screenX),
            scrollDistance: viewport().scrollLeft - (lastScrollLeft ?? viewport().scrollLeft),
          });
          lastScreenX = event.screenX;
          lastScrollLeft = viewport().scrollLeft;
        });
        return () => subscription.unsubscribe();
      });
    }
  }

  /**
   * Emits on {@link _viewportChange$} when the viewport size or scroll position changes.
   */
  private installViewportChangeTracker(): void {
    const viewportSize = dimension(computed(() => this._viewportComponentElement().nativeElement as HTMLElement));
    const viewportClientSize = dimension(computed(() => this._viewportComponent().viewportClientElement));
    const zone = inject(NgZone);

    // Detect resizing.
    effect(() => {
      // Track viewport and viewport client sizes.
      viewportSize();
      viewportClientSize();
      untracked(() => this._viewportChange$.next());
    });

    // Detect scrolling.
    effect(onCleanup => {
      const viewport = this._viewportComponent().viewportElement;
      untracked(() => {
        const subscription = fromEvent(viewport, 'scroll')
          .pipe(subscribeIn(fn => zone.runOutsideAngular(fn)))
          .subscribe(() => this._viewportChange$.next());
        onCleanup(() => subscription.unsubscribe());
      });
    });
  }

  /**
   * Tracks the tabbar indents.
   */
  private installTabbarIndentSizeTracker(): void {
    const tabCornerRadiusDimension = dimension(this._tabCornerRadiusElement);

    effect(() => {
      const indent = tabCornerRadiusDimension().clientWidth;
      this._tabbarIndent = {left: indent, right: indent};
      setCssVariable(this._host, {
        '--ɵpart-bar-indent-left': `${this._tabbarIndent.left}px`,
        '--ɵpart-bar-indent-right': `${this._tabbarIndent.right}px`,
      });
    });
  }

  public ngOnDestroy(): void {
    this.unsetDragState();
  }
}

/**
 * Contains the event plus drag and scroll distance.
 */
interface DragEventPlusDistance {
  /**
   * Reference to the drag event.
   */
  event: DragEvent;
  /**
   * Distance the drag pointer has moved since the last drag event.
   */
  dragDistance: number;
  /**
   * Distance the viewport has scrolled since the last drag event.
   */
  scrollDistance: number;
}
