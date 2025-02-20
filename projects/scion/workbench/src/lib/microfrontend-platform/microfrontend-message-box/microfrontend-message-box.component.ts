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
import {ManifestService, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchMessageBoxCapability, ɵMESSAGE_BOX_CONTEXT, ɵMessageBoxContext} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {ComponentType} from '@angular/cdk/portal';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {UUID} from '@scion/toolkit/uuid';
import {setStyle} from '../../common/dom.util';
import {Microfrontends} from '../common/microfrontend.util';

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
})
export class MicrofrontendMessageBoxComponent implements OnInit, OnDestroy {

  protected readonly outletName = UUID.randomUUID();

  @Input({required: true})
  public capability!: WorkbenchMessageBoxCapability;

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

  constructor(private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _injector: Injector,
              private _logger: Logger) {
    this._logger.debug(() => 'Constructing MicrofrontendMessageBoxComponent.', LoggerNames.MICROFRONTEND);
    this.splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
    this.installWorkbenchDragDetector();
  }

  public ngOnInit(): void {
    this.setSizeProperties();
    this.propagateMessageBoxContext();
    this.propagateWorkbenchTheme();
    this.navigate();
  }

  private navigate(): void {
    const application = this._manifestService.getApplication(this.capability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into workbench message box [app=${this.capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${this.capability.properties.path}].`, LoggerNames.MICROFRONTEND, this.params, this.capability);
    void this._outletRouter.navigate(this.capability.properties.path, {
      outlet: this.outletName,
      relativeTo: application.baseUrl,
      params: this.params,
      pushStateToSessionHistoryStack: false,
      showSplash: this.capability.properties.showSplash,
    });
  }

  /**
   * Make the message box context available to embedded content.
   */
  private propagateMessageBoxContext(): void {
    const context: ɵMessageBoxContext = {
      capability: this.capability,
      params: this.params,
    };
    this.routerOutletElement.nativeElement.setContextValue(ɵMESSAGE_BOX_CONTEXT, context);
  }

  private setSizeProperties(): void {
    setStyle(this.routerOutletElement, {
      'width': this.capability.properties.size?.width ?? '0', // allow content size to go bellow the default iframe size when reporting preferred size
      'min-width': this.capability.properties.size?.minWidth ?? null,
      'max-width': this.capability.properties.size?.maxWidth ?? null,
      'height': this.capability.properties.size?.height ?? '0', // allow content size to go bellow the default iframe size when reporting preferred size
      'min-height': this.capability.properties.size?.minHeight ?? null,
      'max-height': this.capability.properties.size?.maxHeight ?? null,
    });
  }

  private propagateWorkbenchTheme(): void {
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this.routerOutletElement.nativeElement));
  }

  /**
   * Sets the {@link isWorkbenchDrag} property when a workbench drag operation is detected,
   * such as when dragging a view or moving a sash.
   */
  private installWorkbenchDragDetector(): void {
    effect(() => this.isWorkbenchDrag = this._workbenchLayoutService.dragging());
  }

  public ngOnDestroy(): void {
    void this._outletRouter.navigate(null, {outlet: this.outletName}); // Clear the outlet.
  }
}
