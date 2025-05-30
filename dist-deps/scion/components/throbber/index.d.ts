import * as i0 from '@angular/core';

/**
 * Animated graphical control to indicate the execution of an action.
 *
 * Choose between different throbber presentations by setting the `type` property: `ellipsis`, `ripple`, `roller`, `spinner`.
 *
 * ### Styling:
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-throbber` component, the following CSS variables can be set directly on the component.
 *
 * - sci-throbber-color:     Sets the color of the throbber (by default, uses `lightgray`).
 * - sci-throbber-size:      Defines the size of the throbber. Most throbbers are quadratic having the same width and height.
 *                           For non-quadratic throbbers, the size usually specifies the height (by default, uses `50px`).
 * - sci-throbber-duration:  Sets the duration of a single animation cycle (by default, uses `1.25s`).
 *
 * Example:
 *
 * ```css
 *
 * sci-throbber {
 *   --sci-throbber-color: blue;
 *   --sci-throbber-size: 50px;
 *   --sci-throbber-duration: 1s
 * }
 * ```
 */
declare class SciThrobberComponent {
    /**
     * Chooses between different throbber presentation. If not set, uses `spinner` type.
     *
     * - **ellipsis**
     * Represents a throbber as an ellipsis consisting of three horizontally arranged points that appear one after the other.
     * - **ripple**
     * Represents a throbber with a rippled, centric wave effect, similar to throwing a stone into water.
     * - **roller**
     * Represents a circular throbber with points rotating around the center of a circle. Points have a delayed acceleration, which leads to an accordion effect.
     * - **spinner** (default)
     * Represents a classic spinner throbber with strokes arranged radially. The strokes light up one after the other in clockwise direction and then then fade out again.
     */
    readonly type: i0.InputSignal<"ellipsis" | "ripple" | "roller" | "spinner">;
    static ɵfac: i0.ɵɵFactoryDeclaration<SciThrobberComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SciThrobberComponent, "sci-throbber", never, { "type": { "alias": "type"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { SciThrobberComponent };
