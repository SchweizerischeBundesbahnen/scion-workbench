/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV5 {
  type: 'MPart';
  id: string;
  views: MViewV5[];
  activeViewId?: ViewIdV5;
  structural: boolean;
}

export interface MTreeNodeV5 {
  type: 'MTreeNode';
  id: string;
  child1: MTreeNodeV5 | MPartV5;
  child2: MTreeNodeV5 | MPartV5;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV5 {
  root: MTreeNodeV5 | MPartV5;
  activePartId: string;
}

export interface MViewV5 {
  id: ViewIdV5;
  alternativeId?: string;
  uid: string;
  cssClass?: string[];
  markedForRemoval?: true;
  navigation?: {
    id: string;
    hint?: string;
    data?: NavigationDataV5;
    cssClass?: string[];
  };
}

export interface NavigationDataV5 {
  [key: string]: unknown;
}

export type ViewIdV5 = `view.${string}`;
