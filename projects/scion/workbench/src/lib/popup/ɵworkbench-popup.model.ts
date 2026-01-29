/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Blockable} from '../glass-pane/blockable';
import {assertNotInReactiveContext, ComponentRef, computed, DestroyableInjector, DestroyRef, DOCUMENT, effect, ElementRef, inject, InjectionToken, Injector, NgZone, Signal, signal, untracked, WritableSignal} from '@angular/core';
import {WorkbenchFocusMonitor} from '../focus/workbench-focus-tracker.service';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {WorkbenchPopupComponent} from './workbench-popup.component';
import {boundingClientRect} from '@scion/components/dimension';
import {fromEvent} from 'rxjs';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog.model';
import {Arrays, Observables} from '@scion/toolkit/util';
import {ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef, PositionStrategy} from '@angular/cdk/overlay';
import {fromResize$} from '@scion/toolkit/observable';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {WORKBENCH_COMPONENT_REF, WORKBENCH_ELEMENT} from '../workbench-element-references';
import {filter} from 'rxjs/operators';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {coerceElement} from '@angular/cdk/coercion';
import {PopupId} from '../workbench.identifiers';
import {BottomLeftPoint, BottomRightPoint, Point, PopupOrigin, TopLeftPoint, TopRightPoint} from './popup.origin';
import {constrainClientRect, setStyle} from '../common/dom.util';
import {WorkbenchPopup, WorkbenchPopupSize} from './workbench-popup.model';
import {WorkbenchInvocationContext} from '../invocation-context/invocation-context';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {WorkbenchPopupOptions} from './workbench-popup.options';
import {Popup} from './popup';
import {WORKBENCH_POPUP_CONTEXT} from './workbench-popup-context.provider';

/** @inheritDoc */
export class ɵWorkbenchPopup implements Popup, WorkbenchPopup, Blockable {

  /** Injector for the popup; destroyed when the popup is closed. */
  public readonly injector = inject(Injector) as DestroyableInjector;

  private readonly _overlayRef: OverlayRef;
  private readonly _focusMonitor = inject(WorkbenchFocusMonitor);
  private readonly _portal: ComponentPortal<WorkbenchPopupComponent>;
  private readonly _componentRef = signal<ComponentRef<WorkbenchPopupComponent> | undefined>(undefined);
  private readonly _popupOrigin: Signal<DOMRect | undefined>;
  private readonly _cssClass = signal<string[]>([]);

  public readonly size: WorkbenchPopupSize;
  public readonly focused = computed(() => this._focusMonitor.activeElement()?.id === this.id);
  public readonly attached: Signal<boolean>;
  public readonly destroyed = signal<boolean>(false);
  public readonly bounds = boundingClientRect(computed(() => this._componentRef()?.location.nativeElement as HTMLElement | undefined));
  public readonly blockedBy: Signal<ɵWorkbenchDialog | null>;
  // TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
  public readonly input: unknown | undefined;
  public result: unknown | Error | undefined;

  constructor(public id: PopupId,
              public component: ComponentType<unknown>,
              public invocationContext: WorkbenchInvocationContext | null,
              private _options: WorkbenchPopupOptions) {
    this._portal = this.createPortal();
    this.input = this._portal.injector?.get(LEGACY_POPUP_INPUT, undefined, {optional: true});
    this._popupOrigin = this.trackPopupOrigin();
    this._cssClass.set(Arrays.coerce(this._options.cssClass));
    this.size = new ɵWorkbenchPopupSize(this._options);
    this.blockedBy = inject(WorkbenchDialogRegistry).top(this.id);
    this.attached = this.monitorHostElementAttached();

    const positionStrategy = inject(Overlay).position()
      .flexibleConnectedTo({x: 0, y: 0})
      .withFlexibleDimensions(false)
      .withLockedPosition(false) // If locked, the popup won't attempt to reposition itself if not enough space available.
      .withPositions(((): ConnectedPosition[] => {
        switch (this._options.align ?? 'north') {
          case 'north':
            return [NORTH, SOUTH, WEST, EAST];
          case 'south':
            return [SOUTH, NORTH, WEST, EAST];
          case 'west':
            return [WEST, EAST, NORTH, SOUTH];
          case 'east':
            return [EAST, WEST, NORTH, SOUTH];
          default:
            throw Error('[PopupPositionError] Illegal position; must be north, south, west or east');
        }
      })());

    this._overlayRef = this.createOverlay(positionStrategy);
    const componentRef = this._overlayRef.attach(this._portal);
    const popupElement = componentRef.location.nativeElement as HTMLElement;
    this._componentRef.set(componentRef);

    // Make the popup focusable to request focus.
    popupElement.setAttribute('tabindex', '-1');

    this.stickToAnchor(positionStrategy);
    this.repositionOnResize();
    this.bindToHostElement(popupElement);
    this.closeOnHostDestroy();
    this.closeOnFocusLoss(popupElement);
    this.closeOnEscape(popupElement);

    inject(DestroyRef).onDestroy(() => this.destroyed.set(true));
  }

  /**
   * Waits for the popup to close, resolving to its result or rejecting if closed with an error.
   */
  public waitForClose<R>(): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve, reject) => {
      this.injector.get(DestroyRef).onDestroy(() => {
        this.result instanceof Error ? reject(this.result) : resolve(this.result as R);
      });
    });
  }

  /**
   * Creates a portal to render {@link WorkbenchPopupComponent} in the popup's injection context.
   */
  private createPortal(): ComponentPortal<WorkbenchPopupComponent> {
    const injector = Injector.create({
      parent: this._options.injector ?? inject(Injector),
      providers: [
        {provide: ɵWorkbenchPopup, useValue: this},
        {provide: WorkbenchPopup, useExisting: ɵWorkbenchPopup},
        {provide: Popup, useExisting: ɵWorkbenchPopup},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPopup},
        inject(WORKBENCH_POPUP_CONTEXT, {optional: true}) ?? [],
        this._options.providers ?? [],
      ],
    });
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return new ComponentPortal(WorkbenchPopupComponent, null, injector);
  }

  /**
   * Creates a dedicated overlay per popup to place it on top of previously created overlays, such as dialogs, popups, dropdowns, etc.
   */
  private createOverlay(positionStrategy: PositionStrategy): OverlayRef {
    return inject(Overlay).create({
      panelClass: 'wb-popup',
      hasBackdrop: false,
      positionStrategy: positionStrategy,
      scrollStrategy: inject(Overlay).scrollStrategies.noop(),
      disposeOnNavigation: true,
    });
  }

  /**
   * Moves the popup with the anchor.
   */
  private stickToAnchor(positionStrategy: FlexibleConnectedPositionStrategy): void {
    effect(() => {
      const origin = this._popupOrigin();
      untracked(() => {
        if (origin) {
          positionStrategy.setOrigin(origin);
          this._overlayRef.updatePosition();
        }
      });
    });
  }

  /**
   * Monitors attachment of the host element.
   */
  private monitorHostElementAttached(): Signal<boolean> {
    if (this.invocationContext) {
      return this.invocationContext.attached;
    }
    const workbenchComponentRef = inject(WORKBENCH_COMPONENT_REF);
    return computed(() => !!workbenchComponentRef());
  }

  /**
   * Repositions the popup position when resized.
   */
  private repositionOnResize(): void {
    const zone = inject(NgZone);

    fromResize$(this._overlayRef.overlayElement)
      .pipe(
        observeIn(fn => zone.run(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._overlayRef.updatePosition();
      });
  }

  /**
   * Closes the popup on focus loss, if configured.
   */
  private closeOnFocusLoss(popupElement: HTMLElement): void {
    // const focusMonitor = inject(FocusMonitor);

    if (this._options.closeStrategy?.onFocusLost ?? true) {
      effect(onCleanup => {
        if (!this.attached() || !this._popupOrigin()) {
          return;
        }
        const focused = this.focused();

        untracked(() => {
          if (!focused) {
            this.close(this.result);
          }
        })

        // untracked(() => {
        //   const subscription = focusMonitor.monitor(popupElement, true)
        //     .pipe(
        //       tap(focusOrigin => console.log('>>> focus', focusOrigin)),
        //       filter((focusOrigin: FocusOrigin) => !focusOrigin),
        //     )
        //     .subscribe(() => this.close(this.result));
        //   onCleanup(() => subscription.unsubscribe());
        // });
      });
    }
  }

  /**
   * Closes the popup on escape keystroke.
   */
  private closeOnEscape(popupElement: HTMLElement): void {
    const zone = inject(NgZone);

    if (this._options.closeStrategy?.onEscape ?? true) {
      fromEvent<KeyboardEvent>(popupElement, 'keydown')
        .pipe(
          subscribeIn(fn => zone.runOutsideAngular(fn)),
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          observeIn(fn => zone.run(fn)),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.close());
    }
  }

  /**
   * Closes the popup when the context element is destroyed.
   */
  private closeOnHostDestroy(): void {
    if (this.invocationContext) {
      effect(() => {
        if (this.invocationContext!.destroyed()) {
          untracked(() => this.close());
        }
      });
    }
  }

  /**
   * Binds this popup to its workbench host element, displaying it only when the host element is attached.
   */
  private bindToHostElement(popupElement: HTMLElement): void {
    const zone = inject(NgZone);
    const document = inject(DOCUMENT);
    const viewDragService = inject(ViewDragService);

    let activeElement = popupElement;

    // Compute visibility as separate signal to only run the effect on visibility change.
    const visible = computed(() => this.attached() && !!this._popupOrigin() && !viewDragService.dragging());

    effect(() => {
      const isVisible = visible();
      untracked(() => {
        if (isVisible) {
          setStyle(this._overlayRef.overlayElement, {visibility: null});
          activeElement.focus();
        }
        else {
          setStyle(this._overlayRef.overlayElement, {visibility: 'hidden'}); // Hide via `visibility` instead of `display` property to retain the size.
        }
      });
    });

    // Track the focus in the popup to restore it when attaching the popup.
    fromEvent(this._overlayRef.overlayElement, 'focusin')
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : popupElement;
      });
  }

  /**
   * Creates a signal that tracks the position of the popup anchor.
   */
  private trackPopupOrigin(): Signal<DOMRect | undefined> {
    if (this._options.anchor instanceof Element || this._options.anchor instanceof ElementRef) {
      const anchor = coerceElement(this._options.anchor) as HTMLElement;
      const anchorBounds = boundingClientRect(anchor);

      return computed(() => {
        // Maintain position and size when detached to prevent flickering when attached again and to support for virtual scrolling in popup content.
        if (!this.attached()) {
          return undefined;
        }

        // IMPORTANT: Track anchor and host bounds only if attached to prevent flickering.

        // The `boundingClientRect` signal does not detect position changes when the element is scrolled out of view.
        // Consequently, if the popup anchor is scrolled out of view and the context element is enlarged, the popup may not align
        // with the context boundaries. Therefore, we read the anchor's bounding box directly from the DOM.
        anchorBounds();

        return constrainClientRect(anchor.getBoundingClientRect(), this.invocationContext?.bounds());
      }, {equal: isEqualDomRect});
    }
    else {
      const documentBounds = boundingClientRect(document.documentElement);
      const anchorBounds = toSignal(Observables.coerce(this._options.anchor));

      return computed(() => {
        // Maintain position and size when detached to prevent flickering when attached again and to support for virtual scrolling in popup content.
        if (!this.attached()) {
          return undefined;
        }

        // IMPORTANT: Track anchor and host bounds only if attached to prevent flickering.
        if (!anchorBounds()) {
          return undefined;
        }

        const relativeTo = anchorBounds()!.relativeTo ?? 'context';
        const {x, y} = mapToPageCoordinates(anchorBounds()!, relativeTo === 'viewport' ? documentBounds() : (this.invocationContext?.bounds() ?? documentBounds()));
        const {width, height} = anchorBounds()!;
        return constrainClientRect(new DOMRect(x, y, width, height), this.invocationContext?.bounds());
      }, {equal: isEqualDomRect});
    }
  }

  /** @inheritDoc */
  public setResult<R>(result?: R): void {
    this.result = result;
  }

  /** @inheritDoc */
  public close<R>(result?: R | Error): void {
    assertNotInReactiveContext(this.close, 'Call WorkbenchPopup.close() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Prevent closing if blocked.
    if (this.blockedBy()) {
      return;
    }

    this.result = result;
    this.destroy();
  }

  /** @inheritDoc */
  public get cssClass(): Signal<string[]> {
    return this._cssClass;
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    untracked(() => this._cssClass.set(new Array<string>().concat(this._options.cssClass ?? []).concat(cssClass)));
  }

  // TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
  public set cssClasses(cssClasses: string[]) {
    this.cssClass = cssClasses;
  }

  // TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
  public get cssClasses(): string[] {
    return this.cssClass();
  }

  /**
   * Inputs passed to the popup.
   */
  public get inputs(): {[name: string]: unknown} | undefined {
    return this._options.inputs;
  }

  /**
   * Destroys this popup and associated resources.
   */
  public destroy(): void {
    if (!this.destroyed()) {
      this.injector.destroy();
      this._overlayRef.dispose();
    }
  }
}

/** @inheritDoc */
class ɵWorkbenchPopupSize implements WorkbenchPopupSize {

  private readonly _height: WritableSignal<string | undefined>;
  private readonly _width: WritableSignal<string | undefined>;
  private readonly _minHeight: WritableSignal<string | undefined>;
  private readonly _maxHeight: WritableSignal<string | undefined>;
  private readonly _minWidth: WritableSignal<string | undefined>;
  private readonly _maxWidth: WritableSignal<string | undefined>;

  constructor(options: WorkbenchPopupOptions) {
    // Migrate deprecation analogous to `ɵWorkbenchDialogSize`.
    this._height = signal<string | undefined>(options.size?.height);
    this._width = signal<string | undefined>(options.size?.width);
    this._minHeight = signal<string | undefined>(options.size?.minHeight);
    this._maxHeight = signal<string | undefined>(options.size?.maxHeight);
    this._minWidth = signal<string | undefined>(options.size?.minWidth);
    this._maxWidth = signal<string | undefined>(options.size?.maxWidth);
  }

  /** @inheritDoc */
  public get height(): Signal<string | undefined> {
    return this._height;
  }

  /** @inheritDoc */
  public set height(height: string | undefined) {
    untracked(() => this._height.set(height));
  }

  /** @inheritDoc */
  public get width(): Signal<string | undefined> {
    return this._width;
  }

  /** @inheritDoc */
  public set width(width: string | undefined) {
    untracked(() => this._width.set(width));
  }

  /** @inheritDoc */
  public get minHeight(): Signal<string | undefined> {
    return this._minHeight;
  }

  /** @inheritDoc */
  public set minHeight(minHeight: string | undefined) {
    untracked(() => this._minHeight.set(minHeight));
  }

  /** @inheritDoc */
  public get maxHeight(): Signal<string | undefined> {
    return this._maxHeight;
  }

  /** @inheritDoc */
  public set maxHeight(maxHeight: string | undefined) {
    untracked(() => this._maxHeight.set(maxHeight));
  }

  /** @inheritDoc */
  public get minWidth(): Signal<string | undefined> {
    return this._minWidth;
  }

  /** @inheritDoc */
  public set minWidth(minWidth: string | undefined) {
    untracked(() => this._minWidth.set(minWidth));
  }

  /** @inheritDoc */
  public get maxWidth(): Signal<string | undefined> {
    return this._maxWidth;
  }

  /** @inheritDoc */
  public set maxWidth(maxWidth: string | undefined) {
    untracked(() => this._maxWidth.set(maxWidth));
  }
}

const NORTH: ConnectedPosition = {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', panelClass: 'wb-north'};
const SOUTH: ConnectedPosition = {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', panelClass: 'wb-south'};
const WEST: ConnectedPosition = {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', panelClass: 'wb-west'};
const EAST: ConnectedPosition = {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', panelClass: 'wb-east'};

/**
 * Maps given context coordinates to absolute page coordinates.
 */
function mapToPageCoordinates(origin: PopupOrigin, relativeTo: DOMRect): Point {
  const xy = origin as Partial<Point>;
  if (xy.x !== undefined && xy.y !== undefined) {
    return {
      x: relativeTo.x + xy.x,
      y: relativeTo.y + xy.y,
    };
  }
  const topLeft = origin as Partial<TopLeftPoint>;
  if (topLeft.top !== undefined && topLeft.left !== undefined) {
    return {
      x: relativeTo.x + topLeft.left,
      y: relativeTo.y + topLeft.top,
    };
  }
  const topRight = origin as Partial<TopRightPoint>;
  if (topRight.top !== undefined && topRight.right !== undefined) {
    return {
      x: relativeTo.x + (relativeTo.width - topRight.right),
      y: relativeTo.y + topRight.top,
    };
  }
  const bottomLeft = origin as Partial<BottomLeftPoint>;
  if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
    return {
      x: relativeTo.x + bottomLeft.left,
      y: relativeTo.y + (relativeTo.height - bottomLeft.bottom),
    };
  }
  const bottomRight = origin as Partial<BottomRightPoint>;
  if (bottomRight.bottom !== undefined && bottomRight.right !== undefined) {
    return {
      x: relativeTo.x + (relativeTo.width - bottomRight.right),
      y: relativeTo.y + (relativeTo.height - bottomRight.bottom),
    };
  }
  throw Error('[PopupOriginError] Illegal popup origin; must be "Point", "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
}

function isEqualDomRect(a: DOMRect | undefined, b: DOMRect | undefined): boolean {
  return a?.top === b?.top && a?.right === b?.right && a?.bottom === b?.bottom && a?.left === b?.left;
}

/**
 * TODO [Angular 22] Remove with Angular 22. Used for backward compatiblity.
 */
export const LEGACY_POPUP_INPUT = new InjectionToken<unknown>('LEGACY_POPUP_INPUT');
