/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchDialogCapability} from './workbench-dialog-capability';
import {Observable} from 'rxjs';

/**
 * Handle to interact with a dialog opened via {@link WorkbenchDialogService}.
 *
 * The dialog microfrontend can inject this handle to interact with the dialog, such as setting the title,
 * reading parameters, or closing it.
 *
 * @category Dialog
 * @see WorkbenchDialogCapability
 * @see WorkbenchDialogService
 */
export abstract class WorkbenchDialog<R = unknown> {

  /**
   * Capability of the microfrontend loaded into this dialog.
   */
  public abstract readonly capability: WorkbenchDialogCapability;

  /**
   * Parameters as passed by the dialog opener.
   */
  public abstract readonly params: Map<string, unknown>;

  /**
   * Sets the title of the dialog.
   */
  public abstract setTitle(title: string | Observable<string>): void;

  /**
   * Signals readiness, notifying the workbench that this dialog has completed initialization.
   *
   * If `showSplash` is set to `true` on the dialog capability, the workbench displays a splash until the dialog microfrontend signals readiness.
   *
   * @see WorkbenchDialogCapability.properties.showSplash
   */
  public abstract signalReady(): void;

  /**
   * Closes the dialog. Optionally, pass a result or an error to the dialog opener.
   */
  public abstract close(result?: R | Error): void;
}
