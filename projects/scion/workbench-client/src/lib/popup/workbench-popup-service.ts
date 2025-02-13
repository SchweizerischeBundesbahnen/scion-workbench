/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, mapToBody, MessageClient, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {finalize} from 'rxjs/operators';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Defined, Maps, Observables} from '@scion/toolkit/util';
import {fromBoundingClientRect$} from '@scion/toolkit/observable';
import {concat, firstValueFrom, NEVER, Observable} from 'rxjs';
import {WorkbenchView} from '../view/workbench-view';
import {ɵWorkbenchPopupCommand} from './workbench-popup-open-command';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchPopupConfig} from './workbench-popup.config';
import {PopupOrigin} from './popup.origin';

/**
 * Displays a microfrontend in a popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor and
 * moves when the anchor moves. Unlike a dialog, the popup closes on focus loss.
 *
 * A microfrontend provided as a `popup` capability can be opened in a popup. The qualifier differentiates between different
 * popup capabilities. An application can open the public popup capabilities of other applications if it manifests a respective
 * intention.
 *
 * @category Popup
 * @see WorkbenchPopupCapability
 */
export class WorkbenchPopupService {

  /**
   * Displays a microfrontend in a workbench popup based on the given qualifier.
   *
   * The qualifier identifies the microfrontend to display in the popup.
   *
   * The anchor is used to position the popup based on its preferred alignment:
   * - Using an element: The popup opens and sticks to the element.
   * - Using coordinates: The popup opens and sticks relative to the view or page bounds.
   *
   * If the popup is opened within a view, it only displays if the view is active and closes when the view is closed.
   *
   * By default, the popup closes on focus loss or when pressing the escape key.
   *
   * Pass data to the popup using parameters. Only declared parameters are allowed. Refer to the capability documentation for details.
   *
   * @param  qualifier - Identifies the popup capability that provides the microfrontend for display as popup.
   * @param  config - Controls popup behavior.
   * @returns Promise that resolves to the popup result, if any, or that rejects if the popup was closed with an error or couldn't be opened,
   *          e.g., because of missing the intention or because no `popup` capability matching the qualifier and visible to the application
   *          was found.
   */
  public async open<T>(qualifier: Qualifier, config: WorkbenchPopupConfig): Promise<T | undefined> {
    const popupCommand: ɵWorkbenchPopupCommand = {
      popupId: UUID.randomUUID(),
      align: config.align,
      closeStrategy: config.closeStrategy,
      cssClass: config.cssClass,
      context: {
        viewId: Defined.orElse(config.context?.viewId, () => Beans.opt(WorkbenchView)?.id),
      },
    };
    const popupOriginReporter = this.observePopupOrigin$(config)
      .pipe(finalize(() => void Beans.get(MessageClient).publish<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(popupCommand.popupId), undefined, {retain: true})))
      .subscribe(origin => void Beans.get(MessageClient).publish<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(popupCommand.popupId), origin, {retain: true}));

    try {
      const params = Maps.coerce(config.params);
      const openPopup$ = Beans.get(IntentClient).request$<T>({type: WorkbenchCapabilities.Popup, qualifier, params}, popupCommand).pipe(mapToBody());
      return await firstValueFrom(openPopup$, {defaultValue: undefined});
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
    finally {
      popupOriginReporter.unsubscribe();
    }
  }

  /**
   * Observes the position of the popup anchor.
   *
   * The Observable emits the anchor's initial position, and each time its position changes.
   * The Observable never completes.
   */
  private observePopupOrigin$(config: WorkbenchPopupConfig): Observable<PopupOrigin> {
    if (config.anchor instanceof Element) {
      return fromBoundingClientRect$(config.anchor as HTMLElement);
    }
    else {
      return concat(Observables.coerce(config.anchor), NEVER);
    }
  }
}
