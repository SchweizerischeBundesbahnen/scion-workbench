import * as i0 from '@angular/core';
import { input, booleanAttribute, inject, signal, TemplateRef, computed, linkedSignal, Directive, ElementRef, ChangeDetectorRef, effect, Component, output, contentChildren, NgZone, afterNextRender, IterableDiffers, untracked, HostBinding } from '@angular/core';
import { SciSplitterComponent } from '@scion/components/splitter';
import { NgTemplateOutlet } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Allows accessing the sashbox component from sashes.
 */
class SciSashBoxAccessor {
}

/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
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
class SciSashDirective {
    /**
     * Specifies the sash size, either as fixed size with an explicit unit,
     * or as a unitless proportion to distribute remaining space. A proportional
     * sash has the ability to grow or shrink if necessary, and must be >= 1.
     *
     * If not set, remaining space is distributed equally.
     */
    size = input('1', { transform: (size) => size ?? '1' });
    /**
     * Specifies the minimal sash size in pixel or percent.
     * The min-size prevents the user from shrinking the sash below this minimal size.
     *
     * If the unit is omitted, the value is interpreted as a pixel value.
     */
    minSize = input();
    /**
     * Specifies an optional key to identify this sash.
     *
     * The key is used as the property key in the object emitted by {@link SciSashboxComponent.sashEnd} to associate the size of this sash.
     */
    key = input();
    /**
     * Controls whether to animate the entering and leaving of this sash, only if fixed-sized. Defaults to `false`.
     *
     * Enabling animation will mimic the behavior of a side panel that slides in or out.
     *
     * Note: Animates only sashes added or removed after the initial rendering.
     */
    animate = input(false, { transform: booleanAttribute });
    _sashBoxAccessor = inject(SciSashBoxAccessor);
    _component = signal(undefined);
    /**
     * Flex properties computed based on the configured {@link size}. Properties are updated when moving this sash.
     */
    _flexProperties = this.computeFlexProperties();
    /**
     * Represents the template used as sash content.
     *
     * @internal
     */
    sashTemplate = inject(TemplateRef);
    /**
     * Flex properties with normalized 'flex-grow' to ensure the sashes fill the entire sash-box space.
     *
     * Use these properties to lay out this sash in the sashbox's flex layout.
     *
     * @internal
     */
    flexProperties = this.normalizeFlexGrow(this._flexProperties);
    /**
     * Returns if this sash has a fixed size, meaning that it has not the ability to grow or shrink.
     *
     * @internal
     */
    isFixedSize = computed(() => Number.isNaN(+this.size()));
    /**
     * Gets the component that renders this sash.
     *
     * @internal
     */
    component = computed(() => this._component() ?? throwError('[SciSashbox] SashComponent not available yet.'));
    /**
     * Sets the component that renders this sash.
     *
     * @internal
     */
    setComponent(component) {
        this._component.set(component);
    }
    /**
     * Returns the identity of this sash, or the passed index if not configured.
     *
     * @internal
     */
    computeKey(index) {
        return this.key() ?? `${index}`;
    }
    /**
     * Updates the flex properties of this sash for layout in the sashbox's flex layout.
     *
     * @internal
     */
    updateFlexProperties(flexProperties) {
        this._flexProperties.update(previousFlexProperties => ({ ...previousFlexProperties, ...flexProperties }));
    }
    /**
     * Computes the flex properties to lay out this sash in the sashbox's flex layout based on the configured {@link size}.
     */
    computeFlexProperties() {
        return linkedSignal(() => {
            const size = this.size();
            if (this.isFixedSize()) {
                // fixed-sized sash
                return {
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: `${size}`,
                };
            }
            else {
                // remaining space is distributed according to given proportion
                const proportion = +size;
                if (proportion < 1) {
                    throw Error(`[IllegalSashSizeError] The proportion for flexible sized sashes must be >=1 [size=${this.size()}]`);
                }
                return {
                    flexGrow: proportion,
                    flexShrink: 1,
                    flexBasis: '0',
                };
            }
        });
    }
    /**
     * Normalizes the 'flex-grow' of the passed {@link FlexProperties} to ensure that the sum of the 'flex-grow' proportions of all sashes is 1.
     *
     * If the sum of all flex-grow proportions were less than 1, the sashes would not fill the entire sash-box space.
     * Without normalization, this could occur when a sash is removed.
     */
    normalizeFlexGrow(flexProperties) {
        return computed(() => {
            const sashes = this._sashBoxAccessor.sashes();
            const { flexGrow, flexShrink, flexBasis } = flexProperties();
            const flexGrowSum = sashes.reduce((sum, sash) => sum + sash._flexProperties().flexGrow, 0);
            return {
                flexGrow: flexGrow === 0 || flexGrowSum === 0 ? 0 : flexGrow / flexGrowSum, // Sum of normalized flex-grow proportions must be 1;
                flexShrink,
                flexBasis,
            };
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSashDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: SciSashDirective, isStandalone: true, selector: "ng-template[sciSash]", inputs: { size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, minSize: { classPropertyName: "minSize", publicName: "minSize", isSignal: true, isRequired: false, transformFunction: null }, key: { classPropertyName: "key", publicName: "key", isSignal: true, isRequired: false, transformFunction: null }, animate: { classPropertyName: "animate", publicName: "animate", isSignal: true, isRequired: false, transformFunction: null } }, exportAs: ["sciSash"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSashDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[sciSash]',
                    exportAs: 'sciSash',
                }]
        }] });
function throwError(error) {
    throw Error(error);
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
 * Provides access to the native {@link HTMLElement} of the host.
 */
class SciElementRefDirective {
    host = inject(ElementRef).nativeElement;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciElementRefDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0", type: SciElementRefDirective, isStandalone: true, selector: "[sciElementRef]", exportAs: ["sciElementRef"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciElementRefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[sciElementRef]',
                    exportAs: 'sciElementRef',
                }]
        }] });

/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Represents a {@link SciSashDirective} in the DOM, displaying the specified sash template.
 */
class SashComponent {
    /**
     * Specifies the sash representing this component.
     */
    sash = input.required();
    _host = inject(ElementRef).nativeElement;
    _cd = inject(ChangeDetectorRef);
    _sashBoxAccessor = inject(SciSashBoxAccessor);
    animationState = linkedSignal(() => this.sash().animate() && this._sashBoxAccessor.afterFirstRender() ? 'enter' : null);
    constructor() {
        // Associate sash with this component.
        effect(() => this.sash().setComponent(this));
    }
    /**
     * Starts the leave animation, returning a signal to track animation completion.
     */
    startLeaveAnimation() {
        // Detach change detector to prevent updates to the component during the animation.
        this._cd.detach();
        // Trigger 'leave' animation.
        this.animationState.set('leave');
        // Return signal to track animation completion.
        return computed(() => void this.animationState(), { equal: () => false });
    }
    /**
     * Notifies when ending the animation.
     */
    onAnimationEnd() {
        this.animationState.set(null);
    }
    /**
     * Gets the size of this sash in pixel.
     */
    get size() {
        const { width, height } = this._host.getBoundingClientRect();
        return this._sashBoxAccessor.direction() === 'row' ? width : height;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SashComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.0.0", type: SashComponent, isStandalone: true, selector: "sci-sash", inputs: { sash: { classPropertyName: "sash", publicName: "sash", isSignal: true, isRequired: true, transformFunction: null } }, host: { listeners: { "@sash-animation.done": "onAnimationEnd();" }, properties: { "@sash-animation": "animationState()" } }, ngImport: i0, template: "<ng-container *ngTemplateOutlet=\"sash().sashTemplate\"/>\n", styles: [":host{display:grid;grid-auto-rows:100%;grid-auto-columns:100%;overflow:hidden}\n"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], animations: [
            trigger('sash-animation', provideAnimation()),
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SashComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-sash', imports: [
                        NgTemplateOutlet,
                    ], animations: [
                        trigger('sash-animation', provideAnimation()),
                    ], host: {
                        '[@sash-animation]': 'animationState()',
                        '(@sash-animation.done)': 'onAnimationEnd();',
                    }, template: "<ng-container *ngTemplateOutlet=\"sash().sashTemplate\"/>\n", styles: [":host{display:grid;grid-auto-rows:100%;grid-auto-columns:100%;overflow:hidden}\n"] }]
        }], ctorParameters: () => [] });
/**
 * Returns animation metadata to slide-in and slide-out a sash.
 */
function provideAnimation() {
    return [
        transition('void => enter', [
            style({ 'flex-basis': 0 }),
            animate(`125ms ease-out`, style({ 'flex-basis': '*' })),
        ]),
        transition('* => leave', [
            style({ 'flex-basis': '*' }),
            animate(`125ms ease-out`, style({ 'flex-basis': 0 })),
        ]),
    ];
}

/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
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
class SciSashboxComponent {
    /**
     * Specifies if to lay out sashes in a row (which is by default) or column arrangement.
     */
    direction = input('row');
    /**
     * Notifies when start sashing.
     */
    sashStart = output();
    /**
     * Emits an object with new sash sizes when sashing ends.
     *
     * Each sash size is associated with its {@link SciSashDirective.key} or its display position (zero-based) if not set.
     */
    sashEnd = output();
    _host = inject(ElementRef).nativeElement;
    _contentChildren = contentChildren(SciSashDirective);
    /** @internal */
    sashes = this.computeSashes(this._contentChildren);
    /** @internal */
    afterFirstRender = signal(false);
    sashing = false;
    maxHeight;
    maxWidth;
    constructor() {
        this.detectFirstRendering();
    }
    onSashStart() {
        this.sashing = true;
        // Avoid overflow when sashing.
        const hostBounds = this._host.getBoundingClientRect();
        this.maxHeight = hostBounds.height;
        this.maxWidth = hostBounds.width;
        this.sashStart.emit();
        // Set the effective sash size as the flex-basis for non-fixed sashes (as sashing operates on pixel deltas).
        this.sashes().forEach(sash => {
            if (!sash.isFixedSize()) {
                sash.updateFlexProperties({
                    flexGrow: 0,
                    flexShrink: 1,
                    flexBasis: `${sash.component().size}px`,
                });
            }
        });
    }
    onSashEnd() {
        this.sashing = false;
        this.maxHeight = undefined;
        this.maxWidth = undefined;
        // Unset the flex-basis for non-fixed sashes and set the flex-grow accordingly.
        const pixelToFlexGrowFactor = computePixelToFlexGrowFactor(this.sashes());
        const sashSizes = this.sashes().reduce((acc, sash, i) => acc.set(sash.computeKey(i), sash.component().size), new Map());
        this.sashes().forEach((sash, i) => {
            if (!sash.isFixedSize()) {
                sash.updateFlexProperties({
                    flexGrow: pixelToFlexGrowFactor * sashSizes.get(sash.computeKey(i)),
                    flexShrink: 1,
                    flexBasis: '0',
                });
            }
        });
        this.sashEnd.emit(Object.fromEntries(sashSizes));
    }
    onSash(splitter, sashIndex, moveEvent) {
        NgZone.assertNotInAngularZone();
        const distance = moveEvent.distance;
        if (distance === 0) {
            return;
        }
        // Compute the splitter position.
        const splitterRect = splitter.getBoundingClientRect();
        const splitterStart = (this.direction() === 'row' ? splitterRect.left : splitterRect.top);
        const splitterEnd = (this.direction() === 'row' ? splitterRect.left + splitterRect.width : splitterRect.top + splitterRect.height);
        // Ignore the event if outside the splitter's action scope.
        const eventPos = moveEvent.position.clientPos;
        // The sash should not grow after moved the mouse pointer beyond the left bounds of the sash and now moving the mouse pointer back toward the current sash.
        if (distance > 0 && eventPos < splitterStart) {
            return;
        }
        // The sash should not shrink after moved the mouse pointer beyond the right bounds of the sash and now moving the mouse pointer back toward the current sash.
        if (distance < 0 && eventPos > splitterEnd) {
            return;
        }
        // Compute the new sash sizes.
        const sash1 = this.sashes()[sashIndex];
        const sash2 = this.sashes()[sashIndex + 1];
        const sashSize1 = sash1.component().size;
        const sashSize2 = sash2.component().size;
        const sashMinSize1 = sash1.minSize() ? this.toPixel(sash1.minSize()) : 0;
        const sashMinSize2 = sash2.minSize() ? this.toPixel(sash2.minSize()) : 0;
        const newSashSize1 = between(Math.round(sashSize1 + distance), { min: sashMinSize1, max: sashSize1 + sashSize2 - sashMinSize2 });
        const newSashSize2 = between(Math.round(sashSize2 - distance), { min: sashMinSize2, max: sashSize1 + sashSize2 - sashMinSize1 });
        // Set the new computed sash sizes.
        sash1.updateFlexProperties({ flexBasis: `${newSashSize1}px` });
        sash2.updateFlexProperties({ flexBasis: `${newSashSize2}px` });
    }
    onSashReset(sashIndex) {
        const sash1 = this.sashes()[sashIndex];
        const sash2 = this.sashes()[sashIndex + 1];
        const equalSashSize = (sash1.component().size + sash2.component().size) / 2;
        const pixelToFlexGrowFactor = computePixelToFlexGrowFactor(this.sashes());
        const sashSizesAfterReset = this.sashes().reduce((acc, sash, index) => {
            const size = index === sashIndex || index === sashIndex + 1 ? equalSashSize : sash.component().size;
            return acc.set(sash.computeKey(index), size);
        }, new Map());
        [sash1, sash2].forEach(sash => {
            if (sash.isFixedSize()) {
                sash.updateFlexProperties({ flexBasis: `${equalSashSize}px` });
            }
            else {
                sash.updateFlexProperties({ flexGrow: pixelToFlexGrowFactor * equalSashSize });
            }
        });
        this.sashStart.emit();
        this.sashEnd.emit(Object.fromEntries(sashSizesAfterReset));
    }
    toPixel(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (value.endsWith('%')) {
            const hostBounds = this._host.getBoundingClientRect();
            const hostSize = (this.direction() === 'row' ? hostBounds.width : hostBounds.height);
            return parseInt(value, 10) * hostSize / 100;
        }
        return parseInt(value, 10);
    }
    /**
     * Detects when rendered this component for the first time.
     */
    detectFirstRendering() {
        afterNextRender({
            read: () => this.afterFirstRender.set(true),
        });
    }
    /**
     * Mirrors the provided signal. If animated sashes are being removed, delays emission until the animation completes,
     * effectively removing the element after the animation.
     *
     * Delayed removal is required for CDK Portals to not remove displayed content immediately.
     */
    computeSashes(contentChildren) {
        const differ = inject(IterableDiffers).find([]).create();
        const sashes = signal([]);
        effect(() => {
            // Compute removed sashes to be removed with an animation.
            const removedAnimatedSashes = new Array();
            differ.diff(contentChildren())?.forEachRemovedItem(({ item: sash }) => untracked(() => {
                if (sash.animate()) {
                    removedAnimatedSashes.push(sash);
                }
            }));
            // Emit if no sashes are removed with an animation.
            if (!removedAnimatedSashes.length) {
                sashes.set(contentChildren());
                return;
            }
            // Delay emission until a leave animation completes.
            removedAnimatedSashes.forEach(sash => {
                // Start the leave animation.
                const done = sash.component().startLeaveAnimation();
                // Track animation completion, re-running this effect to finally emit the sashes.
                done();
            });
        });
        return sashes;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSashboxComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.0.0", type: SciSashboxComponent, isStandalone: true, selector: "sci-sashbox", inputs: { direction: { classPropertyName: "direction", publicName: "direction", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { sashStart: "sashStart", sashEnd: "sashEnd" }, host: { properties: { "attr.data-direction": "direction()", "class.sashing": "this.sashing", "style.--\u0275sci-sashbox-max-height": "this.maxHeight", "style.--\u0275sci-sashbox-max-width": "this.maxWidth" } }, providers: [{
                provide: SciSashBoxAccessor,
                useFactory: provideSashBoxAccessor,
            }], queries: [{ propertyName: "_contentChildren", predicate: SciSashDirective, isSignal: true }], ngImport: i0, template: "@for (sash of sashes(); track sash; let i = $index; let first = $first; let last = $last) {\n  <sci-sash [sash]=\"sash\"\n            [class.first]=\"first\"\n            [class.last]=\"last\"\n            [style.flex-grow]=\"sash.flexProperties().flexGrow\"\n            [style.flex-shrink]=\"sash.flexProperties().flexShrink\"\n            [style.flex-basis]=\"sash.flexProperties().flexBasis\"/>\n  @if (!last) {\n    <sci-splitter sciElementRef #sciElementRef=\"sciElementRef\"\n                  [orientation]=\"direction() === 'row' ? 'vertical' : 'horizontal'\"\n                  (start)=\"onSashStart()\"\n                  (move)=\"onSash(sciElementRef.host, i, $event)\"\n                  (end)=\"onSashEnd()\"\n                  (reset)=\"onSashReset(i)\"/>\n  }\n}\n", styles: ["@charset \"UTF-8\";:host{display:flex;align-items:stretch;box-sizing:border-box;overflow:hidden;z-index:0}:host *{box-sizing:border-box}:host[data-direction=column]{flex-direction:column}:host[data-direction=row]{flex-direction:row}:host[data-direction=row]>sci-sash{margin:0 var(--sci-sashbox-gap)}:host[data-direction=row]>sci-sash.first{margin-left:0}:host[data-direction=row]>sci-sash.last{margin-right:0}:host[data-direction=column]>sci-sash{margin:var(--sci-sashbox-gap) 0}:host[data-direction=column]>sci-sash.first{margin-top:0}:host[data-direction=column]>sci-sash.last{margin-bottom:0}:host.sashing{max-height:calc(var(--\\275sci-sashbox-max-height) * 1px);max-width:calc(var(--\\275sci-sashbox-max-width) * 1px)}:host.sashing>sci-sash{pointer-events:none}:host>sci-splitter{--sci-splitter-background-color: var(--sci-sashbox-splitter-background-color);--sci-splitter-background-color-hover: var(--sci-sashbox-splitter-background-color-hover);--sci-splitter-size: var(--sci-sashbox-splitter-size);--sci-splitter-size-hover: var(--sci-sashbox-splitter-size-hover);--sci-splitter-touch-target-size: var(--sci-sashbox-splitter-touch-target-size);--sci-splitter-cross-axis-size: var(--sci-sashbox-splitter-cross-axis-size);--sci-splitter-border-radius: var(--sci-sashbox-splitter-border-radius);--sci-splitter-opacity-active: var(--sci-sashbox-splitter-opacity-active);--sci-splitter-opacity-hover: var(--sci-sashbox-splitter-opacity-hover);flex:none;z-index:1}\n"], dependencies: [{ kind: "component", type: SciSplitterComponent, selector: "sci-splitter", inputs: ["orientation"], outputs: ["start", "move", "end", "reset"] }, { kind: "directive", type: SciElementRefDirective, selector: "[sciElementRef]", exportAs: ["sciElementRef"] }, { kind: "component", type: SashComponent, selector: "sci-sash", inputs: ["sash"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSashboxComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-sashbox', imports: [
                        SciSplitterComponent,
                        SciElementRefDirective,
                        SashComponent,
                    ], providers: [{
                            provide: SciSashBoxAccessor,
                            useFactory: provideSashBoxAccessor,
                        }], host: {
                        '[attr.data-direction]': 'direction()',
                    }, template: "@for (sash of sashes(); track sash; let i = $index; let first = $first; let last = $last) {\n  <sci-sash [sash]=\"sash\"\n            [class.first]=\"first\"\n            [class.last]=\"last\"\n            [style.flex-grow]=\"sash.flexProperties().flexGrow\"\n            [style.flex-shrink]=\"sash.flexProperties().flexShrink\"\n            [style.flex-basis]=\"sash.flexProperties().flexBasis\"/>\n  @if (!last) {\n    <sci-splitter sciElementRef #sciElementRef=\"sciElementRef\"\n                  [orientation]=\"direction() === 'row' ? 'vertical' : 'horizontal'\"\n                  (start)=\"onSashStart()\"\n                  (move)=\"onSash(sciElementRef.host, i, $event)\"\n                  (end)=\"onSashEnd()\"\n                  (reset)=\"onSashReset(i)\"/>\n  }\n}\n", styles: ["@charset \"UTF-8\";:host{display:flex;align-items:stretch;box-sizing:border-box;overflow:hidden;z-index:0}:host *{box-sizing:border-box}:host[data-direction=column]{flex-direction:column}:host[data-direction=row]{flex-direction:row}:host[data-direction=row]>sci-sash{margin:0 var(--sci-sashbox-gap)}:host[data-direction=row]>sci-sash.first{margin-left:0}:host[data-direction=row]>sci-sash.last{margin-right:0}:host[data-direction=column]>sci-sash{margin:var(--sci-sashbox-gap) 0}:host[data-direction=column]>sci-sash.first{margin-top:0}:host[data-direction=column]>sci-sash.last{margin-bottom:0}:host.sashing{max-height:calc(var(--\\275sci-sashbox-max-height) * 1px);max-width:calc(var(--\\275sci-sashbox-max-width) * 1px)}:host.sashing>sci-sash{pointer-events:none}:host>sci-splitter{--sci-splitter-background-color: var(--sci-sashbox-splitter-background-color);--sci-splitter-background-color-hover: var(--sci-sashbox-splitter-background-color-hover);--sci-splitter-size: var(--sci-sashbox-splitter-size);--sci-splitter-size-hover: var(--sci-sashbox-splitter-size-hover);--sci-splitter-touch-target-size: var(--sci-sashbox-splitter-touch-target-size);--sci-splitter-cross-axis-size: var(--sci-sashbox-splitter-cross-axis-size);--sci-splitter-border-radius: var(--sci-sashbox-splitter-border-radius);--sci-splitter-opacity-active: var(--sci-sashbox-splitter-opacity-active);--sci-splitter-opacity-hover: var(--sci-sashbox-splitter-opacity-hover);flex:none;z-index:1}\n"] }]
        }], ctorParameters: () => [], propDecorators: { sashing: [{
                type: HostBinding,
                args: ['class.sashing']
            }], maxHeight: [{
                type: HostBinding,
                args: ['style.--ɵsci-sashbox-max-height']
            }], maxWidth: [{
                type: HostBinding,
                args: ['style.--ɵsci-sashbox-max-width']
            }] } });
function between(value, minmax) {
    return Math.min(minmax.max, Math.max(minmax.min, value));
}
/**
 * Returns the factor to compute the flex-grow proportion from the pixel size of a sash.
 */
function computePixelToFlexGrowFactor(sashes) {
    const flexibleSashes = sashes.filter(sash => !sash.isFixedSize());
    const proportionSum = flexibleSashes.reduce((sum, sash) => sum + Number(sash.size()), 0);
    const pixelSum = flexibleSashes.reduce((sum, sash) => sum + sash.component().size, 0);
    return proportionSum / pixelSum;
}
function provideSashBoxAccessor() {
    const component = inject(SciSashboxComponent);
    return new class {
        sashes = component.sashes;
        direction = component.direction;
        afterFirstRender = component.afterFirstRender;
    }();
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
/*
 * Secondary entrypoint: '@scion/components/sashbox'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciSashDirective, SciSashboxComponent };
//# sourceMappingURL=scion-components-sashbox.mjs.map
