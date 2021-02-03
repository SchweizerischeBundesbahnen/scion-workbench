/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { IntentClient, ManifestService, mapToBody, MessageClient, Qualifier, RequestError } from '@scion/microfrontend-platform';
import { Beans } from '@scion/toolkit/bean-manager';
import { catchError, map, take } from 'rxjs/operators';
import { WorkbenchCapabilities } from '../workbench-capabilities.enum';
import { Maps, Observables } from '@scion/toolkit/util';
import { fromBoundingClientRect$ } from '@scion/toolkit/observable';
import { Observable, throwError } from 'rxjs';
import { WorkbenchView } from '../view/workbench-view';
import { ɵWorkbenchPopupCommand } from './workbench-popup-open-command';
import { ɵWorkbenchCommands } from '../ɵworkbench-commands';
import { UUID } from '@scion/toolkit/uuid';
import { WorkbenchPopupCapability } from './workbench-popup-capability';
import { PopupOrigin, WorkbenchPopupConfig } from './workbench-popup.config';

/**
 * Allows displaying a microfrontend in a workbench popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
 * which can be either a page coordinate (x/y) or an HTML element. When using an element as the popup anchor, the popup also
 * moves when the anchor element moves.
 *
 * In a popup, you can display a microfrontend, which an application provides in the form of a popup capability. A qualifier is
 * used to identify the popup capability. Note that for displaying a microfrontend of any other application, you need to declare
 * an intention in your application manifest.
 *
 * Unlike views, popups are not part of the persistent workbench navigation, meaning that popups do not survive a page reload.
 *
 * @see WorkbenchPopupCapability
 * @category Popup
 */
export class WorkbenchPopupService {

  /**
   * Displays a microfrontend in a workbench popup based on the given qualifier.
   *
   * The qualifier identifies the microfrontend which to display in the workbench popup.
   *
   * To position the popup, provide either an exact page coordinate (x/y) or an element to serve as the popup anchor.
   * If you use an element as the popup anchor, the popup also moves when the anchor element moves. If you position the
   * popup using page coordinates, consider passing an Observable to re-position the popup after it is created. If
   * passing coordinates via an Observable, the popup will not display until the Observable emits the first coordinate.
   *
   * By setting the alignment of the popup, you can further control where the popup should open relative to its anchor.
   *
   * You can pass data to the popup microfrontend using parameters. The popup provider can declare mandatory and optional parameters.
   * No additional parameters may be included. Refer to the documentation of the popup capability provider for more information.
   *
   * By default, the popup will close on focus loss, or when the user hits the escape key.
   *
   * When opening the popup in the context of a workbench view, the popup adheres to that view's lifecycle. Consequently, the
   * popup is displayed only when the view is the active view in its viewpart, and is closed when the view is closed.
   *
   * @param  qualifier - Identifies the popup capability that provides the microfrontend for display as popup.
   * @param  config - Controls popup behavior.
   * @return Promise that resolves to the result when closed with a result, or to `undefined` otherwise.
   *         The Promise rejects if opening the popup failed, e.g., if missing the popup intention, or because no application
   *         provides the requested popup. The Promise also rejects when closing the popup with an error.
   */
  public async open<T>(qualifier: Qualifier, config: WorkbenchPopupConfig): Promise<T> {
    // To be able to integrate popups from apps without workbench integration, we do not delegate the opening of the popup to
    // the app that provides the requested popup, but interact with the workbench directly. Nevertheless, we issue an intent
    // so that the platform throws an error in case of unqualified interaction.
    await Beans.get(IntentClient).publish<WorkbenchPopupConfig>({type: WorkbenchCapabilities.Popup, qualifier, params: Maps.coerce(config.params)}, {...config, anchor: undefined});

    const popupCommand: ɵWorkbenchPopupCommand = {
      popupId: UUID.randomUUID(),
      capability: await this.lookupPopupCapabilityElseReject(qualifier),
      align: config.align,
      closeStrategy: config.closeStrategy,
      params: new Map([
        ...Maps.coerce(config.params),
        ...Maps.coerce(qualifier),
      ]),
      viewId: Beans.opt(WorkbenchView)?.viewId,
    };
    const popupOriginPublisher = this.observePopupOrigin$(config).subscribe(origin => {
      Beans.get(MessageClient).publish<ClientRect>(ɵWorkbenchCommands.popupOriginTopic(popupCommand.popupId), origin, {retain: true});
    });

    try {
      return await Beans.get(MessageClient).request$<T>(ɵWorkbenchCommands.popup, popupCommand)
        .pipe(
          mapToBody(),
          catchError(error => throwError(error instanceof RequestError ? error.message : error)),
        )
        .toPromise();
    }
    finally {
      popupOriginPublisher.unsubscribe();
      // Instruct the message broker to delete retained messages to free resources.
      Beans.get(MessageClient).publish(ɵWorkbenchCommands.popupOriginTopic(popupCommand.popupId), undefined, {retain: true}).then();
    }
  }

  /**
   * Looks up the requested popup capability.
   *
   * Returns a Promise that resolves to the requested capability, or that rejects if not found or if multiple providers match the qualifier.
   * Only capabilities for which the requester is qualified are returned.
   */
  private async lookupPopupCapabilityElseReject(qualifier: Qualifier): Promise<WorkbenchPopupCapability> {
    const capabilityIds = await Beans.get(ManifestService).lookupCapabilities$<WorkbenchPopupCapability>({type: WorkbenchCapabilities.Popup, qualifier})
      .pipe(take(1))
      .toPromise();

    if (capabilityIds.length === 0) {
      throw Error(`[NullProviderError] Qualifier matches no popup capability. Maybe, the requested popup capability is not public API or the providing application not available. [type=${WorkbenchCapabilities.Popup}, qualifier=${qualifier}]`);
    }
    if (capabilityIds.length > 1) {
      throw Error(`[MultiProviderError] The popup capability cannot be uniquely identified. Multiple providers match the popup qualifier. [type=${WorkbenchCapabilities.Popup}, qualifier=${JSON.stringify(qualifier)}]`);
    }
    return capabilityIds[0];
  }

  /**
   * Observes the position of the popup anchor.
   *
   * The Observable emits the anchor's initial position, and each time its position changes.
   */
  private observePopupOrigin$(config: WorkbenchPopupConfig): Observable<ClientRect> {
    if (config.anchor instanceof Element) {
      return fromBoundingClientRect$(config.anchor as HTMLElement);
    }
    else {
      return Observables.coerce(config.anchor)
        .pipe(map<PopupOrigin, ClientRect>(origin => ({
          top: origin.y,
          left: origin.x,
          bottom: origin.y + (origin.height || 0),
          right: origin.x + (origin.width || 0),
          width: origin.width || 0,
          height: origin.height || 0,
        })));
    }
  }
}
