/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {PartId} from '../workbench.identifiers';
import {WorkbenchPartCapability} from './workbench-part-capability';

/**
 * A view is a visual workbench element for displaying content stacked or side-by-side in the workbench layout.
 *
 * Users can drag views from one part to another, even across windows, or place them side-by-side, horizontally and vertically.
 *
 * The view microfrontend can inject this handle to interact with the view.
 *
 * @category View
 * @see WorkbenchViewCapability
 * @see WorkbenchRouter
 */
export abstract class WorkbenchPart {

  /**
   * Represents the identity of this view.
   */
  public abstract readonly id: PartId;

  /**
   * Signals readiness, notifying the workbench that this view has completed initialization.
   *
   * If `showSplash` is set to `true` on the view capability, the workbench displays a splash until the view microfrontend signals readiness.
   *
   * @see WorkbenchPartCapability.properties.showSplash
   */
  public abstract signalReady(): void;

  /**
   * Represents the capability of the microfrontend loaded into the part.
   */
  public abstract readonly capability: WorkbenchPartCapability;

  /**
   * Parameters of the microfrontend loaded into the part.
   */
  public abstract readonly params: Map<string, unknown>;

  /**
   * Indicates whether this part is active.
   *
   * Upon subscription, emits the active state of this part, and then emits continuously when it changes.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * Indicates whether this part has the focus.
   *
   * Upon subscription, emits the focused state of this part, and then emits continuously when it changes.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
   */
  public abstract readonly focused$: Observable<boolean>;
}
