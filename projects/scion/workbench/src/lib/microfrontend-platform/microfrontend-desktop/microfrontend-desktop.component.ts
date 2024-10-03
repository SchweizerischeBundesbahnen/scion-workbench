/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Injector, OnDestroy, OnInit, runInInjectionContext, signal, viewChild} from '@angular/core';
import {Observable, switchMap} from 'rxjs';
import {ManifestService, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPerspectiveCapability, ɵDESKTOP_CONTEXT_KEY} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {serializeExecution} from '../../common/operators';
import {NgClass, NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent, ContentAsOverlayConfig} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {GlassPaneDirective} from '../../glass-pane/glass-pane.directive';
import {Microfrontends} from '../common/microfrontend.util';
import {ɵWorkbenchDesktop} from '../../desktop/ɵworkbench-desktop.model';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {IFRAME_OVERLAY_HOST} from '../../content-projection/workbench-element-references';

@Component({
  selector: 'wb-microfrontend-desktop',
  styleUrls: ['./microfrontend-desktop.component.scss'],
  templateUrl: './microfrontend-desktop.component.html',
  standalone: true,
  imports: [
    NgClass,
    ContentAsOverlayComponent,
    NgComponentOutlet,
    GlassPaneDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendDesktopComponent implements OnInit, OnDestroy {

  private _host = inject(ElementRef<HTMLElement>);
  private _outletRouter = inject(OutletRouter);
  private _manifestService = inject(ManifestService);
  private _manifestObjectCache = inject(ManifestObjectCache);
  private _logger = inject(Logger);
  private _workbenchLayoutService = inject(WorkbenchLayoutService);
  private _injector = inject(Injector);

  protected desktop = inject(ɵWorkbenchDesktop);
  protected capability: WorkbenchPerspectiveCapability | null = null;
  /** Splash to display until the microfrontend signals readiness. */
  protected splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  /** Indicates whether a workbench drag operation is in progress, such as when dragging a view or moving a sash. */
  protected isWorkbenchDrag = false;
  /** Configures iframe projection. */
  protected overlayConfig: ContentAsOverlayConfig = {
    location: inject(IFRAME_OVERLAY_HOST),
    visible: this.desktop.portal().attached,
  };
  /** Keystrokes which to bubble across iframe boundaries from embedded content. */
  protected keystrokesToBubble = signal([
    'keydown.escape', // allows closing notifications
  ]);
  private _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendDesktopComponent.`, LoggerNames.MICROFRONTEND_ROUTING);
    this.installWorkbenchDragDetector();
    this.installNavigator();
  }

  public ngOnInit(): void {
    this._routerOutletElement()!.nativeElement.setContextValue(ɵDESKTOP_CONTEXT_KEY, true);
    this.propagateWorkbenchTheme();
  }

  private installNavigator(): void {
    toObservable(this.desktop.navigationData)
      .pipe(
        switchMap(data => this.fetchCapability$(data['capabilityId'] as string)),
        serializeExecution(capability => this.onNavigate(capability)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private async onNavigate(capability: WorkbenchPerspectiveCapability | null): Promise<void> {
    if (!capability) {
      this._logger.warn(() => `[NullCapabilityError] No application found to provide a perspective capability for desktop. Maybe, the requested perspective is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND_ROUTING);
      this.unload();
      return;
    }

    if (!capability.properties.desktop) {
      this._logger.warn(() => `[NullDesktopError] No desktop provided on perspective capability.`, LoggerNames.MICROFRONTEND_ROUTING, capability);
    }
    this.capability = capability;

    // Navigate to the microfrontend.
    const application = this._manifestService.getApplication(capability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into workbench desktop, app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(capability.properties.desktop!.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, capability);
    await this._outletRouter.navigate(capability.properties.desktop!.path, {
      outlet: this.desktop.outlet(),
      relativeTo: application.baseUrl,
      pushStateToSessionHistoryStack: false,
      showSplash: capability.properties.desktop!.showSplash,
      ɵcapabilityId: capability.metadata!.id,
    });
  }

  private fetchCapability$(capabilityId: string): Observable<WorkbenchPerspectiveCapability | null> {
    return this._manifestObjectCache.observeCapability$(capabilityId);
  }

  public onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;
    if (focusWithin) {
      this._host.nativeElement.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Sets the {@link isWorkbenchDrag} property when a workbench drag operation is detected,
   * such as when dragging a view or moving a sash.
   */
  private installWorkbenchDragDetector(): void {
    this._workbenchLayoutService.dragging$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        this.isWorkbenchDrag = (event === 'start');
      });
  }

  private propagateWorkbenchTheme(): void {
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this._routerOutletElement()!.nativeElement));
  }

  private unload(): void {
    this._outletRouter.navigate(null, {outlet: this.desktop.outlet()}).then();
  }

  public ngOnDestroy(): void {
    this.unload();
  }
}
