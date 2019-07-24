/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { captureElementDimension, SciDimension, SciDimensionService } from './dimension.service';

/**
 * Allows observing changes to host element's size.
 *
 * See {SciDimensionService} for more information.
 *
 * ---
 * Usage:
 *
 * <div sciDimension (sciDimensionChange)="onDimensionChange($event)"></div>
 */
@Directive({
  selector: '[sciDimension]',
  exportAs: 'sciDimension',
})
export class SciDimensionDirective implements OnDestroy {

  private _host: HTMLElement;
  private _destroy$ = new Subject<void>();

  /**
   * Upon subscription, it emits the host element's dimension, and then continuously emits when the dimension of the host element changes.
   */
  @Output('sciDimensionChange') // tslint:disable-line:no-output-rename
  public dimensionChange = new EventEmitter<SciDimension>();

  /**
   * Controls if to emit a dimension change inside or outside of the Angular zone.
   * If emitted outside of the Angular zone no change detection cycle is triggered.
   */
  @Input()
  public emitOutsideAngular: boolean;

  constructor(host: ElementRef<HTMLElement>,
              private _dimensionService: SciDimensionService,
              private _ngZone: NgZone) {
    this._host = host.nativeElement;
    this.installDimensionListener();
  }

  private installDimensionListener(): void {
    this._ngZone.runOutsideAngular(() => {
      this._dimensionService.dimension$(this._host)
        .pipe(takeUntil(this._destroy$))
        .subscribe((dimension: SciDimension) => {
          if (this.emitOutsideAngular) {
            this.dimensionChange.emit(dimension);
          }
          else {
            this._ngZone.run(() => this.dimensionChange.emit(dimension));
          }
        });
    });
  }

  /**
   * Returns the current dimension of its host element.
   */
  public get dimension(): SciDimension {
    return captureElementDimension(this._host);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

