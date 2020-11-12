import { Observable } from 'rxjs';
import { UrlSegment } from '@angular/router';
import { Disposable } from '../disposable';
import { WorkbenchMenuItem} from '../workbench.model';
import { WorkbenchViewPart } from '../view-part/workbench-view-part.model';

/**
 * A view is a visual component within the Workbench to present content,
 * and which can be arranged in a parts layout.
 */
export abstract class WorkbenchView {

  /**
   * View outlet identity which is unique in this application.
   */
  public readonly viewId: string;

  /**
   * The viewpart which contains this view.
   *
   * Note: the viewpart of a view can change, e.g. when the view is moved to another viewpart.
   */
  public readonly part: WorkbenchViewPart;

  /**
   * Specifies the title to be displayed in the view tab.
   */
  public title: string;

  /**
   * Specifies the sub title to be displayed in the view tab.
   */
  public heading: string;

  /**
   * Specifies CSS class(es) added to the <wb-view-tab> and <wb-view> elements, e.g. used for e2e testing.
   */
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Returns CSS classes specified, if any.
   */
  public abstract get cssClasses(): string[];

  /**
   * Specifies if the content of the current view is dirty.
   * If dirty, a dirty marker is displayed in the view tab.
   */
  public dirty: boolean;

  /**
   * Specifies if the view is blocked, e.g., not interactable because of showing a view-modal message box.
   */
  public blocked: boolean;

  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  public closable: boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   */
  public abstract get active(): boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   * Emits the current state upon subscription.
   */
  public abstract get active$(): Observable<boolean>;

  /**
   * The position of this view in the tabbar.
   */
  public readonly position: number;

  /**
   * `True` when this view is the first view in the tabbar.
   */
  public readonly first: boolean;

  /**
   * `True` when this view is the last view in the tabbar.
   */
  public readonly last: boolean;

  /**
   * Indicates whether this view is destroyed.
   */
  public abstract get destroyed(): boolean;

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
   * Returns the URL segments of this view.
   *
   * A {@link UrlSegment} is a part of a URL between the two slashes. It contains a path and the matrix parameters associated with the segment.
   */
  public abstract get urlSegments(): UrlSegment[];

  /**
   * Registers a menu item which is added to the context menu of the view tab.
   *
   * @return {@link Disposable} to unregister the menu item.
   */
  public abstract registerMenuItem(menuItem: WorkbenchMenuItem): Disposable;
}
