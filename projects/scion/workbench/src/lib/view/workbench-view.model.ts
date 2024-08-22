import {Observable} from 'rxjs';
import {UrlSegment} from '@angular/router';
import {Disposable} from '../common/disposable';
import {WorkbenchMenuItem} from '../workbench.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {NavigationData, ViewState} from '../routing/routing.model';
import {Signal} from '@angular/core';

/**
 * Handle to interact with a view opened via {@link WorkbenchRouter}.
 *
 * The view component can inject this handle to interact with the view, such as setting the title or closing the view.
 *
 * The view component can inject `ActivatedRoute` to obtain parameters passed to the navigation and/or read data associated with the route.
 *
 * @see WorkbenchRouter
 */
export abstract class WorkbenchView {

  /**
   * Unique identity of this view.
   *
   * Each view is assigned a unique identifier (e.g., `view.1`, `view.2`, etc.).
   *
   * @see alternativeId
   */
  public abstract readonly id: ViewId;

  /**
   * Alternative identity of this view.
   *
   * A view can have an alternative id, a meaningful but not necessarily unique name. A view can
   * be identified either by its unique or alternative id.
   *
   * @see id
   */
  public abstract readonly alternativeId: string | undefined;

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
   * Data passed to the navigation.
   */
  public abstract readonly navigationData: Signal<NavigationData>;

  /**
   * State passed to the navigation.
   */
  public abstract readonly state: ViewState;

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
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  public abstract cssClass: string | string[];

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

/**
 * Format of a view identifier.
 *
 * Each view is assigned a unique identifier (e.g., `view.1`, `view.2`, etc.).
 * A view can also have an alternative id, a meaningful but not necessarily unique name. A view can
 * be identified either by its unique or alternative id.
 */
export type ViewId = `view.${number}`;
