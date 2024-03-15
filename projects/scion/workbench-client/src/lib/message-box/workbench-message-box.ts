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

/**
 * TODO
 *
 * @category MessageBox
 */
export abstract class WorkbenchMessageBox {

  /**
   * Capability that represents the microfrontend loaded into this workbench message-box.
   */
  public abstract readonly capability: WorkbenchMessageBoxCapability;
  /**
   * Parameters including qualifier entries as passed for navigation by the message-box opener.
   */
  public abstract readonly params: Map<string, unknown>;

  /**
   * Signals readiness, notifying the workbench that this message-box has completed initialization.
   *
   * If `showSplash` is set to `true` on the message-box capability, the workbench displays a splash until the message-box microfrontend signals readiness.
   *
   * @see WorkbenchMessageBoxCapability.properties.showSplash
   */
  public abstract signalReady(): void;
}
