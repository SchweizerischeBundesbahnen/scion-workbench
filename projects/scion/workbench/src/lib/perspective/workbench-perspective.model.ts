/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {WorkbenchLayoutFn} from '../layout/workbench-layout';
import {Signal} from '@angular/core';

/**
 * Represents a workbench perspective.
 *
 * A perspective is a named layout. Multiple perspectives can be created. Users can switch between perspectives.
 * Perspectives share the same main area, if any.
 */
export interface WorkbenchPerspective {
  /**
   * Unique identifier of this perspective.
   */
  readonly id: string;
  /**
   * Arbitrary data associated with this perspective.
   */
  readonly data: {[key: string]: unknown};
  /**
   * Indicates whether this perspective is active.
   */
  readonly active: Signal<boolean>;
  /**
   * Indicates whether this perspective is transient, with its layout only memoized, not persisted.
   */
  readonly transient: boolean;
}

/**
 * Defines the workbench layouts of the application
 *
 * A perspective is a named layout. Multiple perspectives can be created. Users can switch between perspectives.
 * Perspectives share the same main area, if any.
 */
export interface WorkbenchPerspectives {
  /**
   * Specifies perspectives to register in the workbench.
   */
  perspectives?: WorkbenchPerspectiveDefinition[];
  /**
   * Specifies which perspective to activate. Defaults to the first registered perspective.
   *
   * The workbench remembers the active perspective and only evaluates this property when starting the workbench
   * for the first time, after clearing storage, or if the active perspective no longer exists.
   *
   * Can be either the identity of a perspective or a function to resolve the perspective.
   */
  initialPerspective?: string | WorkbenchPerspectiveSelectionFn;
}

/**
 * Describes a perspective to register in the workbench.
 */
export interface WorkbenchPerspectiveDefinition {
  /**
   * Specifies the unique identity of the perspective.
   */
  id: string;
  /**
   * Function to create the layout of the perspective. The function can call `inject` to get any required dependencies.
   *
   * A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other.
   * Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.
   *
   * A perspective typically has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support
   * the user's workflow. Initially empty or displaying a welcome page, the main area is where the workbench opens views by default.
   * Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives.
   *
   * See {@link WorkbenchLayoutFn} for more information and an example.
   */
  layout: WorkbenchLayoutFn;
  /**
   * Associates arbitrary data with the perspective, e.g., a label, icon or tooltip.
   */
  data?: {[key: string]: unknown};
  /**
   * Decides if the perspective can be activated. The function can call `inject` to get any required dependencies.
   */
  canActivate?: () => Promise<boolean> | boolean;
  /**
   * Defines the perspective as transient, with its layout only memoized, not persisted.
   */
  transient?: true;
}

/**
 * Signature of a function that can be provided in {@link WorkbenchPerspectives#initialPerspective} to select the perspective for the initial workbench layout.
 *
 * The function is passed a list of registered perspectives. The function can call `inject` to get any required dependencies.
 */
export type WorkbenchPerspectiveSelectionFn = (perspectives: WorkbenchPerspective[]) => Promise<string | undefined> | string | undefined;
