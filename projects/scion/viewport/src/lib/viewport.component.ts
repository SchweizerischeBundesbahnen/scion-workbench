/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, DoCheck, ElementRef, EventEmitter, Input, KeyValueDiffer, KeyValueDiffers, Output, ViewChild } from '@angular/core';
import { NULL_DIMENSION, SciDimension } from '@scion/dimension';

/**
 * Represents a viewport with its `<ng-content>` used as its scrollable viewport client and
 * scrollbars that sit on top of the viewport client.
 *
 * `ng-content` is added to a flex-box container with `flex-flow` set to 'column nowrap'.
 */
@Component({
  selector: 'sci-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class SciViewportComponent implements DoCheck {

  private _viewport: HTMLDivElement;
  private _viewportDimension: SciDimension = NULL_DIMENSION;
  private _viewportClientDiffer: KeyValueDiffer<string, any>;

  /**
   * @internal
   */
  @ViewChild('viewport')
  public set setViewport(viewport: ElementRef<HTMLDivElement>) {
    this._viewport = viewport.nativeElement;
  }

  /**
   * Controls whether to use native scrollbars or, which is by default, emulated scrollbars that sit on top of the viewport client.
   * In the latter, the viewport is still natively scrollable.
   */
  @Input()
  public scrollbarStyle: 'native' | 'on-top' | 'hidden' = 'on-top';

  /**
   * Emits upon a dimension change or a scroll event.
   */
  @Output()
  public viewportChange = new EventEmitter<void>();

  constructor(differs: KeyValueDiffers) {
    this._viewportClientDiffer = differs.find({}).create();
  }

  /**
   * @internal
   */
  public onViewportDimensionChange(dimension: SciDimension): void {
    this._viewportDimension = dimension;
    this.viewportChange.emit();
  }

  public ngDoCheck(): void {
    this.detectViewportClientDimensionChange() && this.viewportChange.emit();
  }

  /**
   * @internal
   */
  public onScroll(): void {
    this.viewportChange.emit();
  }

  /**
   * Returns the dimension of this viewport.
   */
  public get viewportDimension(): SciDimension {
    return this._viewportDimension;
  }

  /**
   * Returns the number of pixels that the viewport client is scrolled vertically.
   *
   * @see Element.scrollTop
   */
  public get scrollTop(): number {
    return this._viewport.scrollTop;
  }

  /**
   * Sets the number of pixels that the viewport client is scrolled vertically.
   *
   * @see Element.scrollTop
   */
  public set scrollTop(scrollTop: number) {
    this._viewport.scrollTop = scrollTop;
  }

  /**
   * Returns the number of pixels that the viewport client is scrolled horizontally.
   *
   * @see Element.scrollLeft
   */
  public get scrollLeft(): number {
    return this._viewport.scrollLeft;
  }

  /**
   * Sets the number of pixels that the viewport client is scrolled horizontally.
   *
   * @see Element.scrollLeft
   */
  public set scrollLeft(scrollLeft: number) {
    this._viewport.scrollLeft = scrollLeft;
  }

  /**
   * Returns the height of the viewport client.
   *
   * @see Element.scrollHeight
   */
  public get scrollHeight(): number {
    return this._viewport.scrollHeight;
  }

  /**
   * Returns the width of the viewport client.
   *
   * @see Element.scrollWidth
   */
  public get scrollWidth(): number {
    return this._viewport.scrollWidth;
  }

  /**
   * Returns the actual viewport {HTMLElement}.
   */
  public get viewportElement(): HTMLElement {
    return this._viewport;
  }

  /**
   * Checks if the specified element is scrolled into the viewport.
   *
   * @element the element to check if scrolled into the viewport
   * @fit specifies whether the element must fully or partially fit into the viewport.
   */
  public isElementInView(element: HTMLElement, fit: 'full' | 'partial'): boolean {
    const elLeft = this.computeOffset(element, 'left');
    const elRight = elLeft + element.offsetWidth;
    const elTop = this.computeOffset(element, 'top');
    const elBottom = elTop + element.offsetHeight;

    const vpLeft = this._viewport.scrollLeft;
    const vpRight = vpLeft + this._viewport.clientWidth;
    const vpTop = this._viewport.scrollTop;
    const vpBottom = vpTop + this._viewport.clientHeight;

    switch (fit) {
      case 'full':
        return (elLeft >= vpLeft && elRight <= vpRight) && (elTop >= vpTop && elBottom <= vpBottom);
      case 'partial':
        return (elRight >= vpLeft && elLeft <= vpRight) && (elBottom >= vpTop && elTop <= vpBottom);
      default:
        throw Error('Unsupported fit strategy');
    }
  }

  /**
   * Scrolls the specified element into the viewport.
   *
   * @element the element to scroll into the viewport
   * @offset the gap between the element and the viewport
   */
  public scrollIntoView(element: HTMLElement, offset: number = 50): void {
    this._viewport.scrollTop = this.computeOffset(element, 'top') - offset;
    this._viewport.scrollLeft = this.computeOffset(element, 'left') - offset;
  }

  /**
   * Computes the distance of the element to this viewport's left or top border.
   */
  public computeOffset(element: HTMLElement, border: 'left' | 'top'): number {
    if (!isChildOf(element, this._viewport)) {
      throw Error('element not a child of the viewport');
    }

    let offset = 0;
    let el = element;
    do {
      offset += (border === 'left' ? el.offsetLeft : el.offsetTop);
      el = el.offsetParent as HTMLElement;
    } while (el !== null && el !== this._viewport);

    return offset;
  }

  private detectViewportClientDimensionChange(): boolean {
    if (!this._viewport) {
      return false;
    }
    const viewportClientSize = {height: this._viewport.scrollHeight, width: this._viewport.scrollWidth};
    return !!this._viewportClientDiffer.diff(viewportClientSize);
  }
}

/**
 * Returns 'true' if the given element is a child element of the parent element.
 */
function isChildOf(element: Element, parent: Element): boolean {
  while (element.parentElement !== null) {
    element = element.parentElement;
    if (element === parent) {
      return true;
    }
  }
  return false;
}
