/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV6 {
  type: 'MPart';
  id: string;
  views: MViewV6[];
  activeViewId?: ViewIdV6;
  structural: boolean;
}

export interface MTreeNodeV6 {
  type: 'MTreeNode';
  id: string;
  child1: MTreeNodeV6 | MPartV6;
  child2: MTreeNodeV6 | MPartV6;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV6 {
  root: MTreeNodeV6 | MPartV6;
  activePartId: string;
}

export interface MViewV6 {
  id: ViewIdV6;
  alternativeId?: string;
  cssClass?: string[];
  markedForRemoval?: true;
  navigation?: {
    id: string;
    hint?: string;
    data?: NavigationDataV6;
    cssClass?: string[];
  };
}

export type ViewIdV6 = `view.${number}`;
export type NavigationDataV6 = {[key: string]: unknown};
