import {Observable} from 'rxjs';
import {UrlSegment} from '@angular/router';
import {Disposable} from '../common/disposable';
import {WorkbenchMenuItem} from '../workbench.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {ViewState} from '../routing/routing.model';

/**
 * A view is a visual workbench component for displaying content stacked or side-by-side.
 *
 * Any component registered as a primary Angular route can be opened as a view using the {@link WorkbenchRouter}.
 *
 * @see WorkbenchPart
 */
export abstract class WorkbenchView {

  /**
   * Unique identity of this view.
   */
  public abstract readonly id: string;

  /**
   * Reference to the part which contains this view.
   *
   * Note: the part of a view can change, e.g. when the view is moved to another part.
   */
  public abstract readonly part: WorkbenchPart;

  /**
   * Specifies the title to be displayed in the view tab.
   */
  public abstract title: string | null;

  /**
   * Specifies the subtitle to be displayed in the view tab.
   */
  public abstract heading: string | null;

  /**
   * Specifies CSS class(es) to be added to the view, useful in end-to-end tests for locating view and view tab.
   */
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * CSS classes associated with the view.
   */
  public abstract readonly cssClasses: string[];

  /**
   * Specifies if the content of the current view is dirty.
   * If dirty, a dirty marker is displayed in the view tab.
   */
  public abstract dirty: boolean;

  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  public abstract closable: boolean;

  /**
   * Indicates whether this view is active or inactive.
   */
  public abstract readonly active: boolean;

  /**
   * Notifies when this view becomes active or inactive.
   *
   * Upon subscription, emits the current state, and then each time the state changes. The observable never completes.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * The position of this view in the tabbar.
   */
  public abstract readonly position: number;

  /**
   * `True` when this view is the first view in the tabbar.
   */
  public abstract readonly first: boolean;

  /**
   * `True` when this view is the last view in the tabbar.
   */
  public abstract readonly last: boolean;

  /**
   * Inidcates whether the tab of this view is scrolled into view in the tabbar.
   */
  public abstract readonly scrolledIntoView: boolean;

  /**
   * Indicates whether this view is destroyed.
   */
  public abstract readonly destroyed: boolean;

  /**
   * URL associated with this view.
   */
  public abstract readonly urlSegments: UrlSegment[];

  /**
   * State associated with this view.
   *
   * Note that state is volatile, meaning it is not encoded in the URL but read from the browser session history; thus, it will be lost when the page is reloaded.
   */
  public abstract readonly state: ViewState;

  /**
   * Activates this view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract activate(): Promise<boolean>;

  /**
   * Destroys this view (or sibling views) and the associated routed component.
   *
   * Note: This instruction runs asynchronously via URL routing.
   *
   * @param target
   *        Allows to control which view(s) to close:
   *
   *        - self: closes this view
   *        - all-views: closes all views of this part
   *        - other-views: closes the other views of this part
   *        - views-to-the-right: closes the views to the right of this view
   *        - views-to-the-left: closes the views to the left of this view
   *
   */
  public abstract close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean>;

  /**
   * Moves this view to a new browser window.
   */
  public abstract move(target: 'new-window'): void;

  /**
   * Moves this view to a different or new part in the specified region.
   *
   * Specifying a target workbench identifier allows the view to be moved to a workbench in a different browser window.
   * The target workbench ID is available via {@link WORKBENCH_ID} DI token in the target application.
   */
  public abstract move(partId: string, options?: {region?: 'north' | 'south' | 'west' | 'east'; workbenchId?: string}): void;

  /**
   * Registers a menu item which is added to the context menu of the view tab.
   *
   * @return handle to unregister the menu item.
   */
  public abstract registerMenuItem(menuItem: WorkbenchMenuItem): Disposable;
}
