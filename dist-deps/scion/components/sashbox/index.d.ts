import * as _angular_core from '@angular/core';
import { SplitterMoveEvent } from '@scion/components/splitter';

/**
 * The <sci-sashbox> is like a CSS flexbox container that lays out its content children (sashes) in a row (which is by default)
 * or column arrangement (as specified by the direction property). A splitter is added between each child to allow the user to
 * shrink or stretch the individual sashes.
 *
 * Sashes are modelled as <ng-template> decorated with the 'sciSash' directive.
 * A sash can have a fixed size with an explicit unit, or a unitless proportion to distribute remaining space.
 * A proportional sash has the ability to grow or shrink if necessary.
 *
 * Sash content is added to a CSS grid container with a single column, stretching the content vertically and horizontally.
 *
 * ### Usage
 *
 * ```html
 * <sci-sashbox direction="row">
 *   <ng-template sciSash size="1">
 *     ...
 *   </ng-template>
 *
 *   <ng-template sciSash size="2">
 *     ...
 *   </ng-template>
 *
 *   <ng-template sciSash size="1">
 *     ...
 *   </ng-template>
 * </sci-sashbox>
 * ```
 *
 * ### Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-sashbox` component, the following CSS variables can be set directly on the component.
 *
 * - --sci-sashbox-gap: Sets the gaps (gutters) between sashes.
 * - --sci-sashbox-splitter-background-color: Sets the background color of the splitter.
 * - --sci-sashbox-splitter-background-color-hover: Sets the background color of the splitter when hovering it.
 * - --sci-sashbox-splitter-size: Sets the size of the splitter along the main axis.
 * - --sci-sashbox-splitter-size-hover: Sets the size of the splitter along the main axis when hovering it.
 * - --sci-sashbox-splitter-touch-target-size: Sets the touch target size to move the splitter (accessibility).
 * - --sci-sashbox-splitter-cross-axis-size: Sets the splitter size along the cross axis.
 * - --sci-sashbox-splitter-border-radius: Sets the border radius of the splitter.
 * - --sci-sashbox-splitter-opacity-active: Sets the opacity of the splitter while the user moves the splitter.
 * - --sci-sashbox-splitter-opacity-hover: Sets the opacity of the splitter when hovering it.
 *
 * Example:
 *
 * ```scss
 * sci-sashbox {
 *   --sci-sashbox-splitter-background-color: black;
 *   --sci-sashbox-splitter-background-color-hover: black;
 * }
 * ```
 */
declare class SciSashboxComponent {
    /**
     * Specifies if to lay out sashes in a row (which is by default) or column arrangement.
     */
    readonly direction: _angular_core.InputSignal<"column" | "row">;
    /**
     * Notifies when start sashing.
     */
    readonly sashStart: _angular_core.OutputEmitterRef<void>;
    /**
     * Emits an object with new sash sizes when sashing ends.
     *
     * Each sash size is associated with its {@link SciSashDirective.key} or its display position (zero-based) if not set.
     */
    readonly sashEnd: _angular_core.OutputEmitterRef<{
        [key: string]: number;
    }>;
    private readonly _host;
    private readonly _contentChildren;
    protected sashing: boolean;
    protected maxHeight: number | undefined;
    protected maxWidth: number | undefined;
    constructor();
    protected onSashStart(): void;
    protected onSashEnd(): void;
    protected onSash(splitter: HTMLElement, sashIndex: number, moveEvent: SplitterMoveEvent): void;
    protected onSashReset(sashIndex: number): void;
    private toPixel;
    /**
     * Detects when rendered this component for the first time.
     */
    private detectFirstRendering;
    /**
     * Mirrors the provided signal. If animated sashes are being removed, delays emission until the animation completes,
     * effectively removing the element after the animation.
     *
     * Delayed removal is required for CDK Portals to not remove displayed content immediately.
     */
    private computeSashes;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciSashboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciSashboxComponent, "sci-sashbox", never, { "direction": { "alias": "direction"; "required": false; "isSignal": true; }; }, { "sashStart": "sashStart"; "sashEnd": "sashEnd"; }, ["_contentChildren"], never, true, never>;
}

/**
 * Use this directive to model a sash for {@link SciSashboxComponent}.
 * The host element of this modelling directive must be a <ng-template> which is used as sash template.
 *
 *
 * ### Usage:
 *
 * <sci-sashbox direction="row">
 *   <!-- fixed size sash -->
 *   <ng-template sciSash size="200px">
 *     ...
 *   </ng-template>
 *
 *   <!-- sash which takes the remaining space -->
 *   <ng-template sciSash>
 *     ...
 *   </ng-template>
 * </sci-sashbox>
 */
declare class SciSashDirective {
    /**
     * Specifies the sash size, either as fixed size with an explicit unit,
     * or as a unitless proportion to distribute remaining space. A proportional
     * sash has the ability to grow or shrink if necessary, and must be >= 1.
     *
     * If not set, remaining space is distributed equally.
     */
    readonly size: _angular_core.InputSignalWithTransform<string | number, string | number | null | undefined>;
    /**
     * Specifies the minimal sash size in pixel or percent.
     * The min-size prevents the user from shrinking the sash below this minimal size.
     *
     * If the unit is omitted, the value is interpreted as a pixel value.
     */
    readonly minSize: _angular_core.InputSignal<string | number | undefined>;
    /**
     * Specifies an optional key to identify this sash.
     *
     * The key is used as the property key in the object emitted by {@link SciSashboxComponent.sashEnd} to associate the size of this sash.
     */
    readonly key: _angular_core.InputSignal<string | undefined>;
    /**
     * Controls whether to animate the entering and leaving of this sash, only if fixed-sized. Defaults to `false`.
     *
     * Enabling animation will mimic the behavior of a side panel that slides in or out.
     *
     * Note: Animates only sashes added or removed after the initial rendering.
     */
    readonly animate: _angular_core.InputSignalWithTransform<boolean, unknown>;
    private readonly _sashBoxAccessor;
    private readonly _component;
    /**
     * Flex properties computed based on the configured {@link size}. Properties are updated when moving this sash.
     */
    private readonly _flexProperties;
    /**
     * Computes the flex properties to lay out this sash in the sashbox's flex layout based on the configured {@link size}.
     */
    private computeFlexProperties;
    /**
     * Normalizes the 'flex-grow' of the passed {@link FlexProperties} to ensure that the sum of the 'flex-grow' proportions of all sashes is 1.
     *
     * If the sum of all flex-grow proportions were less than 1, the sashes would not fill the entire sash-box space.
     * Without normalization, this could occur when a sash is removed.
     */
    private normalizeFlexGrow;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciSashDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<SciSashDirective, "ng-template[sciSash]", ["sciSash"], { "size": { "alias": "size"; "required": false; "isSignal": true; }; "minSize": { "alias": "minSize"; "required": false; "isSignal": true; }; "key": { "alias": "key"; "required": false; "isSignal": true; }; "animate": { "alias": "animate"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { SciSashDirective, SciSashboxComponent };
