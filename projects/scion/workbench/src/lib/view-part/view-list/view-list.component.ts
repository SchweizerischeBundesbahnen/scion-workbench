/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {animate, style, transition, trigger} from '@angular/animations';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ɵWorkbenchViewPart} from '../ɵworkbench-view-part.model';

@Component({
  selector: 'wb-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('viewtabLeave', [
      transition(':leave', [
        style({height: '*'}),
        animate('.25s ease-out', style({height: 0})),
      ]),
    ]),
    trigger('showPopup', [
      transition(':enter', [
        style({height: 0}),
        animate('.25s ease-out', style({height: '*'})),
      ]),
    ]),
  ],
})
export class ViewListComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public hiddenViewTabs: string[] = [];

  constructor(private _viewPart: ɵWorkbenchViewPart,
              private _overlayRef: OverlayRef,
              private _cd: ChangeDetectorRef) {
    this.installHiddenViewTabsListener();
    this.installBackdropListener();
  }

  public onCloseViewTab(): void {
    this._overlayRef.dispose();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this._overlayRef.dispose();
  }

  private installHiddenViewTabsListener(): void {
    this._viewPart.hiddenViewTabs$
      .pipe(takeUntil(this._destroy$))
      .subscribe((hiddenViewTabs: string[]) => {
        this.hiddenViewTabs = hiddenViewTabs;
        if (hiddenViewTabs.length === 0) {
          this._overlayRef.dispose();
        }
        else {
          this._cd.markForCheck();
        }
      });
  }

  private installBackdropListener(): void {
    this._overlayRef.backdropClick()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._overlayRef.dispose());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
