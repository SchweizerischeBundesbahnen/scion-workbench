/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, HostBinding, inject, Injector, OnDestroy, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {Application, ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchPopupCapability, ɵPOPUP_CONTEXT, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupMessageHeaders} from '@scion/workbench-client';
import {Popup} from '../../popup/popup.config';
import {NgClass, NgComponentOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {ComponentType} from '@angular/cdk/portal';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Displays the microfrontend of a given {@link WorkbenchPopupCapability}.
 *
 * This component is designed to be displayed in a workbench popup.
 */
@Component({
  selector: 'wb-microfrontend-popup',
  styleUrls: ['./microfrontend-popup.component.scss'],
  templateUrl: './microfrontend-popup.component.html',
  standalone: true,
  imports: [NgClass, NgComponentOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendPopupComponent implements OnInit, OnDestroy {

  private _popupContext: ɵPopupContext;

  public popupCapability: WorkbenchPopupCapability;

  /**
   * Indicates whether a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  @HostBinding('class.workbench-drag')
  public isWorkbenchDrag = false;

  /**
   * Splash to display until the microfrontend signals readiness.
   */
  protected splash: ComponentType<unknown>;

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement!: ElementRef<SciRouterOutletElement>;

  constructor(public popup: Popup<ɵPopupContext>,
              private _host: ElementRef<HTMLElement>,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _destroyRef: DestroyRef,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _injector: Injector,
              private _logger: Logger) {
    this._popupContext = this.popup.input!;
    this.popupCapability = this._popupContext.capability;
    this.installWorkbenchDragDetector();
    this._logger.debug(() => 'Constructing MicrofrontendPopupComponent.', LoggerNames.MICROFRONTEND);
    this.splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  }

  public ngOnInit(): void {
    // Obtain the capability provider.
    const application = this.lookupApplication(this.popupCapability.metadata!.appSymbolicName);
    if (!application) {
      this.popup.closeWithError(`[NullApplicationError] Unexpected. Cannot resolve application '${this.popupCapability.metadata!.appSymbolicName}'.`);
      return;
    }

    // Listen to popup close requests.
    this._messageClient.observe$<any>(ɵWorkbenchCommands.popupCloseTopic(this.popupId))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(closeRequest => {
        if (closeRequest.headers.get(ɵWorkbenchPopupMessageHeaders.CLOSE_WITH_ERROR) === true) {
          this.popup.closeWithError(closeRequest.body);
        }
        else {
          this.popup.close(closeRequest.body);
        }
      });

    // Make the popup context available to embedded content.
    this.routerOutletElement.nativeElement.setContextValue(ɵPOPUP_CONTEXT, this._popupContext);

    // Propagate workbench and color theme to the microfrontend.
    this.propagateWorkbenchTheme();

    // Navigate to the microfrontend.
    this._logger.debug(() => `Loading microfrontend into workbench popup [app=${this.popupCapability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(this.popupCapability.properties.path)}].`, LoggerNames.MICROFRONTEND, this._popupContext.params, this.popupCapability);
    this._outletRouter.navigate(this.popupCapability.properties.path, {
      outlet: this.popupId,
      relativeTo: application.baseUrl,
      params: this._popupContext.params,
      pushStateToSessionHistoryStack: false,
      showSplash: this.popupCapability.properties.showSplash,
    }).then();
  }

  public onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;

    // Close the popup on focus loss.
    if (this._popupContext.closeOnFocusLost && !focusWithin) {
      this.popup.close();
    }

    if (focusWithin) {
      this._host.nativeElement.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Looks up the application registered under the given symbolic name. Returns `undefined` if not found.
   */
  private lookupApplication(symbolicName: string): Application | undefined {
    return this._manifestService.applications.find(app => app.symbolicName === symbolicName);
  }

  /**
   * Unique identity of this popup.
   */
  public get popupId(): string {
    return this._popupContext.popupId;
  }

  /**
   * Sets the {@link isWorkbenchDrag} property when a workbench drag operation is detected,
   * such as when dragging a view or moving a sash.
   */
  private installWorkbenchDragDetector(): void {
    this._workbenchLayoutService.dragging$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        this.isWorkbenchDrag = (event === 'start');
      });
  }

  private propagateWorkbenchTheme(): void {
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this.routerOutletElement.nativeElement));
  }

  public ngOnDestroy(): void {
    this._outletRouter.navigate(null, {outlet: this.popupId}).then();
  }
}
