import * as i0 from '@angular/core';
import { input, output, inject, NgZone, ChangeDetectorRef, DOCUMENT, DestroyRef, viewChild, HostBinding, ChangeDetectionStrategy, Component } from '@angular/core';
import { fromEvent, merge, audit, Observable } from 'rxjs';
import { tapFirst } from '@scion/toolkit/operators';
import { takeUntil, first } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
class SciSplitterComponent {
    /**
     * Controls whether to render a vertical or horizontal splitter. By default, if not specified, renders a vertical splitter.
     */
    orientation = input('vertical');
    /**
     * Notifies when start moving the splitter.
     */
    start = output(); // eslint-disable-line @angular-eslint/no-output-native
    /**
     * Notifies when moving the splitter. The event is emitted outside the Angular zone.
     */
    move = output();
    /**
     * Notifies when end moving the splitter.
     */
    end = output();
    /**
     * Notifies when resetting the spliter position.
     */
    reset = output(); // eslint-disable-line @angular-eslint/no-output-native
    _zone = inject(NgZone);
    _cd = inject(ChangeDetectorRef);
    _document = inject(DOCUMENT);
    _destroyRef = inject(DestroyRef);
    _touchTarget = viewChild.required('touch_target');
    moving = false;
    get isVertical() {
        return !this.isHorizontal;
    }
    get isHorizontal() {
        return this.orientation() === 'horizontal';
    }
    get splitterCursor() {
        return this.isVertical ? 'ew-resize' : 'ns-resize';
    }
    /* @docs-private */
    ngOnInit() {
        const touchTargetElement = this._touchTarget().nativeElement;
        fromEvent(touchTargetElement, 'dblclick')
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this.onReset());
        fromEvent(touchTargetElement, 'touchstart')
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((event) => this.onTouchStart(event));
        fromEvent(touchTargetElement, 'mousedown')
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((event) => this.onMouseDown(event));
    }
    onReset() {
        this.reset.emit();
    }
    onTouchStart(startEvent) {
        this.installMoveListener({
            startEvent: startEvent,
            moveEventNames: ['touchmove'],
            endEventNames: ['touchend', 'touchcancel'],
            eventPositionFn: (touchEvent) => {
                const touch = touchEvent.touches[0];
                if (this.isVertical) {
                    return { screenPos: touch.screenX, clientPos: touch.clientX, pagePos: touch.pageX };
                }
                else {
                    return { screenPos: touch.screenY, clientPos: touch.clientY, pagePos: touch.pageY };
                }
            },
        });
    }
    onMouseDown(startEvent) {
        if (startEvent.button !== 0) {
            return;
        }
        this.installMoveListener({
            startEvent: startEvent,
            moveEventNames: ['mousemove', 'sci-mousemove'],
            endEventNames: ['mouseup', 'sci-mouseup'],
            eventPositionFn: (mouseEvent) => {
                if (this.isVertical) {
                    return { screenPos: mouseEvent.screenX, clientPos: mouseEvent.clientX, pagePos: mouseEvent.pageX };
                }
                else {
                    return { screenPos: mouseEvent.screenY, clientPos: mouseEvent.clientY, pagePos: mouseEvent.pageY };
                }
            },
        });
    }
    installMoveListener(config) {
        const startEvent = config.startEvent;
        startEvent.preventDefault();
        this._zone.runOutsideAngular(() => {
            // install listeners on document level to allow fast dragging the splitter.
            const moveEvent$ = merge(...config.moveEventNames.map(eventName => fromEvent(this._document, eventName)));
            const endEvent$ = merge(...config.endEventNames.map(eventName => fromEvent(this._document, eventName)));
            let lastClientPos = config.eventPositionFn(startEvent).clientPos;
            // Apply cursor on document level to prevent flickering while moving the splitter
            const oldDocumentCursor = this._document.body.style.cursor;
            this._document.body.style.cursor = this.splitterCursor;
            // Listen for 'move' events until stop moving the splitter
            moveEvent$
                .pipe(tapFirst(() => this._zone.run(() => {
                this.moving = true;
                this.start.emit();
                this._cd.markForCheck();
            })), 
            // Throttle emission to a single event per animation frame.
            audit(() => nextAnimationFrame$()), takeUntilDestroyed(this._destroyRef), takeUntil(endEvent$))
                .subscribe((moveEvent) => {
                NgZone.assertNotInAngularZone();
                const eventPos = config.eventPositionFn(moveEvent);
                const newClientPos = eventPos.clientPos;
                const distance = newClientPos - lastClientPos;
                lastClientPos = newClientPos;
                this.move.emit({ distance, position: eventPos });
            });
            // Listen for 'end' events; call 'stop propagation' to not close overlays
            endEvent$
                .pipe(first(), takeUntilDestroyed(this._destroyRef))
                .subscribe((endEvent) => {
                endEvent.stopPropagation();
                this._document.body.style.cursor = oldDocumentCursor;
                this.moving && this._zone.run(() => {
                    this.end.emit();
                    this.moving = false;
                    this._cd.markForCheck();
                });
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSplitterComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "20.0.0", type: SciSplitterComponent, isStandalone: true, selector: "sci-splitter", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { start: "start", move: "move", end: "end", reset: "reset" }, host: { properties: { "class.moving": "this.moving", "class.vertical": "this.isVertical", "class.horizontal": "this.isHorizontal", "style.cursor": "this.splitterCursor" } }, viewQueries: [{ propertyName: "_touchTarget", first: true, predicate: ["touch_target"], descendants: true, isSignal: true }], ngImport: i0, template: "<div #touch_target class=\"touch-target\">\n  <div class=\"handle\"></div>\n</div>\n", styles: [":host{display:grid;position:relative;background-color:var(--sci-splitter-background-color);border-radius:var(--sci-splitter-border-radius);place-items:center;align-self:center}:host>div.touch-target{position:absolute;display:grid;place-items:center;pointer-events:auto}:host>div.touch-target>div.handle{position:absolute;background-color:var(--sci-splitter-background-color);border-radius:var(--sci-splitter-border-radius);opacity:var(--sci-splitter-opacity-hover);transition-property:width,height;transition-timing-function:ease-in;transition-duration:75ms}:host.vertical{width:var(--sci-splitter-size);height:var(--sci-splitter-cross-axis-size)}:host.vertical>div.touch-target{width:var(--sci-splitter-touch-target-size);height:100%}:host.vertical>div.touch-target>div.handle{width:var(--sci-splitter-size);height:100%}:host.horizontal{height:var(--sci-splitter-size);width:var(--sci-splitter-cross-axis-size)}:host.horizontal>div.touch-target{width:100%;height:var(--sci-splitter-touch-target-size)}:host.horizontal>div.touch-target>div.handle{width:100%;height:var(--sci-splitter-size)}:host>div.touch-target:active>div.handle{opacity:var(--sci-splitter-opacity-active)}:host.vertical.moving>div.touch-target>div.handle,:host.vertical>div.touch-target:hover>div.handle{background-color:var(--sci-splitter-background-color-hover);width:var(--sci-splitter-size-hover)}:host.horizontal.moving>div.touch-target>div.handle,:host.horizontal>div.touch-target:hover>div.handle{background-color:var(--sci-splitter-background-color-hover);height:var(--sci-splitter-size-hover)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciSplitterComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-splitter', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div #touch_target class=\"touch-target\">\n  <div class=\"handle\"></div>\n</div>\n", styles: [":host{display:grid;position:relative;background-color:var(--sci-splitter-background-color);border-radius:var(--sci-splitter-border-radius);place-items:center;align-self:center}:host>div.touch-target{position:absolute;display:grid;place-items:center;pointer-events:auto}:host>div.touch-target>div.handle{position:absolute;background-color:var(--sci-splitter-background-color);border-radius:var(--sci-splitter-border-radius);opacity:var(--sci-splitter-opacity-hover);transition-property:width,height;transition-timing-function:ease-in;transition-duration:75ms}:host.vertical{width:var(--sci-splitter-size);height:var(--sci-splitter-cross-axis-size)}:host.vertical>div.touch-target{width:var(--sci-splitter-touch-target-size);height:100%}:host.vertical>div.touch-target>div.handle{width:var(--sci-splitter-size);height:100%}:host.horizontal{height:var(--sci-splitter-size);width:var(--sci-splitter-cross-axis-size)}:host.horizontal>div.touch-target{width:100%;height:var(--sci-splitter-touch-target-size)}:host.horizontal>div.touch-target>div.handle{width:100%;height:var(--sci-splitter-size)}:host>div.touch-target:active>div.handle{opacity:var(--sci-splitter-opacity-active)}:host.vertical.moving>div.touch-target>div.handle,:host.vertical>div.touch-target:hover>div.handle{background-color:var(--sci-splitter-background-color-hover);width:var(--sci-splitter-size-hover)}:host.horizontal.moving>div.touch-target>div.handle,:host.horizontal>div.touch-target:hover>div.handle{background-color:var(--sci-splitter-background-color-hover);height:var(--sci-splitter-size-hover)}\n"] }]
        }], propDecorators: { moving: [{
                type: HostBinding,
                args: ['class.moving']
            }], isVertical: [{
                type: HostBinding,
                args: ['class.vertical']
            }], isHorizontal: [{
                type: HostBinding,
                args: ['class.horizontal']
            }], splitterCursor: [{
                type: HostBinding,
                args: ['style.cursor']
            }] } });
/**
 * Emits when the next animation frame is executed.
 *
 * Unlike using `timer(0, animationFrameScheduler)`, this observable emits within the zone where it is subscribed.
 *
 * Note that the RxJS `animationFrameScheduler` may not necessarily execute in the current execution context, such as inside or outside Angular.
 * The scheduler always executes tasks in the zone where it was first used in the application.
 */
function nextAnimationFrame$() {
    return new Observable(observer => {
        const animationFrame = requestAnimationFrame(() => observer.next());
        return () => cancelAnimationFrame(animationFrame);
    });
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
 * Secondary entrypoint: '@scion/components/splitter'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciSplitterComponent };
//# sourceMappingURL=scion-components-splitter.mjs.map
