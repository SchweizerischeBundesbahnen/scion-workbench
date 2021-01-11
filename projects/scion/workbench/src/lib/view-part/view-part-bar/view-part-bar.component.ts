/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ViewTabComponent } from '../view-tab/view-tab.component';
import { WorkbenchLayoutService } from '../../layout/workbench-layout.service';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { EMPTY, Observable, Subject, timer } from 'rxjs';
import { SciViewportComponent } from '@scion/toolkit/viewport';
import { ConstrainFn, ViewDragImageRect, ViewTabDragImageRenderer } from '../../view-dnd/view-tab-drag-image-renderer.service';
import { WorkbenchService } from '../../workbench.service';
import { ViewListButtonComponent } from '../view-list-button/view-list-button.component';
import { ViewDragData, ViewDragService } from '../../view-dnd/view-drag.service';
import { Arrays } from '@scion/toolkit/util';
import { setCssVariable, unsetCssVariable } from '../../dom.util';
import { ɵWorkbenchViewPart } from '../ɵworkbench-view-part.model';

/**
 * Renders the view tabbar and viewpart actions, if any.
 * The viewtabs are added to a viewport, which the user can scroll if not enough space.
 */
@Component({
  selector: 'wb-view-part-bar',
  templateUrl: './view-part-bar.component.html',
  styleUrls: ['./view-part-bar.component.scss'],
})
export class ViewPartBarComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _host: HTMLElement;

  @ViewChildren(ViewTabComponent)
  private _viewTabs: QueryList<ViewTabComponent>;

  @ViewChild(SciViewportComponent, {static: true})
  private _viewport: SciViewportComponent;

  @ViewChild(ViewListButtonComponent, {static: true, read: ElementRef})
  private _viewListButtonElement: ElementRef<HTMLElement>;

  /**
   * Transfer data of the view being dragged over this tabbar.
   */
  public dragData: ViewDragData;

  /**
   * Reference to the viewtab over which the user is dragging a viewtab.
   */
  public dropTargetViewTab: ViewTabComponent;

  /**
   * Reference to the viewtab on which the drag operation started.
   * This reference is only set if the drag operation started on a viewtab of this tabbar.
   */
  public dragSourceViewTab: ViewTabComponent;

  /**
   * Indicates if the user is dragging a viewtab over this component.
   */
  public get isDragOver(): boolean {
    return !!this.dragData;
  }

  /**
   * Indicates if the user is dragging over the viewtab where the drag operation started.
   */
  public get isDragSourceDragOver(): boolean {
    return this.dragSourceViewTab && this.dropTargetViewTab === this.dragSourceViewTab;
  }

  /**
   * Indicates if the user is dragging a viewtab over a valid viewtab drop slot,
   * which is either when dragging over a viewtab or the tabbar tail.
   */
  public isTabDropSlotDragOver: boolean;

  /**
   * Indicates if the user is auto scrolling the viewtabs.
   */
  public isAutoScroll: boolean;

  /**
   * Locks the y-axis of the viewtab drag image to snap it to the tabbar while dragging over.
   */
  private constrainFn: ConstrainFn = (rect: ViewDragImageRect): ViewDragImageRect => {
    return {
      x: rect.x,
      y: this._host.getBoundingClientRect().top,
      width: rect.width,
      height: this._host.offsetHeight,
    };
  };

  // tslint:disable-next-line:member-ordering
  constructor(host: ElementRef<HTMLElement>,
              private _workbench: WorkbenchService,
              private _workbenchLayout: WorkbenchLayoutService,
              private _viewTabDragImageRenderer: ViewTabDragImageRenderer,
              private _viewPart: ɵWorkbenchViewPart,
              private _viewDragService: ViewDragService) {
    this._host = host.nativeElement;
  }

  public ngOnInit(): void {
    this.installLayoutChangeListener();
    this.installViewDragListener();
    this.installAutoScroller();
  }

  @HostListener('dblclick', ['$event'])
  public onDoubleClick(event: MouseEvent): void {
    this._workbenchLayout.toggleMaximized(false);
    event.stopPropagation();
  }

  public get viewIds$(): Observable<string[]> {
    return this._viewPart.viewIds$;
  }

  public onTabbarViewportDimensionChange(): void {
    this.computeHiddenViewTabs();
  }

  public onTabbarViewportClientDimensionChange(): void {
    this.computeHiddenViewTabs();
  }

  public onScroll(): void {
    this.computeHiddenViewTabs();
  }

  /**
   * Computes tabs which are not visible in the viewtabs viewport.
   */
  private computeHiddenViewTabs(): void {
    this._viewTabs && this._viewPart.setHiddenViewTabs(this._viewTabs
      .filter(viewTab => !viewTab.isVisibleInViewport())
      .map(viewTab => viewTab.viewId));
  }

  private scrollActiveViewTabIntoViewport(): void {
    // There may be no active view in the tabbar, e.g., when dragging the last view out of the tabbar.
    this._viewTabs.find(viewTab => viewTab.active)?.scrollIntoViewport();
  }

  /**
   * Method invoked when the user starts dragging a viewtab of this tabbar.
   */
  @HostListener('dragstart')
  public onViewDragStart(): void {
    this.dragData = this._viewDragService.getViewDragData();
    this.dragSourceViewTab = this.dropTargetViewTab = this._viewTabs.find(viewTab => viewTab.viewId === this.dragData.viewId);
  }

  /**
   * Method invoked when the user ends dragging a viewtab of this tabbar.
   */
  @HostListener('dragend')
  public onViewDragEnd(): void {
    this.dragSourceViewTab = this.dropTargetViewTab = null;
  }

  /**
   * Method invoked when the user drags a viewtab into this viewpart.
   */
  private onTabbarDragEnter(): void {
    this.dragData = this._viewDragService.getViewDragData();
    setCssVariable(this._host, '--drag-source-width', `${this.dragData.viewTabWidth}px`);

    // Lock the y-axis to snap the view drag image to the view tabbar.
    this._viewTabDragImageRenderer.setConstrainDragImageRectFn(this.constrainFn);
  }

  /**
   * Method invoked while the user is dragging a viewtab over this viewpart.
   */
  private onTabbarDragOver(event: DragEvent): void {
    event.preventDefault(); // allow view drop

    // Compute the pointer x-coordinate relative to the tabbar.
    const pointerOffsetX = event.clientX - this._host.getBoundingClientRect().left + this._viewport.scrollLeft;

    // Determine over which viewtab the user is dragging.
    this.dropTargetViewTab = this._viewTabs.find(viewTab => {
      return pointerOffsetX >= viewTab.host.offsetLeft && pointerOffsetX <= viewTab.host.offsetLeft + viewTab.host.offsetWidth;
    });

    // Compute if the user is dragging over a viewtab drop slot. A drop slot is some valid drop target within the tabbar,
    // which is either when dragging over a viewtab or the tabbar tail.
    const lastViewTab = Arrays.last(this._viewTabs.toArray(), viewTab => viewTab !== this.dragSourceViewTab);
    const viewTabsWidth = lastViewTab ? (lastViewTab.host.offsetLeft + lastViewTab.host.offsetWidth) : 0;
    this.isTabDropSlotDragOver = pointerOffsetX <= viewTabsWidth + this.dragData.viewTabWidth;
  }

  /**
   * Method invoked when the user drags a view out of this viewpart.
   */
  private onTabbarDragLeave(): void {
    this.unsetDragState({unsetDragSource: false});

    // Activate the view next to the view being dragged out of this tabbar.
    if (this.dragSourceViewTab && this.dragSourceViewTab.active) {
      this._viewPart.activateSiblingView().then();
    }
  }

  /**
   * Method invoked when the user drops a view into this viewpart.
   */
  private onTabbarDrop(): void {
    // Do nothing when the user drops the tab on the tab where the drag operation started.
    if (this.isDragSourceDragOver) {
      this.unsetDragState({unsetDragSource: true});
      return;
    }

    const dropIndex = this._viewTabs.toArray().indexOf(this.dropTargetViewTab);
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: this.dragData.appInstanceId,
        partId: this.dragData.partId,
        viewId: this.dragData.viewId,
        viewUrlSegments: this.dragData.viewUrlSegments,
      },
      target: {
        appInstanceId: this._workbench.appInstanceId,
        insertionIndex: dropIndex !== -1 ? dropIndex : undefined,
        partId: this._viewPart.partId,
      },
    });

    // Wait undoing the drag state until flushed tab changes to the DOM, i.e., after the layout routing cycle completes.
    // If we were to undo the drag state immediately during the course of the drop event, the tab layout would temporarily
    // revert to the state before the drag operation, resulting in an ugly flicker.
    this._workbenchLayout.whenLayoutChange().then(() => {
      this.unsetDragState({unsetDragSource: !!this.dragSourceViewTab});
    });
  }

  private unsetDragState(options: { unsetDragSource: boolean }): void {
    if (options && options.unsetDragSource) {
      this.dragSourceViewTab = null;
    }
    this.dropTargetViewTab = null;
    this.dragData = null;
    this.isTabDropSlotDragOver = false;
    this._viewTabDragImageRenderer.unsetConstrainDragImageRectFn(this.constrainFn);
    unsetCssVariable(this._host, '--drag-source-width');
  }

  private installLayoutChangeListener(): void {
    this._workbenchLayout.afterLayoutChange$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.scrollActiveViewTabIntoViewport());
  }

  private installViewDragListener(): void {
    this._viewDragService.viewDrag$(this._host)
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragenter':
            this.onTabbarDragEnter();
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

  private installAutoScroller(): void {
    this._viewDragService.viewDrag$(this._viewListButtonElement.nativeElement, {eventType: ['dragenter', 'dragleave', 'drop']})
      .pipe(
        tap(event => this.isAutoScroll = (event.type === 'dragenter')),
        switchMap(() => this.isAutoScroll ? timer(0, 3) : EMPTY), // start or stop auto scroller
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._viewport.scrollLeft += 3;
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
