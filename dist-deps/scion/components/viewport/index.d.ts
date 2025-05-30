import * as i0 from '@angular/core';
import { Signal, ElementRef } from '@angular/core';

/**
 * Provides the native scrollbar tracksize.
 */
declare class SciNativeScrollbarTrackSizeProvider {
    private readonly _document;
    private readonly _zone;
    /**
     * Provides the track size of the native scrollbar, or `null` if the native scrollbars sit on top of the content.
     */
    trackSize: Signal<NativeScrollbarTrackSize | null>;
    constructor();
    /**
     * Computes the native scrollbar track size.
     *
     * @returns native track size, or `null` if the native scrollbars sit on top of the content.
     */
    private computeTrackSize;
    private createNativeScrollbarTrackSizeSignal;
    static ɵfac: i0.ɵɵFactoryDeclaration<SciNativeScrollbarTrackSizeProvider, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SciNativeScrollbarTrackSizeProvider>;
}
/**
 * Represents the native scrollbar track size.
 */
interface NativeScrollbarTrackSize {
    hScrollbarTrackHeight: number;
    vScrollbarTrackWidth: number;
}

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
declare class SciViewportComponent {
    /**
     * Controls if to use the native scrollbar or a scrollbar that sits on top of the viewport. Defaults to `on-top`.
     */
    readonly scrollbarStyle: i0.InputSignal<ScrollbarStyle>;
    /**
     * Emits when the viewport is scrolled. The event is emitted outside the Angular zone to avoid unnecessary change detection cycles.
     */
    readonly scroll: i0.OutputEmitterRef<Event>;
    private readonly _host;
    private readonly _viewport;
    private readonly _viewportClient;
    protected readonly nativeScrollbarTrackSizeProvider: SciNativeScrollbarTrackSizeProvider;
    constructor();
    focus(): void;
    /**
     * Returns the number of pixels that the viewport client is scrolled vertically.
     *
     * @see Element.scrollTop
     */
    get scrollTop(): number;
    /**
     * Sets the number of pixels that the viewport client is scrolled vertically.
     *
     * @see Element.scrollTop
     */
    set scrollTop(scrollTop: number);
    /**
     * Returns the number of pixels that the viewport client is scrolled horizontally.
     *
     * @see Element.scrollLeft
     */
    get scrollLeft(): number;
    /**
     * Sets the number of pixels that the viewport client is scrolled horizontally.
     *
     * @see Element.scrollLeft
     */
    set scrollLeft(scrollLeft: number);
    /**
     * Returns the height of the viewport client.
     *
     * @see Element.scrollHeight
     */
    get scrollHeight(): number;
    /**
     * Returns the width of the viewport client.
     *
     * @see Element.scrollWidth
     */
    get scrollWidth(): number;
    /**
     * Returns the viewport {HTMLElement}.
     */
    get viewportElement(): HTMLElement;
    /**
     * Returns the viewport client {HTMLElement}.
     */
    get viewportClientElement(): HTMLElement;
    /**
     * Checks if the specified element is scrolled into the viewport.
     *
     * @param element - the element to be checked
     * @param fit - control if the element must fully or partially fit into the viewport
     * @return `true` if the element is scrolled into the viewport, or `false` otherwise.
     */
    isElementInView(element: ElementRef<HTMLElement> | HTMLElement, fit: 'full' | 'partial'): boolean;
    /**
     * Scrolls the specified element into the viewport.
     *
     * @param element - the element to scroll into the viewport
     * @param offset - the gap between the element and the viewport
     */
    scrollIntoView(element: ElementRef<HTMLElement> | HTMLElement, offset?: number): void;
    /**
     * Computes the distance of the element to the viewport's left or top border.
     *
     * @return distance of the element to the viewport's left or top border, or `null` if not contained
     *         in the viewport or the element or any ancestor has the `display` property set to `none`.
     */
    computeOffset(element: ElementRef<HTMLElement> | HTMLElement, border: 'left' | 'top'): number | null;
    /**
     * Emits when the scroll position changes.
     */
    private installScrollEmitter;
    static ɵfac: i0.ɵɵFactoryDeclaration<SciViewportComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SciViewportComponent, "sci-viewport", never, { "scrollbarStyle": { "alias": "scrollbarStyle"; "required": false; "isSignal": true; }; }, { "scroll": "scroll"; }, never, never, true, never>;
}
/**
 * Represents a scrollbar style.
 */
type ScrollbarStyle = 'native' | 'on-top' | 'hidden';

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
declare class SciScrollbarComponent {
    /**
     * Specifies the direction of the scrollbar. Defaults to a vertical scrollbar.
     */
    readonly direction: i0.InputSignal<"vscroll" | "hscroll">;
    /**
     * The viewport to provide scrollbars for.
     */
    readonly viewport: i0.InputSignal<HTMLElement>;
    private readonly _host;
    private readonly _document;
    private readonly _zone;
    private readonly _destroyRef;
    private readonly _thumbElement;
    private readonly _vertical;
    private _lastDragPosition;
    private _overflow;
    private _thumbSizeFr;
    private _thumbPositionFr;
    protected get vertical(): boolean;
    protected get horizontal(): boolean;
    protected get scrolling(): boolean;
    constructor();
    /**
     * Computes the scroll position and updates CSS variables to render the scroll position in the UI.
     */
    private renderScrollPosition;
    protected onTouchStart(event: TouchEvent): void;
    protected onTouchMove(event: TouchEvent): void;
    protected onTouchEnd(event: TouchEvent): void;
    protected onMouseDown(mousedownEvent: MouseEvent): void;
    protected onScrollTrackMouseDown(event: MouseEvent, direction: 'up' | 'down'): void;
    /**
     * Renders the current scroll position when the viewport is scrolled.
     */
    private installScrollPositionRenderer;
    /**
     * Projects the given scrollbar scroll pixels into viewport scroll pixels.
     */
    private toViewportPanPx;
    /**
     * Moves the viewport client by the specified numbers of pixels.
     */
    private moveViewportClient;
    /**
     * Indicates if the content overflows.
     */
    get overflow(): boolean;
    /**
     * Scrolls continuously while holding the mouse pressed, or until the mouse leaves the scrolltrack.
     */
    private scrollWhileMouseDown;
    private setCssVariable;
    private get viewportSize();
    private get viewportClientSize();
    private get scrollPosition();
    private get thumbSize();
    private get trackSize();
    static ɵfac: i0.ɵɵFactoryDeclaration<SciScrollbarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SciScrollbarComponent, "sci-scrollbar", never, { "direction": { "alias": "direction"; "required": false; "isSignal": true; }; "viewport": { "alias": "viewport"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

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
declare class SciScrollableDirective {
    /**
     * Controls whether to display native scrollbars.
     * Has no effect if the native scrollbar sits on top of the content, e.g. in OS X.
     */
    readonly displayNativeScrollbar: i0.InputSignal<boolean>;
    private readonly _host;
    private readonly _renderer;
    private readonly _nativeScrollbarTrackSizeProvider;
    constructor();
    /**
     * Controls the display of the native scrollbar based on this directive's configuration.
     */
    private controlDisplayOfNativeScrollbar;
    /**
     * Uses the native scrollbars when content overflows.
     */
    private useNativeScrollbars;
    /**
     * Shifts the native scrollbars out of the visible viewport area.
     */
    private shiftNativeScrollbars;
    private setStyle;
    static ɵfac: i0.ɵɵFactoryDeclaration<SciScrollableDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SciScrollableDirective, "[sciScrollable]", never, { "displayNativeScrollbar": { "alias": "sciScrollableDisplayNativeScrollbar"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { SciScrollableDirective, SciScrollbarComponent, SciViewportComponent };
export type { ScrollbarStyle };
