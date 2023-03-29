/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {animate, style, transition, trigger} from '@angular/animations';
import {combineLatest, Subject, switchMap} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {ɵWorkbenchViewPart} from '../ɵworkbench-view-part.model';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {filterArray, mapArray} from '@scion/toolkit/operators';

@Component({
  selector: 'wb-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('open', [
      transition(':enter', [
        style({height: 0}),
        animate('.25s ease-out', style({height: '*'})),
      ]),
    ]),
  ],
})
export class ViewListComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public views = new Array<ɵWorkbenchView>();

  constructor(private _viewPart: ɵWorkbenchViewPart,
              private _viewRegistry: WorkbenchViewRegistry,
              private _overlayRef: OverlayRef,
              private _cd: ChangeDetectorRef) {
    this.installHiddenViewTabCollector();
  }

  public onActivateView(): void {
    // The view is activated in 'wb-view-tab' component.
    this._overlayRef.dispose();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this._overlayRef.dispose();
  }

  @HostListener('mousedown', ['$event'])
  public onHostMouseDown(event: MouseEvent): void {
    event.stopPropagation(); // Prevent closing the overlay when clicking an element of it.
  }

  @HostListener('document:mousedown')
  public onDocumentMouseDown(): void {
    this._overlayRef.dispose();
  }

  /**
   * Collects views not scrolled into view in the tabbar of the current part.
   */
  private installHiddenViewTabCollector(): void {
    this._viewPart.viewIds$
      .pipe(
        mapArray(viewId => this._viewRegistry.getElseThrow(viewId)),
        switchMap(views => combineLatest(views.map(view => view.scrolledIntoView$.pipe(map(() => view))))),
        filterArray(view => !view.scrolledIntoView),
        takeUntil(this._destroy$),
      )
      .subscribe((views: ɵWorkbenchView[]) => {
        if (!views.length) {
          this._overlayRef.dispose();
          return;
        }

        this.views = views;
        this._cd.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
