/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';

/**
 * Handle to interact with a dialog opened via {@link WorkbenchDialogService}.
 *
 * The dialog component can inject this handle to interact with the dialog, such as setting the title or closing the dialog.
 *
 * Dialog inputs are available as input properties in the dialog component.
 */
export abstract class WorkbenchDialog<R = unknown> {

  /**
   * Sets the title of the dialog; can be a string literal or an Observable.
   */
  public abstract title: string | Observable<string | undefined> | undefined;

  /**
   * Specifies the preferred dialog size.
   */
  public abstract readonly size: WorkbenchDialogSize;

  /**
   * Controls if to apply a padding to the content of the dialog. Default is `true`.
   *
   * This setting does not affect the padding of the dialog header and footer.
   *
   * The default padding can be changed via the CSS variable `--sci-workbench-dialog-padding`.
   */
  public abstract padding: boolean;

  /**
   * Specifies if to display a close button in the dialog header. Default is `true`.
   */
  public abstract closable: boolean;

  /**
   * Specifies if the user can resize the dialog. Default is `true`.
   */
  public abstract resizable: boolean;

  /**
   * Specifies CSS class(es) to be added to the dialog, useful in end-to-end tests for locating the dialog.
   */
  public abstract cssClass: string | string[];

  /**
   * Closes the dialog. Optionally, pass a result or an error to the dialog opener.
   */
  public abstract close(result?: R | Error): void;
}

/**
 * Represents the preferred dialog size.
 */
export interface WorkbenchDialogSize {
  /**
   * Specifies the minimum height of the dialog.
   */
  minHeight?: string;
  /**
   * Specifies the height of the dialog, displaying a vertical scrollbar if its content overflows.
   * If not specified, the dialog adapts its height to its context height, respecting any `minHeight' or `maxHeight' constraint.
   */
  height?: string;
  /**
   * Specifies the maximum height of the dialog.
   */
  maxHeight?: string;
  /**
   * Specifies the minimum width of the dialog.
   */
  minWidth?: string;
  /**
   * Specifies the width of the dialog, displaying a horizontal scrollbar if its content overflows.
   * If not specified, the dialog adapts its width to its context width, respecting any `minWidth' or `maxWidth' constraint.
   */
  width?: string;
  /**
   * Specifies the maximum width of the dialog.
   */
  maxWidth?: string;
}
