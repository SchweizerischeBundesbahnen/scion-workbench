/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { ViewPartComponent } from '../view-part/view-part.component';
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';
import { VIEW_PART_REF_INDEX, ViewPartSashBox } from '../view-part-grid/view-part-grid-serializer.service';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';

/**
 * Building block to render the viewpart portal grid.
 */
@Component({
  selector: 'wb-view-part-sash-box',
  templateUrl: './view-part-sash-box.component.html',
  styleUrls: ['./view-part-sash-box.component.scss'],
})
export class ViewPartSashBoxComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _sash$ = new Subject<void>();

  @Input()
  public sashBox: ViewPartSashBox;

  @HostBinding('class.split-vertical')
  public get splitVertical(): boolean {
    return !this.sashBox.hsplit;
  }

  @HostBinding('class.split-horizontal')
  public get splitHorizontal(): boolean {
    return this.sashBox.hsplit;
  }

  constructor(private _host: ElementRef,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _workbenchLayout: WorkbenchLayoutService) {
    this.installSashListener();
  }

  public onSashStart(): void {
    this._workbenchLayout.viewSashDrag$.next('start');
  }

  public onSash(deltaPx: number): void {
    const host = this._host.nativeElement as HTMLElement;
    const hostSizePx = (this.splitVertical ? host.clientWidth : host.clientHeight);
    this.sashBox.splitter = this.sashPositionFr + (deltaPx / hostSizePx);
    this._sash$.next();
  }

  public onSashEnd(): void {
    this._workbenchLayout.viewSashDrag$.next('end');
  }

  public get sashPositionFr(): number {
    return this.sashBox.splitter;
  }

  public sashAsViewPartPortal(which: 'sash1' | 'sash2'): WbComponentPortal<ViewPartComponent> {
    const sash = (which === 'sash1' ? this.sashBox.sash1 : this.sashBox.sash2);
    return Array.isArray(sash) ? this._viewPartRegistry.getElseThrow(sash[VIEW_PART_REF_INDEX]).portal : null;
  }

  public sashAsSashBox(which: 'sash1' | 'sash2'): ViewPartSashBox {
    const sash = (which === 'sash1' ? this.sashBox.sash1 : this.sashBox.sash2);
    return !Array.isArray(sash) ? sash : null;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private installSashListener(): void {
    this._sash$
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(500),
      )
      .subscribe(() => {
        const serializedGrid = this._viewPartRegistry.grid
          .splitPosition(this.sashBox.id, this.sashBox.splitter)
          .serialize();
        this._viewOutletNavigator.navigate({viewGrid: serializedGrid}).then();
      });
  }
}
