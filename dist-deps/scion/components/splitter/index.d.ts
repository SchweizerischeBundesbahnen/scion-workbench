import * as _angular_core from '@angular/core';
import { OnInit } from '@angular/core';

/**
 * Represents a splitter, a visual element that allows the user to control the size of elements next to it.
 *
 * The splitter has a handle that the user can move depending on the orientation of the splitter.
 *
 * Note that this control neither does change the size of adjacent elements nor does it (re-)position itself, but emits the distance by
 * which the user has theoretically moved the splitter. You must subscribe to these events and change your layout accordingly.
 *
 * In the toolkit, {@link SciSashboxComponent} uses this splitter to divide a layout into several resizable sections.
 * Another use case would be a resizable sidebar panel.
 *
 * ### Usage
 *
 * ```html
 * <sci-splitter (move)="onSplitterMove($event.distance)"></sci-splitter>
 * ```
 *
 * ### Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-splitter` component, the following CSS variables can be set directly on the component.
 *
 * - --sci-splitter-background-color: Sets the background color of the splitter.
 * - --sci-splitter-background-color-hover: Sets the background color of the splitter when hovering it.
 * - --sci-splitter-size: Sets the size of the splitter along the main axis.
 * - --sci-splitter-size-hover: Sets the size of the splitter along the main axis when hovering it.
 * - --sci-splitter-touch-target-size: Sets the touch target size to move the splitter (accessibility).
 * - --sci-splitter-cross-axis-size: Sets the splitter size along the cross axis.
 * - --sci-splitter-border-radius: Sets the border radius of the splitter.
 * - --sci-splitter-opacity-active: Sets the opacity of the splitter while the user moves the splitter.
 * - --sci-splitter-opacity-hover: Sets the opacity of the splitter when hovering it.
 *
 * Example:
 *
 * ```scss
 * sci-splitter {
 *   --sci-splitter-background-color: black;
 *   --sci-splitter-background-color-hover: black;
 * }
 * ```
 */
declare class SciSplitterComponent implements OnInit {
    /**
     * Controls whether to render a vertical or horizontal splitter. By default, if not specified, renders a vertical splitter.
     */
    readonly orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    /**
     * Notifies when start moving the splitter.
     */
    readonly start: _angular_core.OutputEmitterRef<void>;
    /**
     * Notifies when moving the splitter. The event is emitted outside the Angular zone.
     */
    readonly move: _angular_core.OutputEmitterRef<SplitterMoveEvent>;
    /**
     * Notifies when end moving the splitter.
     */
    readonly end: _angular_core.OutputEmitterRef<void>;
    /**
     * Notifies when resetting the spliter position.
     */
    readonly reset: _angular_core.OutputEmitterRef<void>;
    private readonly _zone;
    private readonly _cd;
    private readonly _document;
    private readonly _destroyRef;
    private readonly _touchTarget;
    protected moving: boolean;
    protected get isVertical(): boolean;
    protected get isHorizontal(): boolean;
    protected get splitterCursor(): string;
    ngOnInit(): void;
    private onReset;
    private onTouchStart;
    private onMouseDown;
    private installMoveListener;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciSplitterComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciSplitterComponent, "sci-splitter", never, { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; }, { "start": "start"; "move": "move"; "end": "end"; "reset": "reset"; }, never, never, true, never>;
}
interface EventPosition {
    clientPos: number;
    pagePos: number;
    screenPos: number;
}
/**
 * Event that is emitted when moving the splitter.
 */
interface SplitterMoveEvent {
    /**
     * The distance in pixels by which the user has moved the splitter since the last emission.
     */
    distance: number;
    /**
     * The position where the mouse or touch event has occurred.
     */
    position: EventPosition;
}

export { SciSplitterComponent };
export type { EventPosition, SplitterMoveEvent };
