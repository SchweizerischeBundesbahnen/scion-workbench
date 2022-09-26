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
import {ConnectedOverlayPositionChange, ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {firstValueFrom, from, fromEvent, MonoTypeOperatorFunction, Observable} from 'rxjs';
import {filter, map, shareReplay, takeUntil} from 'rxjs/operators';
import {ComponentPortal} from '@angular/cdk/portal';
import {Popup, PopupConfig, PopupOrigin, ɵPopup, ɵPopupError} from './popup.config';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Arrays, Observables} from '@scion/toolkit/util';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {fromBoundingClientRect$, fromDimension$} from '@scion/toolkit/observable';
import {coerceElement} from '@angular/cdk/coercion';
import {PopupComponent} from './popup.component';
import {DOCUMENT} from '@angular/common';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';

const NORTH: ConnectedPosition = {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'};
const SOUTH: ConnectedPosition = {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top'};
const WEST: ConnectedPosition = {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center'};
const EAST: ConnectedPosition = {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center'};

/**
 * Allows displaying a component in a workbench popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
 * which can be either a page coordinate (x/y) or an HTML element. When using an element as the popup anchor, the popup also
 * moves when the anchor element moves.
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
              @Optional() private _view: WorkbenchView) {
  }

  /**
   * Displays the specified component in a popup.
   *
   * To position the popup, provide either an exact screen coordinate (x/y) or an element to serve as the popup anchor.
   * If you use an element as the popup anchor, the popup also moves when the anchor element moves. If you position the
   * popup using screen coordinates, consider passing an Observable to re-position the popup after it is created. If
   * passing coordinates via an Observable, the popup will not display until the Observable emits the first coordinate.
   *
   * By setting the alignment of the popup, you can further control where the popup should open relative to its anchor.
   *
   * Optionally, you can pass data to the popup component. The component can inject the popup handle {@link Popup} to
   * read input data or to close the popup.
   *
   * By default, the popup will close on focus loss, or when the user hits the escape key.
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
    const anchor$ = this.observePopupAnchor$(config).pipe(shareReplay({bufferSize: 1, refCount: false}));

    // Set up the popup positioning strategy.
    const overlayPositionStrategy = this._overlay.position()
      .flexibleConnectedTo(await firstValueFrom(anchor$))
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
    const popupHandle = new ɵPopup(config.input, config.size);
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

    // Re-position the popup when the anchor moves.
    anchor$
      .pipe(takeUntilClose())
      .subscribe((origin: PopupOrigin) => {
        overlayPositionStrategy.setOrigin(origin);
        overlayRef.updatePosition();
      });

    // Let the popup reposition itself when the popup size changes.
    fromDimension$(overlayRef.overlayElement)
      .pipe(takeUntilClose())
      .subscribe(() => overlayRef.updatePosition());

    this.installPopupCloser(config, popupElement, overlayRef, popupHandle, takeUntilClose);

    // Dispose the popup when closing it.
    popupHandle.whenClose.then(() => {
      overlayRef.dispose();
    });

    return popupHandle.whenClose.then((result: R | ɵPopupError): R => {
      if (result instanceof ɵPopupError) {
        const error = result.error;
        if (typeof result === 'string') {
          throw Error(result);
        }
        throw error;
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
  private installPopupCloser(config: PopupConfig, popupElement: HTMLElement, overlayRef: OverlayRef, popupHandle: Popup, takeUntilClose: <T>() => MonoTypeOperatorFunction<T>): void {
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
    // If in the context of a view, hide the popup when inactivating the view, or close it when closing the view.
    else if (config.context?.viewId || (config.context?.viewId === undefined /* undefined, not null */ && this._view)) {
      const view = this.resolveViewFromContext(config.context?.viewId);
      overlayRef.overlayElement.classList.add('wb-view-context');

      // Hide the popup when inactivating the view.
      this.bindPopupToViewActiveState(view, overlayRef, takeUntilClose);

      // Close the popup when closing the view.
      this._viewRegistry.viewIds$
        .pipe(takeUntilClose())
        .subscribe(viewIds => {
          if (!viewIds.includes(view.viewId)) {
            popupHandle.close();
          }
        });
    }
  }

  /**
   * Observes the popup anchor to which the popup should dock. The Observable outputs the initial position of the anchor,
   * and each time its position changes.
   */
  private observePopupAnchor$(config: PopupConfig): Observable<PopupOrigin> {
    if (config.anchor instanceof Element || config.anchor instanceof ElementRef) {
      return fromBoundingClientRect$(coerceElement<HTMLElement>(config.anchor as HTMLElement))
        .pipe(map<DOMRect, PopupOrigin>(clientRect => ({
            x: clientRect.left,
            y: clientRect.top,
            width: clientRect.width,
            height: clientRect.height,
          }),
        ));
    }
    else {
      return Observables.coerce(config.anchor);
    }
  }

  private resolveViewFromContext(contextualViewId: string | undefined): WorkbenchView {
    if (contextualViewId) {
      return this._viewRegistry.getElseThrow(contextualViewId);
    }

    if (!this._view) {
      throw Error('[PopupOpenError] Expected view context to be available, but was not.');
    }

    return this._view;
  }

  /**
   * Hides the popup when its contextual view is deactivated, and then displays the popup again when activating it.
   * Also restores the focus on re-activation.
   */
  private bindPopupToViewActiveState(view: WorkbenchView, overlayRef: OverlayRef, takeUntilClose: <T>() => MonoTypeOperatorFunction<T>): void {
    let activeElement: HTMLElement | undefined;

    view.active$
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

    fromEvent(overlayRef.overlayElement, 'focusin')
      .pipe(
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        takeUntilClose(),
      )
      .subscribe(() => {
        activeElement = this._document.activeElement instanceof HTMLElement ? this._document.activeElement : undefined;
      });
  }
}
