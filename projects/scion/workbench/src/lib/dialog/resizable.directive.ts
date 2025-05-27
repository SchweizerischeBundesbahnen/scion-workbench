/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, ElementRef, inject, input, output, untracked} from '@angular/core';
import {createElement, positionElement, getCssTranslation} from '../common/dom.util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {fromMoveHandle$, HandleMoveEvent} from '../common/observables';

const HANDLE_SIZE = 6;

/**
 * Enables resizing the host element via mouse or touch gesture.
 *
 * This directive adds resize handles to the boundaries and corners of the host
 * element, emitting an event when moving the handles. The host must apply the
 * changed position and size by updating respective DOM properties.
 *
 * The following requirements apply for the host:
 * - must be positioned, either relative or absolute
 * - must be horizontally centered in its layout
 */
@Directive({selector: '[wbResizable]'})
export class ResizableDirective {

  public readonly enabled = input(true, {alias: 'wbResizableEnabled'});
  public readonly wbResize = output<WbResizeEvent>({alias: 'wbResizableResize'});

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;

  private minHeight: number | undefined;
  private maxHeight: number | undefined;

  private minWidth: number | undefined;
  private maxWidth: number | undefined;

  constructor() {
    positionElement(this._host, {context: 'resizable'});
    this.installResizeHandles();
  }

  /**
   * Installs handles for resizing the host at its edges and corners.
   */
  private installResizeHandles(): void {
    effect(onCleanup => {
      if (this.enabled()) {
        const handles = untracked(() => this.createResizeHandles());
        onCleanup(() => handles.forEach(handle => handle.dispose()));
      }
    });
  }

  private createResizeHandles(): ResizeHandle[] {
    // Calculate offset to be flush with the component boundaries, not the content boundaries.
    const borderWidth = parseInt(getComputedStyle(this._host).borderWidth, 10);
    const justified = `-${borderWidth + HANDLE_SIZE / 2}px`;

    return [
      // top handle
      new ResizeHandle(this._host, {
        cursor: 'ns-resize',
        left: justified, top: justified, right: justified, height: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => this.onResizeTop(event),
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // right handle
      new ResizeHandle(this._host, {
        cursor: 'ew-resize',
        top: justified, right: justified, bottom: justified, width: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => this.onResizeRight(event),
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // bottom handle
      new ResizeHandle(this._host, {
        cursor: 'ns-resize',
        left: justified, bottom: justified, right: justified, height: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => this.onResizeBottom(event),
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // left handle
      new ResizeHandle(this._host, {
        cursor: 'ew-resize',
        top: justified, left: justified, bottom: justified, width: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => this.onResizeLeft(event),
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // top-left handle
      new ResizeHandle(this._host, {
        cursor: 'nwse-resize',
        top: justified, left: justified, width: `${HANDLE_SIZE}px`, height: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => {
          this.onResizeTop(event);
          this.onResizeLeft(event);
        },
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // top-right handle
      new ResizeHandle(this._host, {
        cursor: 'nesw-resize',
        top: justified, right: justified, width: `${HANDLE_SIZE}px`, height: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => {
          this.onResizeTop(event);
          this.onResizeRight(event);
        },
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // bottom-right handle
      new ResizeHandle(this._host, {
        cursor: 'nwse-resize',
        bottom: justified, right: justified, width: `${HANDLE_SIZE}px`, height: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => {
          this.onResizeBottom(event);
          this.onResizeRight(event);
        },
        onResizeEnd: () => this.onResizeEnd(),
      }),
      // bottom-left handle
      new ResizeHandle(this._host, {
        cursor: 'nesw-resize',
        bottom: justified, left: justified, width: `${HANDLE_SIZE}px`, height: `${HANDLE_SIZE}px`,
        onResizeStart: () => this.onResizeStart(),
        onResize: event => {
          this.onResizeBottom(event);
          this.onResizeLeft(event);
        },
        onResizeEnd: () => this.onResizeEnd(),
      }),
    ];
  }

  /**
   * Method invoked when start resizing the host.
   */
  private onResizeStart(): void {
    const {minHeight, maxHeight, minWidth, maxWidth} = getComputedStyle(this._host);
    const parent = this._host.parentElement!;

    this.minHeight = toPixel(minHeight, {parentSize: parent.clientHeight});
    this.maxHeight = toPixel(maxHeight, {parentSize: parent.clientHeight});
    this.minWidth = toPixel(minWidth, {parentSize: parent.clientWidth});
    this.maxWidth = toPixel(maxWidth, {parentSize: parent.clientWidth});
    if (this.maxWidth !== undefined && this.minWidth !== undefined && this.minWidth > this.maxWidth) {
      this.maxWidth = this.minWidth; // prefer min-width over max-width (as in CSS)
    }
    if (this.maxHeight !== undefined && this.minHeight !== undefined && this.minHeight > this.maxHeight) {
      this.maxHeight = this.minHeight; // prefer min-height over max-height (as in CSS)
    }
    this._workbenchLayoutService.signalResizing(true);
  }

  /**
   * Method invoked when end resizing the host.
   */
  private onResizeEnd(): void {
    this.minHeight = undefined;
    this.maxHeight = undefined;
    this.minWidth = undefined;
    this.maxWidth = undefined;
    this._workbenchLayoutService.signalResizing(false);
  }

  /**
   * Method invoked when moving the top handle.
   */
  private onResizeTop(event: MouseEvent | Touch): void {
    const hostBounds = this._host.getBoundingClientRect();

    // Calculate delta, respecting minimal and maximal size constraints.
    const delta = (() => {
      // Round the delta to the nearest integer to get stable positioning since CSS translations do not have decimal precision.
      const delta = Math.round(event.clientY - hostBounds.top);
      // Do not enlarge if the cursor is located below the handle and moving it upwards.
      if (delta < 0 && event.clientY > hostBounds.top) {
        return 0;
      }
      // Ensure minimal height.
      if (this.minHeight && delta > 0 && event.clientY > hostBounds.bottom - this.minHeight) {
        return hostBounds.height - this.minHeight;
      }
      // Ensure maximal height.
      if (this.maxHeight && delta < 0 && event.clientY < hostBounds.bottom - this.maxHeight) {
        return hostBounds.height - this.maxHeight;
      }
      return delta;
    })();

    if (delta === 0) {
      return;
    }

    this.wbResize.emit({
      height: hostBounds.height - delta,
      translateY: getComputedTranslateY(this._host) + delta,
    });
  }

  /**
   * Method invoked when moving the bottom handle.
   */
  private onResizeBottom(event: MouseEvent | Touch): void {
    const hostBounds = this._host.getBoundingClientRect();

    // Calculate delta, respecting minimal and maximal size constraints.
    const delta = (() => {
      // Round the delta to the nearest integer to get stable positioning since CSS translations do not have decimal precision.
      const delta = Math.round(event.clientY - hostBounds.bottom);
      // Do not enlarge if the cursor is located above the handle and moving it downwards.
      if (delta > 0 && event.clientY < hostBounds.bottom) {
        return 0;
      }
      // Ensure minimal height.
      if (this.minHeight && delta < 0 && event.clientY < hostBounds.top + this.minHeight) {
        return this.minHeight - hostBounds.height;
      }
      // Ensure maximal height.
      if (this.maxHeight && delta > 0 && event.clientY > hostBounds.top + this.maxHeight) {
        return this.maxHeight - hostBounds.height;
      }
      return delta;
    })();

    if (delta === 0) {
      return;
    }

    this.wbResize.emit({
      height: hostBounds.height + delta,
    });
  }

  /**
   * Method invoked when moving the left handle.
   */
  private onResizeLeft(event: MouseEvent | Touch): void {
    const hostBounds = this._host.getBoundingClientRect();

    // Calculate delta, respecting minimal and maximal size constraints.
    const delta = (() => {
      // Divide the delta by two because the host only needs to be moved by half the delta as centered horizontally.
      // Also round the delta to the nearest integer to get stable positioning since CSS translations do not have decimal precision.
      const delta = Math.round((event.clientX - hostBounds.left) / 2) * 2;
      // Do not enlarge if the cursor is located right to the handle and moving it to the left.
      if (delta < 0 && event.clientX > hostBounds.left) {
        return 0;
      }
      // Ensure minimal width.
      if (this.minWidth && delta > 0 && event.clientX > hostBounds.right - this.minWidth) {
        return Math.round((hostBounds.width - this.minWidth) / 2) * 2; // Ensure delta to be dividable by two without remainder to have a stable position as CSS translations do not have decimal precision.
      }
      // Ensure maximal width.
      if (this.maxWidth && delta < 0 && event.clientX < hostBounds.right - this.maxWidth) {
        return Math.round((hostBounds.width - this.maxWidth) / 2) * 2; // Ensure delta to be dividable by two without remainder to have a stable position as CSS translations do not have decimal precision.
      }
      return delta;
    })();

    if (delta === 0) {
      return;
    }

    this.wbResize.emit({
      width: hostBounds.width - delta,
      translateX: getComputedTranslateX(this._host) + delta / 2, // Move only by half the delta as centered horizontally.
    });
  }

  /**
   * Method invoked when moving the right handle.
   */
  private onResizeRight(event: MouseEvent | Touch): void {
    const hostBounds = this._host.getBoundingClientRect();

    // Calculate delta, respecting minimal and maximal size constraints.
    const delta = (() => {
      // Divide the delta by two because the host only needs to be moved by half the delta as centered horizontally.
      // Also round the delta to the nearest integer to get stable positioning since CSS translations do not have decimal precision.
      const delta = Math.round((event.clientX - hostBounds.right) / 2) * 2;
      // Do not enlarge if the cursor is located left to the handle and moving it to the right.
      if (delta > 0 && event.clientX < hostBounds.right) {
        return 0;
      }
      // Ensure minimal width.
      if (this.minWidth && delta < 0 && event.clientX < hostBounds.left + this.minWidth) {
        return Math.round((this.minWidth - hostBounds.width) / 2) * 2; // Ensure delta to be dividable by two without remainder to have a stable position as CSS translations do not have decimal precision.
      }
      // Ensure maximal width.
      if (this.maxWidth && delta > 0 && event.clientX > hostBounds.left + this.maxWidth) {
        return Math.round((this.maxWidth - hostBounds.width) / 2) * 2; // Ensure delta to be dividable by two without remainder to have a stable position as CSS translations do not have decimal precision.
      }
      return delta;
    })();

    if (delta === 0) {
      return;
    }

    this.wbResize.emit({
      width: hostBounds.width + delta,
      translateX: getComputedTranslateX(this._host) + delta / 2, // Move only by half the delta as centered horizontally.
    });
  }
}

/**
 * Represents a handle to resize the host element.
 */
class ResizeHandle {

  private readonly _document: Document;
  private readonly _destroyRef = new ɵDestroyRef();
  private readonly _handleElement: HTMLElement;

  constructor(host: HTMLElement, private _config: ResizeHandleConfig) {
    this._document = host.ownerDocument;
    this._handleElement = createElement('div', {
      parent: host,
      cssClass: 'e2e-resize-handle',
      style: {
        cursor: this._config.cursor,
        position: 'absolute',
        top: this._config.top ?? null,
        right: this._config.right ?? null,
        bottom: this._config.bottom ?? null,
        left: this._config.left ?? null,
        width: this._config.width ?? null,
        height: this._config.height ?? null,
      },
    });
    this.makeHandleMovable();
  }

  private makeHandleMovable(): void {
    let prevBodyCursor: string | undefined;

    fromMoveHandle$(this._handleElement)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event: HandleMoveEvent) => {
        switch (event.type) {
          case 'mousestart': {
            // Apply cursor on document level to prevent flickering while resizing
            prevBodyCursor = this._document.body.style.cursor;
            this._document.body.style.cursor = this._config.cursor;
            this._config.onResizeStart();
            break;
          }
          case 'touchstart': {
            this._config.onResizeStart();
            break;
          }
          case 'mousemove': {
            this._config.onResize(event.mouseEvent);
            break;
          }
          case 'touchmove': {
            this._config.onResize(event.touchEvent.touches[0]!);
            break;
          }
          case 'mouseend': {
            this._document.body.style.cursor = prevBodyCursor!;
            this._config.onResizeEnd();
            break;
          }
          case 'touchend': {
            this._config.onResizeEnd();
            break;
          }
        }
      });
  }

  public dispose(): void {
    this._handleElement.remove();
    this._destroyRef.destroy();
  }
}

/**
 * Event emitted when resizing the host element.
 */
export interface WbResizeEvent {
  /**
   * Specifies the new width of the host.
   */
  width?: number;
  /**
   * Specifies the new height of the host.
   */
  height?: number;
  /**
   * Specifies the new horizontal translation of the host.
   */
  translateX?: number;
  /**
   * Specifies the new vertical translation of the host.
   */
  translateY?: number;
}

/**
 * Configuration of a resize handle.
 */
interface ResizeHandleConfig {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  height?: string;
  width?: string;
  cursor: 'ew-resize' | 'ns-resize' | 'nwse-resize' | 'nesw-resize';
  onResizeStart: () => void;
  onResize: (event: MouseEvent | Touch) => void;
  onResizeEnd: () => void;
}

/**
 * Converts the passed pixel or percentage value into a numerical pixel value, or returns `undefined` if passing `none`.
 */
function toPixel(size: string | 'none', options: {parentSize: number}): number | undefined {
  if (size === 'none') {
    return undefined;
  }
  return size.endsWith('%') ? options.parentSize * parseInt(size, 10) / 100 : parseInt(size, 10);
}

function getComputedTranslateX(element: HTMLElement): number {
  const {translateX} = getCssTranslation(element);
  return translateX === 'none' ? 0 : parseInt(translateX, 10);
}

function getComputedTranslateY(element: HTMLElement): number {
  const {translateY} = getCssTranslation(element);
  return translateY === 'none' ? 0 : parseInt(translateY, 10);
}
