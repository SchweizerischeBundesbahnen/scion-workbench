/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, HostBinding, inject, Injector, input, runInInjectionContext, untracked, viewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchDialogCapability, ɵDIALOG_CONTEXT, ɵDialogContext, ɵWorkbenchCommands, ɵWorkbenchDialogMessageHeaders} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog';
import {Microfrontends} from '../common/microfrontend.util';

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
})
export class MicrofrontendDialogComponent {

  public readonly capability = input.required<WorkbenchDialogCapability>();
  public readonly params = input.required<Map<string, unknown>>();

  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _messageClient = inject(MessageClient);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _injector = inject(Injector);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  protected readonly dialog = inject(ɵWorkbenchDialog);
  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;

  /**
   * Indicates if a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  @HostBinding('class.workbench-drag')
  protected isWorkbenchDrag = false;

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendDialogComponent.', LoggerNames.MICROFRONTEND);

    this.installDialogTitleListener();
    this.installDialogCloseListener();
    this.installWorkbenchDragDetector();
    this.setDialogProperties();
    this.propagateDialogContext();
    this.propagateWorkbenchTheme();
    this.navigate();

    inject(DestroyRef).onDestroy(() => void this._outletRouter.navigate(null, {outlet: this.dialog.id})); // Clear the outlet.
  }

  private navigate(): void {
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        const application = this._manifestService.getApplication(capability.metadata!.appSymbolicName);
        this._logger.debug(() => `Loading microfrontend into workbench dialog [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${capability.properties.path}].`, LoggerNames.MICROFRONTEND, params, capability);
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
   * Make the dialog context available to embedded content.
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

  private setDialogProperties(): void {
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        this.dialog.size.width = capability.properties.size!.width;
        this.dialog.size.height = capability.properties.size!.height;
        this.dialog.size.minWidth = capability.properties.size!.minWidth;
        this.dialog.size.maxWidth = capability.properties.size!.maxWidth;
        this.dialog.size.minHeight = capability.properties.size!.minHeight;
        this.dialog.size.maxHeight = capability.properties.size!.maxHeight;

        this.dialog.title = Microfrontends.substituteNamedParameters(capability.properties.title, params);
        this.dialog.closable = capability.properties.closable ?? true;
        this.dialog.resizable = capability.properties.resizable ?? true;
        this.dialog.padding = capability.properties.padding ?? false;
      });
    });
  }

  private propagateWorkbenchTheme(): void {
    effect(() => {
      const routerOutletElement = this._routerOutletElement().nativeElement;
      untracked(() => runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(routerOutletElement)));
    });
  }

  private installDialogCloseListener(): void {
    this._messageClient.observe$<unknown>(ɵWorkbenchCommands.dialogCloseTopic(this.dialog.id))
      .pipe(takeUntilDestroyed())
      .subscribe(closeRequest => {
        this.dialog.close(closeRequest.headers.get(ɵWorkbenchDialogMessageHeaders.CLOSE_WITH_ERROR) ? new Error(closeRequest.body as string) : closeRequest.body);
      });
  }

  private installDialogTitleListener(): void {
    this._messageClient.observe$<string>(ɵWorkbenchCommands.dialogTitleTopic(this.dialog.id))
      .pipe(takeUntilDestroyed())
      .subscribe(message => {
        this.dialog.title = message.body;
      });
  }

  /**
   * Sets the {@link isWorkbenchDrag} property when a workbench drag operation is detected,
   * such as when dragging a view or moving a sash.
   */
  private installWorkbenchDragDetector(): void {
    effect(() => this.isWorkbenchDrag = this._workbenchLayoutService.dragging());
  }
}
