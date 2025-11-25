/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {signal, Signal, untracked} from '@angular/core';
import {Translatable} from '../text/workbench-text-provider.model';
import {DialogId} from '../workbench.identifiers';

/**
 * Handle to interact with a dialog opened via {@link WorkbenchDialogService}.
 *
 * The dialog component can inject this handle to interact with the dialog, such as setting the title or closing the dialog.
 *
 * Dialog inputs are available as input properties in the dialog component.
 */
export abstract class WorkbenchDialog {

  /**
   * Unique identity of this dialog.
   */
  public abstract readonly id: DialogId;

  /**
   * Sets the title of the dialog.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract get title(): Signal<Translatable | undefined>;
  public abstract set title(title: Translatable | undefined);

  /**
   * Specifies the preferred dialog size.
   */
  public abstract readonly size: WorkbenchDialogSize;

  /**
   * Controls if to apply a padding to the content of the dialog. Defaults to `true`.
   *
   * This setting does not affect the padding of the dialog header and footer.
   *
   * The default padding can be changed via the CSS variable `--sci-workbench-dialog-padding`.
   */
  public abstract get padding(): Signal<boolean>;
  public abstract set padding(padding: boolean);

  /**
   * Specifies if to display a close button in the dialog header. Defaults to `true`.
   */
  public abstract get closable(): Signal<boolean>;
  public abstract set closable(closable: boolean);

  /**
   * Specifies if the user can resize the dialog. Defaults to `true`.
   */
  public abstract get resizable(): Signal<boolean>;
  public abstract set resizable(resizable: boolean);

  /**
   * Specifies CSS class(es) to add to the dialog, e.g., to locate the dialog in tests.
   */
  public abstract get cssClass(): Signal<string[]>;
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Indicates whether this dialog has the focus.
   */
  public abstract readonly focused: Signal<boolean>;

  /**
   * Closes the dialog. Optionally, pass a result or an error to the dialog opener.
   */
  public abstract close<R>(result?: R | Error): void;
}

/**
 * Represents the preferred dialog size.
 */
export interface WorkbenchDialogSize {

  /**
   * Specifies the minimum height of the dialog.
   */
  get minHeight(): Signal<string | undefined>;

  set minHeight(minHeight: string | undefined);

  /**
   * Specifies the height of the dialog, displaying a vertical scrollbar if its content overflows.
   * If not specified, the dialog adapts its height to its context height, respecting any `minHeight' or `maxHeight' constraint.
   */
  get height(): Signal<string | undefined>;

  set height(height: string | undefined);

  /**
   * Specifies the maximum height of the dialog.
   */
  get maxHeight(): Signal<string | undefined>;

  set maxHeight(maxHeight: string | undefined);

  /**
   * Specifies the minimum width of the dialog.
   */
  get minWidth(): Signal<string | undefined>;

  set minWidth(minWidth: string | undefined);

  /**
   * Specifies the width of the dialog, displaying a horizontal scrollbar if its content overflows.
   * If not specified, the dialog adapts its width to its context width, respecting any `minWidth' or `maxWidth' constraint.
   */
  get width(): Signal<string | undefined>;

  set width(width: string | undefined);

  /**
   * Specifies the maximum width of the dialog.
   */
  get maxWidth(): Signal<string | undefined>;

  set maxWidth(maxWidth: string | undefined);
}

/** @inheritDoc */
export class ɵWorkbenchDialogSize implements WorkbenchDialogSize {

  private readonly _minHeight = signal<string | undefined>(undefined);
  private readonly _height = signal<string | undefined>(undefined);
  private readonly _maxHeight = signal<string | undefined>(undefined);
  private readonly _minWidth = signal<string | undefined>(undefined);
  private readonly _width = signal<string | undefined>(undefined);
  private readonly _maxWidth = signal<string | undefined>(undefined);

  /** @inheritDoc */
  public get minHeight(): Signal<string | undefined> {
    return this._minHeight;
  }

  /** @inheritDoc */
  public set minHeight(minHeight: string | undefined) {
    untracked(() => this._minHeight.set(minHeight));
  }

  /** @inheritDoc */
  public get height(): Signal<string | undefined> {
    return this._height;
  }

  /** @inheritDoc */
  public set height(height: string | undefined) {
    untracked(() => this._height.set(height));
  }

  /** @inheritDoc */
  public get maxHeight(): Signal<string | undefined> {
    return this._maxHeight;
  }

  /** @inheritDoc */
  public set maxHeight(maxHeight: string | undefined) {
    untracked(() => this._maxHeight.set(maxHeight));
  }

  /** @inheritDoc */
  public get minWidth(): Signal<string | undefined> {
    return this._minWidth;
  }

  /** @inheritDoc */
  public set minWidth(minWidth: string | undefined) {
    untracked(() => this._minWidth.set(minWidth));
  }

  /** @inheritDoc */
  public get width(): Signal<string | undefined> {
    return this._width;
  }

  /** @inheritDoc */
  public set width(width: string | undefined) {
    untracked(() => this._width.set(width));
  }

  /** @inheritDoc */
  public get maxWidth(): Signal<string | undefined> {
    return this._maxWidth;
  }

  /** @inheritDoc */
  public set maxWidth(maxWidth: string | undefined) {
    untracked(() => this._maxWidth.set(maxWidth));
  }
}
