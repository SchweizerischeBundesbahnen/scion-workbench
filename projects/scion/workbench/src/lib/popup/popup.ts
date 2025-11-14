import {WorkbenchPopup} from './workbench-popup';

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
 * @deprecated since version 20.0.0-beta.10. Replaced by `WorkbenchPopup`. Marked for removal in version 22.
 */
export abstract class Popup extends WorkbenchPopup {
}
