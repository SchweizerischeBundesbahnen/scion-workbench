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

/**
 * Format of an activity identifier.
 *
 * Each activity is assigned a unique identifier (e.g., `activity.9fdf7ab4`, `activity.c6485225`, etc.).
 */
export type ActivityId = `${typeof ACTIVITY_ID_PREFIX}${string}`;

export interface MActivityLayout {
  toolbars: {
    leftTop: MActivityGroup;
    leftBottom: MActivityGroup;
    rightTop: MActivityGroup;
    rightBottom: MActivityGroup;
    bottomLeft: MActivityGroup;
    bottomRight: MActivityGroup;
    showLabels: boolean;
  };
  panels: {
    left: {
      width?: string;
      ratio?: number;
    };
    right: {
      width?: string;
      ratio?: number;
    };
    bottom: {
      height?: string;
      ratio?: number;
    };
  };
}

export interface MActivityGroup {
  activities: MActivity[];
  activeActivityId?: ActivityId;
}

export interface MActivity {
  id: ActivityId;
  icon: string;
  label: string | `%${string}`;
  tooltip?: string | `%${string}`;
}
