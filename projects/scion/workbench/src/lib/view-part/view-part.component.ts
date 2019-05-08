/*
 * Copyright (c) 2018 Swiss Federal Railways
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
import { Region, WbViewDropEvent } from './view-drop-zone.directive';
import { InternalWorkbenchService } from '../workbench.service';
import { WorkbenchViewPart } from '../workbench.model';
import { takeUntil } from 'rxjs/operators';

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

  constructor(viewPart: WorkbenchViewPart, private _workbench: InternalWorkbenchService, public viewPartService: WorkbenchViewPartService) {
    combineLatest(this._workbench.viewPartActions$, viewPart.actions$, viewPart.viewRefs$)
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

    this.moveViewToNewViewPart(this.viewPartService.activeViewRef, 'east').then(noop);
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
    const sourceViewPartService = this._workbench.activeViewPartService;
    const sourceViewRef = sourceViewPartService.activeViewRef;

    if (sourceViewPartService === this.viewPartService && event.region !== 'center' && this.viewPartService.viewCount() > 1) {
      this.moveViewToNewViewPart(sourceViewRef, event.region).then(noop);
    }
    else if (sourceViewPartService !== this.viewPartService) {
      (event.region === 'center') ? this.moveViewToThisViewPart(sourceViewRef).then(noop) : this.moveViewToNewViewPart(sourceViewRef, event.region).then(noop);
    }
  }

  public moveViewToThisViewPart(sourceViewRef: string): Promise<boolean> {
    return this.viewPartService.moveViewToThisViewPart(sourceViewRef);
  }

  public moveViewToNewViewPart(viewRef: string, region: Region): Promise<boolean> {
    return region !== 'center' ? this.viewPartService.moveViewToNewViewPart(viewRef, region) : Promise.resolve(false);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
