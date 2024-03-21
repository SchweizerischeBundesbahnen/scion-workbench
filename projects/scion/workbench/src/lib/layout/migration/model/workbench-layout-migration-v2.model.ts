/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV2 {
  type: 'MPart';
  id: string;
  views: MViewV2[];
  activeViewId?: string;
  structural: boolean;
}

export interface MTreeNodeV2 {
  type: 'MTreeNode';
  nodeId: string;
  child1: MTreeNodeV2 | MPartV2;
  child2: MTreeNodeV2 | MPartV2;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV2 {
  root: MTreeNodeV2 | MPartV2;
  activePartId: string;
}

export interface MViewV2 {
  id: string;
}
