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
import { combineLatest, Observable, Subject } from 'rxjs';
import { WbViewDropEvent } from '../view-dnd/view-drop-zone.directive';
import { takeUntil } from 'rxjs/operators';
import { ViewDragService } from '../view-dnd/view-drag.service';
import { ɵWorkbenchViewPart } from './ɵworkbench-view-part.model';
import { ɵWorkbenchService } from '../ɵworkbench.service';
import { Logger, LoggerNames } from '../logging';

@Component({
  selector: 'wb-view-part',
  templateUrl: './view-part.component.html',
  styleUrls: ['./view-part.component.scss'],
})
export class ViewPartComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public hasViews: boolean;
  public hasActions: boolean;

  @HostBinding('attr.tabindex')
  public tabIndex = -1;

  @HostBinding('attr.data-partid')
  public get partId(): string {
    return this._part.partId;
  }

  @HostBinding('class.active')
  public get isActive(): boolean {
    return this._part.isActive();
  }

  constructor(private _workbench: ɵWorkbenchService,
              private _viewDragService: ViewDragService,
              private _part: ɵWorkbenchViewPart,
              private _logger: Logger) {
    this._logger.debug(() => `Constructing ViewPartComponent [partId=${this.partId}]`, LoggerNames.LIFECYCLE);
    combineLatest([this._workbench.viewPartActions$, this._part.actions$, this._part.viewIds$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([globalActions, localActions, viewIds]) => {
        this.hasViews = viewIds.length > 0;
        this.hasActions = globalActions.length > 0 || localActions.length > 0;
      });
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
    this._logger.debug(() => `Destroying ViewPartComponent [partId=${this.partId}]'`, LoggerNames.LIFECYCLE);
    this._destroy$.next();
  }
}
