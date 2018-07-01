import { Type } from '@angular/core/core';
import { Severity } from '../workbench.constants';

/**
 * Represents a notification to be displayed to the user.
 */
export class Notification {
  /**
   * Specifies the optional title.
   */
  title?: string;
  /**
   * Specifies the notification text, or the component to be displayed as notification.
   * @see input
   */
  content: string | Type<any>;
  /**
   * Specifies the optional input to be given to the component as specified in `content`.
   * @see content
   */
  input?: any;
  /**
   * Specifies the optional severity.
   */
  severity?: Severity | null = 'info';
  /**
   * Specifies the optional timeout upon which to close this notification automatically.
   * If not specified, a 'short' timeout is applied. Use 'Duration.infinite' to not close this notification automatically.
   */
  duration?: Duration;
  /**
   * Specifies the optional group which this notification belongs to.
   * If specified, this notification closes all notification of the same group before being presented.
   */
  group?: string;

  /**
   * Reducer function used in combination with 'group' to combine the inputs of the new and current notification.
   */
  groupInputReduceFn?: (prevInput: any, currInput: any) => any = (prevInput, currInput) => currInput;
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
        }
      });
    });

    // Copy properties of object literal to this instance
    Object.keys(notification)
      .filter(key => typeof notification[key] !== 'undefined')
      .forEach(key => this[key] = notification[key]);
  }
}

export type Duration = 'short' | 'medium' | 'long' | 'infinite';
