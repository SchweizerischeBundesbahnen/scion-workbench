import * as _angular_core from '@angular/core';
import { ElementRef, Signal, Injector } from '@angular/core';

/**
 * Represents the dimension of an element.
 */
interface SciDimension {
    offsetWidth: number;
    offsetHeight: number;
    clientWidth: number;
    clientHeight: number;
    element: HTMLElement;
}

/**
 * Observes the size of the host element.
 *
 * ---
 * Usage:
 *
 * ```html
 * <div sciDimension (sciDimensionChange)="onDimensionChange($event)"></div>
 * ```
 */
declare class SciDimensionDirective {
    /**
     * Controls if to output outside the Angular zone. Defaults to `false`.
     */
    readonly emitOutsideAngular: _angular_core.InputSignal<boolean>;
    /**
     * Outputs the size of the element.
     */
    readonly dimensionChange: _angular_core.OutputEmitterRef<SciDimension>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciDimensionDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<SciDimensionDirective, "[sciDimension]", never, { "emitOutsideAngular": { "alias": "emitOutsideAngular"; "required": false; "isSignal": true; }; }, { "dimensionChange": "sciDimensionChange"; }, never, never, true, never>;
}

/**
 * Creates a signal observing the size of an element.
 *
 * The element can be passed as a signal, enabling observation of view children in the component constructor.
 *
 * The signal subscribes to the native {@link ResizeObserver} to monitor element size changes. Destroying the injection context will unsubscribe the observer.
 *
 * Usage:
 * - Must be called within an injection context or an injector provided. Destroying the injector will unsubscribe the signal.
 * - Must not be called within a reactive context to avoid repeated subscriptions.
 */
declare function dimension(elementLike: HTMLElement | ElementRef<HTMLElement> | Signal<HTMLElement | ElementRef<HTMLElement>>, options?: {
    injector?: Injector;
}): Signal<SciDimension>;
declare function dimension(elementLike: HTMLElement | ElementRef<HTMLElement> | Signal<HTMLElement | ElementRef<HTMLElement> | undefined>, options?: {
    injector?: Injector;
}): Signal<SciDimension | undefined>;

/**
 * Creates a signal observing the bounding box of an element.
 *
 * The bounding box includes the element's position relative to the top-left of the viewport and its size.
 * Refer to https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect for more details.
 *
 * The element can be passed as a signal, enabling observation of view children in the component constructor.
 *
 * There is no native browser API to observe the position of an element. The signal uses {@link IntersectionObserver} and
 * {@link ResizeObserver} to detect position changes. For tracking only size changes, use the {@link dimension} signal instead.
 *
 * Usage:
 * - Must be called within an injection context or an injector provided. Destroying the injector will unsubscribe the signal.
 * - Must not be called within a reactive context to avoid repeated subscriptions.
 * - The element and the document root (`<html>`) must be positioned `relative` or `absolute`. If not, positioning is changed to `relative`.
 */
declare function boundingClientRect(elementLike: HTMLElement | ElementRef<HTMLElement> | Signal<HTMLElement | ElementRef<HTMLElement>>, options?: {
    injector?: Injector;
}): Signal<DOMRect>;
declare function boundingClientRect(elementLike: HTMLElement | ElementRef<HTMLElement> | Signal<HTMLElement | ElementRef<HTMLElement> | undefined>, options?: {
    injector?: Injector;
}): Signal<DOMRect | undefined>;

export { SciDimensionDirective, boundingClientRect, dimension };
export type { SciDimension };
