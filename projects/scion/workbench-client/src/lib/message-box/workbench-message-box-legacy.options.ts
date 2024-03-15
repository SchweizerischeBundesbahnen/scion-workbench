/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dictionary} from '@scion/toolkit/util';
import {ViewId} from '../view/workbench-view';

/**
 * @deprecated since version v1.0.0-beta.23; use {@link WorkbenchMessageBoxOptions} instead; interface will be removed in a future release.
 * @ignore
 */
export interface WorkbenchMessageBoxLegacyOptions {
  title?: string;
  content?: any;
  params?: Map<string, any> | Dictionary;
  actions?: {
    [key: string]: string;
  };
  severity?: 'info' | 'warn' | 'error';
  modality?: 'application' | 'view';
  contentSelectable?: boolean;
  cssClass?: string | string[];
  context?: {
    viewId?: ViewId;
  };
}
