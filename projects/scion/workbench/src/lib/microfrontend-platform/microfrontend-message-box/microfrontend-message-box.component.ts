/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {WorkbenchMessageBoxCapability, ɵMESSAGE_BOX_CONTEXT, ɵMessageBoxContext, ɵWorkbenchCommands} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {setStyle} from '../../common/dom.util';
import {Microfrontends} from '../common/microfrontend.util';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog.model';

/**
 * Displays the microfrontend of a given {@link WorkbenchMessageBoxCapability}.
 *
 * This component is designed to be displayed in a workbench message box.
 */
@Component({
  selector: 'wb-microfrontend-message-box',
  styleUrls: ['./microfrontend-message-box.component.scss'],
  templateUrl: './microfrontend-message-box.component.html',
  imports: [
    NgComponentOutlet,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
  host: {
    '[class.workbench-drag]': 'workbenchLayoutService.dragging()',
  },
})
export class MicrofrontendMessageBoxComponent {

  public readonly capability = input.required<WorkbenchMessageBoxCapability>();
  public readonly params = input.required<Map<string, unknown>>();
  public readonly referrer = input.required<string>();

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
  protected readonly dialog = inject(ɵWorkbenchDialog);

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendMessageBoxComponent.', LoggerNames.MICROFRONTEND);
    this.setMessageBoxProperties();
    this.propagateMessageBoxContext();
    this.propagateWorkbenchTheme();
    this.installDialogFocusedPublisher();
    this.installNavigator();

    inject(DestroyRef).onDestroy(() => {
      // Clear the outlet.
      void this._outletRouter.navigate(null, {outlet: this.dialog.id});
      // Delete retained messages to free resources.
      void this._messageClient.publish(ɵWorkbenchCommands.dialogFocusedTopic(this.dialog.id), undefined, {retain: true});
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
        this._logger.debug(() => `Loading microfrontend into workbench message box [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${capability.properties.path}].`, LoggerNames.MICROFRONTEND, params, capability);

        // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
        await Microfrontends.waitForContext(this._routerOutletElement, ɵMESSAGE_BOX_CONTEXT, {injector});

        void this._outletRouter.navigate(capability.properties.path, {
          outlet: this.dialog.id,
          relativeTo: application.baseUrl,
          params: params,
          pushStateToSessionHistoryStack: false,
          showSplash: capability.properties.showSplash,
        });
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
   * Provides the message box context to embedded content.
   */
  private propagateMessageBoxContext(): void {
    effect(() => {
      const context: ɵMessageBoxContext = {
        dialogId: this.dialog.id,
        capability: this.capability(),
        params: this.params(),
        referrer: {
          appSymbolicName: this.referrer(),
        },
      };
      const routerOutletElement = this._routerOutletElement().nativeElement;

      untracked(() => routerOutletElement.setContextValue(ɵMESSAGE_BOX_CONTEXT, context));
    });
  }

  private installDialogFocusedPublisher(): void {
    effect(() => {
      const focused = this.dialog.focused();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.dialogFocusedTopic(this.dialog.id);
        void this._messageClient.publish(commandTopic, focused, {retain: true});
      });
    });
  }

  private setMessageBoxProperties(): void {
    effect(() => {
      const routerOutletElement = this._routerOutletElement();
      const properties = this.capability().properties;

      untracked(() => {
        setStyle(routerOutletElement, {
          'width': properties.size?.width ?? '0', // allow content size to go below the default iframe size when reporting preferred size
          'min-width': properties.size?.minWidth ?? null,
          'max-width': properties.size?.maxWidth ?? null,
          'height': properties.size?.height ?? '0', // allow content size to go below the default iframe size when reporting preferred size
          'min-height': properties.size?.minHeight ?? null,
          'max-height': properties.size?.maxHeight ?? null,
        });
      });
    });
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }
}
