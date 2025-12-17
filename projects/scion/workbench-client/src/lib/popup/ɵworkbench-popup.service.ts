/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, IS_PLATFORM_HOST, mapToBody, MessageClient, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {finalize, map} from 'rxjs/operators';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Defined, Maps, Observables} from '@scion/toolkit/util';
import {fromBoundingClientRect$} from '@scion/toolkit/observable';
import {concat, firstValueFrom, NEVER, Observable} from 'rxjs';
import {ɵWorkbenchPopupCommand} from './workbench-popup-command';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {WorkbenchPopupOptions} from './workbench-popup.options';
import {PopupOrigin} from './popup.origin';
import {computePopupId, DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';
import {WorkbenchPopupService} from './workbench-popup.service';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchPopupService implements WorkbenchPopupService {

  constructor(private _context?: ViewId | PartId | DialogId | PopupId | undefined) {
  }

  /** @inheritDoc */
  public async open<T>(qualifier: Qualifier, options: WorkbenchPopupOptions): Promise<T | undefined> {
    const command: ɵWorkbenchPopupCommand = {
      popupId: computePopupId(),
      align: options.align,
      closeStrategy: {
        onFocusLost: options.closeStrategy?.onFocusLost,
        onEscape: options.closeStrategy?.onEscape,
      },
      cssClass: options.cssClass,
      context: (() => {
        // TODO [Angular 22] Remove backward compatiblity.
        const context = options.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
        return Defined.orElse(context, this._context);
      })(),
    };
    const popupOriginReporter = this.observePopupOrigin$(options)
      .pipe(finalize(() => void Beans.get(MessageClient).publish<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(command.popupId), undefined, {retain: true})))
      .subscribe(origin => void Beans.get(MessageClient).publish<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(command.popupId), origin, {retain: true}));

    try {
      const params = Maps.coerce(options.params);
      const openPopup$ = Beans.get(IntentClient).request$<T>({type: WorkbenchCapabilities.Popup, qualifier, params}, command).pipe(mapToBody());
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
  private observePopupOrigin$(options: WorkbenchPopupOptions): Observable<PopupOrigin> {
    if (options.anchor instanceof Element) {
      return fromBoundingClientRect$(options.anchor as HTMLElement).pipe(map((domRect: DOMRect) => ({
        top: domRect.top,
        right: domRect.right,
        bottom: domRect.bottom,
        left: domRect.left,
        width: domRect.width,
        height: domRect.height,
        x: domRect.x,
        y: domRect.y,
        relativeTo: Beans.get(IS_PLATFORM_HOST) ? 'viewport' : 'context',
      })));
    }
    else {
      return concat(Observables.coerce(options.anchor), NEVER);
    }
  }
}
