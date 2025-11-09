import {Blockable} from '../glass-pane/blockable';
import {assertNotInReactiveContext, ComponentRef, computed, DestroyableInjector, DestroyRef, DOCUMENT, effect, ElementRef, inject, Injector, NgZone, Signal, signal, Type, untracked, ViewContainerRef} from '@angular/core';
import {WorkbenchFocusMonitor} from '../focus/workbench-focus-tracker.service';
import {ComponentPortal} from '@angular/cdk/portal';
import {PopupComponent} from './popup.component';
import {boundingClientRect} from '@scion/components/dimension';
import {fromEvent} from 'rxjs';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog';
import {Arrays, Observables} from '@scion/toolkit/util';
import {ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef, PositionStrategy} from '@angular/cdk/overlay';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
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
import {WorkbenchPopup} from './workbench-popup';
import {PopupConfig, PopupSize} from './popup.config';
import {provideContextAwareServices} from '../context-aware-service-provider';
import {WorkbenchInvocationContext} from '../invocation-context/invocation-context';
import {ViewDragService} from '../view-dnd/view-drag.service';

/** @inheritDoc */
export class ɵWorkbenchPopup<T = unknown, R = unknown> implements WorkbenchPopup<T, R>, Blockable {

  /** Injector for the popup; destroyed when the popup is closed. */
  public readonly injector = inject(Injector) as DestroyableInjector;

  private readonly _overlayRef: OverlayRef;
  private readonly _focusMonitor = inject(WorkbenchFocusMonitor);
  private readonly _portal: ComponentPortal<PopupComponent>;
  private readonly _componentRef = signal<ComponentRef<PopupComponent> | undefined>(undefined);
  private readonly _popupOrigin: Signal<DOMRect | undefined>;

  public readonly cssClasses: string[];
  public readonly focused = computed(() => this._focusMonitor.activeElement()?.id === this.id);
  public readonly attached: Signal<boolean>;
  public readonly destroyed = signal<boolean>(false);
  public readonly bounds = boundingClientRect(computed(() => this._componentRef()?.location.nativeElement as HTMLElement | undefined));
  public readonly blockedBy: Signal<ɵWorkbenchDialog | null>;
  public result: R | Error | undefined;

  constructor(public id: PopupId, public invocationContext: WorkbenchInvocationContext | null, private _config: PopupConfig) {
    this._portal = this.createPortal(this._config);
    this._popupOrigin = this.trackPopupOrigin();
    this.blockedBy = inject(WorkbenchDialogRegistry).top(this.id);
    this.attached = this.monitorHostElementAttached();
    this.cssClasses = Arrays.coerce(this._config.cssClass);

    const positionStrategy = inject(Overlay).position()
      .flexibleConnectedTo({x: 0, y: 0})
      .withFlexibleDimensions(false)
      .withLockedPosition(false) // If locked, the popup won't attempt to reposition itself if not enough space available.
      .withPositions(((): ConnectedPosition[] => {
        switch (this._config.align ?? 'north') {
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

    this.focus(popupElement);
    this.stickToAnchor(positionStrategy);
    this.repositionOnResize();
    this.bindToHostElement();
    this.closeOnHostDestroy();
    this.closeOnFocusLoss(popupElement);
    this.closeOnEscape(popupElement);

    inject(DestroyRef).onDestroy(() => this.destroyed.set(true));
  }

  /**
   * Waits for the popup to close, resolving to its result or rejecting if closed with an error.
   */
  public waitForClose(): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve, reject) => {
      this.injector.get(DestroyRef).onDestroy(() => {
        this.result instanceof Error ? reject(this.result) : resolve(this.result);
      });
    });
  }

  /**
   * Creates a portal to render {@link PopupComponent} in the popup's injection context.
   */
  private createPortal(config: PopupConfig): ComponentPortal<PopupComponent> {
    const injector = Injector.create({
      parent: config.componentConstructOptions?.injector ?? inject(Injector),
      providers: [
        {provide: ɵWorkbenchPopup, useValue: this},
        {provide: WorkbenchPopup, useExisting: ɵWorkbenchPopup},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPopup},
        provideContextAwareServices(),
        ...[config.componentConstructOptions?.providers ?? []],
      ],
    });
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return new ComponentPortal(PopupComponent, null, injector);
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

  private focus(popupElement: HTMLElement): void {
    // Make the popup focusable to request focus.
    popupElement.setAttribute('tabindex', '-1');
    // Request focus to not close the popup when it opens (if using the 'onFocusLost' strategy).
    inject(FocusMonitor).focusVia(popupElement, 'program');
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
    const focusMonitor = inject(FocusMonitor);

    if (this._config.closeStrategy?.onFocusLost ?? true) {
      focusMonitor.monitor(popupElement, true)
        .pipe(
          filter((focusOrigin: FocusOrigin) => !focusOrigin),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.close(this.result));
    }
  }

  /**
   * Closes the popup on escape keystroke.
   */
  private closeOnEscape(popupElement: HTMLElement): void {
    const zone = inject(NgZone);

    if (this._config.closeStrategy?.onEscape ?? true) {
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
  private bindToHostElement(): void {
    const zone = inject(NgZone);
    const document = inject(DOCUMENT);
    const viewDragService = inject(ViewDragService);

    let activeElement: HTMLElement | undefined;

    effect(() => {
      const visible = this.attached() && !viewDragService.dragging();
      untracked(() => {
        if (visible) {
          setStyle(this._overlayRef.overlayElement, {visibility: null});
          activeElement?.focus();
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
        activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      });
  }

  /**
   * Creates a signal that tracks the position of the popup anchor.
   */
  private trackPopupOrigin(): Signal<DOMRect | undefined> {
    if (this._config.anchor instanceof Element || this._config.anchor instanceof ElementRef) {
      const anchor = coerceElement(this._config.anchor) as HTMLElement;
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
      const anchorBounds = toSignal(Observables.coerce(this._config.anchor));

      return computed(() => {
        // Maintain position and size when detached to prevent flickering when attached again and to support for virtual scrolling in popup content.
        if (!this.attached()) {
          return undefined;
        }

        // IMPORTANT: Track anchor and host bounds only if attached to prevent flickering.
        if (!anchorBounds()) {
          return undefined;
        }

        const {x, y} = mapToPageCoordinates(anchorBounds()!, this.invocationContext?.bounds() ?? documentBounds());
        const {width, height} = anchorBounds()!;
        return constrainClientRect(new DOMRect(x, y, width, height), this.invocationContext?.bounds());
      }, {equal: isEqualDomRect});
    }
  }

  /** @inheritDoc */
  public setResult(result?: R): void {
    this.result = result;
  }

  /** @inheritDoc */
  public close(result?: R | Error): void {
    assertNotInReactiveContext(this.close, 'Call WorkbenchPopup.close() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Prevent closing if blocked.
    if (this.blockedBy()) {
      return;
    }

    this.result = result;
    this.destroy();
  }

  /** @inheritDoc */
  public get input(): T | undefined {
    return this._config.input as T | undefined;
  }

  /** @inheritDoc */
  public get size(): PopupSize | undefined {
    return this._config.size;
  }

  public get component(): Type<any> {
    return this._config.component;
  }

  public get viewContainerRef(): ViewContainerRef | undefined {
    return this._config.componentConstructOptions?.viewContainerRef;
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
