/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { VIEW_REF_PREFIX } from '../workbench.constants';
import { IterableChanges, IterableDiffer, IterableDiffers } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Differ for view router outlets.
 *
 * @see IterableDiffer
 */
export class ViewOutletDiffer {

  private _differ: IterableDiffer<string>;

  constructor(differs: IterableDiffers,
              private _router: Router) {
    this._differ = differs.find([]).create<string>();
  }

  public diff(url: string): IterableChanges<string> {
    const urlTree = this._router.parseUrl(url);
    const outlets = Object.keys(urlTree.root.children);

    const viewOutlets = outlets.filter(outlet => outlet.startsWith(VIEW_REF_PREFIX));
    return this._differ.diff(viewOutlets);
  }
}
