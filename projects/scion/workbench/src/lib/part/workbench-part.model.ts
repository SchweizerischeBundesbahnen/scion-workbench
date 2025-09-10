/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPartAction} from '../workbench.model';
import {WorkbenchView} from '../view/workbench-view.model';
import {Signal} from '@angular/core';
import {NavigationData, NavigationState} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {PartId, ViewId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * A part is a visual workbench element to create the workbench layout. Parts can be docked to the side or
 * positioned relative to each other. A part can be a stack of views or display content.
 *
 * The part component can inject this handle to interact with the part.
 *
 * @see WorkbenchView
 */
export abstract class WorkbenchPart {

  /**
   * Unique identity of this part.
   */
  public abstract readonly id: PartId;

  /**
   * Alternative identity of this part.
   *
   * A part can have an alternative id, a meaningful but not necessarily unique name. A part can
   * be identified either by its unique or alternative id.
   *
   * @see id
   */
  public abstract readonly alternativeId: string | undefined;

  /**
   * Title displayed in the part bar.
   *
   * Note that the title of the top-leftmost part of a docked part cannot be changed.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract get title(): Signal<Translatable | undefined>;
  public abstract set title(title: Translatable | undefined);

  /**
   * Indicates whether this part is located in the workbench main area.
   */
  public abstract readonly isInMainArea: boolean;

  /**
   * Indicates whether this part is located in the workbench peripheral area.
   */
  public abstract readonly peripheral: Signal<boolean>;

  /**
   * Indicates whether this part is the top-leftmost part.
   */
  public abstract readonly topLeft: Signal<boolean>;

  /**
   * Indicates whether this part is the top-rightmost part.
   */
  public abstract readonly topRight: Signal<boolean>;

  /**
   * Indicates whether this part is active or inactive.
   */
  public abstract readonly active: Signal<boolean>;

  /**
   * Indicates whether this part has the focus.
   */
  public abstract readonly focused: Signal<boolean>;

  /**
   * Identifies the active view, or `null` if none.
   *
   * @deprecated since version 20.0.0-beta.4. Use `WorkbenchPart.activeView` instead. API will be removed in version 22.
   */
  public abstract readonly activeViewId: Signal<ViewId | null>;

  /**
   * Identifies views opened in this part.
   *
   * @deprecated since version 20.0.0-beta.4. Use `WorkbenchPart.views` instead. API will be removed in version 22.
   */
  public abstract readonly viewIds: Signal<ViewId[]>;

  /**
   * Gets the active view of this part, or `null` if none.
   */
  public abstract readonly activeView: Signal<WorkbenchView | null>;

  /**
   * Gets views opened in this part.
   */
  public abstract readonly views: Signal<WorkbenchView[]>;

  /**
   * Actions associated with this part.
   */
  public abstract readonly actions: Signal<WorkbenchPartAction[]>;

  /**
   * Specifies CSS class(es) to add to the part, e.g., to locate the part in tests.
   */
  public abstract get cssClass(): Signal<string[]>;
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Provides navigation details of this part.
   *
   * A part can be navigated to display content when its view stack is empty.
   * A navigated part can still have views but won't display navigated content unless its view stack is empty.
   *
   * A part can be navigated using {@link WorkbenchLayout#navigatePart}.
   */
  public abstract readonly navigation: Signal<WorkbenchPartNavigation | undefined>;

  /**
   * Gets the activation instant of this part.
   */
  public abstract readonly activationInstant: Signal<number>;

  /**
   * Activates this part.
   */
  public abstract activate(): Promise<boolean>;
}

/**
 * Provides navigation details of a workbench part.
 */
export interface WorkbenchPartNavigation {
  /**
   * Unique ID per navigation.
   *
   * @internal
   */
  id: string;

  /**
   * Path of this part.
   */
  path: UrlSegment[];

  /**
   * Hint passed to the navigation.
   */
  hint?: string;

  /**
   * Data passed to the navigation.
   */
  data?: NavigationData;

  /**
   * State passed to the navigation.
   */
  state?: NavigationState;
}
