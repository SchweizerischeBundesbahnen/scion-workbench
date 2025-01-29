/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Disposable} from './common/disposable';
import {WorkbenchMenuItemFactoryFn, WorkbenchPartActionFn, WorkbenchTheme} from './workbench.model';
import {ViewId, WorkbenchView} from './view/workbench-view.model';
import {WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {PartId, WorkbenchPart} from './part/workbench-part.model';
import {Injectable, Signal} from '@angular/core';
import {ɵWorkbenchService} from './ɵworkbench.service';
import {WorkbenchLayout} from './layout/workbench-layout';

/**
 * The central class of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout to arrange content side-by-side
 * or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows,
 * enabling users to work on content in parallel.
 *
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. Each part is a stack of views. Content is displayed in views or parts.
 *
 * The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support
 * the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable
 * area for user interaction.
 *
 * Multiple layouts, called perspectives, are supported. Perspectives can be switched. Only one perspective is active at a time.
 * Perspectives share the same main area, if any.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchService})
export abstract class WorkbenchService {

  /**
   * Provides the snapshot of the current workbench layout.
   *
   * The layout is an immutable object. Modifications have no side effects. The layout can be modified using {@link WorkbenchRouter.navigate}.
   */
  public abstract readonly layout: Signal<WorkbenchLayout>;

  /**
   * Provides the handles of the perspectives registered in the workbench.
   *
   * Each handle represents a perspective registered in the workbench. The handle has methods to interact with the perspective.
   * Perspectives are registered via {@link WorkbenchConfig} passed to {@link provideWorkbench} or via {@link WorkbenchService}.
   */
  public abstract readonly perspectives: Signal<WorkbenchPerspective[]>;

  /**
   * Provides the active perspective, or `undefined` if none is active (e.g., during workbench startup).
   */
  public abstract readonly activePerspective: Signal<WorkbenchPerspective | undefined>;

  /**
   * Returns the handle of the specified perspective, or `null` if not found.
   */
  public abstract getPerspective(perspectiveId: string): WorkbenchPerspective | null;

  /**
   * Registers the given perspective.
   *
   * The perspective can be activated via {@link WorkbenchService#switchPerspective}.
   */
  public abstract registerPerspective(perspective: WorkbenchPerspectiveDefinition): Promise<void>;

  /**
   * Switches to the specified perspective.
   *
   * Switching perspective does not change the layout of the main area, if any.
   */
  public abstract switchPerspective(id: string): Promise<boolean>;

  /**
   * Resets the currently active perspective to its initial layout. Resetting the perspective does not change the layout of the main area, if any.
   */
  public abstract resetPerspective(): Promise<void>;

  /**
   * Provides the handles of the parts in the current workbench layout.
   *
   * Each handle represents a part in the layout. The handle has methods to interact with the part. Parts are added to the layout via {@link WorkbenchRouter}.
   */
  public abstract readonly parts: Signal<WorkbenchPart[]>;

  /**
   * Returns the handle of the specified part, or `null` if not found.
   *
   * A handle represents a part in the layout. The handle has methods to interact with the part. A part is added to the layout via {@link WorkbenchRouter}.
   */
  public abstract getPart(partId: PartId): WorkbenchPart | null;

  /**
   * Provides the handles of the views in the current workbench layout.
   *
   * Each handle represents a view in the layout. The handle has methods to interact with the view. Views are opened via {@link WorkbenchRouter}.
   */
  public abstract readonly views: Signal<WorkbenchView[]>;

  /**
   * Returns the handle of the specified view, or `null` if not found.
   *
   * A handle represents a view in the layout. The handle has methods to interact with the view. A view is opened via {@link WorkbenchRouter}.
   */
  public abstract getView(viewId: ViewId): WorkbenchView | null;

  /**
   * Closes the specified workbench views.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract closeViews(...viewIds: ViewId[]): Promise<boolean>;

  /**
   * Registers a factory function to contribute an action to a {@link WorkbenchPart}.
   *
   * Part actions are displayed in the part bar, enabling interaction with the part and its content. Actions can be aligned to the left or right.
   *
   * The function:
   * - Can return a component or template, or an object literal for an object literal for more control.
   * - Is called per part. Returning the action adds it to the part, returning `null` skips it.
   * - Can call `inject` to get any required dependencies.
   * - Runs in a reactive context and is called again when tracked signals change.
   *   Use Angular's untracked function to execute code outside this reactive context.
   *
   * Alternatively to registering a function, actions can be provided declaratively in HTML templates using the {@link WorkbenchPartActionDirective}.
   *
   * ```html
   * <ng-template wbPartAction let-part>
   *   ...
   * </ng-template>
   * ```
   *
   * @param fn - function to contribute an action.
   * @return handle to unregister the action.
   */
  public abstract registerPartAction(fn: WorkbenchPartActionFn): Disposable;

  /**
   * Contributes a menu item to a view's context menu.
   *
   * ---
   * As an alternative to programmatic registration, menu items can be contributed declaratively from an HTML template.
   * Declaring a menu item in the HTML template of a workbench view adds it to that view only. To add it to every view,
   * declare it outside a view context, such as in `app.component.html`, or register it programmatically.
   * Refer to {@link WorkbenchViewMenuItemDirective} for more information.
   *
   * Example:
   * ```html
   * <ng-template wbViewMenuItem [accelerator]="['ctrl', 'b']" (action)="..." let-view>
   *   ...
   * </ng-template>
   * ```
   *
   * @return handle to unregister the menu item.
   */
  public abstract registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable;

  /**
   * Switches the theme of the workbench.
   *
   * Themes can be registered when loading the `@scion/workbench` SCSS module in the application's `styles.scss` file.
   * By default, SCION provides a light and a dark theme, `scion-light` and `scion-dark`.
   *
   * See the documentation of `@scion/workbench` SCSS module for more information.
   *
   * @param theme - The name of the theme to switch to.
   */
  public abstract switchTheme(theme: string): Promise<void>;

  /**
   * Provides the current workbench theme, if any.
   */
  public abstract readonly theme: Signal<WorkbenchTheme | null>;
}
