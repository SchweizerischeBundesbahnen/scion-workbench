/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostBinding, HostListener, OnDestroy } from '@angular/core';
import { WorkbenchViewPartService } from './workbench-view-part.service';
import { combineLatest, noop, Subject } from 'rxjs';
import { WbViewDropEvent } from '../view-dnd/view-drop-zone.directive';
import { InternalWorkbenchService } from '../workbench.service';
import { WorkbenchViewPart } from '../workbench.model';
import { takeUntil } from 'rxjs/operators';
import { ViewDragService } from '../view-dnd/view-drag.service';

@Component({
  selector: 'wb-view-part',
  templateUrl: './view-part.component.html',
  styleUrls: ['./view-part.component.scss'],
  providers: [WorkbenchViewPartService],
})
export class ViewPartComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public hasViews: boolean;
  public hasActions: boolean;

  @HostBinding('attr.tabindex')
  public tabIndex = -1;

  @HostBinding('class.suspend-pointer-events')
  public suspendPointerEvents = false;

  @HostBinding('attr.id')
  public get id(): string {
    return this.viewPartService.viewPartRef; // specs
  }

  constructor(private _workbench: InternalWorkbenchService,
              private _viewDragService: ViewDragService,
              private _viewPart: WorkbenchViewPart,
              public viewPartService: WorkbenchViewPartService) {
    combineLatest([this._workbench.viewPartActions$, this._viewPart.actions$, this._viewPart.viewRefs$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([globalActions, localActions, viewRefs]) => {
        this.hasViews = viewRefs.length > 0;
        this.hasActions = globalActions.length > 0 || localActions.length > 0;
      });
  }

  @HostListener('keydown.control.k', ['$event'])
  public onCloseView(event: KeyboardEvent): void {
    this.viewPartService.destroyActiveView().then(noop);
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('keydown.control.shift.k', ['$event'])
  public onCloseViews(event: KeyboardEvent): void {
    this.viewPartService.remove().then(noop);
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('keydown.control.alt.end', ['$event'])
  public onSplitVertically(event: KeyboardEvent): void {
    if (this.viewPartService.viewCount() === 0) {
      return;
    }

    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: this._workbench.appInstanceId,
        viewPartRef: this._viewPart.viewPartRef,
        viewRef: this._viewPart.activeViewRef,
      },
      target: {
        appInstanceId: this._workbench.appInstanceId,
        viewPartRef: this._viewPart.viewPartRef,
        viewPartRegion: 'east',
      },
    });

    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    this.viewPartService.activate();
  }

  /**
   * Method invoked to move a view into this view part.
   */
  public onDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: event.dragData.appInstanceId,
        viewPartRef: event.dragData.viewPartRef,
        viewRef: event.dragData.viewRef,
      },
      target: {
        appInstanceId: this._workbench.appInstanceId,
        viewPartRef: this._viewPart.viewPartRef,
        viewPartRegion: event.dropRegion,
      },
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
