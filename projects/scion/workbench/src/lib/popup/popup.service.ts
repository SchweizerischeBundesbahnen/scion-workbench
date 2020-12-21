/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Injector, OnDestroy, Optional } from '@angular/core';
import { ConnectedOverlayPositionChange, ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { from, fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ComponentPortal } from '@angular/cdk/portal';
import { Popup, PopupConfig } from './metadata';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { WorkbenchLayoutService } from '../layout/workbench-layout.service';
import { Arrays, Defined } from '@scion/toolkit/util';
import { WorkbenchView } from '../view/workbench-view.model';

const NORTH: ConnectedPosition = {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'};
const SOUTH: ConnectedPosition = {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top'};
const WEST: ConnectedPosition = {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center'};
const EAST: ConnectedPosition = {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center'};

/**
 * Provides the mechanism to open a popup relative to an anchor element.
 */
@Injectable()
export class PopupService implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _injector: Injector,
              private _overlay: Overlay,
              private _focusManager: FocusMonitor,
              private _workbenchLayoutService: WorkbenchLayoutService,
              @Optional() private _view: WorkbenchView) {
  }

  /**
   * Opens a popup relative to the specified anchor.
   *
   * The component can inject {@link Popup} to access input data or to close the popup.
   *
   * @param   config - Controls popup behavior
   * @param   input - Optional data to pass to the popup component
   * @returns a promise that:
   *          - resolves to the result if closed with a result
   *          - resolves to `undefined` if closed without a result
   */
  public open<T>(config: PopupConfig, input?: any): Promise<T> {
    const position = config.position || 'north';

    const overlayPositionStrategy = this._overlay.position()
      .flexibleConnectedTo(config.anchor)
      .withFlexibleDimensions(false)
      .withPositions(((): ConnectedPosition[] => {
        switch (position) {
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
    const overlayConfig = new OverlayConfig({
      panelClass: [
        'wb-popup',
        `wb-${position}`,
        `e2e-position-${position}`,
        ...Arrays.coerce(config.cssClass),
      ],
      width: config.width,
      height: config.height,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      hasBackdrop: false,
      positionStrategy: overlayPositionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      disposeOnNavigation: true,
    });

    const overlayRef = this._overlay.create(overlayConfig);
    const popup = new ɵPopup(input);

    // Prepare component injector
    const injector = Injector.create({
      parent: this._injector,
      providers: [{provide: Popup, useValue: popup}],
    });

    // Instantiate popup component and attach it to the DOM
    const portal = new ComponentPortal(config.component, null, injector);
    const componentRef = overlayRef.attach(portal);

    // Listen for position changes to set current region CSS class
    overlayPositionStrategy.positionChanges
      .pipe(takeUntil(this._destroy$), takeUntil(from(popup.whenClose)))
      .subscribe(change => this.setPopupPositionCssClass(overlayRef, change));

    const popupElement: HTMLElement = componentRef.location.nativeElement;

    // Make the popup focusable and request the focus
    popupElement.setAttribute('tabindex', '-1');
    this._focusManager.focusVia(popupElement, 'program');

    // Close the popup on escape keystroke
    if (!config.closeStrategy || Defined.orElse(config.closeStrategy.onEscape, true)) {
      fromEvent(popupElement, 'keydown')
        .pipe(
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          takeUntil(from(popup.whenClose)),
        )
        .subscribe(() => popup.close());
    }

    // Close the popup on focus lost
    if (!config.closeStrategy || Defined.orElse(config.closeStrategy.onFocusLost, true)) {
      this._focusManager.monitor(popupElement, true)
        .pipe(
          filter((focusOrigin: FocusOrigin) => !focusOrigin),
          takeUntil(from(popup.whenClose)),
        )
        .subscribe(() => popup.close());
    }

    // Close the popup on workbench view grid layout change
    if (!config.closeStrategy || Defined.orElse(config.closeStrategy.onLayoutChange, true)) {
      this._workbenchLayoutService.dragging$
        .pipe(takeUntil(from(popup.whenClose)))
        .subscribe(() => popup.close());
    }

    // If in the context of a view, close the popup when closing the view
    this._view?.active$
      .pipe(
        filter(active => !active),
        takeUntil(from(popup.whenClose)),
      )
      .subscribe(() => {
        popup.close();
      });

    // Dispose the popup if the close notifier fires
    popup.whenClose.then(() => overlayRef.dispose());

    return popup.whenClose;
  }

  private setPopupPositionCssClass(overlayRef: OverlayRef, positionChange: ConnectedOverlayPositionChange): void {
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

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

class ɵPopup implements Popup { // tslint:disable-line:class-name

  private _closeResolveFn: (result: any | undefined) => void;
  public _closePromise = new Promise<any | undefined>(resolve => this._closeResolveFn = resolve); // tslint:disable-line:typedef

  constructor(public input: any | undefined) {
  }

  /**
   * @inheritDoc
   */
  public close(result?: any): void {
    this._closeResolveFn(result);
  }

  public get whenClose(): Promise<any | undefined> {
    return this._closePromise;
  }
}
