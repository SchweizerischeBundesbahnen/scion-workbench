/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {Disposable} from './common/disposable';
import {WorkbenchMenuItemFactoryFn, WorkbenchPartAction, WorkbenchTheme} from './workbench.model';
import {ViewId, WorkbenchView} from './view/workbench-view.model';
import {WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WorkbenchPart} from './part/workbench-part.model';
import {Injectable} from '@angular/core';
import {ɵWorkbenchService} from './ɵworkbench.service';
import {WorkbenchLayout} from './layout/workbench-layout';

/**
 * The central class of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout to arrange content side-by-side
 * or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows,
 * enabling users to work on content in parallel.
 *
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.
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
   * Returns the current {@link WorkbenchLayout}.
   *
   * The layout is an immutable object. Modifications have no side effects. The layout can be modified using {@link WorkbenchRouter.navigate}.
   */
  public abstract readonly layout: WorkbenchLayout;

  /**
   * Emits the current {@link WorkbenchLayout}.
   *
   * Upon subscription, emits the current workbench layout, and then emits continuously
   * when the layout changes. It never completes.
   *
   * The layout is an immutable object. Modifications have no side effects. The layout can be modified using {@link WorkbenchRouter.navigate}.
   */
  public abstract readonly layout$: Observable<WorkbenchLayout>;

  /**
   * Perspectives registered with the workbench.
   */
  public abstract readonly perspectives: readonly WorkbenchPerspective[];

  /**
   * Emits the perspectives registered with the workbench.
   *
   * Upon subscription, emits registered perspectives, and then emits continuously
   * when new perspectives are registered or existing perspectives unregistered. It never completes.
   */
  public abstract readonly perspectives$: Observable<readonly WorkbenchPerspective[]>;

  /**
   * Returns a reference to the specified {@link WorkbenchPerspective}, or `null` if not found.
   */
  public abstract getPerspective(perspectiveId: string): WorkbenchPerspective | null;

  /**
   * Registers the given perspective to arrange views around the main area.
   * The perspective can be activated via the {@link WorkbenchService#switchPerspective} method.
   *
   * @see WorkbenchPerspective
   */
  public abstract registerPerspective(perspective: WorkbenchPerspectiveDefinition): Promise<void>;

  /**
   * Switches to the specified perspective. Layout and views of the main area do not change.
   */
  public abstract switchPerspective(id: string): Promise<boolean>;

  /**
   * Resets the currently active perspective to its initial layout. Layout and views of the main area do not change.
   */
  public abstract resetPerspective(): Promise<void>;

  /**
   * Parts in the workbench layout.
   *
   * Each {@link WorkbenchPart} object represents a part in the workbench layout that can be interacted with.
   */
  public abstract readonly parts: readonly WorkbenchPart[];

  /**
   * Emits the parts in the workbench layout.
   *
   * Upon subscription, emits parts contained in the layout, and then emits continuously
   * when new parts are added or existing parts removed. It never completes.
   */
  public abstract readonly parts$: Observable<readonly WorkbenchPart[]>;

  /**
   * Returns a reference to the specified {@link WorkbenchPart}, or `null` if not found.
   *
   * A {@link WorkbenchPart} object represents a part in the workbench layout that can be interacted with.
   */
  public abstract getPart(partId: string): WorkbenchPart | null;

  /**
   * Views in the workbench layout.
   *
   * Each {@link WorkbenchView} object represents a view in the workbench layout that can be interacted with.
   */
  public abstract readonly views: readonly WorkbenchView[];

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, emits views contained in the layout, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public abstract readonly views$: Observable<readonly WorkbenchView[]>;

  /**
   * Returns a reference to the specified {@link WorkbenchView}, or `null` if not found.
   *
   * A {@link WorkbenchView} object represents a view in the workbench layout that can be interacted with.
   */
  public abstract getView(viewId: ViewId): WorkbenchView | null;

  /**
   * Closes the specified workbench views.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract closeViews(...viewIds: ViewId[]): Promise<boolean>;

  /**
   * Contributes an action to a part's action bar.
   *
   * Part actions are displayed to the right of the view tab bar and enable interaction with the part and its content.
   *
   * @return handle to unregister the part action.
   */
  public abstract registerPartAction(action: WorkbenchPartAction): Disposable;

  /**
   * Registers a view menu item which is added to the context menu of every view tab.
   *
   * The factory function is invoked with the view as its argument when the menu is about to show.
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
   * Emits the current workbench theme.
   *
   * Upon subscription, emits the current theme, and then continuously emits when switching the theme. It never completes.
   */
  public abstract readonly theme$: Observable<WorkbenchTheme | null>;
}
