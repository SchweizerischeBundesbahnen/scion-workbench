/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ContentChildren, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnDestroy, Output, QueryList } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SplitterMoveEvent } from './splitter.directive';
import { SciSashDirective } from './sash.directive';

/**
 * The <sci-sashbox> is like a flexbox container and lays out its content children (sashes) in a row (which is by default)
 * or column arrangement (as specified by the direction property). A splitter is added between each sash to allow the user to
 * shrink or stretch the individual sashes.
 *
 * Sashes are modelled as content children inside a <ng-template> decorated with 'sciSash' directive.
 * A sash can have a fixed size with an explicit unit, or a unitless proportion to distibute remaining space.
 * A proportional sash has the ability to grow or shrink if necessary.
 *
 *
 * ### Usage:
 *
 * <sci-sashbox direction="row">
 *   <ng-template sciSash size="200px" minSize="200px">
 *     ...
 *   </ng-template>
 *
 *   <ng-template sciSash>
 *     ...
 *   </ng-template>
 * </sci-sashbox>
 *
 *
 *
 * ### Theme override:
 *
 * You can override the following CSS properties:
 *
 * --sci-sashbox-gap: Gap between sash and splitter
 * --sci-sashbox-splitter_backgroundColor: Background color of the splitter
 * --sci-sashbox-splitter_backgroundColor_hover: Background color of the splitter when hovered
 * --sci-sashbox-splitter_size: Size of the splitter along the main axis (width if direction is row, or height if direction is column)
 * --sci-sashbox-splitter_sizeOnHover: Size of the splitter along the main axis when hovered
 * --sci-sashbox-splitter_touchTargetSize: Touch target size to move the splitter (accessibility)
 * --sci-sashbox-splitter_crossAxisSize: Handle size along the cross axis (height if direction is row, or width if direction is column)
 * --sci-sashbox-splitter_borderRadius: Border radius of the handle
 * --sci-sashbox-splitter_opacityWhenActive: Opacity of the splitter when active
 * --sci-sashbox-splitter_opacityOnHover: Opacity of the splitter on hover
 *
 * Example:
 *
 * sci-sashbox {
 *   --sci-sashbox-splitter_backgroundColor: black;
 *   --sci-sashbox-splitter_backgroundColor_hover: black;
 * }
 */
@Component({
  selector: 'sci-sashbox',
  templateUrl: './sashbox.component.html',
  styleUrls: ['./sashbox.component.scss'],
})
export class SciSashboxComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  /** @internal **/
  public sashes: SciSashDirective[] = [];

  /** @internal **/
  @HostBinding('class.sashing')
  public sashing = false;

  /**
   * Specifies if to lay out sashes in a row (which is by default) or column arrangement.
   */
  @Input()
  public direction: 'column' | 'row' = 'row';

  /**
   * Emits when start sashing.
   */
  @Output()
  public sashStart = new EventEmitter<void>();

  /**
   * Emits when end sashing.
   */
  @Output()
  public sashEnd = new EventEmitter<void>();

  /** @internal **/
  @ContentChildren(SciSashDirective)
  public set setSashes(queryList: QueryList<SciSashDirective>) {
    queryList.changes
      .pipe(takeUntil(this._destroy$))
      .subscribe((sashses: QueryList<SciSashDirective>) => {
        this.sashes = sashses.toArray();
      });
  }

  constructor(private _host: ElementRef<HTMLElement>, private _zone: NgZone) {
  }

  /** @internal **/
  public onSashStart(): void {
    this.sashing = true;
    this.sashStart.emit();

    // set the effective sash size as the flex-basis for non-fixed sashes (as sashing operates on pixel deltas)
    this.sashes.forEach(sash => {
      if (!sash.isFixedSize) {
        sash.flexGrow = 0;
        sash.flexShrink = 0;
        sash.flexBasis = `${sash.computedSize}px`;
      }
    });
  }

  /** @internal **/
  public onSashEnd(): void {
    this.sashing = false;

    // unset the flex-basis for non-fixed sashes and set the flex-grow accordingly
    const pixelToFlexGrowFactor = computePixelToFlexGrowFactor(this.sashes);
    this.sashes.forEach(sash => {
      if (!sash.isFixedSize) {
        sash.flexGrow = pixelToFlexGrowFactor * sash.computedSize;
        sash.flexShrink = 1;
        sash.flexBasis = '0';
      }
    });
    this.sashEnd.emit();
  }

  /** @internal **/
  public onSash(splitter: HTMLElement, sashIndex: number, moveEvent: SplitterMoveEvent): void {
    const delta = moveEvent.delta;
    if (delta === 0) {
      return;
    }

    NgZone.assertNotInAngularZone();

    // compute the splitter position
    const splitterRect = splitter.getBoundingClientRect();
    const splitterStart = (this.isRowDirection ? splitterRect.left : splitterRect.top);
    const splitterEnd = (this.isRowDirection ? splitterRect.left + splitterRect.width : splitterRect.top + splitterRect.height);

    // ignore the event if outside of the splitter's action scope
    const eventPos = moveEvent.position.clientPos;
    // i.e. the sash should not grow if moved the mouse pointer beyond the left bounds of the sash, and if now moving the mouse pointer back toward the current sash.
    if (delta > 0 && eventPos < splitterStart) {
      return;
    }

    // i.e. the sash should not shrink if moved the mouse pointer beyond the right bounds of the sash, and if now moving the mouse pointer back toward the current sash.
    if (delta < 0 && eventPos > splitterEnd) {
      return;
    }

    // compute the new sash sizes
    const sash1 = this.sashes[sashIndex];
    const sash2 = this.sashes[sashIndex + 1];

    const sashSize1 = sash1.computedSize;
    const sashSize2 = sash2.computedSize;
    const maxSashSize = sashSize1 + sashSize2;
    const computedNewSashSize1 = Math.round(sashSize1 + delta);
    const computedNewSashSize2 = Math.round(sashSize2 - delta);

    if (sash1.minSize !== undefined && delta < 0 && computedNewSashSize1 < this.toPixel(sash1.minSize)) {
      return;
    }
    if (sash2.minSize !== undefined && delta > 0 && computedNewSashSize2 < this.toPixel(sash2.minSize)) {
      return;
    }

    const validNewSashSize1 = between(computedNewSashSize1, {min: 0, max: maxSashSize});
    const validNewSashSize2 = between(computedNewSashSize2, {min: 0, max: maxSashSize});

    // continue only if both sashes adjacent to the splitter change their size (as the event would change other sashes otherwise)
    if (validNewSashSize1 !== computedNewSashSize1) {
      return;
    }
    if (validNewSashSize2 !== computedNewSashSize2) {
      return;
    }

    // set the new computed sash sizes
    this._zone.run(() => {
      sash1.flexBasis = `${computedNewSashSize1}px`;
      sash2.flexBasis = `${computedNewSashSize2}px`;
    });
  }

  /** @internal **/
  public onSashReset(sashIndex: number): void {
    const sash1 = this.sashes[sashIndex];
    const sash2 = this.sashes[sashIndex + 1];
    const equalSashSize = (sash1.computedSize + sash2.computedSize) / 2;
    const pixelToFlexGrowFactor = computePixelToFlexGrowFactor(this.sashes);

    [sash1, sash2].forEach(sash => {
      if (sash.isFixedSize) {
        sash.flexBasis = `${equalSashSize}px`;
      }
      else {
        sash.flexGrow = pixelToFlexGrowFactor * equalSashSize;
      }
    });

    this.sashStart.emit();
    this.sashEnd.emit();
  }

  @HostBinding('class.column')
  public get isColumnDirection(): boolean {
    return this.direction === 'column';
  }

  @HostBinding('class.row')
  public get isRowDirection(): boolean {
    return this.direction === 'row';
  }

  /** @internal **/
  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private toPixel(value: string): number {
    if (value.endsWith('%')) {
      const hostBounds = this._host.nativeElement.getBoundingClientRect();
      const hostSize = (this.isRowDirection ? hostBounds.width : hostBounds.height);
      return parseInt(value, 10) * hostSize / 100;
    }
    return parseInt(value, 10);
  }

  /**
   * Returns the current sizes of all sashes, either as an absolute pixel value for fixed-sized sashes or as a proportion for non-fixed sashes.
   */
  public get sashSizes(): (string | number)[] {
    return this.sashes.map(sash => sash.isFixedSize ? `${sash.computedSize}px` : sash.flexGrow);
  }
}

function between(value: number, minmax: { min: number, max: number }): number {
  return Math.min(minmax.max, Math.max(minmax.min, value));
}

/**
 * Returns the factor to compute the flex-grow proportion from the pixel size of a sash.
 */
function computePixelToFlexGrowFactor(sashes: SciSashDirective[]): number {
  const flexibleSashes = sashes.filter(sash => !sash.isFixedSize);

  const proportionSum = flexibleSashes.reduce((acc, sash) => acc + Number(sash.size), 0);
  const pixelSum = flexibleSashes.reduce((acc, sash) => acc + sash.computedSize, 0);

  return proportionSum / pixelSum;
}
