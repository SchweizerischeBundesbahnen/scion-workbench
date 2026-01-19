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
 * A popup is a visual workbench element for displaying content above other content. The popup is positioned relative
 * to an anchor based on its preferred alignment. The anchor can be an element or a coordinate.
 *
 * The microfrontend can inject this handle to interact with the popup.
 *
 * #### Popup Size
 * Configure the popup with a fixed size in {@link WorkbenchPopupCapability.properties.size}, or report its intrinsic content
 * size using {@link @scion/microfrontend-platform!PreferredSizeService}.
 *
 * @example - Reporting the size of a microfrontend
 * ```ts
 * Beans.get(PreferredSizeService).fromDimension(<Microfrontend HTMLElement>);
 * ```
 *
 * If the content can grow and shrink, e.g., if using expandable panels, position the microfrontend `absolute` to allow infinite
 * space for rendering at its preferred size.
 *
 * Since loading a microfrontend may take time, prefer setting the popup size in the popup capability to avoid flickering when
 * opening the popup.
 *
 * @category Popup
 */
export abstract class WorkbenchPopup {

  /**
   * Identity of this popup.
   */
  public abstract readonly id: PopupId;

  /**
   * Capability of the microfrontend loaded into this popup.
   */
  public abstract readonly capability: WorkbenchPopupCapability;

  /**
   * Parameters passed to the microfrontend loaded into the popup.
   */
  public abstract readonly params: Map<string, unknown>;

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
   * Sets a result that will be passed to the popup opener when the popup is closed on focus loss {@link CloseStrategy#onFocusLost}.
   */
  public abstract setResult<R>(result?: R): void;

  /**
   * Closes the popup. Optionally, pass a result or an error to the popup opener.
   */
  public abstract close<R>(result?: R | Error): void;
}
