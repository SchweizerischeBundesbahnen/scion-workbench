/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, Output, ViewChild } from '@angular/core';
import { ScrollDirection } from '../scrollbar/scrollbar.component';
import { Dimension, NULL_DIMENSION } from '../wb-dimension.directive';
import { DomUtil } from '../dom.util';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'wb-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent {

  private _viewport: HTMLElement;

  private _viewportDimension: Dimension = NULL_DIMENSION;
  private _viewportClientDimension: Dimension = NULL_DIMENSION;

  public ScrollDirection = ScrollDirection;

  @Input()
  public viewportCssClass: string[] = ['viewport-default'];

  @Input()
  public viewportClientCssClass: string[] = ['viewport-client-default'];

  /**
   * Specifies what to do when the content is too large to fit in this viewport.
   *
   * true:  scrollbars are provided if content overflows
   * false: no scrollbars are provided
   */
  @Input()
  @HostBinding('class.overflow-auto')
  public overflowAuto = true;

  /**
   * Fires upon viewport or vieport client dimension changes, or upon a scroll event.
   */
  @Output()
  public viewportChange = new EventEmitter<void>();

  @ViewChild('viewport')
  public set viewport(viewport: ElementRef) {
    this._viewport = viewport.nativeElement;
  }

  constructor(private _host: ElementRef, @Inject(DOCUMENT) private _document: any) {
  }

  @HostListener('wheel', ['$event'])
  public onMouseWheel(event: WheelEvent): void {
    const delta = event.deltaY;
    if (event.shiftKey) {
      this._viewport.scrollLeft += delta;
    } else {
      this._viewport.scrollTop += delta;
    }
  }

  public onArrowUp(): void {
    this._viewport.scrollTop -= 10;
  }

  public onArrowDown(): void {
    this._viewport.scrollTop += 10;
  }

  public onPageUp(): void {
    this._viewport.scrollTop -= this._viewport.clientHeight;
  }

  public onPageDown(): void {
    this._viewport.scrollTop += this._viewport.clientHeight;
  }

  public onCtrlHome(): void {
    this._viewport.scrollTop = 0;
  }

  public onCtrlEnd(): void {
    this._viewport.scrollTop = this._viewport.scrollHeight;
  }

  public onViewportDimensionChange(dimension: Dimension): void {
    this._viewportDimension = dimension;
    this.viewportChange.emit();
  }

  public onViewportClientDimensionChange(dimension: Dimension): void {
    this._viewportClientDimension = dimension;
    this.viewportChange.emit();
  }

  public onScroll(): void {
    this.viewportChange.emit();
  }

  public get viewportDimension(): Dimension {
    return this._viewportDimension;
  }

  public get viewportClientDimension(): Dimension {
    return this._viewportClientDimension;
  }

  public get scrollTop(): number {
    return this._viewport.scrollTop;
  }

  public set scrollTop(scrollTop: number) {
    this._viewport.scrollTop = scrollTop;
  }

  public get scrollLeft(): number {
    return this._viewport.scrollLeft;
  }

  public set scrollLeft(scrollLeft: number) {
    this._viewport.scrollLeft = scrollLeft;
  }

  /**
   * Checks if the specified element is scrolled into the viewport.
   *
   * @element the element to scroll into the viewport
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
   * Returns 'true' if this component or a viewport child is focused.
   */
  public hasFocus(): boolean {
    return DomUtil.isChildOf(this._host.nativeElement, this._document.activeElement);
  }

  /**
   * Scrolls the specified element into this viewport.
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
    let distance = 0;
    let positionedParent = element;
    while (positionedParent && positionedParent.offsetParent !== this._viewport) {
      distance += (border === 'left' ? positionedParent.offsetLeft : positionedParent.offsetTop);
      positionedParent = positionedParent.offsetParent as HTMLElement;
    }

    return positionedParent ? distance : 0;
  }

  public requestFocus(): void {
    this._viewport.focus();
  }

  /**
   * Returns the actual viewport {HTMLElement} that contains the viewport client which is moved via scroll top.
   */
  public get viewportElement(): HTMLElement {
    return this._viewport;
  }
}
