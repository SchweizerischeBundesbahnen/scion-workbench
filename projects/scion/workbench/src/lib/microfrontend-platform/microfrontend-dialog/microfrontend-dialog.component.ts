/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, HostBinding, inject, Injector, Input, OnDestroy, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchDialogCapability, ɵDIALOG_CONTEXT, ɵDialogContext, ɵWorkbenchCommands, ɵWorkbenchDialogMessageHeaders} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {ComponentType} from '@angular/cdk/portal';
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
export class MicrofrontendDialogComponent implements OnInit, OnDestroy {

  @Input({required: true})
  public capability!: WorkbenchDialogCapability;

  @Input({required: true})
  public params!: Map<string, unknown>;

  /**
   * Indicates if a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  @HostBinding('class.workbench-drag')
  public isWorkbenchDrag = false;

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement!: ElementRef<SciRouterOutletElement>;

  /**
   * Splash to display until the microfrontend signals readiness.
   */
  protected splash: ComponentType<unknown>;

  constructor(protected dialog: ɵWorkbenchDialog,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _injector: Injector,
              private _logger: Logger) {
    this._logger.debug(() => 'Constructing MicrofrontendDialogComponent.', LoggerNames.MICROFRONTEND);
    this.splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
    this.installDialogTitleListener();
    this.installDialogCloseListener();
    this.installWorkbenchDragDetector();
  }

  public ngOnInit(): void {
    this.setDialogProperties();
    this.propagateDialogContext();
    this.propagateWorkbenchTheme();
    this.navigate();
  }

  private navigate(): void {
    const application = this._manifestService.getApplication(this.capability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into workbench dialog [app=${this.capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${this.capability.properties.path}].`, LoggerNames.MICROFRONTEND, this.params, this.capability);
    void this._outletRouter.navigate(this.capability.properties.path, {
      outlet: this.dialog.id,
      relativeTo: application.baseUrl,
      params: this.params,
      pushStateToSessionHistoryStack: false,
      showSplash: this.capability.properties.showSplash,
    });
  }

  /**
   * Make the dialog context available to embedded content.
   */
  private propagateDialogContext(): void {
    const context: ɵDialogContext = {
      dialogId: this.dialog.id,
      capability: this.capability,
      params: this.params,
    };
    this.routerOutletElement.nativeElement.setContextValue(ɵDIALOG_CONTEXT, context);
  }

  private setDialogProperties(): void {
    this.dialog.size.width = this.capability.properties.size!.width;
    this.dialog.size.height = this.capability.properties.size!.height;
    this.dialog.size.minWidth = this.capability.properties.size!.minWidth;
    this.dialog.size.maxWidth = this.capability.properties.size!.maxWidth;
    this.dialog.size.minHeight = this.capability.properties.size!.minHeight;
    this.dialog.size.maxHeight = this.capability.properties.size!.maxHeight;

    this.dialog.title = Microfrontends.substituteNamedParameters(this.capability.properties.title, this.params);
    this.dialog.closable = this.capability.properties.closable ?? true;
    this.dialog.resizable = this.capability.properties.resizable ?? true;
    this.dialog.padding = this.capability.properties.padding ?? false;
  }

  private propagateWorkbenchTheme(): void {
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this.routerOutletElement.nativeElement));
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

  public ngOnDestroy(): void {
    void this._outletRouter.navigate(null, {outlet: this.dialog.id}); // Clear the outlet.
  }
}
