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
import {DialogId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

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
   * Represents the identity of this dialog.
   */
  public abstract readonly id: DialogId;

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
   *
   * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract setTitle(title: Translatable): void;

  /**
   * Sets the title of the dialog.
   *
   * @deprecated since version 1.0.0-beta.31. To migrate, pass a translatable and provide the text using a text provider registered in `WorkbenchClient.registerTextProvider`.
   */
  public abstract setTitle(title: Observable<Translatable>): void; // eslint-disable-line @typescript-eslint/unified-signatures

  /**
   * Indicates whether this dialog has the focus.
   */
  public abstract readonly focused$: Observable<boolean>;

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
