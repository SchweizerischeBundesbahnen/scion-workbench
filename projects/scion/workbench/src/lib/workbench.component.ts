/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, ContentChildren, HostBinding, OnDestroy, QueryList, ViewChild, ViewContainerRef } from '@angular/core';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { OverlayHostRef } from './overlay-host-ref.service';
import { WbActivityDirective } from './activity-part/wb-activity.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkbenchActivityPartService } from './activity-part/workbench-activity-part.service';
import { MessageBoxService } from './message-box/message-box.service';

@Component({
  selector: 'wb-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.scss'],
})
export class WorkbenchComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  @ViewChild('overlay_host', {read: ViewContainerRef})
  public host: ViewContainerRef;

  @ContentChildren(WbActivityDirective)
  public set activities(queryList: QueryList<WbActivityDirective>) {
    queryList.changes
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities: WbActivityDirective[]) => {
        this._activityPartService.activities = activities;
      });
  }

  @HostBinding('class.maximized')
  public get maximized(): boolean {
    return this._workbenchLayout.maximized;
  }

  @HostBinding('class.glasspane')
  public get glasspane(): boolean {
    return this._messageBoxService.count > 0;
  }

  constructor(private _workbenchLayout: WorkbenchLayoutService,
              private _activityPartService: WorkbenchActivityPartService,
              private _overlayHostRef: OverlayHostRef,
              private _messageBoxService: MessageBoxService) {
  }

  public ngAfterViewInit(): void {
    this._overlayHostRef.set(this.host);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
