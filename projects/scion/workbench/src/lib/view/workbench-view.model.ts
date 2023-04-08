import {Observable} from 'rxjs';
import {UrlSegment} from '@angular/router';
import {Disposable} from '../disposable';
import {WorkbenchMenuItem} from '../workbench.model';
import {WorkbenchViewPart} from '../view-part/workbench-view-part.model';

/**
 * A view is a visual component within the Workbench to present content,
 * and which can be arranged in a parts layout.
 */
export abstract class WorkbenchView {

  /**
   * View outlet identity which is unique in this application.
   */
  public abstract readonly viewId: string;

  /**
   * The viewpart which contains this view.
   *
   * Note: the viewpart of a view can change, e.g. when the view is moved to another viewpart.
   */
  public abstract readonly part: WorkbenchViewPart;

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
   * Specifies if the view is blocked, e.g., not interactable because of showing a view-modal message box.
   */
  public abstract blocked: boolean;

  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  public abstract closable: boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   */
  public abstract readonly active: boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   * Emits the current state upon subscription.
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
   * Returns the URL segments of this view.
   *
   * A {@link UrlSegment} is a part of a URL between the two slashes. It contains a path and the matrix parameters associated with the segment.
   */
  public abstract readonly urlSegments: UrlSegment[];

  /**
   * Destroys this view (or sibling views) and the associated routed component.
   *
   * Note: This instruction runs asynchronously via URL routing.
   *
   * @param target
   *        Allows to control which view(s) to close:
   *
   *        - self: closes this view
   *        - all-views: closes all views of this viewpart
   *        - other-views: closes the other views of this viewpart
   *        - views-to-the-right: closes the views to the right of this view
   *        - views-to-the-left: closes the views to the left of this view
   *
   */
  public abstract close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean>;

  /**
   * Moves this view to a new part in the specified region, or to a new browser window if 'blank-window'.
   */
  public abstract move(region: 'north' | 'south' | 'west' | 'east' | 'blank-window'): Promise<boolean>;

  /**
   * Registers a menu item which is added to the context menu of the view tab.
   *
   * @return handle to unregister the menu item.
   */
  public abstract registerMenuItem(menuItem: WorkbenchMenuItem): Disposable;
}
