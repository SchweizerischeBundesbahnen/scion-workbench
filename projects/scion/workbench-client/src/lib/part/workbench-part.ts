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
 * A part is a visual element of the workbench layout. Parts can be docked to the side or
 * positioned relative to each other. A part can display content or stack views.
 *
 * The part microfrontend can inject this handle to interact with the part.
 *
 * @category Part
 * @see WorkbenchPartCapability
 */
export abstract class WorkbenchPart {

  /**
   * Identity of this part.
   */
  public abstract readonly id: PartId;

  /**
   * Signals readiness, notifying the workbench that this part has completed initialization.
   *
   * If `showSplash` is set to `true` on the part capability, the workbench displays a splash until the part microfrontend signals readiness.
   *
   * @see WorkbenchPartCapability.properties.showSplash
   */
  public abstract signalReady(): void;

  /**
   * Capability of the microfrontend loaded into the part.
   */
  public abstract readonly capability: WorkbenchPartCapability;

  /**
   * Parameters passed to the microfrontend loaded into the part.
   */
  public abstract readonly params: Map<string, unknown>;

  /**
   * Indicates whether this part is active.
   *
   * Upon subscription, emits the active state of this part, and then emits continuously when it changes.
   * The Observable never completes.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * Indicates whether this part has the focus.
   *
   * Upon subscription, emits the focused state of this part, and then emits continuously when it changes.
   * The Observable never completes.
   */
  public abstract readonly focused$: Observable<boolean>;
}
