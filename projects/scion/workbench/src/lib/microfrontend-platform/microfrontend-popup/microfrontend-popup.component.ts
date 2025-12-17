/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, Injector, input, untracked, viewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchPopupCapability, WorkbenchPopupReferrer, ɵPOPUP_CONTEXT, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupMessageHeaders} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {Microfrontends} from '../common/microfrontend.util';
import {ɵWorkbenchPopup} from '../../popup/ɵworkbench-popup.model';

/**
 * Displays the microfrontend of a given {@link WorkbenchPopupCapability}.
 *
 * This component is designed to be displayed in a workbench popup.
 */
@Component({
  selector: 'wb-microfrontend-popup',
  styleUrls: ['./microfrontend-popup.component.scss'],
  templateUrl: './microfrontend-popup.component.html',
  imports: [NgComponentOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
  host: {
    '[class.workbench-drag]': 'workbenchLayoutService.dragging()',
  },
})
export class MicrofrontendPopupComponent {

  public readonly capability = input.required<WorkbenchPopupCapability>();
  public readonly params = input.required<Map<string, unknown>>();
  public readonly closeOnFocusLost = input.required<boolean>();
  public readonly referrer = input.required<WorkbenchPopupReferrer>();

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly popup = inject(ɵWorkbenchPopup);
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendPopupComponent.', LoggerNames.MICROFRONTEND);

    this.installPopupResultListener();
    this.installPopupCloseListener();
    this.propagatePopupContext();
    this.propagateWorkbenchTheme();
    this.installPopupFocusedPublisher();
    this.setPopupSize();
    this.installNavigator();

    inject(DestroyRef).onDestroy(() => {
      // Clear the outlet.
      void this._outletRouter.navigate(null, {outlet: this.popup.id});
      // Delete retained messages to free resources.
      void this._messageClient.publish(ɵWorkbenchCommands.popupFocusedTopic(this.popup.id), undefined, {retain: true});
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
        this._logger.debug(() => `Loading microfrontend into workbench popup [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${capability.properties.path}].`, LoggerNames.MICROFRONTEND, params, capability);

        // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
        await Microfrontends.waitForContext(this._routerOutletElement, ɵPOPUP_CONTEXT, {injector});

        void this._outletRouter.navigate(capability.properties.path, {
          outlet: this.popup.id,
          relativeTo: application.baseUrl,
          params: params,
          pushStateToSessionHistoryStack: false,
          showSplash: capability.properties.showSplash,
        });
      });
    });
  }

  /**
   * Provides the popup context to embedded content.
   */
  private propagatePopupContext(): void {
    effect(() => {
      const context: ɵPopupContext = {
        popupId: this.popup.id,
        capability: this.capability(),
        params: this.params(),
        referrer: this.referrer(),
      };
      const routerOutletElement = this._routerOutletElement().nativeElement;

      untracked(() => routerOutletElement.setContextValue(ɵPOPUP_CONTEXT, context));
    });
  }

  private setPopupSize(): void {
    effect(() => {
      const size = this.capability().properties.size;
      untracked(() => {
        this.popup.size.width = size?.width;
        this.popup.size.height = size?.height;
        this.popup.size.minWidth = size?.minWidth;
        this.popup.size.maxWidth = size?.maxWidth;
        this.popup.size.minHeight = size?.minHeight;
        this.popup.size.maxHeight = size?.maxHeight;
      });
    });
  }

  private installPopupFocusedPublisher(): void {
    effect(() => {
      const focused = this.popup.focused();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.popupFocusedTopic(this.popup.id);
        void this._messageClient.publish(commandTopic, focused, {retain: true});
      });
    });
  }

  private installPopupResultListener(): void {
    inject(MessageClient).observe$<unknown>(ɵWorkbenchCommands.popupResultTopic(this.popup.id))
      .pipe(takeUntilDestroyed())
      .subscribe(result => this.popup.setResult(result.body));
  }

  private installPopupCloseListener(): void {
    inject(MessageClient).observe$<unknown>(ɵWorkbenchCommands.popupCloseTopic(this.popup.id))
      .pipe(takeUntilDestroyed())
      .subscribe(closeRequest => {
        this.popup.close(closeRequest.headers.get(ɵWorkbenchPopupMessageHeaders.CLOSE_WITH_ERROR) ? new Error(closeRequest.body as string) : closeRequest.body);
      });
  }

  protected onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;

    // Close the popup on focus loss.
    if (this.closeOnFocusLost() && !focusWithin) {
      this.popup.close(this.popup.result);
    }

    if (focusWithin) {
      this._host.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }
}
