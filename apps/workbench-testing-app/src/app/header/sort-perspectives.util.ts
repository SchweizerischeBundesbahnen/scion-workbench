/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPerspective, WorkbenchPerspectiveData} from '@scion/workbench';
import {PerspectiveData} from '../workbench.perspectives';

/**
 * Sorts perspectives by display text, with non-microfrontend perspectives preceding microfrontend perspectives.
 */
export function sortPerspectives(perspectives: WorkbenchPerspective[]): WorkbenchPerspective[] {
  if (!perspectives?.length) {
    return [];
  }

  return [...perspectives].sort((a, b) => {
    if (isMicrofrontendPerspective(a) && !isMicrofrontendPerspective(b)) {
      return 1;
    }
    if (isMicrofrontendPerspective(b) && !isMicrofrontendPerspective(a)) {
      return -1;
    }
    return getLabel(a).localeCompare(getLabel(b));
  });
}

function isMicrofrontendPerspective(perspective: WorkbenchPerspective): boolean {
  return WorkbenchPerspectiveData.capability in perspective.data;
}

function getLabel(perspective: WorkbenchPerspective): string {
  return perspective.data[PerspectiveData.label] as string ?? '';
}
