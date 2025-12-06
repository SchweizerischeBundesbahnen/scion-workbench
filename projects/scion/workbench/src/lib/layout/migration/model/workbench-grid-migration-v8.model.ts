/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV8 {
  type: 'MPart';
  id: PartIdV8;
  alternativeId?: string;
  views: MViewV8[];
  activeViewId?: ViewIdV8;
  structural: boolean;
}

export interface MTreeNodeV8 {
  type: 'MTreeNode';
  id: string;
  child1: MTreeNodeV8 | MPartV8;
  child2: MTreeNodeV8 | MPartV8;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV8 {
  root: MTreeNodeV8 | MPartV8;
  activePartId: PartIdV8;
  referencePartId?: PartIdV8;
}

export interface MViewV8 {
  id: ViewIdV8;
  alternativeId?: string;
  cssClass?: string[];
  markedForRemoval?: true;
  navigation?: {
    id: string;
    hint?: string;
    data?: NavigationDataV8;
    cssClass?: string[];
  };
}

export interface NavigationDataV8 {
  [key: string]: unknown;
}

export type PartIdV8 = `part.${string}`;
export type ViewIdV8 = `view.${string}`;
