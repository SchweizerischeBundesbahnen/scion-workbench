/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, ElementRef, HostListener, NgZone, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ViewTabComponent} from '../view-tab/view-tab.component';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {filter, map, mergeMap, startWith, switchMap, take, takeUntil} from 'rxjs/operators';
import {animationFrameScheduler, BehaviorSubject, combineLatest, from, interval, Observable, Subject} from 'rxjs';
import {ConstrainFn, ViewDragImageRect, ViewTabDragImageRenderer} from '../../view-dnd/view-tab-drag-image-renderer.service';
import {ViewDragData, ViewDragService} from '../../view-dnd/view-drag.service';
import {getCssTranslation, setCssClass, setCssVariable, unsetCssClass, unsetCssVariable} from '../../common/dom.util';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';
import {SciViewportComponent} from '@scion/components/viewport';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {SciDimensionModule} from '@scion/components/dimension';
import {AsyncPipe, NgFor} from '@angular/common';
import {PartActionBarComponent} from '../part-action-bar/part-action-bar.component';
import {ViewListButtonComponent} from '../view-list-button/view-list-button.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Renders view tabs and actions of a {@link WorkbenchPart}.
 *
 * Tabs are added to a viewport, which the user can scroll if not enough space. The viewport grows with its tabs,
 * allowing actions to be placed directly after the last tab or on the right side.
 *
 * ## Drag Events
 * We use native drag and drop to support dragging views to other windows.
 *
 * By listening to drag events, the tabbar visualizes tabs during a drag operation. The drag operation is initiated in {@link ViewTabComponent}.
 * - `dragstart` and `dragend` events are fired in the tabbar where the drag operation was initiated.
 * - `dragenter` event is fired when a tab enters the tabbar.
 * - `dragover` events are fired when dragging a tab over the tabbar.
 * - `dragleave` event is fired when a tab leaves the tabbar.
 * - `drop` event is fired when the user drops a tab in the tabbar.
 * - Note that `dragleave` event is not fired on drop action. Therefore, always handle both events, `dragleave` and `drop` events, respectively.
 *
 * ## Terminology
 * - Drag source: Tab that is being dragged.
 * - Drop target: Tab before which to insert the drag source on drop, or `end` if dropping it after the last tab.
 * - Drag image:  Image for the tab to be dragged. We do not use the native drag image support to control drag image position and size,
 *                e.g., to snap the drag image to the tabbar when dragging near it.
 */
@Component({
  selector: 'wb-part-bar',
  templateUrl: './part-bar.component.html',
  styleUrls: ['./part-bar.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    AsyncPipe,
    SciViewportComponent,
    SciDimensionModule,
    ViewTabComponent,
    PartActionBarComponent,
    ViewListButtonComponent,
  ],
})
export class PartBarComponent implements OnInit {

  private readonly _host: HTMLElement;
  private readonly _viewportChange$ = new Subject<void>();
  private readonly _viewTabs$ = new BehaviorSubject<ViewTabComponent[]>([]);
  private readonly _dragenter$ = new Subject<void>();
  private readonly _dragleave$ = new Subject<void>();
  private readonly _dragend$ = new Subject<void>();

  @ViewChild(SciViewportComponent, {static: true})
  private _viewport!: SciViewportComponent;

  @ViewChildren(ViewTabComponent)
  public set injectViewTabs(queryList: QueryList<ViewTabComponent>) {
    queryList.changes
      .pipe(startWith(queryList), takeUntilDestroyed(this._destroyRef))
      .subscribe(queryList => this._viewTabs$.next(queryList.toArray()));
  }

  /**
   * Reference to the tab before which to insert the drag source on drop, or `end` if dropping it after the last tab.
   */
  public dropTargetViewTab: ViewTabComponent | 'end' | null = null;

  /**
   * Reference to the tab where the drag operation was started.
   * This reference is only set if the drag operation started on a tab of this tabbar.
   */
  public dragSourceViewTab: ViewTabComponent | null = null;

  /**
   * Transfer data of the tab being dragged over this tabbar.
   */
  private _dragData: ViewDragData | null = null;

  /**
   * Function for snapping the drag image to the tabbar when dragging near it.
   */
  private _constrainFn: ConstrainFn | null = null;

  /**
   * Notifies when the drag animation has finished, i.e., tabs have transitioned to their final position.
   */
  private _dragAnimationStable$ = interval(0, animationFrameScheduler)
    .pipe(
      filter(() => this.isDragAnimationStable()),
      subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
      observeInside(continueFn => this._zone.run(continueFn)),
      map(() => undefined as void),
    );

  constructor(host: ElementRef<HTMLElement>,
              private _workbenchService: ɵWorkbenchService,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _router: WorkbenchRouter,
              private _viewTabDragImageRenderer: ViewTabDragImageRenderer,
              private _part: ɵWorkbenchPart,
              private _viewDragService: ViewDragService,
              private _destroyRef: DestroyRef,
              private _zone: NgZone) {
    this._host = host.nativeElement;
  }

  public ngOnInit(): void {
    this.installActiveViewScroller();
    this.installScrolledIntoViewUpdater();
    this.installViewDragListener();
  }

  @HostListener('dblclick', ['$event'])
  public onDoubleClick(event: MouseEvent): void {
    if (this._part.isInMainArea) {
      this._router.ɵnavigate(layout => layout.toggleMaximized()).then();
    }
    event.stopPropagation();
  }

  public get viewIds$(): Observable<string[]> {
    return this._part.viewIds$;
  }

  public onTabbarViewportDimensionChange(): void {
    this._viewportChange$.next();
  }

  public onTabbarViewportClientDimensionChange(): void {
    this._viewportChange$.next();
  }

  public onScroll(): void {
    this._viewportChange$.next();
  }

  /**
   * Method invoked when the user starts dragging a tab of this tabbar.
   */
  @HostListener('dragstart', ['$event'])
  public onViewDragStart(event: DragEvent): void {
    if (!this._viewDragService.isViewDragEvent(event)) {
      return;
    }

    const dragData = this._viewDragService.viewDragData!;
    const dragSourceIndex = this._viewTabs.findIndex(viewTab => viewTab.viewId === dragData.viewId);
    const dragSourceViewTab = this._viewTabs[dragSourceIndex];
    const dropTargetViewTab = this._viewTabs[dragSourceIndex + 1] ?? 'end';

    // When start dragging a view tab, we remove it from the tabbar by setting its `display` to `none` and render its drag image in `ViewTabDragImageRenderer` instead.
    // However, do not unset the `display` of the drag source during `dragstart`. Otherwise, the native drag operation would be corrupted in Chrome and Edge (but not in Firefox).
    animationFrameScheduler.schedule(() => {
      this.dragSourceViewTab = dragSourceViewTab;
      this.dropTargetViewTab = dropTargetViewTab; // Set drop target to avoid tab animation.
      setCssVariable(this._host, {
        '--drag-source-width': `${dragData.viewTabWidth}px`,
        '--drag-source-placeholder-width': `${dragData.viewTabWidth}px`,
      });
    });

    // When dragging a tab very quickly out of this tabbar, only the `dragstart` event gets fired, but not the `dragenter` event.
    // Therefore, we subscribe to global `dragenter` events and manually invoke `onTabbarDragLeave` to correctly display the tabs and the active view.
    this._viewDragService.viewDrag$(window, {eventType: ['dragenter']})
      .pipe(take(1), takeUntil(this._dragend$), takeUntilDestroyed(this._destroyRef))
      .subscribe(event => {
        // Check if the user continues dragging over this tabbar.
        // If not, the user has quickly dragged the tab out of the tabbar and we  manually call `onTabbarDragLeave`.
        if ((this._host.compareDocumentPosition(event.target as Element) & Node.DOCUMENT_POSITION_CONTAINED_BY) === 0) {
          this.onTabbarDragLeave();
        }
      });
  }

  /**
   * Method invoked when the user ends dragging a tab of this tabbar.
   *
   * Invoked only in the tabbar where the drag operation started, regardless of whether the drag operation was completed or canceled.
   */
  @HostListener('dragend')
  public onViewDragEnd(): void {
    this._dragend$.next();
    this.unsetDragState();
  }

  /**
   * Method invoked when the user drags a tab into this tabbar.
   */
  private onTabbarDragEnter(event: DragEvent): void {
    this._dragenter$.next();
    this._dragData = this._viewDragService.viewDragData!;

    // Inject constrain function into the drag image renderer to snap the drag image to the tabbar when dragging near it.
    this._constrainFn = this.createDragImageConstrainFn();
    this._viewTabDragImageRenderer.setConstrainDragImageRectFn(this._constrainFn);

    // Locate drop target to have a nice animation for the drag source placeholder.
    this.dropTargetViewTab = this.computeDropTarget(event);

    // Set the CSS class 'drag-enter' to indicate entering the tabbar.
    setCssClass(this._host, 'drag-enter', 'drag-over');
    this._dragAnimationStable$
      .pipe(take(1), takeUntil(this._dragenter$), takeUntilDestroyed(this._destroyRef))
      .subscribe({complete: () => unsetCssClass(this._host, 'drag-enter')});

    setCssVariable(this._host, {
      '--drag-source-width': `${this._dragData.viewTabWidth}px`,
      '--drag-source-placeholder-width': `${this._dragData.viewTabWidth}px`,
    });
  }

  /**
   * Method invoked when the user drags a tab out of this tabbar.
   */
  private onTabbarDragLeave(): void {
    this._dragleave$.next();

    // Set the CSS class 'drag-leave' to indicate leaving the tabbar.
    setCssClass(this._host, 'drag-leave');
    this._dragAnimationStable$
      .pipe(take(1), takeUntil(this._dragleave$), takeUntilDestroyed(this._destroyRef))
      .subscribe({complete: () => unsetCssClass(this._host, 'drag-leave')});

    this.unsetDragState({unsetDragSource: false});

    // Activate the view next to the view being dragged out of this tabbar. But, do not push the navigation into browsing history stack.
    if (this.dragSourceViewTab && this.dragSourceViewTab.active) {
      this._router.ɵnavigate(layout => layout.activateAdjacentView(this.dragSourceViewTab!.viewId), {skipLocationChange: true}).then();
    }
  }

  /**
   * Method invoked while the user is dragging a tab over this tabbar.
   */
  private onTabbarDragOver(event: DragEvent): void {
    event.preventDefault(); // allow view drop

    // Locate the tab over which the user is dragging the tab, but only after pending transitions have ended to prevent tabs from sliding back and forth.
    if (this.isDragAnimationStable()) {
      this.dropTargetViewTab = this.computeDropTarget(event);
      // Synchronize the width of the drag source placeholder with the drag pointer position to move actions along with the pointer.
      setCssVariable(this._host, {'--drag-source-placeholder-width': `${this.calculateDragSourcePlaceholderWidth(event)}px`});
    }
  }

  /**
   * Method invoked when the user drops a tab in this tabbar.
   */
  private onTabbarDrop(): void {
    const dropIndex = this.dropTargetViewTab === 'end' ? undefined : this._viewTabs.indexOf(this.dropTargetViewTab!);
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: this._dragData!.appInstanceId,
        partId: this._dragData!.partId,
        viewId: this._dragData!.viewId,
        viewUrlSegments: this._dragData!.viewUrlSegments,
      },
      target: {
        appInstanceId: this._workbenchService.appInstanceId,
        insertionIndex: dropIndex,
        partId: this._part.id,
      },
    });

    // Wait undoing the drag state until flushed tab changes to the DOM, i.e., after the layout routing cycle completes.
    // If we were to undo the drag state immediately during the course of the drop event, the tab layout would temporarily
    // revert to the state before the drag operation, resulting in an ugly flicker.
    this._workbenchLayoutService.whenLayoutChange().then(() => {
      this.unsetDragState();
    });
  }

  /**
   * Locates the tab before which the dragged tab is to be inserted when it is dropped. Dragging beyond the last tab returns `end`.
   */
  public computeDropTarget(event: DragEvent): ViewTabComponent | 'end' {
    const viewDragImageRect = this._viewTabDragImageRenderer.calculateDragImageRect(this._dragData!, event);
    const viewTabs = this._viewTabs.filter(viewTab => viewTab !== this.dragSourceViewTab);

    for (const viewTab of viewTabs) {
      const viewTabRect = viewTab.host.getBoundingClientRect();
      const viewTabMiddle = viewTabRect.left + (viewTabRect.width / 2);
      if (viewDragImageRect.left < viewTabMiddle && (viewTab !== this.dropTargetViewTab || viewDragImageRect.right < viewTabMiddle)) {
        return viewTab;
      }
    }
    return 'end';
  }

  /**
   * Creates the function for snapping the drag image to the tabbar when dragging near it.
   */
  private createDragImageConstrainFn(): ConstrainFn {
    const hostLeft = this._host.getBoundingClientRect().left;
    const maxViewportWidth = this.calculateMaxViewportWidth();
    return (rect: ViewDragImageRect): ViewDragImageRect => {
      return new ViewDragImageRect({
        x: Math.min(Math.max(hostLeft, rect.x), hostLeft + maxViewportWidth - rect.width),
        y: this._host.getBoundingClientRect().top,
        width: rect.width,
        height: this._host.offsetHeight,
      });
    };
  }

  /**
   * Calculates the maximum width of the tabbar viewport before an overflow would occur, which can then be used to constrain the drag image.
   *
   * To calculate the effective width, we need to simulate an overflow in the DOM. Therefore, call this method only from `dragstart` and not
   * from `dragover` and disable animations.
   */
  private calculateMaxViewportWidth(): number {
    const currentWidth = this._host.style.getPropertyValue('--drag-source-placeholder-width');

    // Disable animations during calculation and force the viewport to overflow.
    setCssClass(this._host, 'calculating-max-viewport-width');
    setCssVariable(this._host, {'--drag-source-placeholder-width': `${this._host.clientWidth}px`});
    try {
      return this._viewport.viewportElement.clientWidth;
    }
    finally {
      setCssVariable(this._host, {'--drag-source-placeholder-width': currentWidth || null});
      unsetCssClass(this._host, 'calculating-max-viewport-width');
    }
  }

  /**
   * Calculates the width for the drag source placeholder.
   *
   * - When dragging over tabs, the width is equal to the width of the drag source.
   * - When dragging to the right of the last tab, the width of the placeholder is calculated as the distance between the
   *   last tab and the position of the dragover event. Applying this width will resize the viewport, moving part actions along
   *   with the dragover event.
   */
  private calculateDragSourcePlaceholderWidth(event: DragEvent): number {
    const viewDragImageRect = this._viewTabDragImageRenderer.calculateDragImageRect(this._dragData!, event);
    const lastViewTab = this._viewTabs.filter(viewTab => viewTab !== this.dragSourceViewTab).at(-1);
    const lastViewTabRight = lastViewTab?.host.getBoundingClientRect().right ?? this._host.getBoundingClientRect().left;
    return Math.max(lastViewTabRight + viewDragImageRect.width, viewDragImageRect.right) - lastViewTabRight;
  }

  /**
   * Indicates whether CSS animations have finished when dragging a tab over the tabbar.
   * The animation is considered stable when all tabs have moved to their final position.
   */
  private isDragAnimationStable(): boolean {
    if (!this.dropTargetViewTab) {
      return this._viewTabs.every(viewTab => getCssTranslation(viewTab.host).translateX === 'none');
    }

    const viewTabs = this._viewTabs.filter(viewTab => viewTab !== this.dragSourceViewTab);
    const dropTargetIndex = this.dropTargetViewTab === 'end' ? viewTabs.length : viewTabs.indexOf(this.dropTargetViewTab!);
    const dragSourceWidth = `${this._dragData!.viewTabWidth}`;

    return viewTabs.every((viewTab, i) => {
      const viewTabTranslateX = getCssTranslation(viewTab.host).translateX;
      // Expect tabs preceding the drop target not to be shifted to the right.
      if (i < dropTargetIndex && viewTabTranslateX !== 'none') {
        return false;
      }
      // Expect drop target and tabs following the drop target to be shifted to the right.
      if (i >= dropTargetIndex && viewTabTranslateX !== dragSourceWidth) {
        return false;
      }
      return true;
    });
  }

  private unsetDragState(options?: { unsetDragSource?: boolean }): void {
    if (options?.unsetDragSource ?? true) {
      this.dragSourceViewTab = null;
    }

    this.dropTargetViewTab = null;
    this._dragData = null;
    this._viewTabDragImageRenderer.unsetConstrainDragImageRectFn(this._constrainFn!);
    this._constrainFn = null;

    unsetCssClass(this._host, 'drag-over');
    unsetCssVariable(this._host, '--drag-source-width', '--drag-source-placeholder-width');
  }

  private get _viewTabs(): ViewTabComponent[] {
    return this._viewTabs$.value;
  }

  /**
   * Scrolls the tab of the active view into view.
   */
  private installActiveViewScroller(): void {
    this._viewTabs$
      .pipe(
        switchMap(viewTabs => combineLatest(viewTabs.map(viewTab => viewTab.view.active$))),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        // There may be no active view in the tabbar, e.g., when dragging the last view out of the tabbar.
        this._viewTabs.find(viewTab => viewTab.active)?.scrollIntoView();
      });
  }

  /**
   * Updates {@link ɵWorkbenchView} when its tab is scrolled into view.
   */
  private installScrolledIntoViewUpdater(): void {
    this._viewportChange$
      .pipe(
        mergeMap(() => from(this._viewTabs)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(viewTab => {
        viewTab.view.scrolledIntoView = (viewTab.isScrolledIntoView() || viewTab.isDragSource());
      });
  }

  private installViewDragListener(): void {
    this._viewDragService.viewDrag$(this._host)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragenter':
            this.onTabbarDragEnter(event);
            break;
          case 'dragover':
            this.onTabbarDragOver(event);
            break;
          case 'dragleave':
            this.onTabbarDragLeave();
            break;
          case 'drop':
            this.onTabbarDrop();
            break;
        }
      });
  }
}
