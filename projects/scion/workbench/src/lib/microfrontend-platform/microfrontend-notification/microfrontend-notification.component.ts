/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, Injector, input, signal, untracked, viewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchNotificationCapability, ɵNOTIFICATION_CONTEXT, ɵNotificationContext, ɵWorkbenchCommands, ɵWorkbenchDialogMessageHeaders} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {Microfrontends} from '../common/microfrontend.util';
import {ɵWorkbenchNotification} from '../../notification/ɵworkbench-notification.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Displays the microfrontend of a given {@link WorkbenchNotficationCapability}.
 *
 * This component is designed to be displayed in a workbench notification.
 */
@Component({
  selector: 'wb-microfrontend-notification',
  styleUrls: ['./microfrontend-notification.component.scss'],
  templateUrl: './microfrontend-notification.component.html',
  imports: [
    NgComponentOutlet,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
  host: {
    '[class.workbench-drag]': 'workbenchLayoutService.dragging()',
  },
})
export class MicrofrontendNotificationComponent {

  public readonly capability = input.required<WorkbenchNotificationCapability>();
  public readonly params = input.required<Map<string, unknown>>();
  public readonly referrer = input.required<string>();

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
  protected readonly notification = inject(ɵWorkbenchNotification);
  protected readonly focusWithin = signal(false);

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendNotificationComponent.', LoggerNames.MICROFRONTEND);
    this.setNotificationProperties();
    this.propagateNotificationContext();
    this.propagateWorkbenchTheme();
    this.installNavigator();
    this.installNotificationCloseListener();

    inject(DestroyRef).onDestroy(() => {
      // Clear the outlet.
      void this._outletRouter.navigate(null, {outlet: this.notification.id});
    });
  }

  private installNavigator(): void {
    const manifestService = inject(ManifestService);
    const injector = inject(Injector);

    effect(() => {
      const capability = this.capability();
      const params = this.params();

      void untracked(async () => {
        const application = manifestService.getApplication(capability.metadata!.appSymbolicName);
        this._logger.debug(() => `Loading microfrontend into workbench notification [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${capability.properties.path}].`, LoggerNames.MICROFRONTEND, params, capability);

        // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
        await Microfrontends.waitForContext(this._routerOutletElement, ɵNOTIFICATION_CONTEXT, {injector});

        void this._outletRouter.navigate(capability.properties.path ?? '', {
          outlet: this.notification.id,
          relativeTo: application.baseUrl,
          params: params,
          pushStateToSessionHistoryStack: false,
          showSplash: capability.properties.showSplash,
        });
      });
    });
  }

  private installNotificationCloseListener(): void {
    inject(MessageClient).observe$<unknown>(ɵWorkbenchCommands.notificationCloseTopic(this.notification.id))
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.notification.close();
      });
  }

  protected onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;
    this.focusWithin.set(focusWithin);

    if (focusWithin) {
      this._host.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Provides the notification context to embedded content.
   */
  private propagateNotificationContext(): void {
    effect(() => {
      const context: ɵNotificationContext = {
        notificationId: this.notification.id,
        capability: this.capability(),
        params: this.params(),
        referrer: {
          appSymbolicName: this.referrer(),
        },
      };
      const routerOutletElement = this._routerOutletElement().nativeElement;

      untracked(() => routerOutletElement.setContextValue(ɵNOTIFICATION_CONTEXT, context));
    });
  }

  private setNotificationProperties(): void {
    effect(() => {
      const properties = this.capability().properties;

      untracked(() => {
      });
    });
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }
}
