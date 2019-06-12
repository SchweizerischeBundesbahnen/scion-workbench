/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ElementRef, Type } from '@angular/core';

export declare type Position = 'east' | 'west' | 'north' | 'south';

/**
 * Configures a popup given to {PopupService}.
 */
export interface PopupConfig {
  /**
   * Specifies the component to be displayed in the popup.
   *
   * - the component must be registered as entry-component in app module
   * - the component can inject {Popup} instance to access input or to close the popup
   */
  component: Type<any>;
  /**
   * Specifies the {Element} where to attach the popup.
   */
  anchor: ElementRef;
  /**
   * Specifies in which region of the anchor to show the popup (unless not enough space).
   */
  position?: Position;
  /**
   * Controls when to close the popup.
   */
  closeStrategy?: CloseStrategy;
  /**
   * Specifies the min-height of the popup.
   */
  minHeight?: string;
  /**
   * Specifies the height of the popup.
   */
  height?: string;
  /**
   * Specifies the max-height of the popup.
   */
  maxHeight?: string;
  /**
   * Specifies the min-width of the popup.
   */
  minWidth?: string;
  /**
   * Specifies the width of the popup.
   */
  width?: string;
  /**
   * Specifies the max-width of the popup.
   */
  maxWidth?: string;
  /**
   * Specifies CSS class(es) added to the popup overlay, e.g. used for e2e testing.
   */
  cssClass?: string | string[];
}

/**
 * Popup handle which the component can inject to access input data or to close the popup.
 */
export abstract class Popup {
  /**
   * Optional input data available in the popup component.
   */
  public abstract get input(): any | undefined;

  /**
   * Closes the popup.
   */
  public abstract close(result?: any | undefined): void;
}

/**
 * Specifies when to close the popup.
 */
export interface CloseStrategy {
  /**
   * Specifies if to close the popup on focus lost, which is `true` by default.
   */
  onFocusLost?: boolean;
  /**
   * Specifies if to close the popup on escape keystroke, which is `true` by default.
   */
  onEscape?: boolean;
  /**
   * Specifies if to close the popup on workbench view grid change, which is `true` by default.
   */
  onGridLayoutChange?: boolean;
}
