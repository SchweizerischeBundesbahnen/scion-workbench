/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is
 * displayed in views.
 *
 * The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support
 * the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable
 * area for user interaction.
 *
 * Multiple layouts, called perspectives, are supported. Perspectives can be switched with one perspective active at a time.
 * Perspectives share the same main area, if any.
 *
 * The layout is an immutable object that provides methods to modify the layout. Modifications have no
 * side effects. Each modification creates a new layout instance that can be used for further modifications.
 */
export interface WorkbenchLayout {

  /**
   * Adds a part with the given id to this layout. Position and size are expressed relative to a reference part.
   *
   * @param id - Unique id of the part. Use {@link MAIN_AREA} to add the main area.
   * @param relativeTo - Specifies the reference part to lay out the part.
   * @param options - Controls how to add the part to the layout.
   *        @property activate - Controls whether to activate the part. If not set, defaults to `false`.
   * @return a copy of this layout with the part added.
   */
  addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;

  /**
   * Adds a view to the specified part.
   *
   * @param id - The id of the view to add.
   * @param options - Controls how to add the view to the layout.
   *        @property partId - References the part to which to add the view.
   *        @property position - Specifies the position where to insert the view. The position is zero-based. If not set, adds the view at the end.
   *        @property activateView - Controls whether to activate the view. If not set, defaults to `false`.
   *        @property activatePart - Controls whether to activate the part that contains the view. If not set, defaults to `false`.
   * @return a copy of this layout with the view added.
   */
  addView(id: string, options: {partId: string; position?: number; activateView?: boolean; activatePart?: boolean}): WorkbenchLayout;

  /**
   * Removes given view from the layout.
   *
   * - If the view is active, the last used view is activated.
   * - If the view is the last view in the part, the part is removed unless it is the last part in its grid or a structural part.
   *
   * @param id - Specifies the id of the view to remove.
   * @return a copy of this layout with the view removed.
   */
  removeView(id: string): WorkbenchLayout;

  /**
   * Removes given part from the layout.
   *
   * If the part is active, the last used part is activated.
   *
   * @param id - The id of the part to remove.
   * @return a copy of this layout with the part removed.
   */
  removePart(id: string): WorkbenchLayout;

  /**
   * Activates the given view.
   *
   * @param id - The id of the view which to activate.
   * @param options - Controls view activation.
   *        @property activatePart - Controls whether to activate the part that contains the view. If not set, defaults to `false`.
   * @return a copy of this layout with the view activated.
   */
  activateView(id: string, options?: {activatePart?: boolean}): WorkbenchLayout;

  /**
   * Activates the given part.
   *
   * @param id - The id of the part which to activate.
   * @return a copy of this layout with the part activated.
   */
  activatePart(id: string): WorkbenchLayout;
}

/**
 * Describes how to lay out a part relative to another part.
 */
export interface ReferencePart {
  /**
   * Specifies the part which to use as the reference part to lay out the part.
   * If not set, the part will be aligned relative to the root of the workbench layout.
   */
  relativeTo?: string;
  /**
   * Specifies the side of the reference part where to add the part.
   */
  align: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Specifies the proportional size of the part relative to the reference part.
   * The ratio is the closed interval [0,1]. If not set, defaults to `0.5`.
   */
  ratio?: number;
}

/**
 * Identifies the part that represents the main area.
 *
 * Refer to this part to align parts relative to the main area.
 */
export const MAIN_AREA: MAIN_AREA = 'main-area';

/**
 * Represents the type of the constant {@link MAIN_AREA}.
 */
export type MAIN_AREA = 'main-area';
