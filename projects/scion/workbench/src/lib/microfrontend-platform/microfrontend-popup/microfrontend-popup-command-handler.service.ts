/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, NgZone, StaticProvider } from '@angular/core';
import { mapToBody, MessageClient, MicroApplicationConfig } from '@scion/microfrontend-platform';
import { WorkbenchPopup, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupCommand } from '@scion/workbench-client';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Logger, LoggerNames } from '../../logging';
import { MicrofrontendPopupComponent } from './microfrontend-popup.component';
import { WorkbenchViewRegistry } from '../../view/workbench-view.registry';
import { fromDimension$ } from '@scion/toolkit/observable';
import { Popup, PopupOrigin } from '../../popup/popup.config';
import { observeInside, subscribeInside } from '@scion/toolkit/operators';
import { PopupService } from '../../popup/popup.service';
import { ROUTER_OUTLET_NAME } from '../../workbench.constants';
import { Router } from '@angular/router';
import { WbRouterOutletComponent } from '../../routing/wb-router-outlet.component';
import { RouterUtils } from '../../routing/router.util';
import { Commands } from '../../routing/workbench-router.service';

/**
 * Handles microfrontend popup commands, instructing the Workbench {@link PopupService} to navigate to the microfrontend of a given popup capability.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendPopupCommandHandler {

  constructor(private _messageClient: MessageClient,
              private _popupService: PopupService,
              private _logger: Logger,
              private _viewRegistry: WorkbenchViewRegistry,
              private _router: Router,
              private _zone: NgZone,
              {symbolicName: hostAppSymbolicName}: MicroApplicationConfig) {
    this._messageClient.onMessage<ɵWorkbenchPopupCommand>(ɵWorkbenchCommands.popup, async message => {
      const command = message.body!;
      this._logger.debug(() => 'Handling microfrontend popup command', LoggerNames.MICROFRONTEND, command);

      if (command.capability.metadata!.appSymbolicName === hostAppSymbolicName) {
        return this.openHostComponentPopup(command);
      }
      else {
        return this.openMicrofrontendPopup(command);
      }
    });
  }

  /**
   * Opens a popup for displaying a microfrontend provided by an application other than the host app.
   */
  private async openMicrofrontendPopup(command: ɵWorkbenchPopupCommand): Promise<any> {
    const popupContext: ɵPopupContext = {
      popupId: command.popupId,
      capability: command.capability,
      params: coerceMap(command.params),
      closeOnFocusLost: command.closeStrategy?.onFocusLost ?? true,
    };
    return this._popupService.open({
      component: MicrofrontendPopupComponent,
      input: popupContext,
      anchor: this.observePopupAnchor$(command),
      context: command.context,
      align: command.align,
      size: command.capability.properties?.size,
      closeStrategy: {
        ...command.closeStrategy,
        onFocusLost: false, // Closing the popup on focus loss is handled in {MicrofrontendPopupComponent}
      },
      cssClass: command.capability.properties?.cssClass,
    });
  }

  /**
   * Opens a popup for displaying a routed component of the host app. Unlike popups opened via {@link openMicrofrontendPopup},
   * this popup uses a `<router-outlet>` and not a `<sci-router-outlet>`, thus does not integrate the microfrontend via an iframe.
   */
  private async openHostComponentPopup(command: ɵWorkbenchPopupCommand): Promise<any> {
    const popupOutletName = `popup.${command.popupId}`;
    const path = command.capability.properties?.path;
    if (!path) {
      throw Error(`[PopupProviderError] Popup capability has no path to the microfrontend defined: ${JSON.stringify(command.capability)}`);
    }

    // Perform navigation in the named router outlet.
    const navigateSuccess = await this.navigate(path, {outletName: popupOutletName, params: command.params});
    if (!navigateSuccess) {
      throw Error('[PopupNavigateError] Navigation canceled, most likely by a route guard.');
    }

    return this._popupService.open({
      component: WbRouterOutletComponent,
      componentConstructOptions: {
        providers: [
          {provide: ROUTER_OUTLET_NAME, useValue: popupOutletName},
          provideWorkbenchPopup(command),
        ],
      },
      anchor: this.observePopupAnchor$(command),
      context: command.context,
      align: command.align,
      size: command.capability.properties?.size,
      closeStrategy: command.closeStrategy,
      cssClass: command.capability.properties?.cssClass,
    }).finally(() => this.navigate(null, {outletName: popupOutletName})); // Remove the outlet from the URL
  }

  /**
   * Constructs an Observable that, upon subscription, emits the position of the popup anchor, and then each time it is repositioned.
   */
  private observePopupAnchor$(command: ɵWorkbenchPopupCommand): Observable<PopupOrigin> {
    const contextualViewId = command.context?.viewId;
    return combineLatest([
      contextualViewId ? this.observeViewBoundingBox$(contextualViewId) : of(undefined),
      this.observeMicrofrontendPopupOrigin$(command.popupId),
    ])
      .pipe(
        filter(([viewBoundingBox, popupOrigin]) => {
          // Swallow emissions until both sources report a non-empty dimension. For example, when deactivating
          // the popup's contextual view, the view reports an empty bounding box, causing the popup to flicker
          // when activating it again.
          return (!viewBoundingBox || !isNullClientRect(viewBoundingBox)) && !isNullClientRect(popupOrigin);
        }),
        map(([viewBoundingBox, popupOrigin]: [ClientRect | undefined, ClientRect]) => {
          return {
            x: (viewBoundingBox?.left ?? 0) + popupOrigin.left,
            y: (viewBoundingBox?.top ?? 0) + popupOrigin.top,
            width: popupOrigin.width,
            height: popupOrigin.height,
          };
        }),
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        observeInside(continueFn => this._zone.run(continueFn)),
      );
  }

  /**
   * Observes the bounding box of the view in which the popup is opened.
   */
  private observeViewBoundingBox$(viewId: string): Observable<ClientRect> {
    const view = this._viewRegistry.getElseThrow(viewId);
    return fromDimension$(view.portal.componentRef.location.nativeElement)
      .pipe(map(dimension => dimension.element.getBoundingClientRect()));
  }

  /**
   * Observes the bounding box of the popup anchor in which the popup is opened.
   */
  private observeMicrofrontendPopupOrigin$(popupId: string): Observable<ClientRect> {
    return this._messageClient.observe$<ClientRect>(ɵWorkbenchCommands.popupOriginTopic(popupId))
      .pipe(mapToBody());
  }

  /**
   * Performs navigation in the specified outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras: { outletName: string; params?: Map<string, any> }): Promise<boolean> {
    // Replace placeholders with the values of the qualifier and params, if any.
    path = RouterUtils.substituteNamedParameters(path, extras.params);

    const outletCommands: Commands | null = (path !== null ? RouterUtils.segmentsToCommands(RouterUtils.parsePath(this._router, path)) : null);
    const commands: Commands = [{outlets: {[extras.outletName]: outletCommands}}];
    return this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'merge'});
  }
}

/**
 * Coerces the given Map-like object to a `Map`.
 *
 * Data sent from one JavaScript realm to another is serialized with the structured clone algorithm.
 * Altought the algorithm supports the `Map` data type, a deserialized map object cannot be checked to be instance of `Map`.
 * This is most likely because the serialization takes place in a different realm.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @see http://man.hubwiz.com/docset/JavaScript.docset/Contents/Resources/Documents/developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm.html
 *
 * @ignore
 */
function coerceMap<K, V>(mapLike: Map<K, V>): Map<K, V> {
  return new Map(mapLike);
}

function isNullClientRect(clientRect: ClientRect): boolean {
  return clientRect.top === 0 && clientRect.right === 0 && clientRect.bottom === 0 && clientRect.left === 0;
}

/**
 * Provides the {@link WorkbenchPopup} handle for interacting with the popup in a routed component of the host app.
 */
function provideWorkbenchPopup(command: ɵWorkbenchPopupCommand): StaticProvider {
  return {
    provide: WorkbenchPopup,
    deps: [Popup],
    useFactory: (popup: Popup): WorkbenchPopup => {
      return new class implements WorkbenchPopup {
        public readonly capability = command.capability;
        public readonly params = coerceMap(command.params);

        public close<R = any>(result?: R | undefined): void {
          popup.close(result);
        }

        public closeWithError(error: Error | string): void {
          popup.closeWithError(error);
        }
      };
    },
  };
}
