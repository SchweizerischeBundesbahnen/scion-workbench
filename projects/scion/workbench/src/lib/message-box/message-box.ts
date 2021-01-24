/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable } from 'rxjs';

/**
 * Handle that a message box component can inject to interact with the message box, for example,
 * to read input data or to configure the message box.
 *
 * A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text
 * message and one or more buttons.
 */
export abstract class MessageBox<T = any> {

  /**
   * Input data as passed by the message box opener when opened the message box, or `undefined` if not passed.
   */
  public readonly input: T | undefined;

  /**
   * Sets the title of the message box; can be a string literal or an Observable.
   */
  public abstract setTitle(title: string | undefined | Observable<string | undefined>): void;

  /**
   * Sets the severity of the message.
   */
  public abstract setSeverity(severity: 'info' | 'warn' | 'error'): void;

  /**
   * Sets CSS class(es) to be added to the message box, e.g. used for e2e testing.
   *
   * This operation is additive, that is, it does not override CSS classes set by the message box opener.
   */
  public abstract setCssClass(cssClass: string | string[]): void;

  /**
   * Defines the actions that will be displayed to the user in the form of buttons to close the message box.
   *
   * This operation overrides actions defined by the message box opener.
   */
  public abstract setActions(actions: MessageBoxAction[]): void;
}

/**
 * Represents a close action which is displayed as a button in the message box.
 */
export interface MessageBoxAction {
  /**
   * Specifies the key to be returned to the message box opener when the user closes the message box via this close action.
   * The key is also added to the action button as a CSS class in the format `e2e-action-<KEY>`.
   *
   * If to include additional data in the return value, for example, when prompting the user for data, consider registering
   * an {@link onAction action listener} to control the return value.
   */
  key: string;
  /**
   * The label to display to the user; can be a string literal or an Observable.
   */
  label: string | Observable<string>;
  /**
   * Listener called when the user closes the message box via this action.
   *
   * Setting a listener is optional, allowing to control the value which to return to the message box opener
   * when closing the message box via this action. By default, if not set, will return the action key.
   */
  onAction?: () => any;
}
