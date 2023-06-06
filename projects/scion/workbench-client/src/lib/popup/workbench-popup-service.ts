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
import {finalize, map} from 'rxjs/operators';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Defined, Maps, Observables} from '@scion/toolkit/util';
import {fromBoundingClientRect$} from '@scion/toolkit/observable';
import {concat, firstValueFrom, NEVER, Observable, OperatorFunction} from 'rxjs';
import {WorkbenchView} from '../view/workbench-view';
import {ɵWorkbenchPopupCommand} from './workbench-popup-open-command';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchPopupConfig} from './workbench-popup.config';
import {PopupOrigin} from './popup.origin';

/**
 * Allows displaying a microfrontend in a workbench popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
 * which can be either a coordinate or an HTML element. The popup moves when the anchor moves.
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
   * To position the popup, provide either a coordinate or an element to serve as the popup anchor.
   *
   * If you use an element as the popup anchor, the popup also moves when the anchor element moves. If you use a coordinate
   * and open the popup in the context of a view, the popup opens relative to the bounds of that view. Otherwise, it
   * is positioned relative to the page viewport. If you move or resize the view or the page, the popup will also be moved
   * depending on the pair of coordinates used.
   *
   * By setting the alignment of the popup, you can control the region where to open the popup relative to its anchor.
   *
   * You can pass data to the popup microfrontend using parameters. The popup provider can declare mandatory and optional parameters.
   * No additional parameters may be included. Refer to the documentation of the popup capability provider for more information.
   *
   * By default, the popup will close on focus loss, or when the user hits the escape key.
   *
   * If opening the popup in the context of a view, the popup is bound to the lifecycle of the view, that is, the popup
   * is displayed only if the view is active and is closed when the view is closed.
   *
   * @param  qualifier - Identifies the popup capability that provides the microfrontend for display as popup.
   * @param  config - Controls popup behavior.
   * @return Promise that resolves to the result when closed with a result, or to `undefined` otherwise.
   *         The Promise rejects if opening the popup failed, e.g., if missing the popup intention, or because no application
   *         provides the requested popup. The Promise also rejects when closing the popup with an error.
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
      .pipe(finalize(() => Beans.get(MessageClient).publish<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(popupCommand.popupId), undefined, {retain: true})))
      .subscribe(origin => Beans.get(MessageClient).publish<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(popupCommand.popupId), origin, {retain: true}));

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
      return fromBoundingClientRect$(config.anchor as HTMLElement).pipe(pluckPopupOrigin());
    }
    else {
      return concat(Observables.coerce(config.anchor), NEVER).pipe(pluckPopupOrigin());
    }
  }
}

/**
 * Extracts properties from {@link PopupOrigin}, allowing to pass, for example, a {@link MouseEvent}.
 */
function pluckPopupOrigin(): OperatorFunction<any, PopupOrigin> {
  return map(rect => ({x: rect.x, y: rect.y, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height}));
}
