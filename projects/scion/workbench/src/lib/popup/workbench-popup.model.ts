import {PopupId} from '../workbench.identifiers';
import {Signal} from '@angular/core';

/**
 * A popup is a visual workbench element for displaying content above other content. The popup is positioned relative
 * to an anchor based on its preferred alignment. The anchor can be an element or a coordinate.
 *
 * The popup component can inject this handle to interact with the popup.
 *
 * Popup inputs are available as input properties in the popup component.
 *
 * @see WorkbenchPopupService
 */
export abstract class WorkbenchPopup {

  /**
   * Identity of this popup.
   */
  public abstract readonly id: PopupId;

  /**
   * Sets the preferred popup size. Defaults to the content's intrinsic size, constrained by min and max size, if set.
   */
  public abstract readonly size: WorkbenchPopupSize;

  /**
   * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
   */
  public abstract get cssClass(): Signal<string[]>;
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Indicates whether this popup has the focus.
   */
  public abstract readonly focused: Signal<boolean>;

  /**
   * Sets a result that will be passed to the popup opener when the popup is closed on focus loss {@link CloseStrategy#onFocusLost}.
   */
  public abstract setResult<R>(result?: R): void;

  /**
   * Closes the popup. Optionally, pass a result or an error to the popup opener.
   */
  public abstract close<R>(result?: R | Error): void;
}

/**
 * Represents the preferred size of a popup.
 */
export interface WorkbenchPopupSize {
  /**
   * Specifies the height of the popup, constrained by {@link minHeight} and {@link maxHeight}, if any.
   */
  get height(): Signal<string | undefined>;

  set height(height: string | undefined);

  /**
   * Specifies the width of the popup, constrained by {@link minWidth} and {@link maxWidth}, if any.
   */
  get width(): Signal<string | undefined>;

  set width(width: string | undefined);

  /**
   * Specifies the minimum height of the popup.
   */
  get minHeight(): Signal<string | undefined>;

  set minHeight(minHeight: string | undefined);

  /**
   * Specifies the maximum height of the popup.
   */
  get maxHeight(): Signal<string | undefined>;

  set maxHeight(maxHeight: string | undefined);

  /**
   * Specifies the minimum width of the popup.
   */
  get minWidth(): Signal<string | undefined>;

  set minWidth(minWidth: string | undefined);

  /**
   * Specifies the maximum width of the popup.
   */
  get maxWidth(): Signal<string | undefined>;

  set maxWidth(maxWidth: string | undefined);
}
