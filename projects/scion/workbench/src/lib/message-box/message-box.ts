/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';
import { Subject } from 'rxjs';
import { Severity } from '../workbench.constants';

/**
 * Represents a message box to be displayed to the user.
 */
export abstract class MessageBox {

  /**
   * Specifies the optional title.
   */
  title?: string;

  /**
   * Specifies the message box text, or the component to be displayed as content.
   * @see input
   */
  content: string | Type<any>;

  /**
   * Specifies the optional input to be given to the component as specified in `content`.
   * @see content
   */
  input?: any;

  /**
   * Specifies which buttons to display on the message box.
   */
  actions?: Actions;

  /**
   * Specifies the optional severity.
   */
  severity?: Severity | null = 'info';

  /**
   * Specifies the modality context created by the message box.
   *
   * By default, and if in view context, view modality is used.
   */
  modality?: 'application' | 'view' = 'view';

  /**
   * Specifies if the user can select the message box text.
   */
  contentSelectable?: boolean = false; // tslint:disable-line:no-inferrable-types
}

export class WbMessageBox extends MessageBox {

  public readonly close$ = new Subject<Action>();

  /**
   * Allows to register a callback that will be called when a property like 'severity' or 'title' is changed.
   */
  public onPropertyChange: () => void;

  constructor(messageBox: MessageBox) {
    super();

    // Intercept properties to initiate change detection cycle if properties are set in content component.
    ['title', 'actions', 'severity'].forEach(property => {
      Object.defineProperty(this, property, {
        set: (arg: any): void => {
          this[`_${property}`] = arg;
          this.onPropertyChange && this.onPropertyChange();
        },
        get: (): any => {
          return this[`_${property}`];
        }
      });
    });

    // Copy properties of object literal to this instance
    Object.keys(messageBox)
      .filter(key => typeof messageBox[key] !== 'undefined')
      .forEach(key => this[key] = messageBox[key]);
  }
}

/**
 * Represents a key to confirm a message box.
 */
export declare type Action = string;

/**
 * Dictionary of actions to confirm a message box.
 *
 * The key acts a action key, and the value as display text.
 */
export interface Actions {
  [key: string]: string;
}

