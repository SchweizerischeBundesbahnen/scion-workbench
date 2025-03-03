/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, untracked, viewChild} from '@angular/core';
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
  host: {
    '[class.workbench-drag]': 'workbenchLayoutService.dragging()',
  },
})
export class MicrofrontendPopupComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _logger = inject(Logger);
  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');

  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  protected readonly popup = inject(ɵPopup) as ɵPopup<ɵPopupContext>;
  protected readonly popupCapability = this.popupContext.capability;
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);

  constructor() {
    this._logger.debug(() => 'Constructing MicrofrontendPopupComponent.', LoggerNames.MICROFRONTEND);

    this.installPopupResultListener();
    this.installPopupCloseListener();
    this.propagatePopupContext();
    this.propagateWorkbenchTheme();

    void this.navigate();

    inject(DestroyRef).onDestroy(() => void this._outletRouter.navigate(null, {outlet: this.popup.id})); // Clear the outlet.
  }

  private async navigate(): Promise<void> {
    const application = inject(ManifestService).getApplication(this.popupCapability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into workbench popup [app=${this.popupCapability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(this.popupCapability.properties.path)}].`, LoggerNames.MICROFRONTEND, this.popupContext.params, this.popupCapability);

    // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
    await Microfrontends.waitForContext(this._routerOutletElement, ɵPOPUP_CONTEXT);

    void this._outletRouter.navigate(this.popupCapability.properties.path, {
      outlet: this.popup.id,
      relativeTo: application.baseUrl,
      params: this.popupContext.params,
      pushStateToSessionHistoryStack: false,
      showSplash: this.popupCapability.properties.showSplash,
    });
  }

  /**
   * Provides the popup context to embedded content.
   */
  private propagatePopupContext(): void {
    effect(() => {
      const routerOutletElement = this._routerOutletElement();

      untracked(() => routerOutletElement.nativeElement.setContextValue(ɵPOPUP_CONTEXT, this.popupContext));
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
    if (this.popupContext.closeOnFocusLost && !focusWithin) {
      this.popup.close(this.popup.result);
    }

    if (focusWithin) {
      this._host.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }

  private get popupContext(): ɵPopupContext {
    return this.popup.input!;
  }
}
