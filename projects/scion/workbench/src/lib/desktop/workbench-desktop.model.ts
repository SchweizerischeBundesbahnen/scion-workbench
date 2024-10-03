import {UrlSegment} from '@angular/router';
import {NavigationData} from '../routing/routing.model';
import {Injectable, Signal} from '@angular/core';
import {ɵWorkbenchDesktop} from './ɵworkbench-desktop.model';

/**
 * Handle to interact with a desktop navigated via {@link WorkbenchLayout#navigateDesktop}.
 *
 * The desktop component can inject this handle to interact with the desktop.
 *
 * The desktop component can inject `ActivatedRoute` to obtain parameters passed to the navigation and/or read data associated with the route.
 *
 * @see WorkbenchRouter
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchDesktop})
export abstract class WorkbenchDesktop {

  /**
   * Hint passed to the navigation.
   *
   * A hint can be passed to the navigation to differentiate between routes with identical paths.
   */
  public abstract readonly navigationHint: Signal<string | undefined>;

  /**
   * Data passed to the navigation.
   */
  public abstract readonly navigationData: Signal<NavigationData>;

  /**
   * Specifies CSS class(es) to add to the desktop, e.g., to locate the desktop in tests.
   */
  public abstract get cssClass(): Signal<string[]>;
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * URL associated with this desktop.
   */
  public abstract readonly urlSegments: Signal<UrlSegment[]>;
}
