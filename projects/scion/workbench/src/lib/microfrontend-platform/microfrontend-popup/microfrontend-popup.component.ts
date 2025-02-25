/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, HostBinding, inject, Injector, OnInit, runInInjectionContext, ViewChild} from '@angular/core';
import {ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {Logger, LoggerNames} from '../../logging';
import {ɵPOPUP_CONTEXT, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupMessageHeaders} from '@scion/workbench-client';
import {ɵPopup} from '../../popup/popup.config';
import {NgClass, NgComponentOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
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
  imports: [NgClass, NgComponentOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendPopupComponent implements OnInit {

  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _messageClient = inject(MessageClient);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _injector = inject(Injector);
  private readonly _logger = inject(Logger);
  private readonly _popup = inject(ɵPopup) as ɵPopup<ɵPopupContext>;
  private readonly _popupContext = this._popup.input!;

  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly popupCapability = this._popupContext.capability;
  protected readonly outletName = this._popup.id;
  protected readonly cssClasses = this._popup.cssClasses;

  /**
   * Indicates whether a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  @HostBinding('class.workbench-drag')
  protected isWorkbenchDrag = false;

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement!: ElementRef<SciRouterOutletElement>;

  constructor() {
    this.installWorkbenchDragDetector();
    this._logger.debug(() => 'Constructing MicrofrontendPopupComponent.', LoggerNames.MICROFRONTEND);
    inject(DestroyRef).onDestroy(() => void this._outletRouter.navigate(null, {outlet: this.outletName}));
  }

  public ngOnInit(): void {
    // Listen to popup close requests.
    this._messageClient.observe$<unknown>(ɵWorkbenchCommands.popupCloseTopic(this._popup.id))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(closeRequest => {
        this._popup.close(closeRequest.headers.get(ɵWorkbenchPopupMessageHeaders.CLOSE_WITH_ERROR) ? new Error(closeRequest.body as string) : closeRequest.body);
      });

    // Listen to popup result requests.
    this._messageClient.observe$<unknown>(ɵWorkbenchCommands.popupResultTopic(this._popup.id))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(result => this._popup.setResult(result.body));

    // Make the popup context available to embedded content.
    this.routerOutletElement.nativeElement.setContextValue(ɵPOPUP_CONTEXT, this._popupContext);

    // Propagate workbench and color theme to the microfrontend.
    this.propagateWorkbenchTheme();

    // Navigate to the microfrontend.
    const application = this._manifestService.getApplication(this.popupCapability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into workbench popup [app=${this.popupCapability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(this.popupCapability.properties.path)}].`, LoggerNames.MICROFRONTEND, this._popupContext.params, this.popupCapability);
    void this._outletRouter.navigate(this.popupCapability.properties.path, {
      outlet: this.outletName,
      relativeTo: application.baseUrl,
      params: this._popupContext.params,
      pushStateToSessionHistoryStack: false,
      showSplash: this.popupCapability.properties.showSplash,
    });
  }

  protected onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;

    // Close the popup on focus loss.
    if (this._popupContext.closeOnFocusLost && !focusWithin) {
      this._popup.close(this._popup.result);
    }

    if (focusWithin) {
      this._host.nativeElement.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Sets the {@link isWorkbenchDrag} property when a workbench drag operation is detected,
   * such as when dragging a view or moving a sash.
   */
  private installWorkbenchDragDetector(): void {
    effect(() => this.isWorkbenchDrag = this._workbenchLayoutService.dragging());
  }

  private propagateWorkbenchTheme(): void {
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this.routerOutletElement.nativeElement));
  }
}
