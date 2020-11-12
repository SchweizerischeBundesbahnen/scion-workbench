/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { WbViewDropEvent } from '../view-dnd/view-drop-zone.directive';
import { InternalWorkbenchService } from '../workbench.service';
import { InternalWorkbenchViewPart } from '../workbench.model';
import { takeUntil } from 'rxjs/operators';
import { ViewDragService } from '../view-dnd/view-drag.service';

@Component({
  selector: 'wb-view-part',
  templateUrl: './view-part.component.html',
  styleUrls: ['./view-part.component.scss'],
})
export class ViewPartComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  public hasViews: boolean;
  public hasActions: boolean;

  @HostBinding('attr.tabindex')
  public tabIndex = -1;

  @HostBinding('class.suspend-pointer-events')
  public suspendPointerEvents = false;

  @HostBinding('attr.data-partid')
  public get partId(): string {
    return this._part.partId;
  }

  @HostBinding('class.active')
  public get isActive(): boolean {
    return this._part.isActive();
  }

  constructor(private _workbench: InternalWorkbenchService,
              private _viewDragService: ViewDragService,
              private _part: InternalWorkbenchViewPart) {
    combineLatest([this._workbench.viewPartActions$, this._part.actions$, this._part.viewIds$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([globalActions, localActions, viewIds]) => {
        this.hasViews = viewIds.length > 0;
        this.hasActions = globalActions.length > 0 || localActions.length > 0;
      });
  }

  public ngOnInit(): void {
    this._part.activate().then();
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    this._part.activate().then();
  }

  /**
   * Method invoked to move a view into this view part.
   */
  public onDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: event.dragData.appInstanceId,
        partId: event.dragData.partId,
        viewId: event.dragData.viewId,
        viewUrlSegments: event.dragData.viewUrlSegments,
      },
      target: {
        appInstanceId: this._workbench.appInstanceId,
        partId: this._part.partId,
        region: event.dropRegion,
      },
    });
  }

  public get activeViewId$(): Observable<string> {
    return this._part.activeViewId$;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
