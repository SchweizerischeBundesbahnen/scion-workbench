import {UrlSegment} from '@angular/router';
import {Disposable} from '../common/disposable';
import {WorkbenchMenuItem} from '../workbench.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {NavigationData, NavigationState} from '../routing/routing.model';
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
  public abstract readonly navigationHint: Signal<string | undefined>;

  /**
   * Data passed to the navigation.
   */
  public abstract readonly navigationData: Signal<NavigationData>;

  /**
   * State passed to the navigation.
   */
  public abstract readonly navigationState: Signal<NavigationState>;

  /**
   * Part which contains this view.
   *
   * Note: the part of a view can change, e.g., when the view is moved to another part.
   */
  public abstract readonly part: Signal<WorkbenchPart>;

  /**
   * Title to be displayed in the view tab.
   */
  public abstract get title(): Signal<string | null>;
  public abstract set title(title: string | null);

  /**
   * Specifies the subtitle to be displayed in the view tab.
   */
  public abstract get heading(): Signal<string | null>;
  public abstract set heading(heading: string | null);

  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
   */
  public abstract get cssClass(): Signal<string[]>;
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Indicates whether the view has unsaved changes.
   * If marked as dirty, a visual indicator is displayed in the view tab.
   */
  public abstract get dirty(): Signal<boolean>;
  public abstract set dirty(dirty: boolean);

  /**
   * Controls whether the view can be closed. Default is `true`.
   */
  public abstract get closable(): Signal<boolean>;
  public abstract set closable(closable: boolean);

  /**
   * Indicates whether this view is active or inactive.
   */
  public abstract readonly active: Signal<boolean>;

  /**
   * The position of this view in the tabbar.
   */
  public abstract readonly position: Signal<number>;

  /**
   * `True` when this view is the first view in the tabbar.
   */
  public abstract readonly first: Signal<boolean>;

  /**
   * `True` when this view is the last view in the tabbar.
   */
  public abstract readonly last: Signal<boolean>;

  /**
   * Indicates whether the tab of this view is scrolled into the tabbar.
   */
  public abstract readonly scrolledIntoView: Signal<boolean>;

  /**
   * Indicates whether this view is destroyed.
   */
  public abstract readonly destroyed: boolean;

  /**
   * URL associated with this view.
   */
  public abstract readonly urlSegments: Signal<UrlSegment[]>;

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
