/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface MPartV1 {
  partId: string;
  viewIds: string[];
  activeViewId?: string;
}

export interface MTreeNodeV1 {
  nodeId: string;
  child1: MTreeNodeV1 | MPartV1;
  child2: MTreeNodeV1 | MPartV1;
  ratio: number;
  direction: 'column' | 'row';
}

export interface MPartsLayoutV1 {
  root: MTreeNodeV1 | MPartV1;
  activePartId: string;
}
