/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Inject, Injector, OnDestroy, OnInit, runInInjectionContext, signal, viewChild} from '@angular/core';
import {Observable, switchMap} from 'rxjs';
import {ManifestService, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPerspectiveCapability, ɵDESKTOP_CONTEXT_KEY} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {IFRAME_HOST, ViewContainerReference} from '../../content-projection/view-container.reference';
import {serializeExecution} from '../../common/operators';
import {AsyncPipe, NgClass, NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {GlassPaneDirective} from '../../glass-pane/glass-pane.directive';
import {Microfrontends} from '../common/microfrontend.util';
import {ɵWorkbenchDesktop} from '../../desktop/ɵworkbench-desktop.model';
import {ComponentType} from '@angular/cdk/portal';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';

@Component({
  selector: 'wb-microfrontend-desktop',
  styleUrls: ['./microfrontend-desktop.component.scss'],
  templateUrl: './microfrontend-desktop.component.html',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    ContentAsOverlayComponent,
    NgComponentOutlet,
    GlassPaneDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendDesktopComponent implements OnInit, OnDestroy {

  protected capability: WorkbenchPerspectiveCapability | null = null;

  /**
   * Splash to display until the microfrontend signals readiness.
   */
  protected splash: ComponentType<unknown>;

  /**
   * Indicates whether a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  protected isWorkbenchDrag = false;

  /**
   * Keystrokes which to bubble across iframe boundaries of embedded content.
   */
  protected keystrokesToBubble = signal([
    'keydown.escape', // allows closing notifications
  ]);

  protected desktop = inject(ɵWorkbenchDesktop);

  public routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  constructor(private _host: ElementRef<HTMLElement>,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _manifestObjectCache: ManifestObjectCache,
              private _logger: Logger,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _injector: Injector,
              @Inject(IFRAME_HOST) protected iframeHostRef: ViewContainerReference) {
    this._logger.debug(() => `Constructing MicrofrontendDesktopComponent.`, LoggerNames.MICROFRONTEND_ROUTING);
    this.splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
    this.installWorkbenchDragDetector();
    this.installNavigator();
  }

  public ngOnInit(): void {
    this.routerOutletElement()!.nativeElement.setContextValue(ɵDESKTOP_CONTEXT_KEY, true);
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
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this.routerOutletElement()!.nativeElement));
  }

  private unload(): void {
    this._outletRouter.navigate(null, {outlet: this.desktop.outlet()}).then();
  }

  public ngOnDestroy(): void {
    this.unload();
  }
}
