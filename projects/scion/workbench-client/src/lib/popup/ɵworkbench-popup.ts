/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPopupCapability} from './workbench-popup-capability';
import {Beans} from '@scion/toolkit/bean-manager';
import {ContextService, mapToBody, MessageClient, MicrofrontendPlatformClient, OUTLET_CONTEXT, OutletContext} from '@scion/microfrontend-platform';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {ɵPopupContext} from './workbench-popup-context';
import {WorkbenchPopupReferrer} from './workbench-popup-referrer';
import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {decorateObservable} from '../observable-decorator';
import {PopupId} from '../workbench.identifiers';
import {WorkbenchPopup} from './workbench-popup';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchPopup implements WorkbenchPopup {

  public readonly id: PopupId;
  public readonly params: Map<string, any>;
  public readonly capability: WorkbenchPopupCapability;
  public readonly referrer: WorkbenchPopupReferrer;
  public readonly focused$: Observable<boolean>;

  constructor(context: ɵPopupContext) {
    this.id = context.popupId;
    this.capability = context.capability;
    this.params = context.params;
    this.referrer = context.referrer;
    void this.requestFocus();
    this.focused$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.popupFocusedTopic(this.id))
      .pipe(
        mapToBody(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
      );
  }

  /**
   * @inheritDoc
   */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }

  /**
   * @inheritDoc
   */
  public setResult(result?: unknown): void {
    void Beans.get(MessageClient).publish(ɵWorkbenchCommands.popupResultTopic(this.id), result);
  }

  /**
   * @inheritDoc
   */
  public close(result?: unknown | Error): void {
    if (result instanceof Error) {
      const headers = new Map().set(ɵWorkbenchPopupMessageHeaders.CLOSE_WITH_ERROR, true);
      void Beans.get(MessageClient).publish(ɵWorkbenchCommands.popupCloseTopic(this.id), result.message, {headers});
    }
    else {
      void Beans.get(MessageClient).publish(ɵWorkbenchCommands.popupCloseTopic(this.id), result);
    }
  }

  /**
   * If the document is not yet focused, make it focusable and request the focus.
   *
   * In order to close the popup on focus loss, microfrontend content must gain the focus first.
   */
  private async requestFocus(): Promise<void> {
    // Request focus only if this microfrontend is the actual popup microfrontend,
    // i.e. not nested microfrontends in the popup.
    const contexts = await Beans.get(ContextService).lookup<OutletContext>(OUTLET_CONTEXT, {collect: true});
    if (contexts.length > 1) {
      return;
    }

    // Do nothing if an element of this microfrontend already has the focus.
    if (document.activeElement !== document.body) {
      return;
    }

    // Ensure the body element to be focusable.
    if (document.body.getAttribute('tabindex') === null) {
      document.body.style.outline = 'none';
      document.body.setAttribute('tabindex', '-1');
    }

    // Request the focus.
    document.body.focus();
  }
}

/**
 * Message headers to interact with the workbench popup.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export enum ɵWorkbenchPopupMessageHeaders {
  CLOSE_WITH_ERROR = 'ɵWORKBENCH-POPUP:CLOSE_WITH_ERROR',
}
