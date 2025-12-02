/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, Injector, Provider, signal, Signal, untracked, viewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPartCapability, ɵWORKBENCH_PART_CONTEXT, ɵWorkbenchCommands, ɵWorkbenchPartContext} from '@scion/workbench-client';
import {Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {IFRAME_OVERLAY_HOST} from '../../workbench-element-references';
import {serializeExecution} from '../../common/operators';
import {NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent, ContentAsOverlayConfig} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {Microfrontends} from '../common/microfrontend.util';
import {rootEffect, toRootObservable} from '../../common/rxjs-interop.util';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {Router} from '@angular/router';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../../glass-pane/glass-pane.directive';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {filter} from 'rxjs/operators';

/**
 * Embeds the microfrontend of a part capability.
 */
@Component({
  selector: 'wb-microfrontend-part',
  styleUrls: ['./microfrontend-part.component.scss'],
  templateUrl: './microfrontend-part.component.html',
  imports: [
    ContentAsOverlayComponent,
    NgComponentOutlet,
    GlassPaneDirective,
  ],
  viewProviders: [
    configureMicrofrontendGlassPane(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendPartComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _router = inject(Router);
  private readonly _injector = inject(Injector);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  /** Configures iframe projection. */
  protected readonly overlayConfig: ContentAsOverlayConfig = {
    location: inject(IFRAME_OVERLAY_HOST),
    visible: this.part.slot.portal.attached,
  };

  protected readonly navigationContext = this.computeNavigationContext();

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendPartComponent. [partId=${this.part.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.installPartActivePublisher();
    this.installPartFocusedPublisher();
    this.propagateWorkbenchTheme();
    this.propagatePartContext();
    this.installNavigator();

    inject(DestroyRef).onDestroy(() => this.unload());
  }

  private installNavigator(): void {
    // Use a root effect to emit even if detached from change detection.
    toRootObservable(this.navigationContext)
      .pipe(
        filter(Boolean),
        serializeExecution(context => this.onNavigate(context)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private async onNavigate(context: NavigationContext): Promise<void> {
    if (!context.capability) {
      this._logger.warn(() => `[NullCapabilityError] No application found to provide a part capability of id '${context.capabilityId}'. Maybe, the requested part is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND_ROUTING);
      this.unload();
      // Perform navigation for Angular to evaluate `CanMatch` guards to display "Not Found" page.
      void this._router.navigate([{outlets: {}}], {skipLocationChange: true});
      return;
    }

    const {capability, params} = context;

    // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
    await Microfrontends.waitForContext(this._routerOutletElement, ɵWORKBENCH_PART_CONTEXT, {injector: this._injector});

    // Navigate to the microfrontend.
    const application = this._manifestService.getApplication(capability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into workbench part [partId=${this.part.id}, app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(capability.properties!.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, params, capability);
    await this._outletRouter.navigate(capability.properties!.path!, {
      outlet: this.part.id,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
      showSplash: context.prevCapability?.metadata!.id !== context.capabilityId ? capability.properties?.showSplash : false,
    });
  }

  private installPartActivePublisher(): void {
    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(() => {
      const active = this.part.active();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.partActiveTopic(this.part.id);
        void this._messageClient.publish(commandTopic, active, {retain: true});
      });
    });
  }

  private installPartFocusedPublisher(): void {
    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(() => {
      const focused = this.part.focused();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.partFocusedTopic(this.part.id);
        void this._messageClient.publish(commandTopic, focused, {retain: true});
      });
    });
  }

  protected onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;
    if (focusWithin) {
      this._host.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Provides the part context to embedded content.
   */
  private propagatePartContext(): void {
    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(() => {
      const routerOutletElement = this._routerOutletElement().nativeElement;
      const context = this.navigationContext();

      untracked(() => {
        if (context?.capability) {
          routerOutletElement.setContextValue<ɵWorkbenchPartContext>(ɵWORKBENCH_PART_CONTEXT, {
            partId: this.part.id,
            capability: context.capability,
            params: context.params,
          });
        }
        else {
          routerOutletElement.removeContextValue(ɵWORKBENCH_PART_CONTEXT);
        }
      });
    });
  }

  /**
   * Computes the current navigation of this microfrontend part.
   */
  private computeNavigationContext(): Signal<NavigationContext | undefined> {
    const context = signal<NavigationContext | undefined>(undefined);
    const manifestObjectCache = inject(ManifestObjectCache);

    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
    rootEffect(onCleanup => {
      const {capabilityId, params} = this.part.navigation()!.data as unknown as MicrofrontendPartNavigationData;

      untracked(() => {
        const subscription = manifestObjectCache.observeCapability$<WorkbenchPartCapability>(capabilityId).subscribe(capability => {
          context.update(prevContext => ({
            capabilityId,
            capability: capability ?? undefined,
            prevCapability: prevContext?.capability,
            params: Maps.coerce(params),
          }));
        });
        onCleanup(() => subscription.unsubscribe());
      });
    });
    return context;
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }

  private unload(): void {
    // Delete retained messages to free resources.
    void this._messageClient.publish(ɵWorkbenchCommands.partActiveTopic(this.part.id), undefined, {retain: true});
    void this._messageClient.publish(ɵWorkbenchCommands.partFocusedTopic(this.part.id), undefined, {retain: true});
    void this._outletRouter.navigate(null, {outlet: this.part.id});
  }
}

/**
 * Blocks the microfrontend outlet when dialog(s) overlay this part.
 */
function configureMicrofrontendGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useFactory: () => inject(ɵWorkbenchPart),
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: () => ({attributes: {'data-partid': inject(WorkbenchPart).id}}) satisfies GlassPaneOptions,
    },
  ];
}

/**
 * Context available during a navigation.
 */
interface NavigationContext {
  capabilityId: string;
  capability?: WorkbenchPartCapability;
  prevCapability?: WorkbenchPartCapability;
  params: Map<string, unknown>;
}
