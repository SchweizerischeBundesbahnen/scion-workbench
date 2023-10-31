/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPopupCapability} from './workbench-popup-capability';
import {Beans} from '@scion/toolkit/bean-manager';
import {ContextService, MessageClient, MicrofrontendPlatformClient, OUTLET_CONTEXT, OutletContext} from '@scion/microfrontend-platform';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {ɵPopupContext} from './workbench-popup-context';
import {WorkbenchPopupReferrer} from './workbench-popup-referrer';

/**
 * A popup is a visual workbench component for displaying content above other content.
 *
 * If a microfrontend lives in the context of a workbench popup, regardless of its embedding level, it can inject an instance
 * of this class to interact with the workbench popup, such as reading passed parameters or closing the popup.
 *
 * #### Preferred Size
 * You can report preferred popup size using {@link @scion/microfrontend-platform!PreferredSizeService}. Typically, you would
 * subscribe to size changes of the microfrontend's primary content and report it. As a convenience, {@link @scion/microfrontend-platform!PreferredSizeService}
 * provides API to pass an element for automatic dimension monitoring. If your content can grow and shrink, e.g., if using expandable
 * panels, consider positioning primary content out of the document flow, that is, setting its position to `absolute`. This way,
 * you give it infinite space so that it can always be rendered at its preferred size.
 *
 * ```typescript
 * Beans.get(PreferredSizeService).fromDimension(<HTMLElement>);
 * ```
 *
 * Note that the microfrontend may take some time to load, causing the popup to flicker when opened. Therefore, for fixed-sized
 * popups, consider declaring the popup size in the popup capability.
 *
 * @category Popup
 */
export abstract class WorkbenchPopup {

  /**
   * Capability that represents the microfrontend loaded into this workbench popup.
   */
  public abstract readonly capability: WorkbenchPopupCapability;

  /**
   * Signals readiness, notifying the workbench that this popup has completed initialization.
   *
   * If `showSplash` is set to `true` on the popup capability, the workbench displays a splash until the popup microfrontend signals readiness.
   *
   * @see WorkbenchPopupCapability.properties.showSplash
   */
  public abstract signalReady(): void;

  /**
   * Provides information about the context in which this popup was opened.
   */
  public abstract readonly referrer: WorkbenchPopupReferrer;

  /**
   * Parameters including qualifier entries as passed for navigation by the popup opener.
   */
  public abstract readonly params: Map<string, any>;

  /**
   * Closes the popup. Optionally, pass a result to the popup opener.
   */
  public abstract close<R = any>(result?: R | undefined): void;

  /**
   * Closes the popup returning the given error to the popup opener.
   */
  public abstract closeWithError(error: Error | string): void;
}

/**
 * @ignore
 */
export class ɵWorkbenchPopup implements WorkbenchPopup {

  public params: Map<string, any>;
  public capability: WorkbenchPopupCapability;
  public referrer: WorkbenchPopupReferrer;

  constructor(private _context: ɵPopupContext) {
    this.capability = this._context.capability;
    this.params = coerceMap(this._context.params);
    this.referrer = this._context.referrer;
    this.requestFocus();
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
  public close<R = any>(result?: R | undefined): void {
    Beans.get(MessageClient).publish(ɵWorkbenchCommands.popupCloseTopic(this._context.popupId), result);
  }

  /**
   * @inheritDoc
   */
  public closeWithError(error: Error | string): void {
    Beans.get(MessageClient).publish(ɵWorkbenchCommands.popupCloseTopic(this._context.popupId), readErrorMessage(error), {
      headers: new Map().set(ɵWorkbenchPopupMessageHeaders.CLOSE_WITH_ERROR, true),
    });
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
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export enum ɵWorkbenchPopupMessageHeaders {
  CLOSE_WITH_ERROR = 'ɵWORKBENCH-POPUP:CLOSE_WITH_ERROR',
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
 */
function coerceMap<K, V>(mapLike: Map<K, V>): Map<K, V> {
  return new Map(mapLike);
}

/**
 * Returns the error message if given an error object, or the `toString` representation otherwise.
 *
 * @internal
 */
function readErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.toString();
}
