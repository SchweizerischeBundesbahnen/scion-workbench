/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, Inject, Injectable, Injector, NgZone, Optional} from '@angular/core';
import {ConnectedOverlayPositionChange, ConnectedPosition, FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {combineLatestWith, firstValueFrom, from, fromEvent, identity, MonoTypeOperatorFunction, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, shareReplay, startWith, takeUntil} from 'rxjs/operators';
import {ComponentPortal} from '@angular/cdk/portal';
import {Popup, PopupConfig, PopupReferrer, ɵPopup, ɵPopupError} from './popup.config';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Arrays, Dictionaries, Objects, Observables} from '@scion/toolkit/util';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {fromBoundingClientRect$, fromDimension$} from '@scion/toolkit/observable';
import {PopupComponent} from './popup.component';
import {DOCUMENT} from '@angular/common';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {BottomLeftPoint, BottomRightPoint, Point, PopupOrigin, TopLeftPoint, TopRightPoint} from './popup.origin';
import {coerceElement} from '@angular/cdk/coercion';

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
@Injectable()
export class PopupService {

  constructor(private _injector: Injector,
              private _overlay: Overlay,
              private _focusManager: FocusMonitor,
              private _viewRegistry: WorkbenchViewRegistry,
              private _zone: NgZone,
              @Inject(DOCUMENT) private _document: Document,
              @Optional() private _view?: ɵWorkbenchView) {
  }

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
   * When opening the popup in the context of a view, the popup is bound to the lifecycle of the view, that is, the popup
   * is displayed only when the view is active and is closed when the view is closed.
   *
   * @param   config - Controls popup behavior
   * @returns a promise that:
   *          - resolves to the result if closed with a result
   *          - resolves to `undefined` if closed without a result
   */
  public async open<R>(config: PopupConfig): Promise<R> {
    // Ensure to run in Angular zone to display the popup even when called from outside of the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(config));
    }

    const align = config.align || 'north';
    const contextualView = this.resolveContextualView(config);
    const referrer: PopupReferrer = Dictionaries.withoutUndefinedEntries({
      viewId: contextualView?.viewId,
    });

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
        ...Arrays.coerce(config.cssClass),
      ],
      hasBackdrop: false,
      positionStrategy: overlayPositionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
    });

    // Construct the popup component and attach it to the DOM.
    const overlayRef = this._overlay.create(overlayConfig);
    const popupHandle = new ɵPopup(config.input, config.size, referrer);
    const popupPortal = new ComponentPortal(PopupComponent, null, Injector.create({
      parent: config.componentConstructOptions?.injector || this._injector,
      providers: [
        {provide: PopupConfig, useValue: config},
        {provide: Popup, useValue: popupHandle},
        ...[config.componentConstructOptions?.providers || []],
      ],
    }));
    const componentRef = overlayRef.attach(popupPortal);
    const popupElement: HTMLElement = componentRef.location.nativeElement;
    const takeUntilClose = <T>(): MonoTypeOperatorFunction<T> => takeUntil<T>(from(popupHandle.whenClose));

    // Make the popup focusable and request the focus.
    popupElement.setAttribute('tabindex', '-1');
    this._focusManager.focusVia(popupElement, 'program'); // To not close the popup immediately when it opens, if using the 'onFocusLost' strategy.

    // Synchronize the CSS class that indicates where the popup docks to the anchor; is one of 'wb-north', 'wb-south', 'wb-east', or 'wb-west'.
    overlayPositionStrategy.positionChanges
      .pipe(takeUntilClose())
      .subscribe(change => this.setPopupAlignCssClass(overlayRef, change));

    // Re-position the popup when the origin moves.
    popupOrigin$
      .pipe(takeUntilClose())
      .subscribe((origin: FlexibleConnectedPositionStrategyOrigin) => {
        overlayPositionStrategy.setOrigin(origin);
        overlayRef.updatePosition();
      });

    // Reposition the popup when its size changes (if necessary).
    fromDimension$(overlayRef.overlayElement)
      .pipe(takeUntilClose())
      .subscribe(() => overlayRef.updatePosition());

    // Close the popup depending on the passed config.
    this.installPopupCloser(config, popupElement, overlayRef, popupHandle, contextualView, takeUntilClose);

    // Hide the popup when deactivating the contextual view, if any.
    if (contextualView) {
      this.hidePopupOnViewDeactivate(overlayRef, contextualView, takeUntilClose);
    }

    // Dispose the popup when closing it.
    popupHandle.whenClose.then(() => {
      overlayRef.dispose();
    });

    return popupHandle.whenClose.then((result: R | ɵPopupError): R => {
      if (result instanceof ɵPopupError) {
        throw (result.error instanceof Error ? result.error : Error(result.error));
      }
      return result;
    });
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
  private installPopupCloser(config: PopupConfig, popupElement: HTMLElement, overlayRef: OverlayRef, popupHandle: Popup, contextualView: ɵWorkbenchView | null, takeUntilClose: <T>() => MonoTypeOperatorFunction<T>): void {
    // Close the popup on escape keystroke.
    if (config.closeStrategy?.onEscape ?? true) {
      fromEvent<KeyboardEvent>(popupElement, 'keydown')
        .pipe(
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
          observeInside(continueFn => this._zone.run(continueFn)),
          takeUntilClose(),
        )
        .subscribe(() => popupHandle.close());
    }

    // Close the popup on focus loss.
    if (config.closeStrategy?.onFocusLost ?? true) {
      this._focusManager.monitor(popupElement, true)
        .pipe(
          filter((focusOrigin: FocusOrigin) => !focusOrigin),
          takeUntilClose(),
        )
        .subscribe(() => popupHandle.close());
    }

    // Close the popup when closing the view.
    if (contextualView) {
      this._viewRegistry.viewIds$
        .pipe(takeUntilClose())
        .subscribe(viewIds => {
          if (!viewIds.includes(contextualView.viewId)) {
            popupHandle.close();
          }
        });
    }
  }

  /**
   * Hides the popup when its contextual view is deactivated, and then displays the popup again when activating it.
   * Also restores the focus on re-activation.
   */
  private hidePopupOnViewDeactivate(overlayRef: OverlayRef, contextualView: ɵWorkbenchView, takeUntilClose: <T>() => MonoTypeOperatorFunction<T>): void {
    overlayRef.overlayElement.classList.add('wb-view-context');

    let activeElement: HTMLElement | undefined;

    contextualView.active$
      .pipe(takeUntilClose())
      .subscribe(viewActive => {
        if (viewActive) {
          overlayRef.overlayElement.classList.add('wb-view-active');
          activeElement?.focus();
        }
        else {
          overlayRef.overlayElement.classList.remove('wb-view-active');
        }
      });

    // Track the focus in the popup to restore it when activating the popup.
    fromEvent(overlayRef.overlayElement, 'focusin')
      .pipe(
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        takeUntilClose(),
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
        .pipe(map(clientRect => ({x: clientRect.x, y: clientRect.y, width: clientRect.width, height: clientRect.height})));
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
          filter(clientRect => !isNullClientRect(clientRect)), // Omit viewport change if not having a size, for example, if the view is deactivated.
          map(clientRect => ({x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height})),
          startWithNullBoundsIf(() => !view.active), // Ensure initial bounds to be emitted even if the view is inactive. Otherwise, the popup would not be attached to the DOM until the view is activated.
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
      return this._viewRegistry.getElseThrow(config.context.viewId);
    }
    if (config.context?.viewId === undefined) { // `null` means to open the popup outside of the contextual view
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
