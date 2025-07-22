/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivityId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Defines the arrangement of docked parts (also referred to as activities) in the workbench.
 *
 * Docked parts can be minimized to create more space for the main content.
 *
 * A part can be docked to the left, right, or bottom side of the workbench.
 * Each side has two docking areas: `left-top` and `left-bottom`, `right-top` and `right-bottom`, and `bottom-left` and `bottom-right`.
 * Parts added to the same area are stacked, with only one part active per stack. If there is an active part in both stacks of a side,
 * the two parts are split vertically or horizontally, depending on the side.
 *
 * A docked part may be navigated to display content, have views, or define a layout with multiple parts aligned relative to each other.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export interface MActivityLayout {
  toolbars: {
    leftTop: MActivityStack;
    leftBottom: MActivityStack;
    rightTop: MActivityStack;
    rightBottom: MActivityStack;
    bottomLeft: MActivityStack;
    bottomRight: MActivityStack;
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

/**
 * Stack of activities in a docking area.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export interface MActivityStack {
  /**
   * List of activities in the stack.
   */
  activities: MActivity[];
  /**
   * Reference to the currently active activity in the stack.
   */
  activeActivityId?: ActivityId;
  /**
   * Reference to the activity that was active prior to minimization, used to restore the active activity when exiting minimization mode.
   */
  minimizedActivityId?: ActivityId;
}

/**
 * Represents an activity docked to a side of the workbench.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export interface MActivity {
  /** @see DockedPartExtras#ɵactivityId */
  id: ActivityId;
  /** @see DockedPartExtras#icon */
  icon: string;
  /** @see DockedPartExtras#label */
  label: Translatable;
  /** @see DockedPartExtras#tooltip */
  tooltip?: Translatable;
  /** @see DockedPartExtras#cssClass */
  cssClass?: string | string[];
}

/**
 * Specifies the default width of the left and right activity panels.
 *
 * Used as the default width if the design tokens '--sci-workbench-layout-panel-left-width' or '--sci-workbench-layout-panel-right-width' are not set.
 */
export const ACTIVITY_PANEL_WIDTH = 300;

/**
 * Specifies the default height of the bottom activity panel.
 *
 * Used as the default height if the design token '--sci-workbench-layout-panel-bottom-height' is not set.
 */
export const ACTIVITY_PANEL_HEIGHT = 250;

/**
 * Specifies the default split ratio of the activity panels.
 */
export const ACTIVITY_PANEL_RATIO = .5;
