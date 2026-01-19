/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMessageBoxCapability} from '../message-box/workbench-message-box-capability';
import {DialogId} from '../workbench.identifiers';
import {Observable} from 'rxjs';

/**
 * Handle to interact with a message box opened via {@link WorkbenchMessageBoxService}.
 *
 * The message box microfrontend can inject this handle to interact with the message box,
 * such as reading parameters or signaling readiness.
 *
 * @category MessageBox
 * @see WorkbenchMessageBoxCapability
 * @see WorkbenchMessageBoxService
 */
export abstract class WorkbenchMessageBox {

  /**
   * Identity of this message box.
   */
  public abstract readonly id: DialogId;

  /**
   * Capability of the microfrontend loaded into this message box.
   */
  public abstract readonly capability: WorkbenchMessageBoxCapability;

  /**
   * Parameters as passed by the message box opener.
   */
  public abstract readonly params: Map<string, unknown>;

  /**
   * Provides information about where the message box was opened.
   */
  public abstract readonly referrer: {

    /**
     * Symbolic name of the application that opened the messagebox.
     */
    readonly appSymbolicName: string;
  };

  /**
   * Indicates whether this message box has the focus.
   */
  public abstract readonly focused$: Observable<boolean>;

  /**
   * Signals readiness, notifying the workbench that this message box has completed initialization.
   *
   * If `showSplash` is set to `true` on the `messagebox` capability, the workbench displays a splash until the message box microfrontend signals readiness.
   *
   * @see WorkbenchMessageBoxCapability.properties.showSplash
   */
  public abstract signalReady(): void;
}
