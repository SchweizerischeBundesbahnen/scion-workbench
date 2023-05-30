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
import {Disposable} from './disposable';
import {WorkbenchMenuItemFactoryFn, WorkbenchPartAction} from './workbench.model';
import {WorkbenchView} from './view/workbench-view.model';
import {WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WorkbenchPart} from './part/workbench-part.model';
import {Injectable} from '@angular/core';
import {ɵWorkbenchService} from './ɵworkbench.service';

/**
 * The central class of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout
 * to arrange content side-by-side or stacked, all personalizable by the user via drag & drop.
 *
 * The workbench layout is ideal for applications with non-linear workflows, enabling users to work
 * on content in parallel.
 *
 * The workbench has a main area and a peripheral area for placing views. The main area is the primary
 * place for views to interact with the application. The peripheral area arranges views around the main
 * area to support the user's workflow. Multiple arrangements of peripheral views, called perspectives,
 * are supported. Different perspectives provide a different perspective on the application while sharing
 * the main area. Only one perspective can be active at a time.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchService})
export abstract class WorkbenchService {

  /**
   * Perspectives registered with the workbench.
   */
  public abstract readonly perspectives: readonly WorkbenchPerspective[];

  /**
   * Emits the perspectives registered with the workbench.
   *
   * Upon subscription, the currently registered perspectives are emitted, and then emits continuously
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
   */
  public abstract readonly parts: readonly WorkbenchPart[];

  /**
   * Emits the parts in the workbench layout.
   *
   * Upon subscription, the current parts are emitted, and then emits continuously
   * when new parts are added or existing parts removed. It never completes.
   */
  public abstract readonly parts$: Observable<readonly WorkbenchPart[]>;

  /**
   * Returns a reference to the specified {@link WorkbenchPart}, or `null` if not found.
   */
  public abstract getPart(partId: string): WorkbenchPart | null;

  /**
   * Views opened in the workbench.
   */
  public abstract readonly views: readonly WorkbenchView[];

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public abstract readonly views$: Observable<readonly WorkbenchView[]>;

  /**
   * Returns a reference to the specified {@link WorkbenchView}, or `null` if not found.
   */
  public abstract getView(viewId: string): WorkbenchView | null;

  /**
   * Closes the specified workbench views.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract closeViews(...viewIds: string[]): Promise<boolean>;

  /**
   * Registers an action which is added to every part.
   *
   * Part actions are displayed next to the opened view tabs.
   *
   * @return handle to unregister the action.
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
}
