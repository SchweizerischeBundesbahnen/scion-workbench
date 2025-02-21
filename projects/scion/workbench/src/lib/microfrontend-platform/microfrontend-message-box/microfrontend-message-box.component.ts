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
import {ManifestService, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchMessageBoxCapability, ɵMESSAGE_BOX_CONTEXT, ɵMessageBoxContext} from '@scion/workbench-client';
import {NgComponentOutlet} from '@angular/common';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
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
export class MicrofrontendMessageBoxComponent {

  public readonly capability = input.required<WorkbenchMessageBoxCapability>();
  public readonly params = input.required<Map<string, unknown>>();

  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _injector = inject(Injector);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly outletName = UUID.randomUUID();

  /**
   * Indicates if a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  @HostBinding('class.workbench-drag')
  protected isWorkbenchDrag = false;

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendMessageBoxComponent.', LoggerNames.MICROFRONTEND);
    this.installWorkbenchDragDetector();
    this.setSizeProperties();
    this.propagateMessageBoxContext();
    this.propagateWorkbenchTheme();
    this.navigate();

    inject(DestroyRef).onDestroy(() => void this._outletRouter.navigate(null, {outlet: this.outletName})); // Clear the outlet.
  }

  private navigate(): void {
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        const application = this._manifestService.getApplication(capability.metadata!.appSymbolicName);
        this._logger.debug(() => `Loading microfrontend into workbench message box [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${capability.properties.path}].`, LoggerNames.MICROFRONTEND, params, capability);
        void this._outletRouter.navigate(capability.properties.path, {
          outlet: this.outletName,
          relativeTo: application.baseUrl,
          params: params,
          pushStateToSessionHistoryStack: false,
          showSplash: capability.properties.showSplash,
        });
      });
    });
  }

  /**
   * Make the message box context available to embedded content.
   */
  private propagateMessageBoxContext(): void {
    effect(() => {
      const context: ɵMessageBoxContext = {
        capability: this.capability(),
        params: this.params(),
      };
      const routerOutletElement = this._routerOutletElement().nativeElement;

      untracked(() => routerOutletElement.setContextValue(ɵMESSAGE_BOX_CONTEXT, context));
    });
  }

  private setSizeProperties(): void {
    effect(() => {
      const routerOutletElement = this._routerOutletElement();
      const capability = this.capability();

      untracked(() => {
        setStyle(routerOutletElement, {
          'width': capability.properties.size?.width ?? '0', // allow content size to go bellow the default iframe size when reporting preferred size
          'min-width': capability.properties.size?.minWidth ?? null,
          'max-width': capability.properties.size?.maxWidth ?? null,
          'height': capability.properties.size?.height ?? '0', // allow content size to go bellow the default iframe size when reporting preferred size
          'min-height': capability.properties.size?.minHeight ?? null,
          'max-height': capability.properties.size?.maxHeight ?? null,
        });
      });
    });
  }

  private propagateWorkbenchTheme(): void {
    effect(() => {
      const routerOutletElement = this._routerOutletElement().nativeElement;
      untracked(() => runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(routerOutletElement)));
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
