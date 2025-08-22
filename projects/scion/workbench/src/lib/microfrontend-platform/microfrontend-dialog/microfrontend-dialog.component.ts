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
import {ManifestService, MessageClient, MessageHeaders, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {Translatable, WorkbenchDialogCapability, ɵDIALOG_CONTEXT, ɵDialogContext, ɵWorkbenchCommands, ɵWorkbenchDialogMessageHeaders} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog';
import {Microfrontends} from '../common/microfrontend.util';
import {createRemoteTranslatable} from '../text/remote-text-provider';

/**
 * Displays the microfrontend of a given {@link WorkbenchDialogCapability}.
 *
 * This component is designed to be displayed in a workbench dialog.
 */
@Component({
  selector: 'wb-microfrontend-dialog',
  styleUrls: ['./microfrontend-dialog.component.scss'],
  templateUrl: './microfrontend-dialog.component.html',
  imports: [
    NgComponentOutlet,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
  host: {
    '[class.workbench-drag]': 'workbenchLayoutService.dragging()',
  },
})
export class MicrofrontendDialogComponent {

  public readonly capability = input.required<WorkbenchDialogCapability>();
  public readonly params = input.required<Map<string, unknown>>();

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  protected readonly dialog = inject(ɵWorkbenchDialog);
  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendDialogComponent.', LoggerNames.MICROFRONTEND);

    this.installDialogTitleListener();
    this.installDialogCloseListener();
    this.setDialogProperties();
    this.propagateDialogContext();
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
        this._logger.debug(() => `Loading microfrontend into workbench dialog [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${capability.properties.path}].`, LoggerNames.MICROFRONTEND, params, capability);

        // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
        await Microfrontends.waitForContext(this._routerOutletElement, ɵDIALOG_CONTEXT, {injector});

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

  /**
   * Provides the dialog context to embedded content.
   */
  private propagateDialogContext(): void {
    effect(() => {
      const context: ɵDialogContext = {
        dialogId: this.dialog.id,
        capability: this.capability(),
        params: this.params(),
      };
      const routerOutletElement = this._routerOutletElement().nativeElement;

      untracked(() => routerOutletElement.setContextValue(ɵDIALOG_CONTEXT, context));
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

  private setDialogProperties(): void {
    effect(() => {
      const properties = this.capability().properties;
      const params = this.params();
      const appSymbolicName = this.capability().metadata!.appSymbolicName;

      untracked(() => {
        this.dialog.size.width = properties.size!.width;
        this.dialog.size.height = properties.size!.height;
        this.dialog.size.minWidth = properties.size!.minWidth;
        this.dialog.size.maxWidth = properties.size!.maxWidth;
        this.dialog.size.minHeight = properties.size!.minHeight;
        this.dialog.size.maxHeight = properties.size!.maxHeight;
        this.dialog.title = createRemoteTranslatable(properties.title, {appSymbolicName, valueParams: params, topicParams: properties.resolve});
        this.dialog.closable = properties.closable ?? true;
        this.dialog.resizable = properties.resizable ?? true;
        this.dialog.padding = properties.padding ?? false;
      });
    });
  }

  protected onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;
    if (focusWithin) {
      this._host.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }

  private installDialogCloseListener(): void {
    inject(MessageClient).observe$<unknown>(ɵWorkbenchCommands.dialogCloseTopic(this.dialog.id))
      .pipe(takeUntilDestroyed())
      .subscribe(closeRequest => {
        this.dialog.close(closeRequest.headers.get(ɵWorkbenchDialogMessageHeaders.CLOSE_WITH_ERROR) ? new Error(closeRequest.body as string) : closeRequest.body);
      });
  }

  private installDialogTitleListener(): void {
    inject(MessageClient).observe$<Translatable>(ɵWorkbenchCommands.dialogTitleTopic(this.dialog.id))
      .pipe(takeUntilDestroyed())
      .subscribe(message => {
        const sender = message.headers.get(MessageHeaders.AppSymbolicName) as string;
        this.dialog.title = createRemoteTranslatable(message.body, {appSymbolicName: sender});
      });
  }
}
