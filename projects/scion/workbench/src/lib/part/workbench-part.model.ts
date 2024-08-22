/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {WorkbenchPartAction} from '../workbench.model';
import {ViewId} from '../view/workbench-view.model';
import {Signal} from '@angular/core';

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
  public abstract readonly id: string;

  /**
   * Indicates whether this part is located in the main area.
   */
  public abstract readonly isInMainArea: boolean;

  /**
   * Indicates whether this part is active or inactive.
   */
  public abstract readonly active: Signal<boolean>;

  /**
   * Emits the currently active view in this part.
   */
  public abstract readonly activeViewId$: Observable<ViewId | null>;

  /**
   * The currently active view, if any.
   */
  public abstract readonly activeViewId: ViewId | null;

  /**
   * Identifies views opened in this part.
   */
  public abstract readonly viewIds: Signal<ViewId[]>;

  /**
   * Actions matching this part and its active view.
   */
  public abstract readonly actions: Signal<WorkbenchPartAction[]>;
}
