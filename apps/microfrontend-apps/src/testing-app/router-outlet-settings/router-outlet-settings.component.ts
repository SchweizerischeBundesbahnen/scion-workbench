/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PreferredSize, SciRouterOutletElement } from '@scion/microfrontend-platform';
import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkTrapFocus, FocusTrap } from '@angular/cdk/a11y';

const OVERLAY_POSITION_SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'};

@Component({
  selector: 'app-router-outlet-settings',
  templateUrl: './router-outlet-settings.component.html',
  styleUrls: ['./router-outlet-settings.component.scss'],
})
export class RouterOutletSettingsComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _focusTrap: FocusTrap;

  @ViewChild(CdkTrapFocus, {static: true})
  public set setFocusTrap(trapFocus: CdkTrapFocus) {
    this._focusTrap = trapFocus.focusTrap;
  }

  constructor(host: ElementRef<HTMLElement>,
              private _routerOutlet: SciRouterOutletElement,
              private _overlay: OverlayRef) {
    this._overlay.backdropClick()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._overlay.dispose();
      });
  }

  public ngOnInit(): void {
    this._focusTrap.focusInitialElementWhenReady().then();
  }

  public onPageScrollingToggle(): void {
    this._routerOutlet.scrollable = !this._routerOutlet.scrollable;
  }

  public onPreferredSizeResetClick(): void {
    this._routerOutlet.resetPreferredSize();
  }

  public get pageScrollingEnabled(): boolean {
    return this._routerOutlet.scrollable;
  }

  public get preferredSize(): PreferredSize | undefined {
    const preferredSize = this._routerOutlet.preferredSize;
    if (!preferredSize) {
      return undefined;
    }

    // Remove properties which are not set.
    return Object.keys(preferredSize).reduce((obj, key) => {
      if (preferredSize[key] !== undefined) {
        return {...obj, [key]: preferredSize[key]};
      }
      return obj;
    }, {});
  }

  @HostListener('keydown.escape')
  public onEscape(): void {
    this._overlay.dispose();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public static openAsOverlay(config: { anchor: HTMLElement, routerOutlet: SciRouterOutletElement, overlay: Overlay, injector: Injector }): void {
    const {anchor, routerOutlet, overlay, injector} = config;

    const positionStrategy = overlay.position()
      .flexibleConnectedTo(anchor)
      .withFlexibleDimensions(false)
      .withPositions([OVERLAY_POSITION_SOUTH]);

    const overlayConfig = new OverlayConfig({
      panelClass: 'e2e-router-outlet-settings-overlay',
      hasBackdrop: true,
      positionStrategy: positionStrategy,
      scrollStrategy: overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
      width: 350,
      backdropClass: 'transparent-backdrop',
    });

    const overlayRef = overlay.create(overlayConfig);
    const injectionTokens = new WeakMap()
      .set(OverlayRef, overlayRef)
      .set(SciRouterOutletElement, routerOutlet);

    const portal = new ComponentPortal(RouterOutletSettingsComponent, null, new PortalInjector(injector, injectionTokens));
    overlayRef.attach(portal);
  }
}
