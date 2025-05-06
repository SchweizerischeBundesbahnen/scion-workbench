/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV3 {
  type: 'MPart';
  id: string;
  views: MViewV3[];
  activeViewId?: ViewIdV3;
  structural: boolean;
}

export interface MTreeNodeV3 {
  type: 'MTreeNode';
  nodeId: string;
  child1: MTreeNodeV3 | MPartV3;
  child2: MTreeNodeV3 | MPartV3;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV3 {
  root: MTreeNodeV3 | MPartV3;
  activePartId: string;
}

export interface MViewV3 {
  id: ViewIdV3;
  alternativeId?: string;
  cssClass?: string[];
  navigation?: {
    hint?: string;
    cssClass?: string[];
  };
}

export type ViewIdV3 = `view.${number}`;

export const VIEW_ID_PREFIX_V3 = 'view.';
