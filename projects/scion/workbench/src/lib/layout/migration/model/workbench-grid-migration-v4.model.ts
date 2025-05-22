/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV4 {
  type: 'MPart';
  id: string;
  views: MViewV4[];
  activeViewId?: ViewIdV4;
  structural: boolean;
}

export interface MTreeNodeV4 {
  type: 'MTreeNode';
  nodeId: string;
  child1: MTreeNodeV4 | MPartV4;
  child2: MTreeNodeV4 | MPartV4;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV4 {
  root: MTreeNodeV4 | MPartV4;
  activePartId: string;
}

export interface MViewV4 {
  id: ViewIdV4;
  alternativeId?: string;
  uid: string;
  cssClass?: string[];
  markedForRemoval?: true;
  navigation?: {
    hint?: string;
    cssClass?: string[];
  };
}

export type ViewIdV4 = `view.${number}`;
