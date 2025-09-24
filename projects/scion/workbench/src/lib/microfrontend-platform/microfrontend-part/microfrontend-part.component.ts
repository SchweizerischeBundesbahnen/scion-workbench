/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, Injector, signal, Signal, untracked, viewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchPartCapability, ɵWORKBENCH_PART_CONTEXT, ɵWorkbenchCommands, ɵWorkbenchPartContext} from '@scion/workbench-client';
import {Arrays, Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {IFRAME_OVERLAY_HOST} from '../../workbench-element-references';
import {serializeExecution} from '../../common/operators';
import {NgClass, NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent, ContentAsOverlayConfig} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {Microfrontends} from '../common/microfrontend.util';
import {rootEffect} from '../../common/rxjs-interop.util';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {filter} from 'rxjs/operators';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {Router} from '@angular/router';

/**
 * Embeds the microfrontend of a part capability.
 */
@Component({
  selector: 'wb-microfrontend-part',
  styleUrls: ['./microfrontend-part.component.scss'],
  templateUrl: './microfrontend-part.component.html',
  imports: [
    NgClass,
    ContentAsOverlayComponent,
    NgComponentOutlet,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendPartComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _manifestObjectCache = inject(ManifestObjectCache);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _router = inject(Router);
  private readonly _injector = inject(Injector);

  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');
  private readonly _universalKeystrokes = [
    ['escape'], // keystroke to close notifications
    ['ctrl', 'shift', 'F12'], // keystroke to minimize activities
  ];

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  /** Keystrokes which to bubble across iframe boundaries from embedded content. */
  protected readonly keystrokesToBubble: Signal<string[]>;
  /** Configures iframe projection. */
  protected readonly overlayConfig: ContentAsOverlayConfig = {
    location: inject(IFRAME_OVERLAY_HOST),
    visible: this.part.slot.portal.attached,
  };

  protected readonly navigationContext = this.computeNavigationContext();

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendPartComponent. [partId=${this.part.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.keystrokesToBubble = this.computeKeyStrokesToBubble();
    this.installPartActivePublisher();
    this.installPartFocusedPublisher();
    this.propagateWorkbenchTheme();
    this.propagatePartContext();
    this.installNavigator();

    inject(DestroyRef).onDestroy(() => this.unload());
  }

  private installNavigator(): void {
    toObservable(this.navigationContext)
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
    this._logger.debug(() => `Loading microfrontend into workbench part [partId=${this.part.id}, app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(capability.properties.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, params, capability);
    await this._outletRouter.navigate(capability.properties.path!, {
      outlet: this.part.id,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
      showSplash: capability.properties.showSplash,
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

  private computeNavigationContext(): Signal<NavigationContext | undefined> {
    const context = signal<NavigationContext | undefined>(undefined);

    rootEffect(onCleanup => {
      const {capabilityId, params} = this.part.navigation()!.data as unknown as MicrofrontendPartNavigationData;

      untracked(() => {
        const subscription = this._manifestObjectCache.observeCapability$<WorkbenchPartCapability>(capabilityId).subscribe(capability => {
          context.set({capabilityId, capability, params: Maps.coerce(params)});
        });
        onCleanup(() => subscription.unsubscribe());
      });
    });
    return context;
  }

  /**
   * Computes keystrokes to bubble through the iframe boundary.
   *
   * TODO [activity] consider moving to a utility
   */
  private computeKeyStrokesToBubble(): Signal<string[]> {
    return computed(() => {
      const accelerators = [
        ...this._universalKeystrokes,
      ];

      return accelerators
        .filter(accelerator => accelerator.length)
        .map(accelerator => accelerator.map(segment => {
          // Normalize keystrokes according to `SciRouterOutletElement#keystrokes`
          switch (segment) {
            case 'ctrl':
              return 'control';
            case '.':
              return 'dot';
            case ' ':
              return 'space';
            default:
              return segment;
          }
        }))
        .map(accelerator => `keydown.${accelerator.join('.')}{preventDefault=true}`);
    }, {equal: (a, b) => Arrays.isEqual(a, b, {exactOrder: false})});
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
 * Context available during a navigation.
 */
interface NavigationContext {
  capabilityId: string;
  capability: WorkbenchPartCapability | null;
  params: Map<string, unknown>;
}
