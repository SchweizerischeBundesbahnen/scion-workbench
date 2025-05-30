import * as i0 from '@angular/core';
import { inject, DOCUMENT, NgZone, Injectable, input, ElementRef, Renderer2, effect, untracked, Directive, DestroyRef, viewChild, computed, HostBinding, ChangeDetectionStrategy, Component, output, HostListener, ViewEncapsulation } from '@angular/core';
import { fromEvent, merge, mergeWith, timer, of } from 'rxjs';
import { debounceTime, startWith, map, distinctUntilChanged, first, withLatestFrom, takeWhile, takeUntil, switchMap } from 'rxjs/operators';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { subscribeIn, filterArray } from '@scion/toolkit/operators';
import { coerceElement } from '@angular/cdk/coercion';
import { fromResize$, fromMutation$ } from '@scion/toolkit/observable';
import { CdkScrollable } from '@angular/cdk/scrolling';

/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Provides the native scrollbar tracksize.
 */
class SciNativeScrollbarTrackSizeProvider {
    _document = inject(DOCUMENT);
    _zone = inject(NgZone);
    /**
     * Provides the track size of the native scrollbar, or `null` if the native scrollbars sit on top of the content.
     */
    trackSize;
    constructor() {
        this.trackSize = this.createNativeScrollbarTrackSizeSignal();
    }
    /**
     * Computes the native scrollbar track size.
     *
     * @returns native track size, or `null` if the native scrollbars sit on top of the content.
     */
    computeTrackSize() {
        // Create temporary viewport and viewport client with native scrollbars to compute the scrolltrack width.
        const viewportDiv = this._document.createElement('div');
        setStyle(viewportDiv, {
            position: 'absolute',
            overflow: 'scroll',
            height: '100px',
            width: '100px',
            border: '0',
            visibility: 'hidden',
        });
        const viewportClientDiv = this._document.createElement('div');
        setStyle(viewportClientDiv, {
            height: '100%',
            width: '100%',
            border: '0',
        });
        viewportDiv.appendChild(viewportClientDiv);
        this._document.body.appendChild(viewportDiv);
        // Do not use client and offset width/height to calculate the size of the scrollbar, as they are rounded, resulting in unwanted spacing when zooming the page.
        const viewportBounds = viewportDiv.getBoundingClientRect();
        const viewportClientBounds = viewportClientDiv.getBoundingClientRect();
        const trackSize = {
            hScrollbarTrackHeight: viewportBounds.height - viewportClientBounds.height,
            vScrollbarTrackWidth: viewportBounds.width - viewportClientBounds.width,
        };
        // Destroy temporary viewport.
        this._document.body.removeChild(viewportDiv);
        if (trackSize.hScrollbarTrackHeight === 0 && trackSize.vScrollbarTrackWidth === 0) {
            return null;
        }
        return trackSize;
    }
    createNativeScrollbarTrackSizeSignal() {
        // We compute the size of the native scrollbar track when the browser fires the onresize window event.
        // This event is also fired on page zoom or when displaying a hidden document. Hidden documents do not have
        // a scrollbar track size until being displayed, e.g., after showing hidden iframes.
        const trackSize$ = fromEvent(window, 'resize')
            .pipe(subscribeIn(fn => this._zone.runOutsideAngular(fn)), debounceTime(5), startWith(null), // trigger the initial computation
        map(() => this.computeTrackSize()), distinctUntilChanged((t1, t2) => t1?.hScrollbarTrackHeight === t2?.hScrollbarTrackHeight && t1?.vScrollbarTrackWidth === t2?.vScrollbarTrackWidth));
        return toSignal(trackSize$, { initialValue: null });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciNativeScrollbarTrackSizeProvider, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciNativeScrollbarTrackSizeProvider, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciNativeScrollbarTrackSizeProvider, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
/**
 * Applies the given style(s) to the given element.
 *
 * Specify styles to be modified by passing a dictionary containing CSS property names (hyphen case).
 * To remove a style, set its value to `null`.
 *
 * @ignore
 */
function setStyle(element, styles) {
    Object.entries(styles).forEach(([name, value]) => element.style.setProperty(name, value));
}

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Makes the host element natively scrollable and hides native scrollbars by default, unless native scrollbars
 * already sit on top of the viewport (e.g. in OS X).
 *
 * Because there is no cross-browser API to hide scrollbars without losing native scroll support, we set 'overflow'
 * to 'scroll' but shift the native scrollbars out of the visible viewport area. The shift offset is computed upfront.
 *
 * This directive expects its host element to be the only child in document flow in its parent DOM element. It makes the host element
 * fill up the entire space (width and height set to 100%). The parent element must have its CSS `overflow` property set to `hidden`
 * to hide the pushed out native scrollbars.
 */
class SciScrollableDirective {
    /**
     * Controls whether to display native scrollbars.
     * Has no effect if the native scrollbar sits on top of the content, e.g. in OS X.
     */
    displayNativeScrollbar = input(false, { alias: 'sciScrollableDisplayNativeScrollbar' });
    _host = inject((ElementRef)).nativeElement;
    _renderer = inject(Renderer2);
    _nativeScrollbarTrackSizeProvider = inject(SciNativeScrollbarTrackSizeProvider);
    constructor() {
        this.controlDisplayOfNativeScrollbar();
    }
    /**
     * Controls the display of the native scrollbar based on this directive's configuration.
     */
    controlDisplayOfNativeScrollbar() {
        effect(() => {
            const displayNativeScrollbar = this.displayNativeScrollbar();
            if (displayNativeScrollbar) {
                untracked(() => this.useNativeScrollbars());
                return;
            }
            const nativeScrollbarTrackSize = this._nativeScrollbarTrackSizeProvider.trackSize();
            if (nativeScrollbarTrackSize) {
                untracked(() => this.shiftNativeScrollbars(nativeScrollbarTrackSize));
            }
            else {
                untracked(() => this.useNativeScrollbars());
            }
        });
    }
    /**
     * Uses the native scrollbars when content overflows.
     */
    useNativeScrollbars() {
        this.setStyle(this._host, {
            overflow: 'auto',
            width: '100%',
            height: '100%',
            marginRight: 0,
            marginBottom: 0,
        });
    }
    /**
     * Shifts the native scrollbars out of the visible viewport area.
     */
    shiftNativeScrollbars(nativeScrollbarTrackSize) {
        this.setStyle(this._host, {
            overflow: 'scroll',
            width: `calc(100% + ${nativeScrollbarTrackSize.vScrollbarTrackWidth}px`,
            height: `calc(100% + ${nativeScrollbarTrackSize.hScrollbarTrackHeight}px`,
            marginRight: `-${nativeScrollbarTrackSize.vScrollbarTrackWidth}px`,
            marginBottom: `-${nativeScrollbarTrackSize.hScrollbarTrackHeight}px`,
        });
    }
    setStyle(element, style) {
        Object.keys(style).forEach(key => this._renderer.setStyle(element, key, style[key]));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciScrollableDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: SciScrollableDirective, isStandalone: true, selector: "[sciScrollable]", inputs: { displayNativeScrollbar: { classPropertyName: "displayNativeScrollbar", publicName: "sciScrollableDisplayNativeScrollbar", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciScrollableDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[sciScrollable]' }]
        }], ctorParameters: () => [] });

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Renders a vertical or horizontal scrollbar.
 *
 * The scrollbar features the following functionality:
 * - allows to move the thumb by mouse or touch
 * - enlarges the thumb if the mouse pointer is near the thumb
 * - allows paging on mousedown on the scroll track
 *
 * ### Styling:
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-scrollbar` component, the following CSS variables can be set directly on the component.
 *
 * - sci-scrollbar-color:    Sets the color of the scrollbar.
 *
 * Example:
 *
 * ```css
 *
 * sci-scrollbar {
 *   --sci-scrollbar-color: blue;
 * }
 * ```
 */
class SciScrollbarComponent {
    /**
     * Timeout for debouncing viewport resize events that trigger the scroll position computation.
     *
     * Debouncing is particularly important in the context of Angular animations, since they continuously
     * trigger resize events. Debouncing prevents the scrollbar from flickering, for example, when the user
     * expands a panel that contains a viewport.
     *
     * @internal
     */
    static VIEWPORT_RESIZE_DEBOUNCE_TIME = 50;
    /**
     * Specifies the direction of the scrollbar. Defaults to a vertical scrollbar.
     */
    direction = input('vscroll');
    /**
     * The viewport to provide scrollbars for.
     */
    viewport = input.required();
    _host = inject(ElementRef).nativeElement;
    _document = inject(DOCUMENT);
    _zone = inject(NgZone);
    _destroyRef = inject(DestroyRef);
    _thumbElement = viewChild.required('thumb_handle');
    _vertical = computed(() => this.direction() === 'vscroll');
    _lastDragPosition = null;
    _overflow = false;
    _thumbSizeFr = 0;
    _thumbPositionFr = 0;
    get vertical() {
        return this._vertical();
    }
    get horizontal() {
        return !this._vertical();
    }
    get scrolling() {
        return this._lastDragPosition !== null;
    }
    constructor() {
        this.installScrollPositionRenderer();
    }
    /**
     * Computes the scroll position and updates CSS variables to render the scroll position in the UI.
     */
    renderScrollPosition() {
        NgZone.assertNotInAngularZone();
        const viewportSize = this.viewportSize;
        const viewportClientSize = this.viewportClientSize;
        const thumbPositionFr = this.scrollPosition / viewportClientSize;
        const thumbSizeFr = viewportSize / viewportClientSize;
        const overflow = viewportClientSize > viewportSize;
        if (thumbPositionFr !== this._thumbPositionFr || thumbSizeFr !== this._thumbSizeFr) {
            this._thumbPositionFr = thumbPositionFr;
            this._thumbSizeFr = thumbSizeFr;
            this.setCssVariable('--ɵsci-scrollbar-thumb-position-fr', thumbPositionFr);
            this.setCssVariable('--ɵsci-scrollbar-thumb-size-fr', thumbSizeFr);
        }
        if (overflow !== this._overflow) {
            this._overflow = overflow;
            overflow ? this._host.classList.add('overflow') : this._host.classList.remove('overflow');
        }
    }
    onTouchStart(event) {
        event.preventDefault();
        this._lastDragPosition = this.vertical ? event.touches[0].screenY : event.touches[0].screenX;
    }
    onTouchMove(event) {
        event.preventDefault();
        const newDragPositionPx = this.vertical ? event.touches[0].screenY : event.touches[0].screenX;
        const scrollbarPanPx = newDragPositionPx - this._lastDragPosition;
        const viewportPanPx = this.toViewportPanPx(scrollbarPanPx);
        this._lastDragPosition = newDragPositionPx;
        this.moveViewportClient(viewportPanPx);
    }
    onTouchEnd(event) {
        event.preventDefault();
        this._lastDragPosition = null;
    }
    onMouseDown(mousedownEvent) {
        if (mousedownEvent.button !== 0) {
            return;
        }
        mousedownEvent.preventDefault();
        this._lastDragPosition = this.vertical ? mousedownEvent.screenY : mousedownEvent.screenX;
        // Listen for 'mousemove' events
        const mousemoveListener = merge(fromEvent(this._document, 'mousemove'), fromEvent(this._document, 'sci-mousemove'))
            .pipe(subscribeIn(fn => this._zone.runOutsideAngular(fn)), takeUntilDestroyed(this._destroyRef))
            .subscribe(mousemoveEvent => {
            NgZone.assertNotInAngularZone();
            mousemoveEvent.preventDefault();
            const newDragPositionPx = this.vertical ? mousemoveEvent.screenY : mousemoveEvent.screenX;
            const scrollbarPanPx = newDragPositionPx - this._lastDragPosition;
            const viewportPanPx = this.toViewportPanPx(scrollbarPanPx);
            this._lastDragPosition = newDragPositionPx;
            this.moveViewportClient(viewportPanPx);
        });
        // Listen for 'mouseup' events; use 'capture phase' and 'stop propagation' to not close overlays
        merge(fromEvent(this._document, 'mouseup', { capture: true }), fromEvent(this._document, 'sci-mouseup'))
            .pipe(subscribeIn(fn => this._zone.runOutsideAngular(fn)), first(), takeUntilDestroyed(this._destroyRef))
            .subscribe(mouseupEvent => {
            NgZone.assertNotInAngularZone();
            mouseupEvent.stopPropagation();
            mousemoveListener.unsubscribe();
            this._lastDragPosition = null;
        });
    }
    onScrollTrackMouseDown(event, direction) {
        const signum = (direction === 'up' ? -1 : +1);
        this.scrollWhileMouseDown(this.toViewportPanPx(signum * this.thumbSize), event);
    }
    /**
     * Renders the current scroll position when the viewport is scrolled.
     */
    installScrollPositionRenderer() {
        effect(onCleanup => {
            const viewport = this.viewport();
            untracked(() => {
                const subscription = viewportScroll$(viewport)
                    .pipe(mergeWith(viewportSize$(viewport, { debounceTime: SciScrollbarComponent.VIEWPORT_RESIZE_DEBOUNCE_TIME })), mergeWith(viewportClientSize$(viewport, { debounceTime: SciScrollbarComponent.VIEWPORT_RESIZE_DEBOUNCE_TIME })), subscribeIn(fn => this._zone.runOutsideAngular(fn)))
                    .subscribe(() => this.renderScrollPosition());
                onCleanup(() => subscription.unsubscribe());
            });
        });
    }
    /**
     * Projects the given scrollbar scroll pixels into viewport scroll pixels.
     */
    toViewportPanPx(scrollbarPanPx) {
        const scrollRangePx = this.trackSize - this.thumbSize;
        const scrollRatio = scrollbarPanPx / scrollRangePx;
        return scrollRatio * (this.viewportClientSize - this.viewportSize);
    }
    /**
     * Moves the viewport client by the specified numbers of pixels.
     */
    moveViewportClient(viewportPanPx) {
        if (this.vertical) {
            this.viewport().scrollTop += viewportPanPx;
        }
        else {
            this.viewport().scrollLeft += viewportPanPx;
        }
    }
    /**
     * Indicates if the content overflows.
     */
    get overflow() {
        return this._overflow;
    }
    /**
     * Scrolls continuously while holding the mouse pressed, or until the mouse leaves the scrolltrack.
     */
    scrollWhileMouseDown(viewportScrollPx, mousedownEvent) {
        // The `EventTarget` type of `Event.target` is not yet compatible with `FromEventTarget` used in `fromEvent`.
        // This will be fixed in rxjs version 7.0.0. Refer to https://github.com/ReactiveX/rxjs/commit/5f022d784570684632e6fd5ae247fc259ee34c4b
        // for more details.
        const scrollTrackElement = mousedownEvent.target;
        // scroll continuously every 50ms after an initial delay of 250ms
        timer(250, 50)
            .pipe(
        // continue chain with latest mouse event
        withLatestFrom(merge(of(mousedownEvent), fromEvent(scrollTrackElement, 'mousemove')), (tick, event) => event), 
        // start immediately
        startWith(mousedownEvent), 
        // stop scrolling if the thumb hits the mouse pointer position
        takeWhile((event) => scrollTrackElement === this._document.elementFromPoint(event.clientX, event.clientY)), debounceTime(10), 
        // stop scrolling on mouseout or mouseup
        takeUntil(merge(fromEvent(scrollTrackElement, 'mouseout'), fromEvent(scrollTrackElement, 'mouseup'))))
            .subscribe(() => {
            this.moveViewportClient(viewportScrollPx);
        });
    }
    setCssVariable(key, value) {
        this._host.style.setProperty(key, `${value}`);
    }
    get viewportSize() {
        return this.vertical ? this.viewport().clientHeight : this.viewport().clientWidth;
    }
    get viewportClientSize() {
        return this.vertical ? this.viewport().scrollHeight : this.viewport().scrollWidth;
    }
    get scrollPosition() {
        return this.vertical ? this.viewport().scrollTop : this.viewport().scrollLeft;
    }
    get thumbSize() {
        const thumbElement = this._thumbElement().nativeElement;
        return this.vertical ? thumbElement.clientHeight : thumbElement.clientWidth;
    }
    get trackSize() {
        return this.vertical ? this._host.clientHeight : this._host.clientWidth;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciScrollbarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "20.0.0", type: SciScrollbarComponent, isStandalone: true, selector: "sci-scrollbar", inputs: { direction: { classPropertyName: "direction", publicName: "direction", isSignal: true, isRequired: false, transformFunction: null }, viewport: { classPropertyName: "viewport", publicName: "viewport", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "class.vertical": "this.vertical", "class.horizontal": "this.horizontal", "class.scrolling": "this.scrolling" } }, viewQueries: [{ propertyName: "_thumbElement", first: true, predicate: ["thumb_handle"], descendants: true, isSignal: true }], ngImport: i0, template: "<!-- scrolltrack to move the viewport client upwards (paging) -->\n<div class=\"scrolltrack-start\" (mousedown)=\"onScrollTrackMouseDown($event, 'up')\"></div>\n\n<!-- scrollthumb -->\n<div #thumb_handle\n     class=\"thumb-handle\"\n     [class.vertical]=\"vertical\"\n     [class.horizontal]=\"horizontal\"\n     (mousedown)=\"onMouseDown($event)\"\n     (touchstart)=\"onTouchStart($event)\"\n     (touchmove)=\"onTouchMove($event)\"\n     (touchend)=\"onTouchEnd($event)\"\n     (touchcancel)=\"onTouchEnd($event)\">\n  <div class=\"thumb\"\n       [class.vertical]=\"vertical\"\n       [class.horizontal]=\"horizontal\">\n  </div>\n</div>\n\n<!-- scrolltrack to move the viewport client downwards (paging) -->\n<div class=\"scrolltrack-end\" (mousedown)=\"onScrollTrackMouseDown($event, 'down')\"></div>\n", styles: ["@charset \"UTF-8\";:host{display:flex;border:2px solid transparent;box-sizing:border-box;--\\275sci-scrollbar-thumb-position-fr: 0;--\\275sci-scrollbar-thumb-size-fr: 0}:host.vertical{flex-direction:column}:host.horizontal{flex-direction:row}:host>div.scrolltrack-start{flex-grow:var(--\\275sci-scrollbar-thumb-position-fr)}:host>div.thumb-handle{flex-basis:20px;display:flex;flex-grow:var(--\\275sci-scrollbar-thumb-size-fr);align-items:center}:host>div.thumb-handle.vertical{flex-direction:column}:host>div.thumb-handle.horizontal{flex-direction:row}:host>div.thumb-handle>div.thumb{flex:auto;border-radius:4px;background-color:var(--sci-scrollbar-color);opacity:.4;transition-duration:125ms;transition-property:width,height;transition-timing-function:ease-out}:host>div.thumb-handle>div.thumb.vertical{width:60%}:host>div.thumb-handle>div.thumb.horizontal{height:60%}:host>div.scrolltrack-end{flex-grow:calc(1 - (var(--\\275sci-scrollbar-thumb-position-fr) + var(--\\275sci-scrollbar-thumb-size-fr)))}:host-context:not(.overflow){display:none}:host-context:hover>div.thumb-handle>div.thumb,:host-context(.scrolling)>div.thumb-handle>div.thumb{background-color:var(--sci-scrollbar-color);opacity:.75}:host-context:hover>div.thumb-handle>div.thumb.vertical,:host-context(.scrolling)>div.thumb-handle>div.thumb.vertical{width:100%}:host-context:hover>div.thumb-handle>div.thumb.horizontal,:host-context(.scrolling)>div.thumb-handle>div.thumb.horizontal{height:100%}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciScrollbarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-scrollbar', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- scrolltrack to move the viewport client upwards (paging) -->\n<div class=\"scrolltrack-start\" (mousedown)=\"onScrollTrackMouseDown($event, 'up')\"></div>\n\n<!-- scrollthumb -->\n<div #thumb_handle\n     class=\"thumb-handle\"\n     [class.vertical]=\"vertical\"\n     [class.horizontal]=\"horizontal\"\n     (mousedown)=\"onMouseDown($event)\"\n     (touchstart)=\"onTouchStart($event)\"\n     (touchmove)=\"onTouchMove($event)\"\n     (touchend)=\"onTouchEnd($event)\"\n     (touchcancel)=\"onTouchEnd($event)\">\n  <div class=\"thumb\"\n       [class.vertical]=\"vertical\"\n       [class.horizontal]=\"horizontal\">\n  </div>\n</div>\n\n<!-- scrolltrack to move the viewport client downwards (paging) -->\n<div class=\"scrolltrack-end\" (mousedown)=\"onScrollTrackMouseDown($event, 'down')\"></div>\n", styles: ["@charset \"UTF-8\";:host{display:flex;border:2px solid transparent;box-sizing:border-box;--\\275sci-scrollbar-thumb-position-fr: 0;--\\275sci-scrollbar-thumb-size-fr: 0}:host.vertical{flex-direction:column}:host.horizontal{flex-direction:row}:host>div.scrolltrack-start{flex-grow:var(--\\275sci-scrollbar-thumb-position-fr)}:host>div.thumb-handle{flex-basis:20px;display:flex;flex-grow:var(--\\275sci-scrollbar-thumb-size-fr);align-items:center}:host>div.thumb-handle.vertical{flex-direction:column}:host>div.thumb-handle.horizontal{flex-direction:row}:host>div.thumb-handle>div.thumb{flex:auto;border-radius:4px;background-color:var(--sci-scrollbar-color);opacity:.4;transition-duration:125ms;transition-property:width,height;transition-timing-function:ease-out}:host>div.thumb-handle>div.thumb.vertical{width:60%}:host>div.thumb-handle>div.thumb.horizontal{height:60%}:host>div.scrolltrack-end{flex-grow:calc(1 - (var(--\\275sci-scrollbar-thumb-position-fr) + var(--\\275sci-scrollbar-thumb-size-fr)))}:host-context:not(.overflow){display:none}:host-context:hover>div.thumb-handle>div.thumb,:host-context(.scrolling)>div.thumb-handle>div.thumb{background-color:var(--sci-scrollbar-color);opacity:.75}:host-context:hover>div.thumb-handle>div.thumb.vertical,:host-context(.scrolling)>div.thumb-handle>div.thumb.vertical{width:100%}:host-context:hover>div.thumb-handle>div.thumb.horizontal,:host-context(.scrolling)>div.thumb-handle>div.thumb.horizontal{height:100%}\n"] }]
        }], ctorParameters: () => [], propDecorators: { vertical: [{
                type: HostBinding,
                args: ['class.vertical']
            }], horizontal: [{
                type: HostBinding,
                args: ['class.horizontal']
            }], scrolling: [{
                type: HostBinding,
                args: ['class.scrolling']
            }] } });
/**
 * Emits whenever the viewport scrolls.
 */
function viewportScroll$(viewport) {
    return fromEvent(viewport, 'scroll', { passive: true }).pipe(map(() => undefined));
}
/**
 * Emits on subscription, and then each time the size of the viewport changes.
 */
function viewportSize$(viewport, options) {
    return fromResize$(viewport)
        .pipe(
    // Debouncing is particularly important in the context of Angular animations, since they continuously
    // trigger resize events. Debouncing prevents the scrollbar from flickering, for example, when the user
    // expands a panel that contains a viewport.
    debounceTime(options.debounceTime), map(() => undefined));
}
/**
 * Emits on subscription, and then each time the size or style property of the viewport client changes.
 */
function viewportClientSize$(viewport, options) {
    return children$(viewport)
        .pipe(switchMap(children => merge(...children.map(child => merge(fromResize$(child), 
    // Observe style mutations since some transformations change the scroll position without necessarily triggering a dimension change,
    // e.g., `scale` or `translate` used by some virtual scroll implementations
    fromMutation$(child, { subtree: false, childList: false, attributeFilter: ['style'] }))))), 
    // Debouncing is particularly important in the context of Angular animations, since they continuously
    // trigger resize events. Debouncing prevents the scrollbar from flickering, for example, when the user
    // expands a panel that contains a viewport.
    debounceTime(options.debounceTime), map(() => undefined));
}
/**
 * Emits the children of the passed element, and then each time child elements are added or removed.
 */
function children$(element) {
    return fromMutation$(element, { subtree: false, childList: true })
        .pipe(startWith(undefined), map(() => Array.from(element.children)), filterArray((child) => child instanceof HTMLElement));
}

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Represents a viewport with slotted content (`<ng-content>`) used as scrollable content. By default, content is added to a CSS grid layout.
 *
 * The viewport component displays scrollbars when its content overflows. Scrollbars are displayed on top of the content, not next to it.
 * The component uses the native scrollbars of the operating system if they are already sitting on top, or falls back and renders scrollbars on top otherwise.
 * The viewport remains natively scrollable with the native scrollbars shifted out of the viewport's visible area. Consequently, the viewport keeps supporting
 * native scrolling features such as touch gestures, scroll speed acceleration, or scrolling near the viewport edges during drag-and-drop operations.
 *
 * ```html
 * <sci-viewport>
 *   your content
 * </sci-viewport>
 * ```
 *
 * ## Adding the viewport to a layout
 *
 * Typically, you would add the viewport component to a flexible layout, filling the remaining space vertically and horizontally, such as a flexbox container
 * with the viewport's `flex` CSS property set to either `flex: auto` or `flex: 1 1 0`.
 *
 * The viewport is sized according to its content width and height. It grows to absorb any free space, thus overflowing its content only when encountering
 * a layout constraint. Depending on the layout, different steps may be necessary to prevent the viewport from growing to infinity.
 *
 * - If practical, give the viewport a fixed size or a maximum size.
 * - If you add the viewport to a flexbox layout, make sure that it cannot exceed the available space. Instead, the viewport should fill the remaining space,
 *   vertically and horizontally. Be aware that, by default, a flex item does not shrink below its minimum content size. To change this, set the viewport's
 *   `flex-basis` to `0` (instead of `auto`), or use the CSS shorthand property `flex: 1 1 0`. The `flex-basis` defines the default size of a flex item before
 *   the remaining extra space is distributed. If the viewport does not appear after setting this property, check its parent elements' content sizes.
 *   As an alternative to setting `flex: 1 1 0`, change the setting to `flex: auto` and hide the overflow in the parent element, as follows: `overflow: hidden`.
 *   Another approach would be to set the minimum height of all parents to `0`, as follows: `min-height: 0`.
 *
 *   For the complete documentation on the flex layout and its features, refer to https://developer.mozilla.org/en-US/docs/Web/CSS/flex.
 *
 *
 * ## Layouting the viewport's slotted content
 *
 * By default, the viewport's content is added to a CSS grid container with a single column, filling remaining space vertically and horizontally.
 * Using the `::part(content)` pseudo element selector, you can configure the grid container or apply a different layout, such as a flex or flow layout.
 *
 * #### Example of adding slotted content to a CSS flex container
 * ```css
 * sci-viewport::part(content) {
 *   display: flex;
 *   flex-direction: column;
 * }
 * ```
 *
 * #### Example of configuring CSS grid container with two columns
 * ```css
 * sci-viewport::part(content) {
 *   grid-template-columns: 1fr 1fr;
 *   gap: 1em;
 * }
 * ```
 *
 * ## Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-viewport` component, the following CSS variables can be set directly on the component.
 *
 * - sci-viewport-scrollbar-color:     Sets the color of the scrollbar.
 *
 * ```css
 * sci-viewport {
 *   --sci-viewport-scrollbar-color: blue;
 * }
 * ```
 */
class SciViewportComponent {
    /**
     * Controls if to use the native scrollbar or a scrollbar that sits on top of the viewport. Defaults to `on-top`.
     */
    scrollbarStyle = input('on-top');
    /**
     * Emits when the viewport is scrolled. The event is emitted outside the Angular zone to avoid unnecessary change detection cycles.
     */
    scroll = output(); // eslint-disable-line @angular-eslint/no-output-native
    _host = inject(ElementRef).nativeElement;
    _viewport = viewChild.required('viewport');
    _viewportClient = viewChild.required('viewport_client');
    nativeScrollbarTrackSizeProvider = inject(SciNativeScrollbarTrackSizeProvider);
    constructor() {
        this.installScrollEmitter();
    }
    focus() {
        this.viewportElement.focus();
    }
    /**
     * Returns the number of pixels that the viewport client is scrolled vertically.
     *
     * @see Element.scrollTop
     */
    get scrollTop() {
        return this.viewportElement.scrollTop;
    }
    /**
     * Sets the number of pixels that the viewport client is scrolled vertically.
     *
     * @see Element.scrollTop
     */
    set scrollTop(scrollTop) {
        this.viewportElement.scrollTop = scrollTop;
    }
    /**
     * Returns the number of pixels that the viewport client is scrolled horizontally.
     *
     * @see Element.scrollLeft
     */
    get scrollLeft() {
        return this.viewportElement.scrollLeft;
    }
    /**
     * Sets the number of pixels that the viewport client is scrolled horizontally.
     *
     * @see Element.scrollLeft
     */
    set scrollLeft(scrollLeft) {
        this.viewportElement.scrollLeft = scrollLeft;
    }
    /**
     * Returns the height of the viewport client.
     *
     * @see Element.scrollHeight
     */
    get scrollHeight() {
        return this.viewportElement.scrollHeight;
    }
    /**
     * Returns the width of the viewport client.
     *
     * @see Element.scrollWidth
     */
    get scrollWidth() {
        return this.viewportElement.scrollWidth;
    }
    /**
     * Returns the viewport {HTMLElement}.
     */
    get viewportElement() {
        return this._viewport().nativeElement;
    }
    /**
     * Returns the viewport client {HTMLElement}.
     */
    get viewportClientElement() {
        return this._viewportClient().nativeElement;
    }
    /**
     * Checks if the specified element is scrolled into the viewport.
     *
     * @param element - the element to be checked
     * @param fit - control if the element must fully or partially fit into the viewport
     * @return `true` if the element is scrolled into the viewport, or `false` otherwise.
     */
    isElementInView(element, fit) {
        const elTop = this.computeOffset(element, 'top');
        if (elTop === null) {
            return false;
        }
        const elLeft = this.computeOffset(element, 'left');
        if (elLeft === null) {
            return false;
        }
        // Consider elements as scrolled into view when there is no viewport overflow.
        // The calculation of whether an element is scrolled into view may be wrong by a few pixels if the viewport contains elements with decimal sizes.
        // This can happen because `offsetLeft` and `offsetTop` operate on an integer (not a decimal), losing precision that can accumulate.
        // To avoid incorrect calculation when there is no viewport overflow, we consider all contained elements as scrolled into the view.
        if (this.viewportElement.scrollWidth <= this.viewportElement.clientWidth && this.viewportElement.scrollHeight <= this.viewportElement.clientHeight) {
            return true;
        }
        const elBottom = elTop + coerceElement(element).offsetHeight;
        const elRight = elLeft + coerceElement(element).offsetWidth;
        const vpTop = this.viewportElement.scrollTop;
        const vpLeft = this.viewportElement.scrollLeft;
        const vpBottom = vpTop + this.viewportElement.clientHeight;
        const vpRight = vpLeft + this.viewportElement.clientWidth;
        if (fit === 'full') {
            return (elTop >= vpTop && elBottom <= vpBottom) && (elLeft >= vpLeft && elRight <= vpRight);
        }
        else {
            return (elBottom >= vpTop && elTop <= vpBottom) && (elRight >= vpLeft && elLeft <= vpRight);
        }
    }
    /**
     * Scrolls the specified element into the viewport.
     *
     * @param element - the element to scroll into the viewport
     * @param offset - the gap between the element and the viewport
     */
    scrollIntoView(element, offset = 50) {
        const top = this.computeOffset(element, 'top');
        if (top === null) {
            return;
        }
        const left = this.computeOffset(element, 'left');
        if (left === null) {
            return;
        }
        this.viewportElement.scrollTop = top - offset;
        this.viewportElement.scrollLeft = left - offset;
    }
    /**
     * Computes the distance of the element to the viewport's left or top border.
     *
     * @return distance of the element to the viewport's left or top border, or `null` if not contained
     *         in the viewport or the element or any ancestor has the `display` property set to `none`.
     */
    computeOffset(element, border) {
        let offset = 0;
        let el = coerceElement(element);
        do {
            offset += (border === 'left' ? el.offsetLeft : el.offsetTop);
            const offsetParent = el.offsetParent;
            if (offsetParent === null) {
                // `offsetParent` is `null` in the following situations:
                // - The element or any ancestor has the `display` property set to `none`
                // - The element has the position property set to fixed (Firefox returns <body>).
                // - The element is <body> or <html>.
                // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent.
                return null;
            }
            if (!(offsetParent instanceof HTMLElement)) {
                return null;
            }
            el = offsetParent;
        } while (el !== this._host);
        return offset;
    }
    /**
     * Emits when the scroll position changes.
     */
    installScrollEmitter() {
        const zone = inject(NgZone);
        effect(onCleanup => {
            const viewport = this._viewport();
            untracked(() => {
                const subscription = fromEvent(viewport.nativeElement, 'scroll')
                    .pipe(subscribeIn(fn => zone.runOutsideAngular(fn)))
                    .subscribe(event => this.scroll.emit(event));
                onCleanup(() => subscription.unsubscribe());
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciViewportComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.0.0", type: SciViewportComponent, isStandalone: true, selector: "sci-viewport", inputs: { scrollbarStyle: { classPropertyName: "scrollbarStyle", publicName: "scrollbarStyle", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { scroll: "scroll" }, host: { listeners: { "focus": "focus()" } }, viewQueries: [{ propertyName: "_viewport", first: true, predicate: ["viewport"], descendants: true, isSignal: true }, { propertyName: "_viewportClient", first: true, predicate: ["viewport_client"], descendants: true, isSignal: true }], ngImport: i0, template: "<!-- viewport and viewport client -->\n<div #viewport\n     class=\"viewport\"\n     tabindex=\"-1\"\n     sciScrollable [sciScrollableDisplayNativeScrollbar]=\"scrollbarStyle() === 'native'\"\n     cdkScrollable>\n  <div #viewport_client class=\"viewport-client\" part=\"content\">\n    <slot></slot>\n  </div>\n</div>\n\n<!-- render emulated scrollbars which sit on-top -->\n@if (scrollbarStyle() === 'on-top' && nativeScrollbarTrackSizeProvider.trackSize() !== null) {\n  <sci-scrollbar [direction]=\"'vscroll'\" [viewport]=\"viewport\" class=\"e2e-vertical\"/>\n  <sci-scrollbar [direction]=\"'hscroll'\" [viewport]=\"viewport\" class=\"e2e-horizontal\"/>\n}\n", styles: [":host{display:grid;grid-template-columns:100%;grid-template-rows:100%;position:relative;overflow:hidden;outline:none}:host:host-context(:not(:hover):not(:active)) sci-scrollbar:not(.scrolling){opacity:0}:host>div.viewport{display:grid;position:relative;outline:none;-webkit-overflow-scrolling:touch}:host>div.viewport>div.viewport-client{display:grid}:host>sci-scrollbar{--sci-scrollbar-color: var(--sci-viewport-scrollbar-color);position:absolute;transition-duration:1s;transition-property:opacity;transition-timing-function:ease-out}:host>sci-scrollbar.vertical{top:0;right:0;bottom:0;left:unset;width:12px}:host>sci-scrollbar.horizontal{top:unset;right:0;bottom:0;left:0;height:12px}\n"], dependencies: [{ kind: "directive", type: SciScrollableDirective, selector: "[sciScrollable]", inputs: ["sciScrollableDisplayNativeScrollbar"] }, { kind: "component", type: SciScrollbarComponent, selector: "sci-scrollbar", inputs: ["direction", "viewport"] }, { kind: "directive", type: CdkScrollable, selector: "[cdk-scrollable], [cdkScrollable]" }], encapsulation: i0.ViewEncapsulation.ShadowDom });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciViewportComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-viewport', encapsulation: ViewEncapsulation.ShadowDom, imports: [
                        SciScrollableDirective,
                        SciScrollbarComponent,
                        CdkScrollable,
                    ], template: "<!-- viewport and viewport client -->\n<div #viewport\n     class=\"viewport\"\n     tabindex=\"-1\"\n     sciScrollable [sciScrollableDisplayNativeScrollbar]=\"scrollbarStyle() === 'native'\"\n     cdkScrollable>\n  <div #viewport_client class=\"viewport-client\" part=\"content\">\n    <slot></slot>\n  </div>\n</div>\n\n<!-- render emulated scrollbars which sit on-top -->\n@if (scrollbarStyle() === 'on-top' && nativeScrollbarTrackSizeProvider.trackSize() !== null) {\n  <sci-scrollbar [direction]=\"'vscroll'\" [viewport]=\"viewport\" class=\"e2e-vertical\"/>\n  <sci-scrollbar [direction]=\"'hscroll'\" [viewport]=\"viewport\" class=\"e2e-horizontal\"/>\n}\n", styles: [":host{display:grid;grid-template-columns:100%;grid-template-rows:100%;position:relative;overflow:hidden;outline:none}:host:host-context(:not(:hover):not(:active)) sci-scrollbar:not(.scrolling){opacity:0}:host>div.viewport{display:grid;position:relative;outline:none;-webkit-overflow-scrolling:touch}:host>div.viewport>div.viewport-client{display:grid}:host>sci-scrollbar{--sci-scrollbar-color: var(--sci-viewport-scrollbar-color);position:absolute;transition-duration:1s;transition-property:opacity;transition-timing-function:ease-out}:host>sci-scrollbar.vertical{top:0;right:0;bottom:0;left:unset;width:12px}:host>sci-scrollbar.horizontal{top:unset;right:0;bottom:0;left:0;height:12px}\n"] }]
        }], ctorParameters: () => [], propDecorators: { focus: [{
                type: HostListener,
                args: ['focus']
            }] } });

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/*
 * Secondary entrypoint: '@scion/components/viewport'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciScrollableDirective, SciScrollbarComponent, SciViewportComponent };
//# sourceMappingURL=scion-components-viewport.mjs.map
