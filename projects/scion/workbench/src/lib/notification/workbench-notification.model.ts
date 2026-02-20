import {Signal} from '@angular/core';
import {Translatable} from '../text/workbench-text-provider.model';
import {NotificationId} from '../workbench.identifiers';

/**
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered or focused.
 * It informs about system events, task completion, or errors. Severity indicates importance or urgency.
 *
 * The notification component can inject this handle to interact with the notification.
 *
 * Notification inputs are available as input properties in the notification component.
 *
 * @see WorkbenchNotificationService
 */
export abstract class WorkbenchNotification {
  /**
   * Identity of this notification.
   */
  public abstract readonly id: NotificationId;

  /**
   * Sets the title of the notification.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract get title(): Signal<Translatable | undefined>;
  public abstract set title(title: Translatable | undefined);

  /**
   * Sets the preferred notification size. Defaults to the content's intrinsic size, constrained by min and max size, if set.
   */
  public abstract readonly size: WorkbenchNotificationSize;

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
   * Indicates whether this notification has the focus.
   */
  public abstract readonly focused: Signal<boolean>;

  /**
   * Gets size and position of this notification, or `undefined` if not constructed.
   */
  public abstract readonly bounds: Signal<DOMRect | undefined>;

  /**
   * Closes the notification.
   */
  public abstract close(): void;
}

/**
 * Represents the preferred notification size.
 */
export interface WorkbenchNotificationSize {
  /**
   * Specifies the height of the notification, constrained by {@link minHeight} and {@link maxHeight}, if any.
   */
  get height(): Signal<string | undefined>;

  set height(height: string | undefined);

  /**
   * Specifies the minimum height of the notification.
   */
  get minHeight(): Signal<string | undefined>;

  set minHeight(minHeight: string | undefined);

  /**
   * Specifies the maximum height of the notification.
   */
  get maxHeight(): Signal<string | undefined>;

  set maxHeight(maxHeight: string | undefined);
}
