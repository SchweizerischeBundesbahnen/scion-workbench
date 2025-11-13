/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Disposable} from './common/disposable';
import {WorkbenchElement, WorkbenchPartActionFn, WorkbenchViewMenuItemFn} from './workbench.model';
import {WorkbenchView} from './view/workbench-view.model';
import {WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WorkbenchPart} from './part/workbench-part.model';
import {Injectable, Signal, WritableSignal} from '@angular/core';
import {ɵWorkbenchService} from './ɵworkbench.service';
import {WorkbenchLayout} from './layout/workbench-layout';
import {DialogId, PartId, PopupId, ViewId} from './workbench.identifiers';
import {WorkbenchDialog} from './dialog/workbench-dialog';
import {WorkbenchPopup} from './popup/workbench-popup';

/**
 * The central class of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout to display content side-by-side
 * or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows,
 * enabling users to work on content in parallel.
 *
 * An application can have multiple layouts, called perspectives. A perspective defines an arrangement of parts and views.
 * Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts.
 * Content can be displayed in both parts and views.
 *
 * Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the layout of a perspective,
 * restoring it the next time it is activated.
 *
 * A perspective typically has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support
 * the user's workflow. Initially empty or displaying a welcome page, the main area is where the workbench opens views by default. Users can split
 * the main area (or any other part) by dragging views side-by-side, vertically and horizontally, even across windows.
 *
 * Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives. Having a main area and
 * multiple perspectives is optional.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchService})
export abstract class WorkbenchService {

  /**
   * Provides the layout of the workbench.
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
   * Provides the handles of the views in the current workbench layout.
   *
   * Each handle represents a view in the layout. The handle has methods to interact with the view. Views are opened via {@link WorkbenchRouter}.
   */
  public abstract readonly views: Signal<WorkbenchView[]>;

  /**
   * Provides the handles of the dialogs opened in the workbench.
   *
   * Each handle represents a dialog. The handle has methods to interact with the dialog. Dialogs are opened via {@link WorkbenchDialogService}.
   */
  public abstract readonly dialogs: Signal<WorkbenchDialog[]>;

  /**
   * Provides the handles of the popups opened in the workbench.
   *
   * Each handle represents a popup. The handle has methods to interact with the popup. Popups are opened via {@link WorkbenchPopupService}.
   */
  public abstract readonly popups: Signal<WorkbenchPopup[]>;

  /**
   * Returns the handle of the specified part, or `null` if not found.
   *
   * A handle represents a part in the layout. The handle has methods to interact with the part. A part is added to the layout via {@link WorkbenchRouter}.
   */
  public abstract getPart(partId: PartId): WorkbenchPart | null;

  /**
   * Returns the handle of the specified view, or `null` if not found.
   *
   * A handle represents a view in the layout. The handle has methods to interact with the view. A view is opened via {@link WorkbenchRouter}.
   */
  public abstract getView(viewId: ViewId): WorkbenchView | null;

  /**
   * Returns the handle of the specified dialog, or `null` if not found.
   *
   * A handle represents a dialog opened in the workbench. The handle has methods to interact with the dialog. A dialog is opened via {@link WorkbenchDialogService}.
   */
  public abstract getDialog(dialogId: DialogId): WorkbenchDialog | null;

  /**
   * Returns the handle of the specified popup, or `null` if not found.
   *
   * A handle represents a popup opened in the workbench. The handle has methods to interact with the popup. A popup is opened via {@link WorkbenchPopupService}.
   */
  public abstract getPopup(popupId: PopupId): WorkbenchPopup | null;

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
   * Registers a factory function to contribute a menu item to the context menu of a {@link WorkbenchView}.
   *
   * Right-clicking on a view tab opens a context menu to interact with the view and its content.
   *
   * The function:
   * - Is called per view. Returning the menu item adds it to the context menu of the view, returning `null` skips it.
   * - Can call `inject` to get any required dependencies.
   * - Runs in a reactive context and is called again when tracked signals change.
   *   Use Angular's `untracked` function to execute code outside this reactive context.
   *
   * Alternatively to registering a function, menu items can be provided declaratively in HTML templates using the {@link WorkbenchViewMenuItemDirective}.
   *
   * ```html
   * <ng-template wbViewMenuItem (action)="..." let-view>
   *   ...
   * </ng-template>
   * ```
   *
   * @param fn - function to contribute a menu item.
   * @return handle to unregister the menu item.
   */
  public abstract registerViewMenuItem(fn: WorkbenchViewMenuItemFn): Disposable;

  /**
   * Defines settings to adapt the workbench to personal preferences and working styles.
   *
   * Settings are stored in {@link WorkbenchConfig.storage} (defaults to local storage).
   */
  public abstract readonly settings: {
    /**
     * Specifies the workbench theme.
     *
     * Defaults to the `sci-theme` attribute set on the HTML root element, or to the user's OS color scheme preference if not set.
     *
     * Built-in themes: `scion-light` and `scion-dark`.
     */
    theme: WritableSignal<string | null>;
    /**
     * Controls the alignment of the bottom docked panel.
     *
     * Defaults to the `--sci-workbench-layout-panel-align` design token, or `justify` if not set.
     */
    panelAlignment: WritableSignal<'left' | 'right' | 'center' | 'justify'>;
    /**
     * Controls animation of docked panels.
     *
     * Defaults to the `--sci-workbench-layout-panel-animate` design token, or `true` if not set.
     */
    panelAnimation: WritableSignal<boolean>;
  };

  /**
   * Provides the focused workbench element, or `null` if the focus is on a DOM element outside any workbench element.
   */
  public abstract readonly activeElement: Signal<WorkbenchElement | null>;
}
