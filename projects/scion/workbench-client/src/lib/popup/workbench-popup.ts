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
import {WorkbenchPopupReferrer} from './workbench-popup-referrer';
import {Observable} from 'rxjs';
import {PopupId} from '../workbench.identifiers';

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
export abstract class WorkbenchPopup<R = unknown> {

  /**
   * Represents the identity of this popup.
   */
  public abstract readonly id: PopupId;

  /**
   * Capability that represents the microfrontend loaded into this workbench popup.
   */
  public abstract readonly capability: WorkbenchPopupCapability;

  /**
   * Indicates whether this popup has the focus.
   */
  public abstract readonly focused$: Observable<boolean>;

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
   *
   * @deprecated since version 1.0.0-beta.34. Marked for removal. No replacement. Instead, add a parameter to the popup capability for the popup opener to pass required referrer information.
   */
  public abstract readonly referrer: WorkbenchPopupReferrer;

  /**
   * Parameters including qualifier entries as passed for navigation by the popup opener.
   */
  public abstract readonly params: Map<string, any>;

  /**
   * Sets a result that will be passed to the popup opener when the popup is closed on focus loss {@link CloseStrategy#onFocusLost}.
   */
  public abstract setResult(result?: R): void;

  /**
   * Closes the popup. Optionally, pass a result or an error to the popup opener.
   */
  public abstract close(result?: R | Error): void;
}
