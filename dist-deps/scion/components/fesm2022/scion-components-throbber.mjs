import * as i0 from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
 * Represents a throbber as an ellipsis consisting of three horizontally arranged points that appear one after the other.
 *
 * Throbber type: `ellipsis`
 */
class SciEllipsisThrobberComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciEllipsisThrobberComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.0.0", type: SciEllipsisThrobberComponent, isStandalone: true, selector: "sci-ellipsis-throbber", ngImport: i0, template: "<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n", styles: [":host{display:inline-flex;justify-content:space-between;font-size:var(--sci-throbber-size);width:1em;box-sizing:border-box}:host>div.point{flex:none;border-radius:50%;width:.3em;height:.3em;animation:sci-ellipsis-throbber var(--sci-throbber-duration) ease-in-out infinite;background-color:var(--sci-throbber-color)}:host>div.point:nth-child(1){animation-delay:calc(var(--sci-throbber-duration) / -6)}:host>div.point:nth-child(2){animation-delay:calc(var(--sci-throbber-duration) / -12)}@keyframes sci-ellipsis-throbber{0%{transform:scale(0)}40%{transform:scale(1)}80%,to{transform:scale(0)}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciEllipsisThrobberComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-ellipsis-throbber', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n", styles: [":host{display:inline-flex;justify-content:space-between;font-size:var(--sci-throbber-size);width:1em;box-sizing:border-box}:host>div.point{flex:none;border-radius:50%;width:.3em;height:.3em;animation:sci-ellipsis-throbber var(--sci-throbber-duration) ease-in-out infinite;background-color:var(--sci-throbber-color)}:host>div.point:nth-child(1){animation-delay:calc(var(--sci-throbber-duration) / -6)}:host>div.point:nth-child(2){animation-delay:calc(var(--sci-throbber-duration) / -12)}@keyframes sci-ellipsis-throbber{0%{transform:scale(0)}40%{transform:scale(1)}80%,to{transform:scale(0)}}\n"] }]
        }] });

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
 * Represents a throbber with a rippled, centric wave effect, similar to throwing a stone into water.
 *
 * Throbber type: `ripple`
 */
class SciRippleThrobberComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciRippleThrobberComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.0.0", type: SciRippleThrobberComponent, isStandalone: true, selector: "sci-ripple-throbber", ngImport: i0, template: "<div class=\"circle\"></div>\n<div class=\"circle\"></div>\n", styles: [":host{display:inline-block;position:relative;font-size:var(--sci-throbber-size);width:1em;height:1em;box-sizing:border-box}:host>div.circle{position:absolute;width:1em;height:1em;border-radius:50%;border:0 solid var(--sci-throbber-color);animation:sci-ripple-throbber var(--sci-throbber-duration) cubic-bezier(0,.2,.8,1) infinite}:host>div.circle:nth-child(1){animation-delay:calc(var(--sci-throbber-duration) / -2)}@keyframes sci-ripple-throbber{0%{transform:scale(0);opacity:0;border-width:0}25%{opacity:1;border-width:.1em}50%{opacity:.75}to{transform:scale(1);opacity:0;border-width:.05em}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciRippleThrobberComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-ripple-throbber', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"circle\"></div>\n<div class=\"circle\"></div>\n", styles: [":host{display:inline-block;position:relative;font-size:var(--sci-throbber-size);width:1em;height:1em;box-sizing:border-box}:host>div.circle{position:absolute;width:1em;height:1em;border-radius:50%;border:0 solid var(--sci-throbber-color);animation:sci-ripple-throbber var(--sci-throbber-duration) cubic-bezier(0,.2,.8,1) infinite}:host>div.circle:nth-child(1){animation-delay:calc(var(--sci-throbber-duration) / -2)}@keyframes sci-ripple-throbber{0%{transform:scale(0);opacity:0;border-width:0}25%{opacity:1;border-width:.1em}50%{opacity:.75}to{transform:scale(1);opacity:0;border-width:.05em}}\n"] }]
        }] });

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
 * Represents a circular throbber with points rotating around the center of a circle. Points have a delayed acceleration, which leads to an accordion effect.
 *
 * Throbber type: `roller`
 */
class SciRollerThrobberComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciRollerThrobberComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.0.0", type: SciRollerThrobberComponent, isStandalone: true, selector: "sci-roller-throbber", ngImport: i0, template: "<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>", styles: [":host{display:inline-flex;justify-content:center;position:relative;font-size:var(--sci-throbber-size);width:1em;height:1em;box-sizing:border-box}:host>div.point{flex:none;position:absolute;transform-origin:.05em .5em;width:.1em;height:.1em;border-radius:50%;background-color:var(--sci-throbber-color)}:host>div.point:nth-child(1){animation:sci-roller-throbber-1 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.02)}@keyframes sci-roller-throbber-1{0%{transform:rotate(-105deg)}to{transform:rotate(255deg)}}:host>div.point:nth-child(2){animation:sci-roller-throbber-2 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.04)}@keyframes sci-roller-throbber-2{0%{transform:rotate(-90deg)}to{transform:rotate(270deg)}}:host>div.point:nth-child(3){animation:sci-roller-throbber-3 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.06)}@keyframes sci-roller-throbber-3{0%{transform:rotate(-75deg)}to{transform:rotate(285deg)}}:host>div.point:nth-child(4){animation:sci-roller-throbber-4 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.08)}@keyframes sci-roller-throbber-4{0%{transform:rotate(-60deg)}to{transform:rotate(300deg)}}:host>div.point:nth-child(5){animation:sci-roller-throbber-5 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.1)}@keyframes sci-roller-throbber-5{0%{transform:rotate(-45deg)}to{transform:rotate(315deg)}}:host>div.point:nth-child(6){animation:sci-roller-throbber-6 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.12)}@keyframes sci-roller-throbber-6{0%{transform:rotate(-30deg)}to{transform:rotate(330deg)}}:host>div.point:nth-child(7){animation:sci-roller-throbber-7 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.14)}@keyframes sci-roller-throbber-7{0%{transform:rotate(-15deg)}to{transform:rotate(345deg)}}:host>div.point:nth-child(8){animation:sci-roller-throbber-8 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.16)}@keyframes sci-roller-throbber-8{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciRollerThrobberComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-roller-throbber', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>\n<div class=\"point\"></div>", styles: [":host{display:inline-flex;justify-content:center;position:relative;font-size:var(--sci-throbber-size);width:1em;height:1em;box-sizing:border-box}:host>div.point{flex:none;position:absolute;transform-origin:.05em .5em;width:.1em;height:.1em;border-radius:50%;background-color:var(--sci-throbber-color)}:host>div.point:nth-child(1){animation:sci-roller-throbber-1 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.02)}@keyframes sci-roller-throbber-1{0%{transform:rotate(-105deg)}to{transform:rotate(255deg)}}:host>div.point:nth-child(2){animation:sci-roller-throbber-2 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.04)}@keyframes sci-roller-throbber-2{0%{transform:rotate(-90deg)}to{transform:rotate(270deg)}}:host>div.point:nth-child(3){animation:sci-roller-throbber-3 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.06)}@keyframes sci-roller-throbber-3{0%{transform:rotate(-75deg)}to{transform:rotate(285deg)}}:host>div.point:nth-child(4){animation:sci-roller-throbber-4 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.08)}@keyframes sci-roller-throbber-4{0%{transform:rotate(-60deg)}to{transform:rotate(300deg)}}:host>div.point:nth-child(5){animation:sci-roller-throbber-5 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.1)}@keyframes sci-roller-throbber-5{0%{transform:rotate(-45deg)}to{transform:rotate(315deg)}}:host>div.point:nth-child(6){animation:sci-roller-throbber-6 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.12)}@keyframes sci-roller-throbber-6{0%{transform:rotate(-30deg)}to{transform:rotate(330deg)}}:host>div.point:nth-child(7){animation:sci-roller-throbber-7 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.14)}@keyframes sci-roller-throbber-7{0%{transform:rotate(-15deg)}to{transform:rotate(345deg)}}:host>div.point:nth-child(8){animation:sci-roller-throbber-8 var(--sci-throbber-duration) cubic-bezier(.5,0,.5,1) infinite;animation-delay:calc(var(--sci-throbber-duration) * -.16)}@keyframes sci-roller-throbber-8{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"] }]
        }] });

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
 * Represents a classic spinner throbber with strokes arranged radially. The strokes light up one after the other in clockwise direction
 * and then fade out again.
 *
 * Throbber type: `spinner`
 */
class SciSpinnerThrobberComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSpinnerThrobberComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.0.0", type: SciSpinnerThrobberComponent, isStandalone: true, selector: "sci-spinner-throbber", ngImport: i0, template: "<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>", styles: [":host{display:inline-flex;justify-content:center;position:relative;font-size:var(--sci-throbber-size);width:1em;height:1em;box-sizing:border-box}:host>div.stroke{flex:none;position:absolute;transform-origin:.0375em .5em;width:.075em;height:.25em;opacity:0;border-radius:20%;background-color:var(--sci-throbber-color);animation:sci-spinner-throbber var(--sci-throbber-duration) linear infinite}:host>div.stroke:nth-child(1){transform:rotate(0);animation-delay:calc(var(--sci-throbber-duration) * .0833333333)}:host>div.stroke:nth-child(2){transform:rotate(30deg);animation-delay:calc(var(--sci-throbber-duration) * .1666666667)}:host>div.stroke:nth-child(3){transform:rotate(60deg);animation-delay:calc(var(--sci-throbber-duration) * .25)}:host>div.stroke:nth-child(4){transform:rotate(90deg);animation-delay:calc(var(--sci-throbber-duration) * .3333333333)}:host>div.stroke:nth-child(5){transform:rotate(120deg);animation-delay:calc(var(--sci-throbber-duration) * .4166666667)}:host>div.stroke:nth-child(6){transform:rotate(150deg);animation-delay:calc(var(--sci-throbber-duration) * .5)}:host>div.stroke:nth-child(7){transform:rotate(180deg);animation-delay:calc(var(--sci-throbber-duration) * .5833333333)}:host>div.stroke:nth-child(8){transform:rotate(210deg);animation-delay:calc(var(--sci-throbber-duration) * .6666666667)}:host>div.stroke:nth-child(9){transform:rotate(240deg);animation-delay:calc(var(--sci-throbber-duration) * .75)}:host>div.stroke:nth-child(10){transform:rotate(270deg);animation-delay:calc(var(--sci-throbber-duration) * .8333333333)}:host>div.stroke:nth-child(11){transform:rotate(300deg);animation-delay:calc(var(--sci-throbber-duration) * .9166666667)}:host>div.stroke:nth-child(12){transform:rotate(330deg);animation-delay:calc(var(--sci-throbber-duration) * 1)}@keyframes sci-spinner-throbber{0%{opacity:1}to{opacity:0}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSpinnerThrobberComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-spinner-throbber', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>\n<div class=\"stroke\"></div>", styles: [":host{display:inline-flex;justify-content:center;position:relative;font-size:var(--sci-throbber-size);width:1em;height:1em;box-sizing:border-box}:host>div.stroke{flex:none;position:absolute;transform-origin:.0375em .5em;width:.075em;height:.25em;opacity:0;border-radius:20%;background-color:var(--sci-throbber-color);animation:sci-spinner-throbber var(--sci-throbber-duration) linear infinite}:host>div.stroke:nth-child(1){transform:rotate(0);animation-delay:calc(var(--sci-throbber-duration) * .0833333333)}:host>div.stroke:nth-child(2){transform:rotate(30deg);animation-delay:calc(var(--sci-throbber-duration) * .1666666667)}:host>div.stroke:nth-child(3){transform:rotate(60deg);animation-delay:calc(var(--sci-throbber-duration) * .25)}:host>div.stroke:nth-child(4){transform:rotate(90deg);animation-delay:calc(var(--sci-throbber-duration) * .3333333333)}:host>div.stroke:nth-child(5){transform:rotate(120deg);animation-delay:calc(var(--sci-throbber-duration) * .4166666667)}:host>div.stroke:nth-child(6){transform:rotate(150deg);animation-delay:calc(var(--sci-throbber-duration) * .5)}:host>div.stroke:nth-child(7){transform:rotate(180deg);animation-delay:calc(var(--sci-throbber-duration) * .5833333333)}:host>div.stroke:nth-child(8){transform:rotate(210deg);animation-delay:calc(var(--sci-throbber-duration) * .6666666667)}:host>div.stroke:nth-child(9){transform:rotate(240deg);animation-delay:calc(var(--sci-throbber-duration) * .75)}:host>div.stroke:nth-child(10){transform:rotate(270deg);animation-delay:calc(var(--sci-throbber-duration) * .8333333333)}:host>div.stroke:nth-child(11){transform:rotate(300deg);animation-delay:calc(var(--sci-throbber-duration) * .9166666667)}:host>div.stroke:nth-child(12){transform:rotate(330deg);animation-delay:calc(var(--sci-throbber-duration) * 1)}@keyframes sci-spinner-throbber{0%{opacity:1}to{opacity:0}}\n"] }]
        }] });

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
class SciThrobberComponent {
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
    type = input('spinner');
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciThrobberComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.0.0", type: SciThrobberComponent, isStandalone: true, selector: "sci-throbber", inputs: { type: { classPropertyName: "type", publicName: "type", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@switch (type()) {\n  @case ('ellipsis') {\n    <sci-ellipsis-throbber/>\n  }\n  @case ('ripple') {\n    <sci-ripple-throbber/>\n  }\n  @case ('roller') {\n    <sci-roller-throbber/>\n  }\n  @case ('spinner') {\n    <sci-spinner-throbber/>\n  }\n  @default {\n    <sci-spinner-throbber/>\n  }\n}\n", styles: [":host{display:inline-grid}\n"], dependencies: [{ kind: "component", type: SciEllipsisThrobberComponent, selector: "sci-ellipsis-throbber" }, { kind: "component", type: SciRippleThrobberComponent, selector: "sci-ripple-throbber" }, { kind: "component", type: SciRollerThrobberComponent, selector: "sci-roller-throbber" }, { kind: "component", type: SciSpinnerThrobberComponent, selector: "sci-spinner-throbber" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciThrobberComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-throbber', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        SciEllipsisThrobberComponent,
                        SciRippleThrobberComponent,
                        SciRollerThrobberComponent,
                        SciSpinnerThrobberComponent,
                    ], template: "@switch (type()) {\n  @case ('ellipsis') {\n    <sci-ellipsis-throbber/>\n  }\n  @case ('ripple') {\n    <sci-ripple-throbber/>\n  }\n  @case ('roller') {\n    <sci-roller-throbber/>\n  }\n  @case ('spinner') {\n    <sci-spinner-throbber/>\n  }\n  @default {\n    <sci-spinner-throbber/>\n  }\n}\n", styles: [":host{display:inline-grid}\n"] }]
        }] });

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
 * Secondary entrypoint: '@scion/components/throbber'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciThrobberComponent };
//# sourceMappingURL=scion-components-throbber.mjs.map
