import {Signal} from '@angular/core';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered.
 * It informs about system events, task completion or errors. The severity indicates importance or urgency.
 *
 * The notification component can inject this handle to interact with the notification.
 *
 * Notification inputs are available as input properties in the notification component.
 *
 * @see WorkbenchNotificationService
 */
export abstract class WorkbenchNotification {

  /**
   * Sets the title of the notification.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract get title(): Signal<Translatable | undefined>;
  public abstract set title(title: Translatable | undefined);

  /**
   * Sets the severity of the notification to indicate importance or urgency.
   */
  public abstract get severity(): Signal<'info' | 'warn' | 'error'>;
  public abstract set severity(severity: 'info' | 'warn' | 'error');

  /**
   * Controls how long to display the notification.
   *
   * Can be a duration alias, or milliseconds.
   */
  public abstract get duration(): Signal<'short' | 'medium' | 'long' | 'infinite' | number>;
  public abstract set duration(duration: 'short' | 'medium' | 'long' | 'infinite' | number);

  /**
   * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
   */
  public abstract get cssClass(): Signal<string[]>;
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Closes the notification.
   */
  public abstract close(): void;
}
