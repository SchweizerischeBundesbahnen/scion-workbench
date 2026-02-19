import {ElementRef, Signal, ViewContainerRef} from '@angular/core';
import {SciMenuRef} from './menu-adapter';

export abstract class SciMenuService {

  public abstract open(menuName: `menu:${string}`, options: SciMenuOptions): SciMenuRef;
}

export interface SciMenuOptions {
  /**
   * Controls where to open the menu.
   *
   * Can be an HTML element or a coordinate. The coordinate is relative to the page viewport.
   *
   * Supported coordinate pairs:
   * - x/y: Relative to the top/left corner of the page viewport.
   * - top/left: Same as x/y.
   * - top/right: Relative to the top/right corner of the page viewport.
   * - bottom/left: Relative to the bottom/left corner of the page viewport.
   * - bottom/right: Relative to the bottom/right corner of the page viewport.
   */
  anchor: MaybeSignal<HTMLElement | ElementRef<HTMLElement> | SciMenuOrigin>;
  /**
   * Controls where to align the menu relative to the menu anchor, unless there is not enough space available in that area. Defaults to `south`.
   */
  align?: 'east' | 'west' | 'north' | 'south';
  /**
   * Controls where the menu will be added to the DOM. If not specified, adds the menu after the anchor element.
   */
  viewContainerRef?: ViewContainerRef;
}

// Consider moving to @scion/toolkit
export type MaybeSignal<T> = T | Signal<T>;

/**
 * Represents a point on the page, optionally with a dimension, where a menu should be attached.
 */
export type SciMenuOrigin = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};
