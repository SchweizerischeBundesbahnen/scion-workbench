import {WorkbenchPopup} from './workbench-popup.model';

/**
 * A popup is a visual workbench element for displaying content above other content. The popup is positioned relative
 * to an anchor based on its preferred alignment. The anchor can be an element or a coordinate.
 *
 * The popup component can inject this handle to interact with the popup.
 *
 * Popup inputs are available as input properties in the popup component.
 *
 * @see WorkbenchPopupService
 *
 * @deprecated since version 21.0.0-beta.1. Replaced by `WorkbenchPopup`. Marked for removal in version 22.
 */
export abstract class Popup<T = unknown, R = unknown> extends WorkbenchPopup { // eslint-disable-line @typescript-eslint/no-unused-vars

  /**
   * Input data as passed by the popup opener when opened the popup, or `undefined` if not passed.
   *
   * @deprecated since version 21.0.0-beta.1. Use `WorkbenchPopupService` to open popups. Inputs are available as input properties in the popup component. Marked for removal in version 22.
   */
  public abstract readonly input: T | undefined;

  /**
   * CSS classes associated with the popup.
   *
   * @deprecated since version 21.0.0-beta.1. Use `WorkbenchPopup.cssClass` instead. Marked for removal in version 22.
   */
  public abstract readonly cssClasses: string[];
}
