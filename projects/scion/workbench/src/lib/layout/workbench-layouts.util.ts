/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MPart, MTreeNode} from './workbench-layout.model';

/**
 * Provides helper functions for operating on a workbench layout.
 */
export const WorkbenchLayouts = {

  /**
   * Recursively collects all parts of a given element and its descendants.
   */
  collectParts: (element: MPart | MTreeNode): MPart[] => {
    const parts = new Array<MPart>();
    if (element instanceof MPart) {
      parts.push(element);
    }
    else {
      parts.push(...WorkbenchLayouts.collectParts(element.child1));
      parts.push(...WorkbenchLayouts.collectParts(element.child2));
    }
    return parts;
  },
} as const;
