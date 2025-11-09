import {PopupId} from '../workbench.identifiers';
import {Signal} from '@angular/core';
import {PopupSize} from './popup.config';

/**
 * Handle to interact with a popup opened via {@link WorkbenchPopupService}.
 *
 * The popup component can inject this handle to interact with the popup.
 *
 * Popup inputs are available via {@link WorkbenchPopup.input} property.
 */
export abstract class WorkbenchPopup<T = unknown, R = unknown> {

  /**
   * Unique identity of this popup.
   */
  public abstract readonly id: PopupId;

  /**
   * Input data as passed by the popup opener when opened the popup, or `undefined` if not passed.
   */
  public abstract readonly input: T | undefined;

  /**
   * Preferred popup size as specified by the popup opener, or `undefined` if not set.
   */
  public abstract readonly size: PopupSize | undefined;

  /**
   * CSS classes associated with the popup.
   */
  public abstract readonly cssClasses: string[];

  /**
   * Indicates whether this popup has the focus.
   */
  public abstract readonly focused: Signal<boolean>;

  /**
   * Sets a result that will be passed to the popup opener when the popup is closed on focus loss {@link CloseStrategy#onFocusLost}.
   */
  public abstract setResult(result?: R): void;

  /**
   * Closes the popup. Optionally, pass a result or an error to the popup opener.
   */
  public abstract close(result?: R | Error): void;
}
