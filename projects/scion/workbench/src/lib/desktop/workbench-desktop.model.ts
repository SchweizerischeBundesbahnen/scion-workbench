import {UrlSegment} from '@angular/router';
import {ViewState} from '../routing/routing.model';

export abstract class WorkbenchDesktop {

  /**
   * Hint passed to the navigation.
   *
   * A hint can be passed to the navigation to differentiate between routes with identical paths.
   *
   * For example, the views of the initial layout or a perspective are usually navigated to the empty path route to avoid cluttering the URL,
   * requiring a navigation hint to differentiate between the routes.
   */
  public abstract readonly navigationHint: string | undefined;

  /**
   * Specifies CSS class(es) to add to the desktop, e.g., to locate the desktop in tests.
   */
  public abstract cssClass: string | string[];

  /**
   * URL associated with this desktop.
   */
  public abstract readonly urlSegments: UrlSegment[];

  /**
   * State associated with this desktop.
   *
   * Note that state is volatile, meaning it is not encoded in the URL but read from the browser session history; thus, it will be lost when the page is reloaded.
   */
  public abstract readonly state: ViewState;
}
