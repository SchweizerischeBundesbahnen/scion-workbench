/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ACTIVITY_ID_PREFIX} from '../workbench.constants';
import {PartId} from '../part/workbench-part.model';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Format of an activity identifier.
 *
 * Each activity is assigned a unique identifier (e.g., `activity.9fdf7ab4`, `activity.c6485225`, etc.).
 */
export type ActivityId = `${typeof ACTIVITY_ID_PREFIX}${string}`;

/**
 * Defines the layout of docked parts (also known as activities) in the workbench.
 *
 * A part can be docked to the left, right, or bottom side of the workbench. Each side allows for displaying
 * two docked parts, with the left and right docking areas split vertically and the bottom docking area split horizontally.
 *
 * Docked parts can be minimized to the activity bar on either the left or right side of the workbench.
 * A docked part may be navigated to display content, have views, or define a layout with multiple parts aligned relative to each other.
 */
export interface MActivityLayout {
  toolbars: {
    leftTop: MActivityGroup;
    leftBottom: MActivityGroup;
    rightTop: MActivityGroup;
    rightBottom: MActivityGroup;
    bottomLeft: MActivityGroup;
    bottomRight: MActivityGroup;
  };
  panels: {
    left: {
      width: number;
      ratio: number;
    };
    right: {
      width: number;
      ratio: number;
    };
    bottom: {
      height: number;
      ratio: number;
    };
  };
}

export interface MActivityGroup {
  activities: MActivity[];
  activeActivityId?: ActivityId;
  minimizedActivityId?: ActivityId;
}

/**
 * Represents a docked part docked to the left, right, or bottom side of the workbench.
 *
 * A docked part may be navigated to display content, have views, or define a layout of multiple parts aligned relative to each other.
 */
export interface MActivity {
  /** @see DockedPartExtras#ɵactivityId */
  id: ActivityId;
  /**
   * References the initial part of this activity.
   *
   * If a view stack, the part is not removed when removing its last view. Explicitly removing this part removes the activity.
   */
  referencePartId: PartId;
  /** @see DockedPartExtras#icon */
  icon: string;
  /** @see DockedPartExtras#label */
  label: Translatable;
  /** @see DockedPartExtras#tooltip */
  tooltip?: Translatable;
  /** @see DockedPartExtras#cssClass */
  cssClass?: string | string[];
}
