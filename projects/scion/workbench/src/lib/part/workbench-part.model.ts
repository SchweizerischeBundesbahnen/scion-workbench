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
import {ViewId} from '../view/workbench-view.model';
import {Signal} from '@angular/core';
import {PartOutlet} from '../workbench.constants';
import {NavigationData, NavigationState} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';

/**
 * Represents a part of the workbench layout.
 *
 * A part is a stack of views that can be arranged in the workbench layout.
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
   * Indicates whether this part is located in the main area.
   */
  public abstract readonly isInMainArea: boolean;

  /**
   * Indicates whether this part is active or inactive.
   */
  public abstract readonly active: Signal<boolean>;

  /**
   * Identifies the active view, or `null` if none.
   */
  public abstract readonly activeViewId: Signal<ViewId | null>;

  /**
   * Identifies views opened in this part.
   */
  public abstract readonly viewIds: Signal<ViewId[]>;

  /**
   * Actions matching this part and its active view.
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
}

/**
 * Format of a part identifier.
 *
 * Each part is assigned a unique identifier (e.g., `part.9fdf7ab4`, `part.c6485225`, etc.).
 * A part can also have an alternative id, a meaningful but not necessarily unique name. A part can
 * be identified either by its unique or alternative id.
 */
export type PartId = PartOutlet;

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
