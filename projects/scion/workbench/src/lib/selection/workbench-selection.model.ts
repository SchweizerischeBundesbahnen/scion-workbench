/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export interface WorkbenchSelection {
  readonly data: WorkbenchSelectionData;
}

export type WorkbenchSelectionData = {
  [type: string]: unknown[];
};

export class ɵWorkbenchSelection implements WorkbenchSelection {

  public data: WorkbenchSelectionData;
  public provider: string;

  constructor(data: WorkbenchSelectionData, options: {provider: string}) {
    this.data = data;
    this.provider = options.provider;
  }
}

export abstract class WorkbenchSelectionProvider {
  public abstract readonly id: string;
}
