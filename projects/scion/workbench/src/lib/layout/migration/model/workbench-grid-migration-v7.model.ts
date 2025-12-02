/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV7 {
  type: 'MPart';
  id: PartIdV7;
  alternativeId?: string;
  views: MViewV7[];
  activeViewId?: ViewIdV7;
  structural: boolean;
}

export interface MTreeNodeV7 {
  type: 'MTreeNode';
  id: string;
  child1: MTreeNodeV7 | MPartV7;
  child2: MTreeNodeV7 | MPartV7;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartGridV7 {
  root: MTreeNodeV7 | MPartV7;
  activePartId: PartIdV7;
  referencePartId?: PartIdV7;
}

export interface MViewV7 {
  id: ViewIdV7;
  alternativeId?: string;
  cssClass?: string[];
  markedForRemoval?: true;
  navigation?: {
    id: string;
    hint?: string;
    data?: NavigationDataV7;
    cssClass?: string[];
  };
}

export interface NavigationDataV7 {
  [key: string]: unknown;
}

export type PartIdV7 = `part.${string}`;
export type ViewIdV7 = `view.${string}`;
