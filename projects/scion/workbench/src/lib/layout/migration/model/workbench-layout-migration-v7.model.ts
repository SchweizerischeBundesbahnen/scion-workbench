/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MWorkbenchLayoutV7 {
  referenceLayout: {
    grids: {
      main: string;
      [activityId: ActivityId]: string;
    };
    activityLayout: string;
    outlets: string;
  };
  userLayout: {
    grids: {
      main: string;
      [activityId: ActivityId]: string;
    };
    activityLayout: string;
    outlets: string;
  };
}

type ActivityId = `activity.${string}`;
