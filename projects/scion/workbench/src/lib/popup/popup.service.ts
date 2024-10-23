/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, createEnvironmentInjector, DestroyRef, effect, ElementRef, EnvironmentInjector, inject, Injectable, Injector, NgZone, runInInjectionContext, Signal, untracked} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {firstValueFrom, fromEvent} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ComponentPortal} from '@angular/cdk/portal';
import {Popup, PopupConfig, ɵPopup} from './popup.config';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Observables} from '@scion/toolkit/util';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {fromResize$} from '@scion/toolkit/observable';
import {PopupComponent} from './popup.component';
import {DOCUMENT} from '@angular/common';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {BottomLeftPoint, BottomRightPoint, Point, PopupOrigin, TopLeftPoint, TopRightPoint} from './popup.origin';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {provideViewContext} from '../view/view-context-provider';
import {UUID} from '@scion/toolkit/uuid';
import {boundingClientRect} from '@scion/components/dimension';

const NORTH: ConnectedPosition = {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', panelClass: 'wb-north'};
const SOUTH: ConnectedPosition = {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', panelClass: 'wb-south'};
const WEST: ConnectedPosition = {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', panelClass: 'wb-west'};
const EAST: ConnectedPosition = {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', panelClass: 'wb-east'};

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
    assertNotInReactiveContext(this.open, 'Call WorkbenchPopupService.open() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the popup even when called from outside of the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(config));
    }

    const align = config.align || 'north';
    const contextualView = this.resolveContextualView(config);
    const popup = this.createPopup(config, {view: contextualView});
    const popupDestroyRef = popup.injector.get(DestroyRef);
    const popupOrigin = this.trackPopupOrigin(config, contextualView, popup.injector);

    // Wait for the initial position.
    const initialPosition = await firstValueFrom(toObservable(popupOrigin, {injector: popup.injector}).pipe(filter(Boolean)));

    const overlayPositionStrategy = this._overlay.position()
      .flexibleConnectedTo(initialPosition)
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
      panelClass: 'wb-popup',
      hasBackdrop: false,
      positionStrategy: overlayPositionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
    });

    // Construct the popup component and attach it to the DOM.
    const overlayRef = this._overlay.create(overlayConfig);
    const popupPortal = new ComponentPortal(PopupComponent, null, Injector.create({
      parent: config.componentConstructOptions?.injector || this._environmentInjector,
      providers: [
        {provide: ɵPopup, useValue: popup},
        {provide: Popup, useExisting: ɵPopup},
        provideViewContext(contextualView),
        ...[config.componentConstructOptions?.providers || []],
      ],
    }));
    const componentRef = overlayRef.attach(popupPortal);
    const popupElement: HTMLElement = componentRef.location.nativeElement;

    // Make the popup focusable and request the focus.
    popupElement.setAttribute('tabindex', '-1');
    this._focusManager.focusVia(popupElement, 'program'); // To not close the popup immediately when it opens, if using the 'onFocusLost' strategy.

    // Reposition popup when the anchor is moved.
    effect(() => {
      const origin = popupOrigin();
      untracked(() => {
        if (origin) {
          overlayPositionStrategy.setOrigin(origin);
          overlayRef.updatePosition();
        }
      });
    }, {injector: popup.injector});

    // Reposition popup when resized.
    fromResize$(overlayRef.overlayElement)
      .pipe(
        observeIn(fn => this._zone.run(fn)),
        takeUntilDestroyed(popupDestroyRef),
      )
      .subscribe(() => {
        overlayRef.updatePosition();
      });

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

  /**
   * Closes the popup depending on the configured popup closing strategy.
   */
  private installPopupCloser(config: PopupConfig, popupElement: HTMLElement, popup: ɵPopup, contextualView: ɵWorkbenchView | null): void {
    const popupDestroyRef = popup.injector.get(DestroyRef);

    // Close the popup on escape keystroke.
    if (config.closeStrategy?.onEscape ?? true) {
      fromEvent<KeyboardEvent>(popupElement, 'keydown')
        .pipe(
          subscribeIn(fn => this._zone.runOutsideAngular(fn)),
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          observeIn(fn => this._zone.run(fn)),
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
          untracked(() => popup.close());
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

    effect(() => {
      const attached = contextualView.portal.attached();
      untracked(() => {
        if (attached) {
          overlayRef.overlayElement.classList.add('wb-view-attached');
          activeElement?.focus();
        }
        else {
          overlayRef.overlayElement.classList.remove('wb-view-attached');
        }
      });
    }, {injector: popup.injector});

    // Track the focus in the popup to restore it when attaching the popup.
    fromEvent(overlayRef.overlayElement, 'focusin')
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(popupDestroyRef),
      )
      .subscribe(() => {
        activeElement = this._document.activeElement instanceof HTMLElement ? this._document.activeElement : undefined;
      });
  }

  /**
   * Creates a signal that tracks the position of the popup anchor.
   */
  private trackPopupOrigin(config: PopupConfig, contextualView: ɵWorkbenchView | null, injector: Injector): Signal<DOMRect | undefined> {
    if (config.anchor instanceof Element || config.anchor instanceof ElementRef) {
      const anchorBounds = boundingClientRect(config.anchor as HTMLElement | ElementRef<HTMLElement>, {injector});
      return computed(() => {
        // Maintain position and size when detached to prevent flickering when attached again and to support for virtual scrolling in popup content.
        if (contextualView && !contextualView.portal.attached()) {
          return undefined;
        }
        return anchorBounds();  // IMPORTANT: Track anchor bounds only if attached to prevent flickering.
      }, {equal: isEqualDomRect});
    }
    else {
      const hostBounds = boundingClientRect(contextualView?.portal.componentRef.location.nativeElement ?? document.documentElement, {injector});
      const anchorBounds = toSignal(Observables.coerce(config.anchor), {injector});
      return computed(() => {
        // Maintain position and size when detached to prevent flickering when attached again and to support for virtual scrolling in popup content.
        if (contextualView && !contextualView.portal.attached()) {
          return undefined;
        }
        if (!anchorBounds()) { // IMPORTANT: Track anchor bounds only if attached to prevent flickering.
          return undefined;
        }

        const {x, y} = mapToPageCoordinates(anchorBounds()!, hostBounds());
        const {width, height} = anchorBounds()!;
        return new DOMRect(x, y, width, height);
      }, {equal: isEqualDomRect});
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
}

/**
 * Maps given view coordinates to absolute page coordinates.
 */
function mapToPageCoordinates(origin: PopupOrigin, relativeTo: DOMRect): Point {
  const xy = origin as Point;
  if (xy.x !== undefined && xy.y !== undefined) {
    return {
      x: relativeTo.x + xy.x,
      y: relativeTo.y + xy.y,
    };
  }
  const topLeft = origin as TopLeftPoint;
  if (topLeft.top !== undefined && topLeft.left !== undefined) {
    return {
      x: relativeTo.x + topLeft.left,
      y: relativeTo.y + topLeft.top,
    };
  }
  const topRight = origin as TopRightPoint;
  if (topRight.top !== undefined && topRight.right !== undefined) {
    return {
      x: relativeTo.x + (relativeTo.width - topRight.right),
      y: relativeTo.y + topRight.top,
    };
  }
  const bottomLeft = origin as BottomLeftPoint;
  if (bottomLeft.bottom !== undefined && bottomLeft.left !== undefined) {
    return {
      x: relativeTo.x + bottomLeft.left,
      y: relativeTo.y + (relativeTo.height - bottomLeft.bottom),
    };
  }
  const bottomRight = origin as BottomRightPoint;
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
