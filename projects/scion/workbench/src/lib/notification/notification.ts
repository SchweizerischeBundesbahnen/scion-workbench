/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';
import { Severity } from '../workbench.constants';

/**
 * Represents a notification to be displayed to the user.
 */
export class Notification {
  /**
   * Specifies the optional title.
   */
  public title?: string;
  /**
   * Specifies the notification text, or the component to be displayed as notification.
   * @see input
   */
  public content: string | Type<any>;
  /**
   * Specifies the optional input to be given to the component as specified in `content`.
   * @see content
   */
  public input?: any;
  /**
   * Specifies the optional severity.
   */
  public severity?: Severity | null = 'info';
  /**
   * Specifies the optional timeout upon which to close this notification automatically.
   * If not specified, a 'medium' timeout is applied. Use 'Duration.infinite' to not close this notification automatically.
   */
  public duration?: Duration;
  /**
   * Specifies the optional group which this notification belongs to.
   * If specified, this notification closes all notification of the same group before being presented.
   */
  public group?: string;
  /**
   * Specifies CSS class(es) added to the <wb-notification> element, e.g. used for e2e testing.
   */
  public cssClass?: string | string[];
  /**
   * Reducer function used in combination with 'group' to combine the inputs of the new and current notification.
   */
  public groupInputReduceFn?: (prevInput: any, currInput: any) => any = (prevInput, currInput) => currInput;
}

export class WbNotification extends Notification {

  /**
   * Allows to register a callback that will be called when a property like 'severity' or 'title' is changed.
   */
  public onPropertyChange: () => void;

  constructor(notification: Notification) {
    super();

    // Patch setters to initiate change detection cycle if properties are set in content component.
    ['title', 'severity'].forEach(property => {
      Object.defineProperty(this, property, {
        set: (arg: any): void => {
          this[`_${property}`] = arg;
          this.onPropertyChange && this.onPropertyChange();
        },
        get: (): any => {
          return this[`_${property}`];
        },
      });
    });

    // Copy properties of object literal to this instance
    Object.keys(notification)
      .filter(key => typeof notification[key] !== 'undefined')
      .forEach(key => this[key] = notification[key]);

    this.severity = this.severity || 'info';
    this.duration = this.duration || 'medium';
  }
}

export type Duration = 'short' | 'medium' | 'long' | 'infinite';
