/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {createEnvironmentInjector, DestroyRef, effect, ElementRef, EnvironmentInjector, inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {ConnectedOverlayPositionChange, ConnectedPosition, FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {combineLatestWith, firstValueFrom, fromEvent, identity, MonoTypeOperatorFunction, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, shareReplay, startWith} from 'rxjs/operators';
import {ComponentPortal} from '@angular/cdk/portal';
import {Popup, PopupConfig, ɵPopup} from './popup.config';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Objects, Observables} from '@scion/toolkit/util';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {fromBoundingClientRect$, fromDimension$} from '@scion/toolkit/observable';
import {PopupComponent} from './popup.component';
import {DOCUMENT} from '@angular/common';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {BottomLeftPoint, BottomRightPoint, Point, PopupOrigin, TopLeftPoint, TopRightPoint} from './popup.origin';
import {coerceElement} from '@angular/cdk/coercion';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {provideViewContext} from '../view/view-context-provider';
import {UUID} from '@scion/toolkit/uuid';

const NORTH: ConnectedPosition = {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'};
const SOUTH: ConnectedPosition = {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top'};
const WEST: ConnectedPosition = {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center'};
const EAST: ConnectedPosition = {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center'};

/**
 * Allows displaying a component in a workbench popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
 * which can be either a coordinate or an HTML element. The popup moves when the anchor moves.
 *
 * Unlike views, popups are not part of the persistent Workbench navigation, meaning that popups do not survive a page reload.
 */
@Injectable({providedIn: 'root'})
export class PopupService {

  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _overlay = inject(Overlay);
  private readonly _focusManager = inject(FocusMonitor);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _zone = inject(NgZone);
  private readonly _document = inject(DOCUMENT);
  private readonly _view = inject(ɵWorkbenchView, {optional: true});

  /**
   * Displays the specified component in a popup.
   *
   * To position the popup, provide either a coordinate or an element to serve as the popup anchor.
   *
   * If you use an element as the popup anchor, the popup also moves when the anchor element moves. If you use a coordinate
   * and open the popup in the context of a view, the popup opens relative to the bounds of that view. Otherwise, it
   * is positioned relative to the page viewport. If you move or resize the view or the page, the popup will also be moved
   * depending on the pair of coordinates used.
   *
   * By setting the alignment of the popup, you can control the region where to open the popup relative to its anchor.
   *
   * Optionally, you can pass data to the popup component. The component can inject the popup handle {@link Popup} to
   * read input data or to close the popup.
   *
   * By default, the popup will close on focus loss, or when the user hits the escape key.
   *
   * If opening the popup in the context of a view, the popup is bound to the lifecycle of the view, that is, the popup
   * is displayed only if the view is active and is closed when the view is closed.
   *
   * @param   config - Controls popup behavior
   * @returns a promise that:
   *          - resolves to the result if closed with a result
   *          - resolves to `undefined` if closed without a result
   */
  public async open<R>(config: PopupConfig): Promise<R | undefined> {
    // Ensure to run in Angular zone to display the popup even when called from outside of the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(config));
    }

    const align = config.align || 'north';
    const contextualView = this.resolveContextualView(config);

    // Set up the popup positioning strategy.
    const popupOrigin$ = this.observePopupOrigin$(config, contextualView).pipe(shareReplay({bufferSize: 1, refCount: false}));
    const overlayPositionStrategy = this._overlay.position()
      .flexibleConnectedTo(await firstValueFrom(popupOrigin$))
      .withFlexibleDimensions(false)
      .withLockedPosition(false) // If locked, the popup won't attempt to reposition itself if not enough space available.
      .withPositions(((): ConnectedPosition[] => {
        switch (align) {
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

    // Configure the popup overlay.
    const overlayConfig = new OverlayConfig({
      panelClass: [
        'wb-popup',
        `wb-${align}`,
      ],
      hasBackdrop: false,
      positionStrategy: overlayPositionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
    });

    // Construct the popup component and attach it to the DOM.
    const overlayRef = this._overlay.create(overlayConfig);
    const popup = this.createPopup(config, {view: contextualView});
    const popupPortal = new ComponentPortal(PopupComponent, null, Injector.create({
      parent: config.componentConstructOptions?.injector || this._environmentInjector,
      providers: [
        {provide: ɵPopup, useValue: popup},
        {provide: Popup, useExisting: ɵPopup},
        provideViewContext(contextualView),
        ...[config.componentConstructOptions?.providers || []],
      ],
    }));
    const popupDestroyRef = popup.injector.get(DestroyRef);
    const componentRef = overlayRef.attach(popupPortal);
    const popupElement: HTMLElement = componentRef.location.nativeElement;

    // Make the popup focusable and request the focus.
    popupElement.setAttribute('tabindex', '-1');
    this._focusManager.focusVia(popupElement, 'program'); // To not close the popup immediately when it opens, if using the 'onFocusLost' strategy.

    // Synchronize the CSS class that indicates where the popup docks to the anchor; is one of 'wb-north', 'wb-south', 'wb-east', or 'wb-west'.
    overlayPositionStrategy.positionChanges
      .pipe(takeUntilDestroyed(popupDestroyRef))
      .subscribe(change => this.setPopupAlignCssClass(overlayRef, change));

    // Re-position the popup when the origin moves.
    popupOrigin$
      .pipe(takeUntilDestroyed(popupDestroyRef))
      .subscribe((origin: FlexibleConnectedPositionStrategyOrigin) => {
        overlayPositionStrategy.setOrigin(origin);
        overlayRef.updatePosition();
      });

    // Reposition the popup when its size changes (if necessary).
    fromDimension$(overlayRef.overlayElement)
      .pipe(takeUntilDestroyed(popupDestroyRef))
      .subscribe(() => overlayRef.updatePosition());

    // Close the popup depending on the passed config.
    this.installPopupCloser(config, popupElement, popup, contextualView);

    // Hide the popup when detaching the contextual view, if any.
    if (contextualView) {
      this.hidePopupOnViewDetach(overlayRef, contextualView, popup);
    }

    // Dispose the popup when closing it.
    popupDestroyRef.onDestroy(() => {
      overlayRef.dispose();
    });

    return new Promise<R | undefined>((resolve, reject) => {
      popupDestroyRef.onDestroy(() => {
        popup.result instanceof Error ? reject(popup.result) : resolve(popup.result as R);
      });
    });
  }

  /**
   * Creates the popup handle.
   */
  private createPopup<R>(config: PopupConfig, context: {view: ɵWorkbenchView | null}): ɵPopup<R> {
    // Construct the handle in an injection context that shares the popup's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const popupId = config.id ?? UUID.randomUUID();
    const popupEnvironmentInjector = createEnvironmentInjector([provideViewContext(context.view)], this._environmentInjector, `Workbench Popup ${popupId}`);
    return runInInjectionContext(popupEnvironmentInjector, () => new ɵPopup<R>(popupId, config));
  }

  private setPopupAlignCssClass(overlayRef: OverlayRef, positionChange: ConnectedOverlayPositionChange): void {
    overlayRef.overlayElement.classList.remove('wb-north', 'wb-south', 'wb-east', 'wb-west');
    switch (positionChange.connectionPair) {
      case NORTH:
        overlayRef.overlayElement.classList.add('wb-north');
        break;
      case SOUTH:
        overlayRef.overlayElement.classList.add('wb-south');
        break;
      case EAST:
        overlayRef.overlayElement.classList.add('wb-east');
        break;
      case WEST:
        overlayRef.overlayElement.classList.add('wb-west');
        break;
    }
  }

  /**
   * Closes the popup depending on the configured popup closing strategy.
   */
  private installPopupCloser(config: PopupConfig, popupElement: HTMLElement, popup: ɵPopup, contextualView: ɵWorkbenchView | null): void {
    const popupDestroyRef = popup.injector.get(DestroyRef);

    // Close the popup on escape keystroke.
    if (config.closeStrategy?.onEscape ?? true) {
      fromEvent<KeyboardEvent>(popupElement, 'keydown')
        .pipe(
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
          observeInside(continueFn => this._zone.run(continueFn)),
          takeUntilDestroyed(popupDestroyRef),
        )
        .subscribe(() => popup.close());
    }

    // Close the popup on focus loss.
    if (config.closeStrategy?.onFocusLost ?? true) {
      this._focusManager.monitor(popupElement, true)
        .pipe(
          filter((focusOrigin: FocusOrigin) => !focusOrigin),
          takeUntilDestroyed(popupDestroyRef),
        )
        .subscribe(() => popup.close(popup.result));
    }

    // Close the popup when closing the view.
    if (contextualView) {
      effect(() => {
        if (!this._viewRegistry.objects().some(view => view.id === contextualView.id)) {
          popup.close();
        }
      }, {injector: popup.injector});
    }
  }

  /**
   * Hides the popup when its contextual view is detached, and displays it when it is reattached. Also restores the focus on re-activation.
   * The contextual view is detached if not active, or located in the peripheral area and the main area is maximized.
   */
  private hidePopupOnViewDetach(overlayRef: OverlayRef, contextualView: ɵWorkbenchView, popup: ɵPopup): void {
    overlayRef.overlayElement.classList.add('wb-view-context');

    const popupDestroyRef = popup.injector.get(DestroyRef);
    let activeElement: HTMLElement | undefined;

    contextualView.portal.attached$
      .pipe(takeUntilDestroyed(popupDestroyRef))
      .subscribe(attached => {
        if (attached) {
          overlayRef.overlayElement.classList.add('wb-view-attached');
          activeElement?.focus();
        }
        else {
          overlayRef.overlayElement.classList.remove('wb-view-attached');
        }
      });

    // Track the focus in the popup to restore it when attaching the popup.
    fromEvent(overlayRef.overlayElement, 'focusin')
      .pipe(
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        takeUntilDestroyed(popupDestroyRef),
      )
      .subscribe(() => {
        activeElement = this._document.activeElement instanceof HTMLElement ? this._document.activeElement : undefined;
      });
  }

  /**
   * Observes the position of the popup anchor.
   *
   * The Observable emits the anchor's initial position, and each time when its position changes.
   */
  private observePopupOrigin$(config: PopupConfig, contextualView: ɵWorkbenchView | null): Observable<FlexibleConnectedPositionStrategyOrigin> {
    if (config.anchor instanceof Element || config.anchor instanceof ElementRef) {
      return fromBoundingClientRect$(coerceElement<HTMLElement>(config.anchor as HTMLElement))
        .pipe(
          filter(clientRect => !isNullClientRect(clientRect)), // Omit changes without dimension, for example, emitted when the view is deactivated.
          map(clientRect => ({x: clientRect.x, y: clientRect.y, width: clientRect.width, height: clientRect.height})),
        );
    }
    else {
      return Observables.coerce(config.anchor)
        .pipe(
          combineLatestWith(this.viewportBounds$(contextualView)),
          map(([popupOrigin, viewportBounds]) => {
            const {x, y} = this.mapPopupOriginToPageCoordinate(popupOrigin, viewportBounds);
            return {x, y, width: popupOrigin.width, height: popupOrigin.height};
          }),
          distinctUntilChanged(Objects.isEqual),
        );
    }
  }

  /**
   * Observes the bounds of the viewport (view or page) in which the popup has been opened.
   */
  private viewportBounds$(view: ɵWorkbenchView | null): Observable<ViewportBounds> {
    if (view) {
      return fromDimension$(view.portal.componentRef.location.nativeElement)
        .pipe(
          map(dimension => dimension.element.getBoundingClientRect()),
          filter(clientRect => !isNullClientRect(clientRect)), // Omit changes without dimension, for example, emitted when the view is deactivated.
          map(clientRect => ({x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height})),
          startWithNullBoundsIf(() => !view.active()), // Ensure initial bounds to be emitted even if the view is inactive. Otherwise, the popup would not be attached to the DOM until the view is activated.
        );
    }
    else {
      return fromEvent(window, 'resize')
        .pipe(
          startWith(undefined as void),
          map(() => ({x: 0, y: 0, width: window.innerWidth, height: window.innerHeight})),
        );
    }
  }

  /**
   * Resolves the contextual view to which the popup is bound.
   */
  private resolveContextualView(config: PopupConfig): ɵWorkbenchView | null {
    if (config.context?.viewId) {
      return this._viewRegistry.get(config.context.viewId);
    }
    if (config.context?.viewId === undefined) { // `null` means to open the popup outside the contextual view
      return this._view ?? null;
    }
    return null;
  }

  /**
   * Maps the passed popup origin, which is relative to the given viewport, to a page coordinate.
   */
  private mapPopupOriginToPageCoordinate(origin: PopupOrigin, viewportBounds: ViewportBounds): Point {
    const xy = origin as Point;
    if (xy.x !== undefined && xy.y !== undefined) {
      return {
        x: viewportBounds.x + xy.x,
        y: viewportBounds.y + xy.y,
      };
    }
    const topLeft = origin as TopLeftPoint;
    if (topLeft.top !== undefined && topLeft.left !== undefined) {
      return {
        x: viewportBounds.x + topLeft.left,
        y: viewportBounds.y + topLeft.top,
      };
    }
    const topRight = origin as TopRightPoint;
    if (topRight.top !== undefined && topRight.right !== undefined) {
      return {
        x: viewportBounds.x + (viewportBounds.width - topRight.right),
        y: viewportBounds.y + topRight.top,
      };
    }
    const bottomLeft = origin as BottomLeftPoint;
    if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
      return {
        x: viewportBounds.x + bottomLeft.left,
        y: viewportBounds.y + (viewportBounds.height - bottomLeft.bottom),
      };
    }
    const bottomRight = origin as BottomRightPoint;
    if (bottomRight.bottom !== undefined && bottomRight.right !== undefined) {
      return {
        x: viewportBounds.x + (viewportBounds.width - bottomRight.right),
        y: viewportBounds.y + (viewportBounds.height - bottomRight.bottom),
      };
    }
    throw Error('[PopupOriginError] Illegal popup origin; must be "Point", "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
  }
}

function isNullClientRect(clientRect: DOMRect): boolean {
  return clientRect.top === 0 && clientRect.right === 0 && clientRect.bottom === 0 && clientRect.left === 0;
}

function startWithNullBoundsIf(condition: () => boolean): MonoTypeOperatorFunction<ViewportBounds> {
  return condition() ? startWith({x: 0, y: 0, width: 0, height: 0}) : identity;
}

interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
