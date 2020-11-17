/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable } from 'rxjs';
import { Disposable } from './disposable';
import { WorkbenchMenuItemFactoryFn, WorkbenchViewPartAction } from './workbench.model';

/**
 * Root object for the SCION Workbench.
 *
 * It consists of one or more viewparts containing views which can be flexibly arranged and dragged around by the user.
 *
 * The Workbench provides core features of a modern rich web application.
 *
 * - tabbed, movable and stackable views
 * - activity panel as application entry point
 * - global notifications
 * - global or view-local message boxes
 * - URL encoded navigational state
 *
 * Activities are modelled in `app.component.html` as content children of <wb-workbench> in the form of <wb-activity> elements.
 *
 * Views are opened via Angular routing mechanism. To open a component in a view, it has to be registered as a route in the routing module.
 * Use `wbRouterLink` directive or `WorkbenchRouter` service for view-based navigation.
 */
export abstract class WorkbenchService {

  /**
   * A unique ID per instance of the app. If opened in a different browser tab, it has a different instance ID.
   */
  public readonly appInstanceId: string;

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public readonly views$: Observable<string[]>;

  /**
   * Destroys the specified workbench view(s) and associated routed component.
   * If it is the last view in the viewpart, the viewpart is removed as well.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract destroyView(...viewIds: string[]): Promise<boolean>;

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract activateView(viewId: string): Promise<boolean>;

  /**
   * Returns the identity of the viewpart which contains the specified view.
   *
   * Throws an error if no viewpart contains the view.
   */
  public abstract resolveViewPart(viewId: string): string;

  /**
   * Registers an action which is added to every viewpart.
   *
   * Viewpart actions are displayed next to the opened view tabs.
   *
   * @return handle to unregister the action.
   */
  public abstract registerViewPartAction(action: WorkbenchViewPartAction): Disposable;

  /**
   * Registers a view menu item which is added to the context menu of every view tab.
   *
   * The factory function is invoked with the view as its argument when the menu is about to show.
   *
   * @return handle to unregister the menu item.
   */
  public abstract registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable;
}
