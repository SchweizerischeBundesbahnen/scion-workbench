import * as i0 from '@angular/core';
import { input, output, inject, ElementRef, NgZone, Directive, assertNotInReactiveContext, assertInInjectionContext, Injector, computed, isSignal, signal, effect, untracked } from '@angular/core';
import { fromResize$, fromBoundingClientRect$ } from '@scion/toolkit/observable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { subscribeIn, observeIn } from '@scion/toolkit/operators';
import { coerceElement } from '@angular/cdk/coercion';
import { Objects } from '@scion/toolkit/util';

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
 * Observes the size of the host element.
 *
 * ---
 * Usage:
 *
 * ```html
 * <div sciDimension (sciDimensionChange)="onDimensionChange($event)"></div>
 * ```
 */
class SciDimensionDirective {
    /**
     * Controls if to output outside the Angular zone. Defaults to `false`.
     */
    emitOutsideAngular = input(false);
    /**
     * Outputs the size of the element.
     */
    dimensionChange = output({ alias: 'sciDimensionChange' });
    constructor() {
        const host = inject(ElementRef).nativeElement;
        const zone = inject(NgZone);
        fromResize$(host)
            .pipe(
        // Avoid triggering change detection cycle.
        subscribeIn(fn => zone.runOutsideAngular(fn)), 
        // Run in animation frame to prevent 'ResizeObserver loop completed with undelivered notifications' error.
        // Do not use `animationFrameScheduler` because the scheduler does not necessarily execute in the current execution context, such as inside or outside Angular.
        // The scheduler always executes tasks in the context (e.g. zone) where the scheduler was first used in the application.
        observeIn(fn => requestAnimationFrame(fn)), observeIn(fn => this.emitOutsideAngular() ? fn() : zone.run(fn)), takeUntilDestroyed())
            .subscribe(() => {
            // Assert Angular zone.
            this.emitOutsideAngular() ? NgZone.assertNotInAngularZone() : NgZone.assertInAngularZone();
            this.dimensionChange.emit({
                clientWidth: host.clientWidth,
                offsetWidth: host.offsetWidth,
                clientHeight: host.clientHeight,
                offsetHeight: host.offsetHeight,
                element: host,
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciDimensionDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: SciDimensionDirective, isStandalone: true, selector: "[sciDimension]", inputs: { emitOutsideAngular: { classPropertyName: "emitOutsideAngular", publicName: "emitOutsideAngular", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { dimensionChange: "sciDimensionChange" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciDimensionDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[sciDimension]',
                }]
        }], ctorParameters: () => [] });

/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
function dimension(elementLike, options) {
    assertNotInReactiveContext(dimension, 'Invoking `dimension` causes new subscriptions every time. Move `dimension` outside of the reactive context and read the signal value where needed.');
    if (!options?.injector) {
        assertInInjectionContext(dimension);
    }
    const injector = options?.injector ?? inject(Injector);
    const zone = injector.get(NgZone);
    const element = computed(() => coerceElement(isSignal(elementLike) ? elementLike() : elementLike));
    const onResize = signal(undefined, { equal: () => false });
    // Subscribe to element size changes.
    effect(onCleanup => {
        const el = element();
        if (!el) {
            return;
        }
        untracked(() => {
            const subscription = fromResize$(el)
                .pipe(
            // Avoid triggering change detection cycle.
            subscribeIn(fn => zone.runOutsideAngular(fn)), 
            // Run in animation frame to prevent 'ResizeObserver loop completed with undelivered notifications' error.
            // Do not use `animationFrameScheduler` because the scheduler does not necessarily execute in the current execution context, such as inside or outside Angular.
            // The scheduler always executes tasks in the context (e.g. zone) where the scheduler was first used in the application.
            observeIn(fn => requestAnimationFrame(fn)))
                .subscribe(() => {
                NgZone.assertNotInAngularZone();
                onResize.set();
            });
            onCleanup(() => subscription.unsubscribe());
        });
    }, { injector });
    // Create signal that recomputes each time the size changes.
    return computed(() => {
        const el = element();
        if (!el) {
            return undefined;
        }
        // Track element size.
        onResize();
        return {
            clientWidth: el.clientWidth,
            offsetWidth: el.offsetWidth,
            clientHeight: el.clientHeight,
            offsetHeight: el.offsetHeight,
            element: el,
        };
    }, { equal: Objects.isEqual });
}

/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
function boundingClientRect(elementLike, options) {
    assertNotInReactiveContext(boundingClientRect, 'Invoking `boundingClientRect` causes new subscriptions every time. Move `boundingClientRect` outside of the reactive context and read the signal value where needed.');
    if (!options?.injector) {
        assertInInjectionContext(boundingClientRect);
    }
    const injector = options?.injector ?? inject(Injector);
    const zone = injector.get(NgZone);
    const element = computed(() => coerceElement(isSignal(elementLike) ? elementLike() : elementLike));
    const onBoundingBoxChange = signal(undefined, { equal: () => false });
    // Subscribe to element bounding box changes.
    effect(onCleanup => {
        const el = element();
        if (!el) {
            return;
        }
        untracked(() => {
            const subscription = fromBoundingClientRect$(el)
                // Avoid triggering change detection cycle.
                .pipe(subscribeIn(fn => zone.runOutsideAngular(fn)))
                .subscribe(() => {
                NgZone.assertNotInAngularZone();
                onBoundingBoxChange.set();
            });
            onCleanup(() => subscription.unsubscribe());
        });
    }, { injector });
    // Create signal that recomputes each time the bounding box changes.
    return computed(() => {
        const el = element();
        if (!el) {
            return undefined;
        }
        // Track bounding box.
        onBoundingBoxChange();
        return el.getBoundingClientRect();
    }, { equal: isEqualDomRect });
}
function isEqualDomRect(a, b) {
    return a?.top === b?.top && a?.right === b?.right && a?.bottom === b?.bottom && a?.left === b?.left;
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
 * Secondary entrypoint: '@scion/components/dimension'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciDimensionDirective, boundingClientRect, dimension };
//# sourceMappingURL=scion-components-dimension.mjs.map
