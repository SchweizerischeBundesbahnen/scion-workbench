/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Application, ManifestService, MessageClient, OutletRouter, SciRouterOutletElement } from '@scion/microfrontend-platform';
import { Arrays } from '@scion/toolkit/util';
import { Logger, LoggerNames } from '../../logging';
import { ɵPOPUP_CONTEXT, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupMessageHeaders } from '@scion/workbench-client';
import { Popup } from '../../popup/popup.config';

/**
 * Component displayed in a workbench popup for embedding the microfrontend of a popup capability.
 */
@Component({
  selector: 'wb-microfrontend-popup',
  styleUrls: ['./microfrontend-popup.component.scss'],
  templateUrl: './microfrontend-popup.component.html',
})
export class MicrofrontendPopupComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _focusWithin$ = new Subject<boolean>();
  private _popupContext: ɵPopupContext;

  public microfrontendCssClasses: string[];

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement: ElementRef<SciRouterOutletElement>;

  constructor(private _popup: Popup<ɵPopupContext>,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _logger: Logger) {
    this._popupContext = this._popup.input;
    this._logger.debug(() => 'Constructing MicrofrontendPopupComponent.', LoggerNames.MICROFRONTEND);
  }

  public ngOnInit(): void {
    this.onInit().then();
  }

  private async onInit(): Promise<void> {
    const popupCapability = this._popupContext.capability;

    // Obtain the capability provider.
    const application = this.lookupApplication(popupCapability.metadata.appSymbolicName);
    if (!application) {
      this._popup.closeWithError(`[NullApplicationError] Unexpected. Cannot resolve application '${popupCapability.metadata.appSymbolicName}'.`);
      return;
    }

    // Obtain the microfrontend path.
    const microfrontendPath = popupCapability.properties?.path;
    if (microfrontendPath === undefined || microfrontendPath === null) { // empty path is a valid path
      this._popup.closeWithError(`[PopupProviderError] Popup has no path to the microfrontend defined.`);
      return;
    }

    // Listen to popup close requests.
    this._messageClient.observe$<any>(ɵWorkbenchCommands.popupCloseTopic(this.popupId))
      .pipe(takeUntil(this._destroy$))
      .subscribe(closeRequest => {
        if (closeRequest.headers.get(ɵWorkbenchPopupMessageHeaders.CLOSE_WITH_ERROR) === true) {
          this._popup.closeWithError(closeRequest.body);
        }
        else {
          this._popup.close(closeRequest.body);
        }
      });

    // Close the popup on focus loss.
    if (this._popupContext.closeOnFocusLost) {
      this._focusWithin$
        .pipe(
          filter(focusWithin => !focusWithin),
          takeUntil(this._destroy$),
        )
        .subscribe(() => {
          this._popup.close();
        });
    }

    // Make the popup context available to embedded content.
    this.routerOutletElement.nativeElement.setContextValue(ɵPOPUP_CONTEXT, this._popupContext);
    this.microfrontendCssClasses = ['e2e-popup', `e2e-${popupCapability.metadata.appSymbolicName}`, ...Arrays.coerce(popupCapability.properties.cssClass)];

    // Navigate to the microfrontend.
    this._logger.debug(() => `Loading microfrontend into workbench popup [app=${popupCapability.metadata.appSymbolicName}, baseUrl=${application.baseUrl}, path=${microfrontendPath}].`, LoggerNames.MICROFRONTEND, this._popupContext.params, popupCapability);
    await this._outletRouter.navigate(microfrontendPath, {
      outlet: this.popupId,
      relativeTo: application.baseUrl,
      params: this._popupContext.params,
      pushStateToSessionHistoryStack: false,
    });
  }

  public onFocusWithin(event: Event): void {
    this._focusWithin$.next((event as CustomEvent<boolean>).detail);
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

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
